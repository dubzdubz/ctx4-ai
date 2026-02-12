import { HomePage } from "@/components/home/home-page";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return <HomePage isAuthenticated={!!user} />;
}
