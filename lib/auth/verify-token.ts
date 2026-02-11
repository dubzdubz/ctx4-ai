import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
);

export async function verifyToken(
  _req: Request,
  bearerToken?: string,
): Promise<AuthInfo | undefined> {
  if (!bearerToken) {
    return undefined;
  }

  try {
    // Validate token against Supabase Auth server
    const { data, error } = await supabase.auth.getUser(bearerToken);

    if (error || !data.user) {
      return undefined;
    }

    const user = data.user;

    // Extract scopes from token metadata or user claims
    const scopes = user.app_metadata?.scopes || ["openid", "email", "profile"];

    return {
      token: bearerToken,
      scopes,
      clientId: user.id, // Supabase user ID
      extra: {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return undefined;
  }
}
