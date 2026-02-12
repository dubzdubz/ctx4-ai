import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";

/**
 * Check if the authenticated user is authorized to use ctx tools.
 *
 * If ALLOWED_USER_IDS is set, only users with IDs in that comma-separated list
 * can access the tools. If not set, any authenticated user can access.
 *
 * @param authInfo - The auth info from extra.authInfo
 * @throws Error if user is not authorized
 */
export function checkUserAuthorization(authInfo?: AuthInfo): void {
  const allowedUserIds = process.env.ALLOWED_USER_IDS;

  // If no restriction configured, allow all authenticated users
  if (!allowedUserIds) {
    return;
  }

  // If no auth info provided, skip check (shouldn't happen with required auth)
  if (!authInfo) {
    return;
  }

  const allowedIds = allowedUserIds.split(",").map((id) => id.trim());
  const userId = authInfo.extra?.userId as string | undefined;

  if (!userId || !allowedIds.includes(userId)) {
    throw new Error(
      `Unauthorized: User ${userId || "unknown"} is not in the allowed users list. ` +
        "Contact the server administrator for access.",
    );
  }

  const email = authInfo.extra?.email as string | undefined;
  console.log(`[auth] User ${userId} authorized (${email || "no email"})`);
}
