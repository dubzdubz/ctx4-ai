import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function MePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  // This page is protected by middleware — claims should always exist here
  if (!claims) {
    return null;
  }

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

        <div className="flex justify-end">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}
