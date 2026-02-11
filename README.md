# next-mcp-starter

A **Next.js** starter template for building authenticated **MCP servers** with **Supabase** auth.

Ship tools that AI clients can discover and call — with OAuth 2.1 built in.

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

The MCP handler in `app/[transport]/route.ts` responds on `/mcp`, `/sse`, and `/streamable-http`. Authentication is handled by `withMcpAuth`, which delegates to `lib/auth/verify-token.ts` for JWT validation.

Supabase session middleware runs via `proxy.ts`, protecting browser routes while allowing Bearer-authenticated MCP requests to pass through.

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/)
- A [Supabase](https://supabase.com/) project

### 1. Clone and install

```bash
git clone https://github.com/dubzdubz/next-mcp-starter.git
cd next-mcp-starter
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in your Supabase credentials from [Supabase Dashboard → Settings → API](https://supabase.com/dashboard/project/_/settings/api):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
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
    "next-mcp-starter": {
      "url": "http://localhost:3000/sse",
      "type": "http"
    }
  }
}
```

The client will automatically:
1. Discover OAuth configuration from Supabase
2. Register itself dynamically (if enabled)
3. Open browser for user authorization
4. Exchange tokens and make authenticated MCP requests

### Testing with MCP Inspector

Use the [MCP Inspector](https://github.com/MCPJam/inspector) to test and debug your server:

```bash
npx @mcpjam/inspector@latest
```

### Available Example Tools

| Tool | Description |
|------|-------------|
| `roll_dice` | Roll a dice with a specified number of sides (authenticated) |

## Project Structure

```
├── app/
│   ├── [transport]/route.ts          # MCP handler (mcp, sse, streamable-http)
│   ├── .well-known/                  # OAuth protected resource metadata
│   ├── api/oauth/approve/route.ts    # OAuth consent approval endpoint
│   ├── auth/
│   │   ├── confirm/page.tsx          # Magic link confirmation
│   │   ├── error/page.tsx            # Auth error page
│   │   ├── login/page.tsx            # Login page (magic link form)
│   │   └── oauth/authorize/page.tsx  # OAuth consent screen
│   ├── me/page.tsx                   # User profile (protected)
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing page
│   └── globals.css                   # Tailwind v4 + Shadcn theme
├── components/
│   ├── auth/                         # Auth components (login, logout, consent)
│   └── ui/                           # Shadcn UI components
├── lib/
│   ├── auth/verify-token.ts          # JWT verification for MCP auth
│   └── supabase/                     # Supabase client/server/middleware
├── proxy.ts                          # Next.js middleware (session + route protection)
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

Edit `lib/supabase/middleware.ts` to change which paths are public or protected. MCP transport routes (`/mcp`, `/sse`, `/streamable-http`) are automatically bypassed when a Bearer token is present.

## Tech Stack

| Dependency | Version | Purpose |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | 16 | React framework |
| [mcp-handler](https://github.com/vercel/mcp-handler) | ^1.0.7 | MCP server adapter |
| [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk) | 1.25.2 | MCP SDK |
| [Supabase](https://supabase.com/) | SSR + JS | Auth & database |
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
