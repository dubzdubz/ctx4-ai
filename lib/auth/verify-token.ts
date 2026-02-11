import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";

export async function verifyToken(
  _req: Request,
  bearerToken?: string,
): Promise<AuthInfo | undefined> {
  if (!bearerToken) {
    return undefined;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  try {
    // Validate token by fetching user info from Supabase
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        apikey: serviceRoleKey,
      },
    });

    if (!response.ok) {
      return undefined;
    }

    const user = await response.json();

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
