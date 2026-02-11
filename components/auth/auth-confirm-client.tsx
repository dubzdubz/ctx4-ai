"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { createClient } from "@/lib/supabase/client";

export function AuthConfirmClient({ next }: { next: string }) {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  useEffect(() => {
    const supabase = createClient();

    // Supabase redirects with either:
    // - Implicit flow: hash fragment (#access_token=...&refresh_token=...)
    // - PKCE flow: query param (?code=...)
    const handleAuthRedirect = async () => {
      if (typeof window === "undefined") return;

      const hash = window.location.hash;
      const code = new URLSearchParams(window.location.search).get("code");

      if (!hash && !code) {
        setStatus("error");
        return;
      }

      // Supabase client auto-detects hash or code and persists session. Poll briefly
      // as the exchange can be async.
      for (let i = 0; i < 15; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setStatus("success");
          // Full page navigation to ensure server receives new session cookies
          window.location.href = next;
          return;
        }
        await new Promise((r) => setTimeout(r, 200));
      }
      setStatus("error");
    };

    handleAuthRedirect();
  }, [next]);

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center px-6 pt-24 pb-16">
        <div className="w-full max-w-lg">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Invalid or expired link</CardTitle>
            <CardDescription>
              Please request a new magic link to sign in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LinkButton href="/auth/login" variant="outline" className="w-full">
              Back to login
            </LinkButton>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-6 pt-24 pb-16">
      <div className="w-full max-w-lg">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Signing you in...</CardTitle>
          <CardDescription>Please wait a moment</CardDescription>
        </CardHeader>
      </Card>
      </div>
    </div>
  );
}
