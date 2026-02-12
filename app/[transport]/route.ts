import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { verifyToken } from "@/lib/auth/verify-token";
import { registerAllTools } from "@/lib/tools";

const handler = createMcpHandler(
  (server) => {
    registerAllTools(server);
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
  requiredScopes: [], // Empty = no scope enforcement (optional: add required scopes like ["openid", "email"])
  resourceMetadataPath: "/.well-known/oauth-protected-resource",
  resourceUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export { authHandler as GET, authHandler as POST };
