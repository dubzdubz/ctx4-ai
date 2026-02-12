import { NextResponse } from "next/server";
import { getUserGithubConfig, upsertUserGithubConfig } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";

/**
 * Save the user's selected repository during onboarding.
 *
 * The installationId in the request body must match the user's existing
 * DB config (saved during the verified GitHub callback). This prevents
 * a user from linking an arbitrary installation to their account.
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

  // --- Security: Verify the installationId matches the user's verified config ---
  const config = await getUserGithubConfig(user.id);
  if (!config || config.installationId !== Number(installationId)) {
    console.warn(
      `[github/select-repo] User ${user.id} attempted to use ` +
        `unverified installation ${installationId}`,
    );
    return NextResponse.json(
      { error: "Installation not verified. Please reconnect GitHub." },
      { status: 403 },
    );
  }
  // --- End security check ---

  try {
    await upsertUserGithubConfig({
      userId: user.id,
      installationId: Number(installationId),
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
