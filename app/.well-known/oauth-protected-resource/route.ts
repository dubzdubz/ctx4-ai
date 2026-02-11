import {
  protectedResourceHandler,
  metadataCorsOptionsRequestHandler,
} from "mcp-handler";

const supabaseProjectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serverUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const handler = protectedResourceHandler({
  authServerUrls: [`${supabaseProjectUrl}/auth/v1`],
  resourceUrl: serverUrl,
});

const corsHandler = metadataCorsOptionsRequestHandler();

export { handler as GET, corsHandler as OPTIONS };
