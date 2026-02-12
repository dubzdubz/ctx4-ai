import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { checkUserAuthorization } from "@/lib/auth/check-user-auth";
import { GUIDE_CONTENT } from "@/lib/content/guide";
import { sandboxManager } from "@/lib/sandbox/manager";
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
      // Check user authorization
      checkUserAuthorization(extra.authInfo);

      // Ensure sandbox is ready before running parallel operations
      await sandboxManager.ensure();

      const [instructions, contextContent, resources, skills] =
        await Promise.all([
          readResourceContent("instructions"),
          readResourceContent("context"),
          scanContextResources(),
          scanSkills(),
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
