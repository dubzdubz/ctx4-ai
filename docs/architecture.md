# Architecture

## High-Level Design

Next.js application with MCP server endpoints, using Vercel Sandbox (Firecracker microVM) for isolated command execution. Git-backed filesystem with GitHub as source of truth.

```
[Claude/ChatGPT Client]
        ↓
    OAuth 2.0 Authentication (Supabase)
        ↓
    MCP Protocol (with bearer token)
        ↓
[Next.js App with MCP Handler]
  ├── /mcp endpoint (HTTP transport)
  ├── OAuth endpoints (/auth/oauth/authorize, /api/oauth/approve)
  ├── User authorization check (allowlist)
  ├── ctx_instructions() → reads from sandbox
  ├── ctx_bash() → executes in sandbox
  └── manages sandbox lifecycle
        ↓
[Vercel Sandbox — ephemeral Firecracker microVM]
  ├── /vercel/sandbox (git working directory)
  ├── git + bash (pre-installed)
  └── Seeded from user's GitHub repo on creation
        ↓
    GitHub (source of truth)
```

## Key Architectural Decisions

### Next.js with mcp-handler

**Decision:** Use Next.js App Router with mcp-handler for MCP server integration.

**Rationale:**
- Unified codebase — MCP server and web UI in one application
- Vercel-native deployment
- mcp-handler provides seamless Next.js integration
- HTTP transport via dynamic route handler
- Built-in OAuth support with withMcpAuth wrapper

**Framework:** `mcp-handler` (Vercel's official Next.js MCP adapter)

### Vercel Sandbox Over Docker

**Decision:** Use Vercel Sandbox microVMs for command execution.

**Rationale:**
- True microVM isolation (Firecracker) — MCP server never executes untrusted commands in its own process
- Stateless server — can deploy to Vercel without Docker
- Path to multi-user — each user gets their own sandbox
- Better dev experience — `pnpm dev` locally, no Docker required

### Filesystem Over Database

**Decision:** Use actual filesystem operations instead of a database abstraction.

**Rationale:**
- LLMs understand filesystem operations natively (read, write, grep, glob, ls, edit)
- No abstraction leakage - tools map directly to operations
- Simple implementation
- Natural organization (folders, files, text content)

### Git for Versioning

**Decision:** Each user's memory directory is a git repository.

**Rationale:**
- Built-in audit trail (every change is a commit)
- Natural backup mechanism (push to GitHub)
- Enables future features (undo, restore, conflict resolution)
- Familiar tooling for debugging

### Tools Over Resources

**Decision:** Tools are the primary interface. Resources can be added later if needed.

**Rationale:**
- MCP resources are **application-driven** — the host app decides when to inject them
- MCP tools are **model-controlled** — the LLM calls them proactively
- Primary discovery via `ctx_instructions()` tool

### MCP as Interface

**Decision:** Expose memory operations via Model Context Protocol.

**Rationale:**
- Native protocol for Claude
- ChatGPT integration via adapters
- Standardized tool interface
- Future-proof as MCP adoption grows

## Authentication & Authorization

### OAuth 2.0 with Supabase

**Decision:** Use Supabase OAuth provider for authentication.

**Rationale:**
- Standard OAuth 2.0/2.1 flow works with Claude, ChatGPT, and other AI clients
- No custom header support needed
- Supports multiple authentication methods (email, social providers, SSO)
- Enterprise-grade security with JWT validation
- Discovery endpoints for automatic client configuration

**Implementation:**
- `withMcpAuth()` wrapper from mcp-handler integrates with Next.js route handlers
- Token verification via `lib/auth/verify-token.ts` using Supabase JWKS
- Automatic endpoints: `/.well-known/oauth-protected-resource`, OAuth consent flows
- Supports both ES256 (recommended) and HS256 (legacy) JWT tokens
- OAuth works seamlessly with existing Next.js auth (cookie-based for web, bearer for MCP)

### User Authorization Model

**Decision:** Per-user data isolation via authenticated user ID.

**How it works:**
- Supabase OAuth issues a JWT with `sub` claim = user ID
- Every MCP tool call extracts the user ID from the verified JWT
- `sandboxPool.getForUser(userId)` loads only that user's GitHub config from the database
- Each user can only access their own repo/sandbox — no cross-user access is possible
- User signup is controlled via Supabase invites (no open registration)

### GitHub App Installation Security

**Decision:** Verify installation ownership via OAuth code exchange during GitHub App callback.

**Threat model:** GitHub App callback URLs receive `installation_id` as a query parameter. GitHub warns: "Bad actors can hit this URL with a spoofed installation_id." Without verification, an attacker could link another user's GitHub installation to their own account and gain read/write access to the victim's repository via the sandbox.

**Implementation:**
- GitHub App has "Request user authorization (OAuth) during installation" enabled
- Callback receives both `installation_id` and `code` (OAuth authorization code)
- Server exchanges `code` for a user access token via `POST /login/oauth/access_token`
- Server calls `GET /user/installations` with that token to verify the user owns the installation
- Only after verification: installation_id is saved to DB (repo fields nullable until user picks one)
- `/api/github/repos` reads installation_id from DB config — never from query params
- `/api/github/select-repo` verifies the submitted `installationId` matches the user's DB config

**Key files:**
- `lib/github/app.ts` — `exchangeCodeForUserToken()`, `verifyUserOwnsInstallation()`
- `app/api/github/callback/route.ts` — OAuth verification in callback
- `app/api/github/repos/route.ts` — installation_id from trusted sources only
- `app/api/github/select-repo/route.ts` — verifies installation before saving

### Security Layers

1. **Authentication (Supabase):** Who are you?
   - User authenticates via OAuth flow
   - Supabase validates credentials
   - Access token issued

2. **Authorization (Server):** What can you access?
   - Server validates user ID against allowlist
   - Only authorized users can call MCP tools
   - Unauthorized users receive clear error message

3. **Installation ownership (GitHub OAuth):** Is this your repo?
   - GitHub OAuth code proves user identity during app installation
   - `GET /user/installations` verifies the installation belongs to the user
   - Prevents installation hijacking via spoofed callback URLs

## System Components

### Next.js Application

**Framework:** Next.js 16+ with App Router

**Responsibilities:**
- Serve MCP endpoints via dynamic route handlers
- Handle MCP protocol requests
- Manage sandbox lifecycle (create, reuse, timeout)
- Execute commands via Vercel Sandbox SDK
- Commit and push changes to git
- Serve web UI (future: memory browsing interface)

**Key Files:**
- `app/[transport]/route.ts` - MCP handler with tool registrations
- `lib/sandbox/manager.ts` - Sandbox lifecycle management
- `lib/sandbox/scanner.ts` - Resource and skill discovery
- `lib/auth/verify-token.ts` - JWT token verification

### Sandbox Manager (`lib/sandbox/manager.ts`)

Manages per-user Vercel Sandbox instances via `SandboxManagerPool` (`lib/sandbox/pool.ts`):
- **Pool**: In-memory `Map<userId, SandboxManager>` cache — each user gets their own sandbox
- Constructor accepts `userId` and config (installationId, repoUrl, defaultBranch)
- Creates sandbox seeded from user's GitHub repo on first tool call (lazy initialization)
- Uses `getInstallationToken()` for git auth (refreshes after 50 min)
- Reuses existing sandbox via local expiry tracking (avoids `Sandbox.get()` round-trips)
- Extends sandbox timeout when near expiry, recreates if expired
- Deduplicates concurrent `ensure()` and `extendTimeout()` calls
- Configures git credentials inside sandbox

### Storage Layer

Sandbox filesystem at `/vercel/sandbox/` (ephemeral):

```
/vercel/sandbox/
├── resources/          # Context resources (frontmatter: name + description)
├── skills/             # Agent skills (SKILL.md per skill)
└── knowledge/          # General knowledge and memories
```

Git is the source of truth — sandbox is re-seeded from git on creation.

## MCP Interface

### Tools

| Tool | Description | Git Commit? |
|------|-------------|-------------|
| `ctx_instructions` | Returns full context bootstrap (guide + instructions + context + resource/skill indexes). Primary entry point for LLMs. | No |
| `ctx_bash` | Sandboxed bash in `/vercel/sandbox` | Yes (on changes) |

### Tool Registration Pattern

```typescript
server.registerTool(
  "tool_name",
  {
    title: "Tool Title",
    description: "Tool description",
    inputSchema: {
      param: z.string(),
    },
  },
  async ({ param }, extra) => {
    // Access auth info
    const userId = extra.authInfo?.extra?.userId;

    // Return MCP response
    return {
      content: [{ type: "text", text: "result" }],
    };
  },
);
```

## Technology Stack

- **Framework:** Next.js 16+ (App Router)
- **Runtime:** Node.js 20+
- **MCP Integration:** mcp-handler (Vercel's Next.js adapter)
- **Package Manager:** pnpm
- **Language:** TypeScript
- **Sandbox:** Vercel Sandbox (Firecracker microVM)
- **Storage:** Ephemeral sandbox filesystem + Git
- **Database:** Drizzle ORM + Supabase PostgreSQL
- **GitHub:** Octokit (GitHub App with installation tokens)
- **Auth:**
  - Supabase OAuth 2.0 (user authentication)
  - Vercel OIDC token (sandbox access)
  - GitHub App installation tokens (repository access)
- **Deployment:** Vercel (or any Next.js host)

## Multi-User Support

### Current State

- OAuth authentication with Supabase ✅
- User authorization via allowlist ✅
- Per-user GitHub App installations with ownership verification ✅
- Per-user sandbox instances keyed by user ID ✅
- GitHub OAuth code exchange prevents installation hijacking ✅
- Installation ID never exposed as client-controllable parameter ✅

## Deferred Features

- **Snapshots:** Snapshot sandbox after git clone to skip re-cloning on next session
- **Background git push:** Return output immediately, push in background
- **`git ls-remote` optimization:** Check if remote HEAD changed before pulling
- **Redis sandbox pool:** Replace in-memory Map with Redis for horizontal scaling
- **Platform migration:** SandboxManager abstraction supports swapping to Modal, E2B, etc.
- **Conflict Resolution:** Beyond last-write-wins
- **Custom Web UI:** Rich editing and visualization
- **Search Indexes:** Full-text search beyond grep
