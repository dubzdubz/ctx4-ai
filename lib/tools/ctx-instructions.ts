import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GUIDE_CONTENT } from "@/lib/content/guide";
import { sandboxPool } from "@/lib/sandbox/pool";
import {
  readResourceContent,
  scanContextResources,
  scanSkills,
} from "@/lib/sandbox/scanner";

export function registerCtxInstructionsTool(server: McpServer) {
  server.registerTool(
    "ctx_instructions",
    {
      title: "Get Context Instructions",
      description: `Get your persistent instructions, context, and available skills. Call this at the start of every conversation to load your stored context.`,
      inputSchema: {},
    },
    async (_params, extra) => {
      const userId = extra.authInfo?.extra?.userId as string | undefined;
      if (!userId) {
        return {
          content: [{ type: "text", text: "Error: Unable to identify user." }],
        };
      }

      const manager = await sandboxPool.getForUser(userId);

      // Ensure sandbox is ready before running parallel operations
      await manager.ensure();

      const [instructions, contextContent, resources, skills] =
        await Promise.all([
          readResourceContent(manager, "instructions"),
          readResourceContent(manager, "context"),
          scanContextResources(manager),
          scanSkills(manager),
        ]);

      const section = (title: string, body: string) =>
        `\n\n---\n${title}\n---\n\n${body}`;

      const formatList = (items: { name: string; description: string }[]) =>
        items.map((i) => `- **${i.name}**: ${i.description}`).join("\n");

      const sections = [
        section("GUIDE", GUIDE_CONTENT),
        instructions && section("INSTRUCTIONS", instructions),
        contextContent && section("CONTEXT", contextContent),
        resources.length > 0 &&
          section("AVAILABLE CONTEXT RESOURCES", formatList(resources)),
        skills.length > 0 && section("AVAILABLE SKILLS", formatList(skills)),
      ].filter(Boolean);

      return {
        content: [
          {
            type: "text",
            text: sections.join("\n"),
          },
        ],
      };
    },
  );
}
