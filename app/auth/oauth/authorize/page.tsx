import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OAuthAuthorizationForm } from "@/components/auth/oauth-authorization-form";

export default async function OAuthAuthorizePage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const supabase = await createClient();
	const params = await searchParams;

	// Check if user is authenticated
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		// Redirect to login with return URL
		const returnUrl = new URL("/auth/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
		returnUrl.searchParams.set("next", `/auth/oauth/authorize?${new URLSearchParams(params as Record<string, string>).toString()}`);
		redirect(returnUrl.toString());
	}

	// Extract OAuth parameters from query string
	const clientId = params.client_id as string | undefined;
	const redirectUri = params.redirect_uri as string | undefined;
	const state = params.state as string | undefined;
	const scope = params.scope as string | undefined;
	const codeChallenge = params.code_challenge as string | undefined;
	const codeChallengeMethod = params.code_challenge_method as string | undefined;
	const responseType = params.response_type as string | undefined;

	// Validate required OAuth parameters
	if (!clientId || !redirectUri || !responseType) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="w-full max-w-md rounded-lg border border-destructive bg-destructive/10 p-6">
					<h2 className="mb-2 text-lg font-semibold text-destructive">
						Invalid Authorization Request
					</h2>
					<p className="text-sm text-muted-foreground">
						Missing required OAuth parameters. Please contact the application
						developer.
					</p>
				</div>
			</div>
		);
	}

	// Parse scopes
	const scopes = scope?.split(" ") || [];

	return (
		<div className="flex min-h-screen items-center justify-center px-4">
			<OAuthAuthorizationForm
				user={user}
				clientId={clientId}
				redirectUri={redirectUri}
				state={state}
				scopes={scopes}
				codeChallenge={codeChallenge}
				codeChallengeMethod={codeChallengeMethod}
			/>
		</div>
	);
}
