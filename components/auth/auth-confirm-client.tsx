"use client";

import { useEffect, useState } from "react";
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
        <div className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            Invalid or expired link
          </h1>
          <p className="text-sm text-muted-foreground">
            Please request a new magic link to sign in.
          </p>
          <LinkButton href="/auth/login" variant="outline" className="w-full">
            Back to login
          </LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center px-6 pt-24 pb-16">
      <div className="w-full max-w-sm space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Signing you in...
        </h1>
        <p className="text-sm text-muted-foreground">Please wait a moment</p>
      </div>
    </div>
  );
}
