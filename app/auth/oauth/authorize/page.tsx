import { redirect } from "next/navigation";
import { OAuthAuthorizationForm } from "@/components/auth/oauth-authorization-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/server";

export default async function OAuthAuthorizePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const authorizationId = params.authorization_id as string | undefined;

  if (!authorizationId) {
    return (
      <div className="flex min-h-screen flex-col items-center px-6 pt-24 pb-16">
        <div className="w-full max-w-lg">
          <Alert variant="destructive" className="w-full max-w-md">
            <AlertTitle>Invalid Authorization Request</AlertTitle>
            <AlertDescription>
              Missing authorization_id parameter. The OAuth flow may not have
              been initiated correctly.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login, preserving authorization_id so we return here after login
    const next = `/auth/oauth/authorize?authorization_id=${encodeURIComponent(authorizationId)}`;
    redirect(`/auth/login?next=${encodeURIComponent(next)}`);
  }

  // Get authorization details from Supabase using the authorization_id.
  // This returns either:
  // - OAuthAuthorizationDetails (user needs to consent) — has `authorization_id` field
  // - OAuthRedirect (user already consented) — has `redirect_url` field
  const { data: authDetails, error } =
    await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

  if (error || !authDetails) {
    return (
      <div className="flex min-h-screen flex-col items-center px-6 pt-24 pb-16">
        <div className="w-full max-w-lg">
          <Alert variant="destructive" className="w-full max-w-md">
            <AlertTitle>Authorization Error</AlertTitle>
            <AlertDescription>
              {error?.message || "Invalid or expired authorization request."}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // If the user has already consented, redirect immediately
  if ("redirect_url" in authDetails) {
    redirect(authDetails.redirect_url);
  }

  // User needs to consent — show the consent page
  const scopes = authDetails.scope?.trim() ? authDetails.scope.split(" ") : [];

  return (
    <div className="flex min-h-screen flex-col items-center px-6 pt-24 pb-16">
      <div className="w-full max-w-lg">
        <OAuthAuthorizationForm
          user={user}
          authorizationId={authorizationId}
          clientName={authDetails.client.name}
          scopes={scopes}
        />
      </div>
    </div>
  );
}
