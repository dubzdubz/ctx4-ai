import type { EmailOtpType } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AuthConfirmClient } from "@/components/auth/auth-confirm-client"

export default async function AuthConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string; next?: string }>
}) {
  const params = await searchParams
  const token_hash = params.token_hash
  const type = params.type as EmailOtpType | null
  const nextParam = params.next
  const next = nextParam?.startsWith("/") ? nextParam : "/"

  // PKCE flow: token_hash and type in query params (custom email template)
  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      redirect(next)
    }
    redirect(`/auth/error?error=${encodeURIComponent(error.message)}`)
  }

  // Implicit flow: tokens in hash fragment (default Supabase email template)
  // Hash is never sent to server, so we render a client component that handles it
  return <AuthConfirmClient next={next} />
}
