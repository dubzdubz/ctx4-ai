import { NextResponse } from "next/server";
import { getUserGithubConfig } from "@/lib/db/queries";
import { listAccessibleRepos } from "@/lib/github/app";
import { createClient } from "@/lib/supabase/server";

/**
 * List repositories accessible to the user's GitHub App installation.
 *
 * Requires the user to be authenticated and have an installation_id
 * (either from their saved config or as a query parameter during onboarding).
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Allow passing installation_id as query param (during onboarding before config is saved)
  const url = new URL(request.url);
  const installationIdParam = url.searchParams.get("installation_id");

  let installationId: number | undefined;

  if (installationIdParam) {
    installationId = Number(installationIdParam);
  } else {
    const config = await getUserGithubConfig(user.id);
    installationId = config?.installationId;
  }

  if (!installationId) {
    return NextResponse.json(
      { error: "No GitHub installation found. Please connect GitHub first." },
      { status: 404 },
    );
  }

  try {
    const repos = await listAccessibleRepos(installationId);

    return NextResponse.json({
      repositories: repos.map((repo) => ({
        id: repo.id,
        fullName: repo.full_name,
        name: repo.name,
        owner: repo.owner.login,
        cloneUrl: repo.clone_url,
        defaultBranch: repo.default_branch,
        private: repo.private,
        description: repo.description,
      })),
    });
  } catch (error) {
    console.error("[github/repos] Error listing repos:", error);
    return NextResponse.json(
      { error: "Failed to list repositories" },
      { status: 500 },
    );
  }
}
