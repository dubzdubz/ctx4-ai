import { Navbar } from "@/components/nav/navbar";
import { createClient } from "@/lib/supabase/server";

export async function NavbarWrapper() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return <Navbar isAuthenticated={!!user} />;
}
