import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { getUserGithubConfig } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";

export default async function MePage() {
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
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Your account</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium">{claims.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">User ID</span>
              <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
                {claims.sub}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Role</span>
              <Badge variant="secondary">{claims.role}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">GitHub</CardTitle>
            <CardDescription>
              {githubConfig
                ? "Your context repository is connected."
                : "Connect a GitHub repository to use as your context store."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {githubConfig ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Repository
                  </span>
                  <span className="text-sm font-medium">
                    {githubConfig.repoFullName}
                  </span>
                </div>
                {githubConfig.githubUsername && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      GitHub user
                    </span>
                    <span className="text-sm font-medium">
                      {githubConfig.githubUsername}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Branch</span>
                  <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
                    {githubConfig.defaultBranch}
                  </code>
                </div>
              </>
            ) : installUrl ? (
              <LinkButton href={installUrl} variant="outline">
                Connect GitHub
              </LinkButton>
            ) : (
              <p className="text-sm text-muted-foreground">
                GitHub App not configured.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
