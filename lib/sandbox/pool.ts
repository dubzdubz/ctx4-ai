import { type SandboxConfig, SandboxManager } from "./manager";
import { getUserGithubConfig } from "@/lib/db/queries";

class SandboxManagerPool {
  private managers = new Map<string, SandboxManager>();

  async getForUser(userId: string): Promise<SandboxManager> {
    if (!this.managers.has(userId)) {
      const config = await getUserGithubConfig(userId);
      if (!config) {
        throw new Error(
          "No GitHub configuration found. Please complete onboarding first.",
        );
      }

      const sandboxConfig: SandboxConfig = {
        installationId: config.installationId,
        repoUrl: config.repoUrl,
        defaultBranch: config.defaultBranch ?? "main",
      };

      const manager = new SandboxManager(userId, sandboxConfig);
      this.managers.set(userId, manager);
    }
    // biome-ignore lint/style/noNonNullAssertion: guaranteed by the block above
    return this.managers.get(userId)!;
  }

  async remove(userId: string): Promise<void> {
    const manager = this.managers.get(userId);
    if (manager) {
      await manager.stop();
      this.managers.delete(userId);
    }
  }
}

export const sandboxPool = new SandboxManagerPool();
