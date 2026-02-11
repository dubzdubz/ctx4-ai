import {
  protectedResourceHandler,
  metadataCorsOptionsRequestHandler,
} from "mcp-handler";

// MCP-specific OAuth Protected Resource Metadata
// Some MCP clients append /mcp to the discovery path, so we serve
// the same metadata here as at /.well-known/oauth-protected-resource

const supabaseProjectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serverUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const handler = protectedResourceHandler({
  authServerUrls: [`${supabaseProjectUrl}/auth/v1`],
  resourceUrl: serverUrl,
});

const corsHandler = metadataCorsOptionsRequestHandler();

export { handler as GET, corsHandler as OPTIONS };
