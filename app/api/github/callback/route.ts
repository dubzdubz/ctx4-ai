import { NextResponse } from "next/server";
import { upsertUserGithubConfig } from "@/lib/db/queries";
import { listAccessibleRepos } from "@/lib/github/app";
import { createClient } from "@/lib/supabase/server";

/**
 * GitHub App installation callback.
 *
 * After a user installs the GitHub App (or modifies their installation),
 * GitHub redirects here with `installation_id` and optionally `setup_action`.
 *
 * If the user selected exactly one repo during installation, we save the
 * config immediately and redirect to the dashboard. Otherwise, redirect
 * to the repo selection page.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const installationId = url.searchParams.get("installation_id");
  const setupAction = url.searchParams.get("setup_action");

  if (!installationId) {
    return NextResponse.redirect(
      new URL("/me", url.origin),
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", url.origin));
  }

  const installationIdNum = Number(installationId);

  // If this is a new installation, check if the user selected exactly one repo
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

        return NextResponse.redirect(new URL("/me", url.origin));
      }
    } catch (error) {
      console.error("[github/callback] Error listing repos:", error);
    }
  }

  // Multiple repos or update action — redirect to /me for repo selection
  const meUrl = new URL("/me", url.origin);
  meUrl.searchParams.set("installation_id", installationId);
  return NextResponse.redirect(meUrl);
}
