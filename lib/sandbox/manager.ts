import { Sandbox } from "@vercel/sandbox";
import { getInstallationToken } from "@/lib/github/app";
import { DATA_DIR } from "@/lib/sandbox/constants";

const SANDBOX_TIMEOUT = 60_000; // 1 minute
const EXTEND_THRESHOLD = 20_000; // extend when < 20s remaining
const TOKEN_REFRESH_THRESHOLD = 50 * 60 * 1000; // 50 minutes (GitHub tokens expire in 1 hour)

export interface SandboxConfig {
  installationId: number;
  repoUrl: string;
  defaultBranch: string;
}

/**
 * Manages a single Vercel Sandbox instance for a specific user.
 * - Creates sandbox seeded from the user's git repo
 * - Reuses existing sandbox within a session
 * - Runs commands in the sandbox
 * - Handles git push after changes
 */
export class SandboxManager {
  private sandbox: Sandbox | null = null;
  private sandboxId: string | null = null;
  private ensurePromise: Promise<Sandbox> | null = null;
  private extendPromise: Promise<Sandbox> | null = null;
  private expiresAt = 0;
  private tokenSetAt = 0;

  constructor(
    private readonly userId: string,
    private readonly config: SandboxConfig,
  ) {}

  /**
   * Get or create a sandbox, seeded from the user's git repo.
   * Deduplicates concurrent calls so only one sandbox is created.
   * Tracks expiry locally to avoid Sandbox.get() network calls (~200ms each).
   */
  async ensure(): Promise<Sandbox> {
    if (this.sandbox && this.sandboxId) {
      const remaining = this.expiresAt - Date.now();

      if (remaining > EXTEND_THRESHOLD) {
        console.log(
          `[SandboxManager:${this.userId}] ${remaining}ms remaining, reusing`,
        );
        return this.sandbox;
      }

      if (remaining > 0) {
        // Deduplicate concurrent extend calls
        if (this.extendPromise) {
          return this.extendPromise;
        }
        console.log(
          `[SandboxManager:${this.userId}] ${remaining}ms remaining, extending timeout`,
        );
        this.extendPromise = this.sandbox
          .extendTimeout(SANDBOX_TIMEOUT)
          .then(() => {
            this.expiresAt = Date.now() + SANDBOX_TIMEOUT;
            // biome-ignore lint/style/noNonNullAssertion: sandbox is guaranteed to exist in .then() callback
            return this.sandbox!;
          })
          .catch(() => {
            console.log(
              `[SandboxManager:${this.userId}] extend failed, will recreate`,
            );
            this.sandbox = null;
            this.sandboxId = null;
            this.expiresAt = 0;
            this.tokenSetAt = 0;
            return this._create();
          })
          .finally(() => {
            this.extendPromise = null;
          });
        return this.extendPromise;
      }
      console.log(
        `[SandboxManager:${this.userId}] sandbox expired, will recreate`,
      );

      this.sandbox = null;
      this.sandboxId = null;
      this.expiresAt = 0;
      this.tokenSetAt = 0;
    }

    // Deduplicate concurrent creation calls
    if (this.ensurePromise) {
      return this.ensurePromise;
    }

    this.ensurePromise = this._create().finally(() => {
      this.ensurePromise = null;
    });

    return this.ensurePromise;
  }

  private async _create(): Promise<Sandbox> {
    const startTime = Date.now();

    const { installationId, repoUrl } = this.config;
    const token = await getInstallationToken(installationId);

    console.log(
      `[SandboxManager:${this.userId}] creating sandbox for ${repoUrl}...`,
    );
    const sandbox = await Sandbox.create({
      source: {
        type: "git",
        url: repoUrl,
        username: "x-access-token",
        password: token,
      },
      runtime: "node24",
      timeout: SANDBOX_TIMEOUT,
    });

    // Configure git identity inside the sandbox
    await sandbox.runCommand({
      cmd: "git",
      args: ["config", "user.email", "ctx4-ai[bot]@users.noreply.github.com"],
      cwd: DATA_DIR,
    });
    await sandbox.runCommand({
      cmd: "git",
      args: ["config", "user.name", "ctx4-ai[bot]"],
      cwd: DATA_DIR,
    });

    // Configure git credentials for push (installation token auth)
    const authedUrl = repoUrl.replace(
      "https://",
      `https://x-access-token:${token}@`,
    );
    await sandbox.runCommand({
      cmd: "git",
      args: ["remote", "set-url", "origin", authedUrl],
      cwd: DATA_DIR,
    });

    this.sandbox = sandbox;
    this.sandboxId = sandbox.sandboxId;
    this.expiresAt = Date.now() + SANDBOX_TIMEOUT;
    this.tokenSetAt = Date.now();
    console.log(
      `[SandboxManager:${this.userId}] sandbox ready: ${this.sandboxId} in ${Date.now() - startTime}ms`,
    );
    return sandbox;
  }

  /**
   * Refresh GitHub credentials in the sandbox if the token is older than 50 minutes.
   * GitHub App installation tokens expire after 1 hour, so we refresh before that.
   */
  private async refreshGitCredentialsIfNeeded(): Promise<void> {
    const tokenAge = Date.now() - this.tokenSetAt;

    if (tokenAge < TOKEN_REFRESH_THRESHOLD) {
      return; // Token still fresh
    }

    console.log(
      `[SandboxManager:${this.userId}] refreshing GitHub token (age: ${Math.round(tokenAge / 60000)}min)`,
    );

    const token = await getInstallationToken(this.config.installationId);
    const authedUrl = this.config.repoUrl.replace(
      "https://",
      `https://x-access-token:${token}@`,
    );

    // biome-ignore lint/style/noNonNullAssertion: method is only called after ensure()
    await this.sandbox!.runCommand({
      cmd: "git",
      args: ["remote", "set-url", "origin", authedUrl],
      cwd: DATA_DIR,
    });

    this.tokenSetAt = Date.now();
  }

  /**
   * Run a command in the sandbox.
   */
  async runCommand(
    command: string,
    cwd?: string,
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    const sandbox = await this.ensure();

    const result = await sandbox.runCommand({
      cmd: "bash",
      args: ["-c", command],
      cwd: cwd ?? DATA_DIR,
    });

    const stdout = await result.stdout();
    const stderr = await result.stderr();

    return { stdout, stderr, exitCode: result.exitCode };
  }

  /**
   * Read a file from the sandbox. Returns null if file doesn't exist.
   */
  async readFile(relativePath: string): Promise<string | null> {
    const sandbox = await this.ensure();

    const buffer = await sandbox.readFileToBuffer({
      path: relativePath,
      cwd: DATA_DIR,
    });

    if (!buffer) return null;
    return buffer.toString("utf-8");
  }

  /**
   * Git sync: commit and push changes if any exist.
   */
  async gitSyncIfChanged(comment?: string): Promise<string | null> {
    const { stdout: status } = await this.runCommand("git status --porcelain");

    if (!status.trim()) return null;

    // Refresh GitHub token if needed (only when we're actually pushing)
    await this.refreshGitCredentialsIfNeeded();

    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
    const message = comment || `auto-save ${timestamp}`;

    // Escape double quotes in commit message
    const escapedMessage = message.replace(/"/g, '\\"');
    await this.runCommand("git add -A");
    await this.runCommand(`git commit -m "${escapedMessage}"`);
    await this.runCommand("git push");

    return message;
  }

  /**
   * Stop and clean up the sandbox.
   */
  async stop(): Promise<void> {
    console.log(`[SandboxManager:${this.userId}] stopping sandbox`);
    if (this.sandbox) {
      try {
        await this.sandbox.stop();
      } catch {
        // Already stopped
      }
      this.sandbox = null;
      this.sandboxId = null;
      this.expiresAt = 0;
      this.tokenSetAt = 0;
    }
  }
}
