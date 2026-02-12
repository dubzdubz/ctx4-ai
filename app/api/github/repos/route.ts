import { NextResponse } from "next/server";
import { getUserGithubConfig } from "@/lib/db/queries";
import { listAccessibleRepos } from "@/lib/github/app";
import { createClient } from "@/lib/supabase/server";

/**
 * List repositories accessible to the user's GitHub App installation.
 *
 * The installation_id is always resolved from the user's DB config
 * (saved during the verified GitHub callback). We never accept
 * installation_id as a query parameter to prevent enumeration of
 * other users' installations.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await getUserGithubConfig(user.id);
  if (!config?.installationId) {
    return NextResponse.json(
      { error: "No GitHub installation found. Please connect GitHub first." },
      { status: 404 },
    );
  }

  try {
    const repos = await listAccessibleRepos(config.installationId);

    return NextResponse.json({
      installationId: config.installationId,
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
