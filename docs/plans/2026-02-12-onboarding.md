# Improve New User Onboarding

**Date**: 2026-02-12
**Status**: Planned

## Context

New users face a cold start: after connecting GitHub, they land in an empty repo with no scaffolding, no guidance on what to put where, and no web-based documentation. We're adding three things to fix this:

1. **MCP prompt** (`onboarding`) — a single LLM-driven flow that scaffolds the repo AND gathers user context
2. **Template GitHub repo** — one-click "Use this template" to create a pre-scaffolded repo
3. **Getting started page** — `/docs/getting-started` on the website

---

## 1. MCP Onboarding Prompt

A single `onboarding` prompt registered via `server.registerPrompt()` that combines repo initialization and user onboarding.

### Behavior

The prompt returns messages instructing the LLM to:

**Phase 1 — Scaffold (if needed)**
1. Call `ctx_instructions()` to check current state
2. If repo is empty/missing structure, create it using `ctx_bash`:
   - `resources/instructions.md` — starter with frontmatter
   - `resources/context.md` — starter context overview
   - `skills/` directory
   - `knowledge/` directory
3. Include the `skill-creator` skill in `skills/skill-creator/SKILL.md`

**Phase 2 — Onboarding conversation**
1. Ask the user about themselves:
   - What they do (role, projects, tech stack)
   - How they prefer to work (communication style, coding preferences)
   - What they want the AI to remember across conversations
2. Save answers to appropriate files:
   - Key facts → `resources/context.md`
   - Preferences/instructions → `resources/instructions.md`
   - Detailed knowledge → `knowledge/` files
3. Summarize what was saved and suggest next steps

### Files

| Action | File |
|--------|------|
| Create | `lib/prompts/index.ts` — `registerAllPrompts(server)` |
| Create | `lib/prompts/onboarding.ts` — onboarding prompt implementation |
| Modify | `app/[transport]/route.ts` — call `registerAllPrompts(server)` |

---

## 2. Template GitHub Repo

A public repo (`ctx4-ai/template`) marked as a [GitHub template repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository).

### Template contents
```
resources/
  instructions.md    — starter with frontmatter + placeholder sections
  context.md         — starter context overview with guidance comments
skills/
  skill-creator/
    SKILL.md         — the skill-creator skill
knowledge/
  .gitkeep
README.md            — explains the repo structure and links to ctx4.ai
```

### Where it lives

**Separate repo** (`ctx4-ai/template`) — this IS the product artifact users fork. Maintaining a copy in this repo would drift. This repo's docs and prompt just link to it.

**Out of scope for this PR** — we'll create the template repo separately after this work lands. The onboarding prompt handles scaffolding for users who start with an empty repo anyway.

---

## 3. Getting Started Page

### Route

`/docs/getting-started`

### Content

1. **Overview** — What ctx4.ai does (1-2 sentences)
2. **Step 1: Create your context repo** — Link to template repo ("Use this template") + explain the structure
3. **Step 2: Sign up & connect GitHub** — Login, install GitHub App, select repo
4. **Step 3: Connect your AI client** — How to add the MCP server to Claude Desktop / ChatGPT (config snippets)
5. **Step 4: Start using it** — Mention the onboarding prompt, show example first conversation

### Files

| Action | File |
|--------|------|
| Create | `app/docs/getting-started/page.tsx` — server component (page wrapper) |
| Create | `components/docs/getting-started.tsx` — client component (content + animations) |
| Modify | `components/home/home-page.tsx` — add "Getting Started" link |

---

## Verification

1. **Prompt**: `pnpm dev` → MCP inspector → `prompts/list` returns `onboarding`, `prompts/get` returns correct messages
2. **Docs page**: `localhost:3000/docs/getting-started` renders correctly
3. **Home page**: Docs link appears and navigates
4. **Lint**: `pnpm lint` passes
5. **Build**: `pnpm build` succeeds
