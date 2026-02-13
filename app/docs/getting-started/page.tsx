import type { Metadata } from "next";
import { GettingStarted } from "@/components/docs/getting-started";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Getting Started — ctx4.ai",
  description:
    "Set up your portable context layer for Claude & ChatGPT in minutes.",
};

export default async function GettingStartedPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return <GettingStarted isAuthenticated={!!user} />;
}
