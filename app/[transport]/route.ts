import { createMcpHandler } from "mcp-handler";
import { z } from "zod/v3";

const handler = createMcpHandler(
	(server) => {
		server.registerTool(
			"roll_dice",
			{
				title: "Roll Dice",
				description: "Roll a dice with a specified number of sides.",
				inputSchema: {
					sides: z.number().int().min(2),
				},
			},
			async ({ sides }) => {
				const value = 1 + Math.floor(Math.random() * sides);
				return {
					content: [{ type: "text", text: `🎲 You rolled a ${value}!` }],
				};
			},
		);
	},
	{},
	{
		basePath: "",
		maxDuration: 60,
		verboseLogs: true,
	},
);

export { handler as GET, handler as POST };
