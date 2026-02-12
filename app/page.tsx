import { LinkButton } from "@/components/ui/link-button";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-6xl font-bold">ctx4.ai</h1>
      <p className="text-xl text-muted-foreground">
        Your portable context layer for Claude & ChatGPT
      </p>
      {user ? (
        <LinkButton href="/settings" variant="default">
          Settings
        </LinkButton>
      ) : (
        <LinkButton href="/auth/login" variant="default">
          Get Started
        </LinkButton>
      )}
    </div>
  );
}
