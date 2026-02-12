import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v3";

export function registerRollDiceTool(server: McpServer) {
  server.registerTool(
    "roll_dice",
    {
      title: "Roll Dice",
      description: "Roll a dice with a specified number of sides.",
      inputSchema: {
        sides: z.number().int().min(2),
      },
    },
    async ({ sides }, extra) => {
      // Access authenticated user info
      const userEmail = extra.authInfo?.extra?.email;

      const value = 1 + Math.floor(Math.random() * sides);
      return {
        content: [
          {
            type: "text",
            text: `🎲 ${userEmail || "User"} rolled a ${value}!`,
          },
        ],
      };
    },
  );
}
