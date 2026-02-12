"use client";

import type { User } from "@supabase/supabase-js";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface OAuthAuthorizationFormProps {
  user: User;
  authorizationId: string;
  clientName: string;
  scopes: string[];
}

export function OAuthAuthorizationForm({
  user,
  authorizationId,
  clientName,
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
        err instanceof Error ? err.message : "Failed to process authorization",
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
    <div className="w-full max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Authorize {clientName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This application wants to access your account
        </p>
      </div>

      {/* User info */}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Signed in as</p>
        <p className="font-medium">{user.email}</p>
      </div>

      {/* Requested permissions */}
      {scopes.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">
            This application is requesting permission to:
          </p>
          <ul className="ml-5 list-disc space-y-1 text-sm text-muted-foreground">
            {scopes.map((scope) => (
              <li key={scope}>{getScopeDescription(scope)}</li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
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
    </div>
  );
}
