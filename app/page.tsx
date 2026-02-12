import { LinkButton } from "@/components/ui/link-button";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-5xl font-bold tracking-tight md:text-6xl">ctx4.ai</h1>
      <p className="max-w-md text-lg text-muted-foreground md:text-xl">
        Your portable context layer for Claude & ChatGPT
      </p>
      {user ? (
        <LinkButton href="/settings" variant="default" size="lg">
          Settings
        </LinkButton>
      ) : (
        <LinkButton href="/auth/login" variant="default" size="lg">
          Get Started
        </LinkButton>
      )}
    </div>
  );
}
