import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { z } from "zod/v3";
import { verifyToken } from "@/lib/auth/verify-token";

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
	},
	{},
	{
		basePath: "",
		maxDuration: 60,
		verboseLogs: true,
	},
);

// Wrap handler with OAuth authentication
const authHandler = withMcpAuth(handler, verifyToken, {
	required: true,
	requiredScopes: [], // Supabase handles scope validation
	resourceMetadataPath: "/.well-known/oauth-protected-resource",
});

export { authHandler as GET, authHandler as POST };
