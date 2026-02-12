import { LogoutButton } from "@/components/auth/logout-button";
import { GithubRepoManager } from "@/components/github/github-repo-manager";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getUserGithubConfig } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  // This page is protected by middleware — claims should always exist here
  if (!claims) {
    return null;
  }

  const githubConfig = await getUserGithubConfig(claims.sub as string);

  const appSlug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG;
  const installUrl = appSlug
    ? `https://github.com/apps/${appSlug}/installations/new`
    : null;

  return (
    <div className="flex min-h-screen flex-col items-center px-6 pt-24 pb-16">
      <div className="w-full max-w-lg space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            Your account
          </h1>
          <LogoutButton />
        </div>

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">Profile</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{claims.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">User ID</span>
              <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
                {claims.sub}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Role</span>
              <Badge variant="secondary">{claims.role}</Badge>
            </div>
          </div>
        </section>

        <Separator />

        <GithubRepoManager
          config={
            githubConfig?.repoFullName
              ? {
                  repoFullName: githubConfig.repoFullName,
                  githubUsername: githubConfig.githubUsername,
                  defaultBranch: githubConfig.defaultBranch ?? "main",
                  installationId: githubConfig.installationId,
                }
              : null
          }
          installUrl={installUrl}
        />
      </div>
    </div>
  );
}
