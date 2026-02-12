import { NextResponse } from "next/server";
import { deleteUserGithubConfig } from "@/lib/db/queries";
import { sandboxPool } from "@/lib/sandbox/pool";
import { createClient } from "@/lib/supabase/server";

/**
 * Disconnect the user's GitHub integration.
 * Removes the GitHub config and clears any cached sandbox.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Remove the sandbox from the pool if it exists
    await sandboxPool.remove(user.id);

    // Delete the GitHub config from the database
    await deleteUserGithubConfig(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[github/disconnect] Error disconnecting GitHub:", error);
    return NextResponse.json(
      { error: "Failed to disconnect GitHub" },
      { status: 500 },
    );
  }
}
