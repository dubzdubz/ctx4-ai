import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v3";
import { sandboxPool } from "@/lib/sandbox/pool";

export function registerCtxBashTool(server: McpServer) {
  server.registerTool(
    "ctx_bash",
    {
      title: "Execute Bash Command",
      description: `Execute a bash command in the memory sandbox.

Available commands: ls, cat, grep, find, echo, mkdir, touch, rm, mv, cp, etc.

Examples:
- List files: ls -la
- Read file: cat notes.md
- Search: grep -r "TODO" .
- Create file: echo "# My Notes" > notes.md
- Create dir: mkdir projects

Any changes are automatically committed and pushed to GitHub.`,
      inputSchema: {
        command: z.string().describe("The bash command to execute"),
        comment: z
          .string()
          .optional()
          .describe(
            "Optional description for the git commit (if changes are made)",
          ),
      },
    },
    async ({ command, comment }, extra) => {
      const userId = extra.authInfo?.extra?.userId as string | undefined;
      if (!userId) {
        return {
          content: [{ type: "text", text: "Error: Unable to identify user." }],
        };
      }

      try {
        const manager = await sandboxPool.getForUser(userId);

        const startTime = Date.now();
        const { stdout, stderr, exitCode } = await manager.runCommand(command);

        const endTime = Date.now();
        console.log(`[ctx_bash] command executed in ${endTime - startTime}ms`);

        const output = stdout || stderr || "(no output)";

        if (exitCode !== 0 && stderr) {
          return {
            content: [
              {
                type: "text",
                text: `${output}\n\n[Exit code: ${exitCode}]`,
              },
            ],
          };
        }

        // Check for changes and sync to git
        const commitMessage = await manager.gitSyncIfChanged(comment);
        console.log(
          `[ctx_bash] git sync completed in ${Date.now() - endTime}ms`,
        );

        if (commitMessage) {
          return {
            content: [
              {
                type: "text",
                text: `${output}\n\n[Committed: ${commitMessage}]`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: output,
            },
          ],
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${message}`,
            },
          ],
        };
      }
    },
  );
}
