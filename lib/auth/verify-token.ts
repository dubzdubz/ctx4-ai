import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
);

/**
 * Verifies an OAuth access token issued by Supabase Auth.
 *
 * This function:
 * 1. Validates the JWT signature using Supabase's JWKS endpoint
 * 2. Extracts OAuth-specific claims (client_id, scope, etc.)
 * 3. Returns AuthInfo compatible with MCP SDK requirements
 *
 * OAuth access tokens from Supabase include these claims:
 * - client_id: The OAuth client that obtained this token
 * - scope: Space-separated list of granted scopes
 * - sub: The user ID
 * - iss: Token issuer (Supabase Auth URL)
 * - aud: Token audience
 * - exp: Expiration timestamp
 *
 * @param _req - The incoming request (unused but required by mcp-handler)
 * @param bearerToken - The Bearer token from the Authorization header
 * @returns AuthInfo if token is valid, undefined otherwise
 */
export async function verifyToken(
  _req: Request,
  bearerToken?: string,
): Promise<AuthInfo | undefined> {
  if (!bearerToken) {
    return undefined;
  }

  try {
    // Validate token and extract claims from JWT
    // getClaims() verifies the signature using JWKS (fast, cached)
    const { data, error } = await supabase.auth.getClaims(bearerToken);

    if (error || !data?.claims) {
      return undefined;
    }

    const claims = data.claims;

    // Extract OAuth client_id from token claims (required for OAuth tokens)
    const clientId = claims.client_id as string | undefined;
    if (!clientId) {
      // Not an OAuth token - this is a regular session token
      // You can choose to reject these or handle them differently
      console.warn("Token missing client_id claim - not an OAuth token");
      return undefined;
    }

    // Extract scopes from token claims (space-separated string in OAuth tokens)
    // If scope claim is not present, use empty array
    const scopeString = claims.scope as string | undefined;
    const scopes = scopeString ? scopeString.split(" ") : [];

    // Extract expiration time
    const expiresAt = claims.exp as number | undefined;

    // Validate issuer and audience (optional but recommended)
    const expectedIssuer = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1`;
    if (claims.iss !== expectedIssuer) {
      console.warn(
        `Token issuer mismatch: expected ${expectedIssuer}, got ${claims.iss}`,
      );
      return undefined;
    }

    return {
      token: bearerToken,
      scopes,
      clientId, // OAuth client ID (not user ID)
      expiresAt,
      extra: {
        userId: claims.sub, // User ID is in the 'sub' claim
        email: claims.email,
        role: claims.role,
        aud: claims.aud,
        iss: claims.iss,
      },
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return undefined;
  }
}
