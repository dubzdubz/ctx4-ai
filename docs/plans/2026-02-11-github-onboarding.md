# Multi-User GitHub Onboarding

## Overview

Transform ctx4-ai from single-user (hardcoded `GITHUB_REPO`/`GITHUB_TOKEN`) to multi-user where each user connects their GitHub App and selects their private ctx repository.

## Architecture

### GitHub App with Installation Tokens
- Users install the GitHub App and select specific repos
- We store only `installation_id` (not tokens)
- Octokit generates tokens on-demand (1-hour validity, auto-cached)
- Commits appear as `ctx4-ai[bot]`

### Database: Single Table with Drizzle
One table stores everything we need per user - no separate tables for installations vs repos.

### Sandbox Caching: In-Memory
Sandboxes are ephemeral. Use in-memory `Map<userId, SandboxManager>` for caching active sandboxes. No database needed. (Redis later if we scale horizontally.)

## Database Schema (Drizzle)

```typescript
// lib/db/schema.ts
import { pgTable, uuid, bigint, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const userGithubConfigs = pgTable('user_github_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(),  // References auth.users

  // GitHub App installation
  installationId: bigint('installation_id', { mode: 'number' }).notNull(),
  githubUsername: text('github_username'),

  // Selected repository
  repoFullName: text('repo_full_name').notNull(),    // e.g., "username/my-ctx-repo"
  repoId: bigint('repo_id', { mode: 'number' }).notNull(),
  repoUrl: text('repo_url').notNull(),               // HTTPS clone URL
  defaultBranch: text('default_branch').default('main'),

  // Metadata
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

## Code Changes

### Files to Modify

1. **`lib/sandbox/manager.ts`**
   - Constructor accepts `userId` and `repoConfig`
   - Uses `getInstallationToken(installationId)` for git auth
   - Create `SandboxManagerPool` class with in-memory `Map<string, SandboxManager>`

2. **`lib/tools/ctx-bash.ts`**
   - Get `userId` from `extra.authInfo`
   - Get sandbox via `sandboxPool.getForUser(userId)`

3. **`lib/tools/ctx-instructions.ts`**
   - Same pattern as ctx-bash

4. **`lib/supabase/middleware.ts`**
   - Check if user has GitHub configured
   - Redirect to `/onboarding` if not

### Files to Create

```
lib/
├── db/
│   ├── index.ts              # Drizzle client setup
│   ├── schema.ts             # Table definitions
│   └── queries.ts            # CRUD functions for user_github_configs
├── github/
│   └── app.ts                # Octokit GitHub App client
├── sandbox/
│   └── pool.ts               # SandboxManagerPool (in-memory cache)

app/
├── api/github/
│   ├── callback/route.ts     # GitHub App installation callback
│   └── repos/route.ts        # List user's accessible repos
├── onboarding/
│   ├── page.tsx              # Onboarding entry/router
│   ├── connect-github/page.tsx
│   └── select-repo/page.tsx
```

## GitHub App Client

```typescript
// lib/github/app.ts
import { App } from "octokit";

export const githubApp = new App({
  appId: process.env.GITHUB_APP_ID!,
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
});

export async function getOctokitForInstallation(installationId: number) {
  return await githubApp.getInstallationOctokit(installationId);
}

export async function getInstallationToken(installationId: number): Promise<string> {
  const octokit = await githubApp.getInstallationOctokit(installationId);
  const { token } = await octokit.auth({ type: "installation" }) as { token: string };
  return token;
}

export async function listAccessibleRepos(installationId: number) {
  const octokit = await getOctokitForInstallation(installationId);
  const { data } = await octokit.rest.apps.listReposAccessibleToInstallation();
  return data.repositories;
}
```

## Sandbox Pool (In-Memory Cache)

```typescript
// lib/sandbox/pool.ts
import { SandboxManager } from './manager';
import { getUserGithubConfig } from '@/lib/db/queries';

class SandboxManagerPool {
  private managers = new Map<string, SandboxManager>();

  async getForUser(userId: string): Promise<SandboxManager> {
    if (!this.managers.has(userId)) {
      const config = await getUserGithubConfig(userId);
      if (!config) throw new Error('User has no GitHub config');

      const manager = new SandboxManager(userId, config);
      this.managers.set(userId, manager);
    }
    return this.managers.get(userId)!;
  }

  async remove(userId: string): Promise<void> {
    const manager = this.managers.get(userId);
    if (manager) {
      await manager.stop();
      this.managers.delete(userId);
    }
  }
}

export const sandboxPool = new SandboxManagerPool();
```

## Onboarding Flow

```
Login (Supabase)
      ↓
Middleware checks: has GitHub config?
   ├── No  → /onboarding
   │            ↓
   │         /onboarding/connect-github
   │            User clicks "Connect GitHub"
   │            → Redirect to: github.com/apps/APP_NAME/installations/new
   │            → User selects repos
   │            → GitHub redirects to /api/github/callback?installation_id=XXX
   │            → We save installation_id, redirect to select-repo
   │            ↓
   │         /onboarding/select-repo
   │            Fetch repos via listAccessibleRepos()
   │            User picks one
   │            Save full config to user_github_configs
   │            ↓
   └── Yes → MCP ready / Dashboard
```

## Environment Variables

```bash
# GitHub App (from GitHub Developer Settings)
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_APP_CLIENT_ID=Iv1.xxxxxxxxxx
GITHUB_APP_CLIENT_SECRET=xxxxxxxxxxxx

# Existing (Supabase provides this)
DATABASE_URL=postgres://...  # Supabase connection string for Drizzle
```

## Implementation Phases

### Phase 1: Database (~1.5 hours)
- [ ] Install: `drizzle-orm`, `drizzle-kit`, `postgres`
- [ ] Setup Drizzle config (`drizzle.config.ts`) with Supabase connection
- [ ] Create schema in `lib/db/schema.ts`
- [ ] Run migration: `drizzle-kit push`
- [ ] Create `lib/db/queries.ts` with CRUD functions

### Phase 2: GitHub Integration (~2 hours)
- [ ] Install: `octokit`
- [ ] Add GitHub App env vars to `.env`
- [ ] Create `lib/github/app.ts`
- [ ] Create `/api/github/callback/route.ts`
- [ ] Create `/api/github/repos/route.ts`

### Phase 3: Sandbox Refactor (~2 hours)
- [ ] Create `lib/sandbox/pool.ts`
- [ ] Modify `SandboxManager` constructor to accept config
- [ ] Update `_create()` to use `getInstallationToken()`
- [ ] Update `ctx_bash` and `ctx_instructions` to use pool

### Phase 4: Onboarding UI (~2 hours)
- [ ] Create `/onboarding/connect-github/page.tsx`
- [ ] Create `/onboarding/select-repo/page.tsx`
- [ ] Update middleware for redirects

### Phase 5: Polish (~1 hour)
- [ ] Add GitHub status to `/me` page
- [ ] Handle "Change Repo" / "Disconnect GitHub"
- [ ] Remove legacy `GITHUB_REPO`/`GITHUB_TOKEN` env var usage

**Total: ~8.5 hours**

## Verification

1. **New user flow**: Sign up → Connect GitHub → Select repo → Use ctx_bash
2. **Token generation**: Verify Octokit generates tokens on-demand
3. **Multi-user isolation**: Two users have separate sandboxes with different repos
4. **Sandbox caching**: Same user reuses sandbox within session
