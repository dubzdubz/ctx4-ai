# ctx4.ai

Your portable context layer for Claude & ChatGPT

---

## Features

- **MCP Server** — Powered by [mcp-handler](https://github.com/vercel/mcp-handler). Supports Streamable HTTP and SSE transports via a single dynamic route.
- **OAuth 2.1 Authorization** — Full authorization code flow with PKCE, dynamic client registration, and a consent screen. MCP clients authenticate automatically.
- **Magic Link Auth** — Passwordless sign-in with Supabase magic links. No passwords to manage.
- **Token Verification** — Server-side JWT verification using Supabase JWKS. MCP tool calls are authenticated and scoped to the signed-in user.
- **Protected Resource Metadata** — Standards-compliant `/.well-known/oauth-protected-resource` endpoint for automatic MCP client configuration.
- **Shadcn UI + Tailwind v4** — Pre-configured UI components with Tailwind CSS v4, Biome linting, and formatting.

## How It Works

```
MCP Client (e.g. Claude, Cursor)
  │
  ├─ Discovers OAuth config via /.well-known/oauth-protected-resource
  ├─ Registers dynamically with Supabase OAuth 2.1 Server
  ├─ Opens browser → user signs in (magic link) → approves scopes
  └─ Exchanges code for tokens (PKCE)
        │
        ▼
  app/[transport]/route.ts  ← MCP handler (mcp-handler)
        │
        ├─ verifyToken()    ← validates Bearer JWT via Supabase JWKS
        └─ server tools     ← your custom MCP tools (e.g. roll_dice)
```

The MCP handler in `app/[transport]/route.ts` responds on `/mcp` (HTTP transport). Authentication is handled by `withMcpAuth`, which delegates to `lib/auth/verify-token.ts` for JWT validation.

Supabase session middleware runs via `proxy.ts`, protecting browser routes while allowing Bearer-authenticated MCP requests to pass through.

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/)
- A [Supabase](https://supabase.com/) project

### 1. Clone and install

```bash
git clone https://github.com/dubzdubz/ctx4-ai.git
cd ctx4-ai
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in your credentials (see `.env.example` for the full list):

```
# Supabase (from Dashboard → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (Supabase PostgreSQL connection string)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# GitHub App (from GitHub Developer Settings)
NEXT_PUBLIC_GITHUB_APP_SLUG=your-app-slug
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_APP_CLIENT_ID=Iv1.xxxxxxxxxx
GITHUB_APP_CLIENT_SECRET=xxxxxxxxxxxx
```

### 3. Configure Supabase Auth

**Magic link auth:**

In Supabase Dashboard → **Authentication** → **URL Configuration**:
- Set **Site URL** to `http://localhost:3000` (or your production URL)
- Add `http://localhost:3000/auth/confirm` to **Redirect URLs**

**OAuth 2.1 Server:**

In Supabase Dashboard → **Authentication** → **OAuth Server**:
- Enable **OAuth 2.1 Server**
- Set **Authorization Path** to: `/auth/oauth/authorize`
- (Optional) Enable **Dynamic Client Registration** to allow MCP clients to self-register

### 4. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Connecting an MCP Client

Add the server to your MCP client (Cursor, VS Code, etc.):

```json
{
  "servers": {
    "ctx4-ai": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

The client will automatically:
1. Discover OAuth configuration from Supabase
2. Register itself dynamically (if enabled)
3. Open browser for user authorization
4. Exchange tokens and make authenticated MCP requests

### Running Onboarding (Optional but Recommended)

Once connected, run the onboarding prompt to set up your context repo:

```
/ctx4:onboarding
```

This will scaffold your repo and ask a few questions about your preferences and workflow.

### Adding System Prompt (Optional but Recommended)

For best results, add this to your client's custom instructions or system prompt:

```
Use the ctx4 MCP to manage my long-term context and memory. Always call ctx_instructions first before using ctx_bash to understand how to interact with my context. Use it to store preferences, learnings, and anything that should persist across conversations.
```

**Where to add:**
- **Claude**: Settings → General → Personal Preferences
- **ChatGPT**: Settings → Personalization → Custom Instructions

### Testing with MCP Inspector

Use the [MCP Inspector](https://github.com/MCPJam/inspector) to test and debug your server:

```bash
npx @mcpjam/inspector@latest
```

### Available Tools

| Tool | Description |
|------|-------------|
| `ctx_instructions` | Returns full context bootstrap (guide + instructions + context + resource/skill indexes) |
| `ctx_bash` | Sandboxed bash in `/vercel/sandbox` with auto git commit and push |
| `roll_dice` | Roll a dice with a specified number of sides (demo tool) |

## Project Structure

```
├── app/
│   ├── [transport]/route.ts          # MCP handler (HTTP transport)
│   ├── .well-known/                  # OAuth protected resource metadata
│   ├── api/
│   │   ├── github/                   # GitHub App endpoints (callback, repos, select-repo, disconnect)
│   │   └── oauth/approve/route.ts    # OAuth consent approval endpoint
│   ├── auth/
│   │   ├── confirm/page.tsx          # Magic link confirmation
│   │   ├── error/page.tsx            # Auth error page
│   │   ├── login/page.tsx            # Login page (magic link form)
│   │   └── oauth/authorize/page.tsx  # OAuth consent screen
│   ├── settings/page.tsx             # User settings / profile + GitHub integration
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing page
│   └── globals.css                   # Tailwind v4 + Shadcn theme
├── components/
│   ├── auth/                         # Auth components (login, logout, consent)
│   ├── github/                       # GitHub integration UI (repo manager)
│   └── ui/                           # Shadcn UI components
├── lib/
│   ├── auth/verify-token.ts          # JWT verification for MCP auth
│   ├── db/                           # Drizzle ORM (schema, queries, client)
│   ├── github/app.ts                 # GitHub App client (Octokit, installation tokens)
│   ├── sandbox/                      # SandboxManager, SandboxManagerPool, scanner
│   ├── supabase/                     # Supabase client/server/middleware
│   └── tools/                        # MCP tool implementations
├── drizzle/                          # Database migrations
├── proxy.ts                          # Next.js middleware (session + route protection)
├── drizzle.config.ts                 # Drizzle ORM configuration
├── biome.jsonc                       # Biome linter/formatter config
└── .env.example                      # Environment variables template
```

## Customization

### Adding MCP Tools

Register new tools in `app/[transport]/route.ts`:

```typescript
server.registerTool(
  "my_tool",
  {
    title: "My Tool",
    description: "Does something useful.",
    inputSchema: {
      query: z.string(),
    },
  },
  async ({ query }, extra) => {
    const userEmail = extra.authInfo?.extra?.email;
    return {
      content: [{ type: "text", text: `Result for ${query}` }],
    };
  },
);
```

### Modifying Auth Scopes

Edit the `requiredScopes` array in `app/[transport]/route.ts` to enforce specific OAuth scopes:

```typescript
const authHandler = withMcpAuth(handler, verifyToken, {
  required: true,
  requiredScopes: ["openid", "email", "mcp:tools"],
  // ...
});
```

Available scopes: `openid`, `email`, `profile`, `mcp:tools`, `mcp:resources`.

### Adjusting Route Protection

Edit `proxy.ts` and `lib/supabase/middleware.ts` to change which paths are public or protected. The MCP transport route (`/mcp`) is automatically bypassed when a Bearer token is present.

## Tech Stack

| Dependency | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16 | React framework |
| [mcp-handler](https://github.com/vercel/mcp-handler) | ^1.0.7 | MCP server adapter |
| [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk) | 1.25.2 | MCP SDK |
| [Supabase](https://supabase.com/) | SSR + JS | Auth & database |
| [Drizzle ORM](https://orm.drizzle.team/) | ^0.45 | Database ORM |
| [Octokit](https://github.com/octokit/octokit.js) | ^5.0 | GitHub App integration |
| [Shadcn UI](https://ui.shadcn.com/) | base-vega | UI components |
| [Tailwind CSS](https://tailwindcss.com/) | v4 | Styling |
| [Biome](https://biomejs.dev/) | ^2.3 | Linting & formatting |

## References

- [mcp-handler](https://github.com/vercel/mcp-handler) — Vercel adapter for MCP servers on Next.js
- [Supabase OAuth 2.1 Server](https://supabase.com/docs/guides/auth/oauth-server) — OAuth 2.1 and OIDC identity provider docs
- [MCP Inspector](https://github.com/MCPJam/inspector) — Test and debug MCP servers
- [MCP Server Concepts](https://modelcontextprotocol.io/docs/learn/server-concepts) — Tools, resources, and prompts
- [MCP Authorization Specification](https://modelcontextprotocol.io/specification/draft/basic/authorization) — OAuth flow for MCP
- [Next.js Documentation](https://nextjs.org/docs) — Framework docs

## License

MIT
