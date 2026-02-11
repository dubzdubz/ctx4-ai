import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { authorizationId, approved } = await request.json();

    if (!authorizationId) {
      return NextResponse.json(
        { error: "Missing authorization ID" },
        { status: 400 },
      );
    }

    // Create Supabase client with the user's session (cookie-based auth)
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (approved) {
      const { data, error } =
        await supabase.auth.oauth.approveAuthorization(authorizationId);

      if (error) {
        console.error("Supabase approve error:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Supabase returns a redirect_url that sends the user back to the
      // OAuth client with an authorization code
      return NextResponse.json({ redirectUrl: data.redirect_url });
    }

    const { data, error } =
      await supabase.auth.oauth.denyAuthorization(authorizationId);

    if (error) {
      console.error("Supabase deny error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Supabase returns a redirect_url that sends the user back to the
    // OAuth client with an error
    return NextResponse.json({ redirectUrl: data.redirect_url });
  } catch (error) {
    console.error("OAuth approval error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
