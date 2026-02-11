import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/** MCP transport routes that authenticate via Bearer token (withMcpAuth). */
const MCP_TRANSPORT_PATHS = ["/mcp", "/sse", "/streamable-http"] as const;

/** Path prefixes that do not require authentication. */
const PUBLIC_PATH_PREFIXES = [
  "/",
  "/.well-known",
  "/mcp",
  "/auth/login",
  "/auth/error",
  "/auth/confirm",
  "/auth/oauth/authorize",
] as const;

function isMcpTransportPath(pathname: string): boolean {
  return MCP_TRANSPORT_PATHS.some((path) => pathname === path);
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATH_PREFIXES.some((prefix) =>
    prefix === "/"
      ? pathname === "/"
      : pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function updateSession(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const pathname = request.nextUrl.pathname;

  // Skip session middleware ONLY for MCP transport routes with Bearer auth.
  // These routes authenticate via token validation in their handlers using withMcpAuth.
  // All other routes must use cookie-based auth.
  if (authHeader?.startsWith("Bearer ") && isMcpTransportPath(pathname)) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
