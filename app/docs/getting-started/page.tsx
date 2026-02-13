import type { Metadata } from "next";
import { GettingStarted } from "@/components/docs/getting-started";
import { getUserGithubConfig } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Getting Started — ctx4.ai",
  description:
    "Set up your portable context layer for Claude & ChatGPT in minutes.",
};

export default async function GettingStartedPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const isAuthenticated = !!claims;

  const userId = claims?.sub as string | undefined;
  const githubConfig =
    userId != null ? await getUserGithubConfig(userId) : undefined;
  const hasLinkedRepo = !!githubConfig?.repoFullName;
  const linkedRepoName = githubConfig?.repoFullName ?? null;

  return (
    <GettingStarted
      isAuthenticated={isAuthenticated}
      hasLinkedRepo={hasLinkedRepo}
      linkedRepoName={linkedRepoName}
    />
  );
}
