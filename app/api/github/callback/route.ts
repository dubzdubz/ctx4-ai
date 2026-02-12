import { NextResponse } from "next/server";
import { upsertUserGithubConfig } from "@/lib/db/queries";
import {
  exchangeCodeForUserToken,
  listAccessibleRepos,
  verifyUserOwnsInstallation,
} from "@/lib/github/app";
import { createClient } from "@/lib/supabase/server";

/**
 * GitHub App installation callback.
 *
 * After a user installs the GitHub App with "Request user authorization
 * (OAuth) during installation" enabled, GitHub redirects here with:
 *   - `installation_id` — the installation that was created/modified
 *   - `code` — an OAuth authorization code proving the user's identity
 *   - `setup_action` — "install" or "update"
 *
 * Security: We exchange the `code` for a user token, then verify via
 * GET /user/installations that the installation_id actually belongs
 * to this GitHub user. This prevents installation hijacking via
 * crafted callback URLs with spoofed installation_ids.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const installationId = url.searchParams.get("installation_id");
  const setupAction = url.searchParams.get("setup_action");
  const code = url.searchParams.get("code");

  if (!installationId) {
    return NextResponse.redirect(new URL("/settings", url.origin));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", url.origin));
  }

  const installationIdNum = Number(installationId);

  // --- Security: Verify installation ownership via OAuth code ---
  if (!code) {
    console.warn(
      `[github/callback] No OAuth code for user ${user.id} — ` +
        "ensure 'Request user authorization during installation' is enabled",
    );
    return NextResponse.redirect(
      new URL("/settings?error=github_auth_required", url.origin),
    );
  }

  let userToken: string;
  try {
    userToken = await exchangeCodeForUserToken(code);
  } catch (error) {
    console.error("[github/callback] OAuth code exchange failed:", error);
    return NextResponse.redirect(
      new URL("/settings?error=github_auth_failed", url.origin),
    );
  }

  const isOwner = await verifyUserOwnsInstallation(
    userToken,
    installationIdNum,
  );
  if (!isOwner) {
    console.warn(
      `[github/callback] User ${user.id} attempted to claim ` +
        `installation ${installationId} they don't have access to`,
    );
    return NextResponse.redirect(
      new URL("/settings?error=installation_not_authorized", url.origin),
    );
  }
  // --- End security check ---

  // If this is a new installation with exactly one repo, save fully
  if (setupAction === "install") {
    try {
      const repos = await listAccessibleRepos(installationIdNum);

      if (repos.length === 1) {
        const repo = repos[0];
        await upsertUserGithubConfig({
          userId: user.id,
          installationId: installationIdNum,
          githubUsername: repo.owner.login,
          repoFullName: repo.full_name,
          repoId: repo.id,
          repoUrl: repo.clone_url,
          defaultBranch: repo.default_branch ?? "main",
        });

        return NextResponse.redirect(new URL("/settings", url.origin));
      }
    } catch (error) {
      console.error("[github/callback] Error listing repos:", error);
    }
  }

  // Multiple repos or update action — save the verified installation_id
  // to the DB (repo fields stay null until the user picks one)
  await upsertUserGithubConfig({
    userId: user.id,
    installationId: installationIdNum,
  });

  return NextResponse.redirect(
    new URL("/settings?select_repo=true", url.origin),
  );
}
