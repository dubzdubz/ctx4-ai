# ctx4-ai - Agent Context

Next.js web app + MCP server for adding long-term context/memory to AI agents. Built with TypeScript, Next.js 16, and mcp-handler.

## Quick Reference

- **Stack**: TypeScript, Next.js 16 (App Router), pnpm, mcp-handler, Vercel Sandbox, Supabase Auth, Drizzle ORM, GitHub App (Octokit), Storybook
- **Dev server**: `pnpm dev` → Next.js at `localhost:3000`, MCP at `localhost:3000/mcp`
- **Build**: `pnpm build && pnpm start`
- **Lint**: `pnpm lint` (Biome) / `pnpm lint:fix`
- **Storybook**: `pnpm storybook` → `localhost:6006`
- **Test**: `vitest` (unit), Playwright (e2e via Storybook)
- **Auth**: OAuth 2.0 via Supabase — standard OAuth flow with `/authorize` and `/token` endpoints

## Project Structure

```
├── app/
│   ├── [transport]/route.ts   # MCP handler (tools registration)
│   ├── api/
│   │   ├── github/            # GitHub App endpoints (callback, repos, select-repo, disconnect)
│   │   └── oauth/             # OAuth approval endpoint
│   ├── auth/                  # OAuth endpoints
│   ├── settings/              # User settings / profile page (incl. GitHub integration)
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── lib/
│   ├── auth/                  # Auth utilities (verify-token)
│   ├── content/               # Built-in guide content
│   ├── db/                    # Drizzle ORM (schema, queries, client)
│   ├── github/                # GitHub App client (Octokit, installation tokens)
│   ├── sandbox/               # SandboxManager, SandboxManagerPool, scanner
│   ├── supabase/              # Supabase client helpers
│   ├── tools/                 # MCP tool implementations
│   └── utils.ts               # Shared utilities
├── components/
│   ├── github/                # GitHub integration UI (repo manager)
│   ├── auth/                  # Auth components
│   └── ui/                    # Shadcn UI components
├── drizzle/                   # Database migrations
├── scripts/                   # Build/dev scripts
├── docs/                      # Project documentation
│   ├── architecture.md        # Architecture decisions
│   ├── product.md             # Product overview
│   └── style-guide.md         # Code style & linting
└── CLAUDE.md                  # This file (always in context)
```

## Architecture

Next.js application with MCP server endpoints, using Vercel Sandbox (Firecracker microVM) for isolated command execution. Git-backed filesystem with GitHub as source of truth.

```
[Claude/ChatGPT] → MCP Protocol → [Next.js App with MCP Handler]
                                        ├── OAuth 2.0 (Supabase)
                                        ├── Per-user isolation (userId from JWT)
                                        ├── ctx_instructions() → reads from sandbox
                                        └── ctx_bash() → executes in sandbox
                                              ↓
                                         [SandboxManagerPool — per-user sandbox cache]
                                              ↓
                                         [Vercel Sandbox (microVM)]
                                           ├── /vercel/sandbox (git working directory)
                                           └── Seeded from user's GitHub repo (via GitHub App)
                                              ↓
                                         GitHub (source of truth)
```

### Key Design Decisions

- **Next.js + mcp-handler**: Unified codebase for MCP server and web UI, Vercel-native deployment
- **Vercel Sandbox** over Docker: True microVM isolation (Firecracker), stateless server, per-user sandboxes
- **Tools over Resources**: MCP tools are model-controlled (LLM calls proactively), resources are app-driven. Primary discovery via `ctx_instructions()` tool.
- **Git as source of truth**: Sandbox filesystem is ephemeral. Git clone on sandbox creation, git push after changes.
- **Filesystem over Database**: LLMs understand filesystem operations natively (read, write, grep, ls)

## Current Implementation

### MCP Tools
- `ctx_instructions()` — returns the full context bootstrap: guide + instructions.md + context.md + resources index + skills index. **Primary entry point for LLMs.**
- `ctx_bash({ command, comment? })` — executes bash in sandbox (`/vercel/sandbox`), auto-commits and pushes to GitHub
- `ctx_roll_dice()` — test/demo tool

### Auth
- OAuth 2.0 via Supabase with `withMcpAuth` wrapper from mcp-handler
- Per-user data isolation (each user can only access their own GitHub repo/sandbox)
- JWT verification via Supabase JWKS
- GitHub App with OAuth-verified installation ownership (prevents installation hijacking)
- Config via GitHub App credentials, `VERCEL_OIDC_TOKEN`, and Supabase env vars

### GitHub Integration (`lib/github/app.ts`)
- GitHub App with per-installation tokens (1-hour validity, auto-cached by Octokit)
- Commits appear as `ctx4-ai[bot]`
- OAuth code exchange during callback verifies user owns the installation
- Per-user config stored in `user_github_configs` table (Drizzle ORM + Supabase PostgreSQL)

### Sandbox (`lib/sandbox/`)
- **SandboxManagerPool** (`pool.ts`): In-memory `Map<userId, SandboxManager>` cache
- **SandboxManager** (`manager.ts`): Per-user sandbox lifecycle
  - Constructor accepts `userId` and config (installationId, repoUrl, defaultBranch)
  - Creates sandbox seeded from user's GitHub repo on first tool call (lazy init)
  - Uses `getInstallationToken()` for git auth (refreshes after 50 min)
  - Reuses existing sandbox via local expiry tracking
  - Extends sandbox timeout when near expiry, recreates if expired
  - Deduplicates concurrent `ensure()` and `extendTimeout()` calls

### Sandbox Data Directory Convention
```
/vercel/sandbox/
├── resources/          # Context resources (frontmatter: name + description)
├── skills/             # Agent skills (SKILL.md per skill with frontmatter)
└── knowledge/          # General knowledge and memories
```

## Agent Instructions

### Documentation Maintenance

1. **Keep `docs/` up to date**: When making significant changes, update or create relevant documentation in `docs/`.
2. **Save important learnings**: Document architectural decisions, gotchas, and patterns discovered during development.
3. **Update this file**: Keep AGENTS.md current with high-level project info and pointers to detailed docs.

### Component Development

4. **Add Storybook stories for new components**: When creating or significantly modifying UI components in `components/`, add a `.stories.tsx` file alongside the component (e.g. `component.stories.tsx`). Cover key states (default, loading, error, empty, etc.) and mock API calls when needed.

### What to Document

- Architecture decisions and rationale
- API contracts and tool definitions
- Setup instructions and dependencies
- Known issues and workarounds
- Testing strategies

### Documentation Location

| Topic | Location |
|-------|----------|
| High-level overview | `AGENTS.md` |
| Architecture details | `docs/architecture.md` |
| Product overview | `docs/product.md` |
| Code style & linting | `docs/style-guide.md` |
| Usage instructions | `README.md` |

## Important Learnings

### Testing Strategy

**Correct testing workflow:**
```bash
# 1. Setup (one-time)
vercel link           # Link to a Vercel project
vercel env pull       # Pull auth token to .env.local
cp .env.example .env  # Add DATABASE_URL, GitHub App credentials, and Supabase credentials

# 2. Run
pnpm dev              # Start Next.js dev server

# 3. Test MCP via Inspector or client
# - Call ctx_instructions → should return guide + context from sandbox
# - Call ctx_bash({ command: "ls -la" }) → should list repo contents

# 4. Unit tests
pnpm vitest

# 5. Storybook
pnpm storybook
```
