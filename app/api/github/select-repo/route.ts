import { NextResponse } from "next/server";
import { upsertUserGithubConfig } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";

/**
 * Save the user's selected repository during onboarding.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    installationId,
    repoId,
    repoFullName,
    repoUrl,
    defaultBranch,
    githubUsername,
  } = body;

  if (!installationId || !repoId || !repoFullName || !repoUrl) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  try {
    await upsertUserGithubConfig({
      userId: user.id,
      installationId,
      githubUsername,
      repoFullName,
      repoId,
      repoUrl,
      defaultBranch: defaultBranch ?? "main",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[github/select-repo] Error saving config:", error);
    return NextResponse.json(
      { error: "Failed to save repository configuration" },
      { status: 500 },
    );
  }
}
