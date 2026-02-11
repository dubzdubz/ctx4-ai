import {
  BotIcon,
  ExternalLinkIcon,
  GithubIcon,
  KeyRoundIcon,
  MailIcon,
  PaletteIcon,
  ShieldCheckIcon,
  UserIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";

const REPO_URL = "https://github.com/dubzdubz/next-mcp-starter";

const features = [
  {
    icon: BotIcon,
    title: "MCP Server",
    description:
      "Built-in Model Context Protocol server powered by mcp-handler. Supports Streamable HTTP and SSE transports out of the box.",
    badge: "mcp-handler",
  },
  {
    icon: ShieldCheckIcon,
    title: "OAuth 2.1 Authorization",
    description:
      "Full OAuth 2.1 flow with PKCE, dynamic client registration, and consent screen. MCP clients authenticate automatically.",
    badge: "OAuth 2.1",
  },
  {
    icon: MailIcon,
    title: "Magic Link Auth",
    description:
      "Passwordless authentication with Supabase magic links. Users sign in via email — no passwords to manage.",
    badge: "Supabase",
  },
  {
    icon: KeyRoundIcon,
    title: "Token Verification",
    description:
      "Server-side JWT verification with JWKS. MCP tool calls are authenticated and scoped to the signed-in user.",
    badge: "Secure",
  },
  {
    icon: PaletteIcon,
    title: "Shadcn UI + Tailwind v4",
    description:
      "Pre-configured with Shadcn UI components, Tailwind CSS v4, and Biome for linting and formatting.",
    badge: "UI",
  },
  {
    icon: ExternalLinkIcon,
    title: "Protected Resource Metadata",
    description:
      "Standards-compliant OAuth discovery at /.well-known/oauth-protected-resource for automatic MCP client configuration.",
    badge: "Spec",
  },
];

const references = [
  {
    label: "mcp-handler",
    href: "https://github.com/vercel/mcp-handler",
  },
  {
    label: "Supabase OAuth 2.1",
    href: "https://supabase.com/docs/guides/auth/oauth-server",
  },
  {
    label: "MCP Spec",
    href: "https://modelcontextprotocol.io/docs/learn/server-concepts",
  },
  {
    label: "MCP Inspector",
    href: "https://github.com/MCPJam/inspector",
  },
  {
    label: "Next.js Docs",
    href: "https://nextjs.org/docs",
  },
];

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-end gap-3 px-6 py-4">
        <LinkButton href="/me" variant="outline" className="gap-1.5 text-sm">
          <UserIcon className="size-4" />
          Account
        </LinkButton>
      </nav>

      {/* Hero */}
      <header className="flex flex-col items-center gap-6 px-6 pt-12 pb-16 text-center">
        <Badge variant="outline" className="font-mono text-xs tracking-wide">
          Next.js + MCP + OAuth
        </Badge>
        <h1 className="max-w-2xl text-5xl leading-tight font-bold tracking-tight sm:text-6xl">
          next-mcp-starter
        </h1>
        <p className="max-w-lg text-lg text-muted-foreground">
          A starter template for building authenticated MCP servers with Next.js
          and Supabase. Ship tools that AI clients can discover and call, with
          OAuth 2.1 built in.
        </p>

        <div className="mt-2 flex items-center gap-3">
          <LinkButton
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            variant="default"
            className="gap-2"
          >
            <GithubIcon className="size-4" />
            View on GitHub
          </LinkButton>
          <LinkButton href="/me" variant="outline">
            Sign in
          </LinkButton>
        </div>
      </header>

      {/* Features */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="flex flex-col">
              <CardHeader>
                <div className="mb-2 flex items-center gap-2">
                  <f.icon className="size-5 text-muted-foreground" />
                  <Badge variant="secondary" className="text-[10px]">
                    {f.badge}
                  </Badge>
                </div>
                <CardTitle className="text-base">{f.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {f.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick start snippet */}
      <section className="mx-auto w-full max-w-5xl px-6 pb-20">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick start</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto rounded-md bg-muted p-4 font-mono text-sm leading-relaxed">
              <code>{`# Clone and install
git clone ${REPO_URL}.git
cd next-mcp-starter
pnpm install

# Configure environment
cp .env.example .env
# Add your Supabase credentials to .env

# Start dev server
pnpm dev`}</code>
            </pre>
          </CardContent>
        </Card>
      </section>

      {/* References */}
      <footer className="mt-auto border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-6">
          {references.map((r) => (
            <a
              key={r.href}
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {r.label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
