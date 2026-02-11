"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { User } from "@supabase/supabase-js";

interface OAuthAuthorizationFormProps {
	user: User;
	clientId: string;
	redirectUri: string;
	state?: string;
	scopes: string[];
	codeChallenge?: string;
	codeChallengeMethod?: string;
}

export function OAuthAuthorizationForm({
	user,
	clientId,
	redirectUri,
	state,
	scopes,
	codeChallenge,
	codeChallengeMethod,
}: OAuthAuthorizationFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleApprove = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

			// Build authorization request to Supabase
			const authUrl = new URL(`${supabaseUrl}/auth/v1/authorize`);
			authUrl.searchParams.set("client_id", clientId);
			authUrl.searchParams.set("redirect_uri", redirectUri);
			authUrl.searchParams.set("response_type", "code");
			authUrl.searchParams.set("scope", scopes.join(" "));

			if (state) {
				authUrl.searchParams.set("state", state);
			}

			if (codeChallenge && codeChallengeMethod) {
				authUrl.searchParams.set("code_challenge", codeChallenge);
				authUrl.searchParams.set("code_challenge_method", codeChallengeMethod);
			}

			// Redirect to Supabase authorization endpoint
			window.location.href = authUrl.toString();
		} catch (err) {
			console.error("Authorization error:", err);
			setError(
				err instanceof Error ? err.message : "Failed to authorize application",
			);
			setIsLoading(false);
		}
	};

	const handleDeny = () => {
		// Redirect back to client with error
		const errorUrl = new URL(redirectUri);
		errorUrl.searchParams.set("error", "access_denied");
		errorUrl.searchParams.set(
			"error_description",
			"User denied authorization",
		);

		if (state) {
			errorUrl.searchParams.set("state", state);
		}

		window.location.href = errorUrl.toString();
	};

	// Get user-friendly scope descriptions
	const getScopeDescription = (scope: string): string => {
		const descriptions: Record<string, string> = {
			openid: "Access your user ID",
			email: "Access your email address",
			profile: "Access your profile information",
			phone: "Access your phone number",
			"mcp:tools": "Execute tools on your behalf",
			"mcp:resources": "Access resources on your behalf",
		};

		return descriptions[scope] || `Access "${scope}"`;
	};

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Authorize Application</CardTitle>
				<CardDescription>
					An application is requesting access to your account
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{/* User info */}
				<div className="rounded-lg border p-3">
					<p className="text-sm text-muted-foreground">Signed in as</p>
					<p className="font-medium">{user.email}</p>
				</div>

				{/* Client info */}
				<div className="rounded-lg border p-3">
					<p className="text-sm text-muted-foreground">Application</p>
					<p className="font-medium">{clientId}</p>
					<p className="mt-1 text-xs text-muted-foreground">
						Redirect URI: {redirectUri}
					</p>
				</div>

				{/* Requested permissions */}
				<div>
					<p className="mb-2 text-sm font-medium">
						This application is requesting permission to:
					</p>
					<ul className="space-y-2">
						{scopes.map((scope) => (
							<li
								key={scope}
								className="flex items-start gap-2 text-sm"
							>
								<span className="mt-0.5 text-primary">•</span>
								<span>{getScopeDescription(scope)}</span>
							</li>
						))}
					</ul>
				</div>

				{error && (
					<div className="rounded-lg border border-destructive bg-destructive/10 p-3">
						<p className="text-sm text-destructive">{error}</p>
					</div>
				)}

				{/* Action buttons */}
				<div className="flex gap-3">
					<Button
						onClick={handleDeny}
						variant="outline"
						disabled={isLoading}
						className="flex-1"
					>
						Deny
					</Button>
					<Button
						onClick={handleApprove}
						disabled={isLoading}
						className="flex-1"
					>
						{isLoading ? "Authorizing..." : "Authorize"}
					</Button>
				</div>

				<p className="text-xs text-muted-foreground">
					By authorizing, you allow this application to access the requested
					information. You can revoke access at any time from your account
					settings.
				</p>
			</CardContent>
		</Card>
	);
}
