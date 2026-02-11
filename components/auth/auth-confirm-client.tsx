"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export function AuthConfirmClient({ next }: { next: string }) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    const supabase = createClient()

    // Supabase redirects with either:
    // - Implicit flow: hash fragment (#access_token=...&refresh_token=...)
    // - PKCE flow: query param (?code=...)
    const handleAuthRedirect = async () => {
      if (typeof window === "undefined") return

      const hash = window.location.hash
      const code = new URLSearchParams(window.location.search).get("code")

      if (!hash && !code) {
        setStatus("error")
        return
      }

      // Supabase client auto-detects hash or code and persists session. Poll briefly
      // as the exchange can be async.
      for (let i = 0; i < 15; i++) {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          setStatus("success")
          // Full page navigation to ensure server receives new session cookies
          window.location.href = next
          return
        }
        await new Promise((r) => setTimeout(r, 200))
      }
      setStatus("error")
    }

    handleAuthRedirect()
  }, [next])

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p className="text-destructive">
          Invalid or expired link. Please request a new magic link.
        </p>
        <a href="/auth/login" className="mt-4 text-sm underline">
          Back to login
        </a>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <p className="text-muted-foreground">Signing you in...</p>
    </div>
  )
}
