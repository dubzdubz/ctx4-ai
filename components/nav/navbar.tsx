"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type NavbarProps = {
  isAuthenticated: boolean;
};

export function Navbar({ isAuthenticated }: NavbarProps) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-8">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight hover:opacity-80 transition-opacity"
        >
          ctx4.ai
        </Link>

        <div className="flex items-center gap-1">
          <Button
            render={<Link href="/docs/getting-started" />}
            nativeButton={false}
            variant="ghost"
            size="sm"
          >
            Docs
          </Button>

          {isAuthenticated ? (
            <>
              <Button
                render={<Link href="/settings" />}
                nativeButton={false}
                variant="ghost"
                size="sm"
              >
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                Sign out
              </Button>
            </>
          ) : (
            <Button
              render={<Link href="/auth/login" />}
              nativeButton={false}
              variant="ghost"
              size="sm"
            >
              Login
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
