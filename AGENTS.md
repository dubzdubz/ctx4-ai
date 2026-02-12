# ctx4-ai - Agent Context

Next.js web app + MCP server for adding long-term context/memory to AI agents. Built with TypeScript, Next.js 16, and mcp-handler.

## Quick Reference

- **Stack**: TypeScript, Next.js 16 (App Router), pnpm, mcp-handler, Vercel Sandbox, Supabase Auth, Storybook
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
│   ├── api/                   # API routes
│   ├── auth/                  # OAuth endpoints
│   ├── settings/              # User settings / profile page
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── lib/
│   ├── auth/                  # Auth utilities (verify-token)
│   ├── content/               # Built-in guide content
│   ├── sandbox/               # SandboxManager + scanner
│   ├── supabase/              # Supabase client helpers
│   ├── tools/                 # MCP tool implementations
│   └── utils.ts               # Shared utilities
├── components/                # React UI components
├── scripts/                   # Build/dev scripts
├── docs/                      # Project documentation
│   ├── architecture.md        # Architecture decisions
│   ├── product.md             # Product overview
│   └── style-guide.md         # Code style & linting
└── AGENTS.md                  # This file (always in context)
```

## Architecture

Next.js application with MCP server endpoints, using Vercel Sandbox (Firecracker microVM) for isolated command execution. Git-backed filesystem with GitHub as source of truth.

```
[Claude/ChatGPT] → MCP Protocol → [Next.js App with MCP Handler]
                                        ├── OAuth 2.0 (Supabase)
                                        ├── User authorization (allowlist)
                                        ├── ctx_instructions() → reads from sandbox
                                        └── ctx_bash() → executes in sandbox
                                              ↓
                                         [Vercel Sandbox (microVM)]
                                           ├── /vercel/sandbox (git working directory)
                                           └── Seeded from user's GitHub repo
                                              ↓
                                         GitHub (source of truth)
```

### Key Design Decisions

- **Next.js + mcp-handler**: Unified codebase for MCP server and web UI, Vercel-native deployment
- **Vercel Sandbox** over Docker: True microVM isolation (Firecracker), stateless server, path to multi-user
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
- Config via GitHub App credentials, `VERCEL_OIDC_TOKEN`, and Supabase env vars

### SandboxManager (`lib/sandbox/manager.ts`)
- Creates sandbox seeded from git repo on first tool call (lazy initialization)
- Reuses existing sandbox via local expiry tracking
- Extends sandbox timeout when near expiry, recreates if expired
- Deduplicates concurrent `ensure()` and `extendTimeout()` calls
- Handles git config, credentials, commit, and push inside sandbox

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
cp .env.example .env  # Add GITHUB_REPO, GITHUB_TOKEN, and Supabase credentials

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
