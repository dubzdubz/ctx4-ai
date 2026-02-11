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
	authorizationId: string;
	clientName: string;
	redirectUri: string;
	scopes: string[];
}

export function OAuthAuthorizationForm({
	user,
	authorizationId,
	clientName,
	redirectUri,
	scopes,
}: OAuthAuthorizationFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleDecision = async (approved: boolean) => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/oauth/approve", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ authorizationId, approved }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Authorization failed");
			}

			// Redirect to the URL provided by Supabase (back to the OAuth client)
			if (data.redirectUrl) {
				window.location.href = data.redirectUrl;
			}
		} catch (err) {
			console.error("Authorization error:", err);
			setError(
				err instanceof Error
					? err.message
					: "Failed to process authorization",
			);
			setIsLoading(false);
		}
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
				<CardTitle>Authorize {clientName}</CardTitle>
				<CardDescription>
					This application wants to access your account
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
					<p className="font-medium">{clientName}</p>
					<p className="mt-1 text-xs text-muted-foreground">
						Redirect URI: {redirectUri}
					</p>
				</div>

				{/* Requested permissions */}
				{scopes.length > 0 && (
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
				)}

				{error && (
					<div className="rounded-lg border border-destructive bg-destructive/10 p-3">
						<p className="text-sm text-destructive">{error}</p>
					</div>
				)}

				{/* Action buttons */}
				<div className="flex gap-3">
					<Button
						onClick={() => handleDecision(false)}
						variant="outline"
						disabled={isLoading}
						className="flex-1"
					>
						Deny
					</Button>
					<Button
						onClick={() => handleDecision(true)}
						disabled={isLoading}
						className="flex-1"
					>
						{isLoading ? "Processing..." : "Authorize"}
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
