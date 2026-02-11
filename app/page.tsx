import { createClient } from "@/lib/supabase/server"
import { LogoutButton } from "@/components/auth/logout-button"
import { LinkButton } from "@/components/ui/link-button"

export default async function Page() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-6xl font-bold">ctx4.ai</h1>
      <p className="text-xl text-muted-foreground">
        Your portable context layer for Claude & ChatGPT
      </p>
      {user ? (
        <>
          <p className="text-sm text-muted-foreground">
            Signed in as {user.email}
          </p>
          <LogoutButton />
        </>
      ) : (
        <LinkButton href="/auth/login" variant="default">
          Sign in
        </LinkButton>
      )}
    </div>
  )
}
