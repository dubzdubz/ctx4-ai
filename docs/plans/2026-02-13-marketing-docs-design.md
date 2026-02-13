# Marketing, Docs & Onboarding Improvements

## Context

The current homepage is minimal — title, one-liner, 3 feature cards, and a "Get Started" button. There's no explanation of what ctx4 actually does, why someone should use it, or what makes it different. The Getting Started page is solid but there's nothing in between "what is this?" and "how to set it up."

## Audience

Technical users who already know what MCP is. No need to explain MCP itself — focus on what ctx4 does and why.

## Primary CTA

Sign up and connect to the hosted version (ctx4-ai.vercel.app).

---

## 1. Homepage Improvements

**File:** `components/home/home-page.tsx`

### Hero Section (revised)

- **Headline:** "A Notion for your AI agents" (or similar — communicates organized, persistent, user-owned knowledge)
- **Subheading:** "Portable context and long-term memory for Claude & ChatGPT. Open source. Works via MCP. Your data lives in your GitHub repo — you own it."
- **CTAs:** Two buttons side by side:
  - "Get Started" (primary, links to `/docs/getting-started`)
  - "How It Works" (secondary/outline, links to `/docs/how-it-works`)

### Feature Cards (keep existing 3, improve descriptions)

1. **Personal Context** — "Your preferences, role, and working style. The AI loads this at the start of every conversation."
2. **Knowledge Base** — "Processes, docs, and reference material. Organized by you or the AI."
3. **Skills** — "Reusable routines and workflows. Teach the AI once, use everywhere."

### Trust Signals Row

Small, understated horizontal row below features. Icons/badges:

- **Open Source** — Apache 2.0
- **Free** — Hosted version is free
- **Your Data** — Lives in your GitHub repo
- **Portable** — Works with any MCP client

### Bottom Section (replace current)

Replace the vague current footer text with a compact "how it works" teaser:

Three steps in a horizontal flow:
1. **Connect** — Add the MCP server to Claude or ChatGPT
2. **Context loads** — The AI reads your instructions, knowledge, and skills
3. **AI remembers** — New learnings are saved to your repo automatically

Then: "Learn more →" linking to `/docs/how-it-works`

---

## 2. How It Works Page

**Route:** `/docs/how-it-works`
**Component:** `components/docs/how-it-works.tsx`

Uses `PageLayout` (same as Getting Started) for consistency.

### Content Sections

#### The Problem (2-3 sentences)

Every conversation starts from scratch. You repeat your preferences, your team's processes, your project context. Built-in memory features are locked to one provider and opaque — you can't see or control what's stored.

#### The Solution (2-3 sentences)

ctx4 is an MCP server that gives your AI persistent, structured context stored in a GitHub repo you control. Connect Claude, ChatGPT, or any MCP client — your context follows you everywhere.

#### How the Flow Works

Visual step-by-step (could be a simple diagram or styled steps):

1. **You connect your MCP client** — Add the ctx4 MCP URL to Claude, ChatGPT, or any MCP client
2. **AI loads your context** — The AI calls `ctx_instructions` to read your full context: who you are, what you know, what skills you've taught it
3. **You have a conversation** — The AI works with your full context loaded
4. **AI saves what matters** — During the conversation, the AI saves relevant preferences, learnings, and knowledge via `ctx_bash`
5. **Auto-syncs to GitHub** — Changes are committed and pushed to your repo automatically
6. **Next conversation picks up where you left off** — Any client, any time. Your context is always there.

#### What Gets Stored

Show the repo structure with explanations:

```
your-context-repo/
├── resources/
│   ├── instructions.md    # Your preferences & instructions for the AI
│   └── context.md         # Who you are, what you do
├── skills/
│   └── skill-creator/     # Reusable workflows (e.g., code review, writing)
└── knowledge/             # Memories, notes, learnings
```

Brief explanation: Resources are loaded every conversation. Skills are invoked on demand. Knowledge is searchable reference material.

#### Architecture (brief, for technical users)

Simple diagram showing:

```
Claude / ChatGPT / Any MCP Client
        │
        ▼ (MCP protocol)
   ctx4 Server (Next.js on Vercel)
        │
        ├── OAuth 2.0 auth (Supabase)
        ├── Per-user isolation
        │
        ▼
   Sandbox (Firecracker microVM)
        │
        ├── Git working directory
        └── Auto-commit & push
               │
               ▼
          Your GitHub Repo
```

One paragraph explaining: each user gets an isolated sandbox (Firecracker microVM). The sandbox clones your repo on creation. Every change is committed and pushed automatically. The sandbox is ephemeral — GitHub is the source of truth.

#### CTA

"Ready to try it?" → Get Started button

---

## 3. Why ctx4 Page

**Route:** `/docs/why-ctx4`
**Component:** `components/docs/why-ctx4.tsx`

Uses `PageLayout` for consistency.

### Content Sections

#### "Why not just use built-in memory?"

Claude and ChatGPT both have memory features. But they're limited:

- **Locked to one provider** — Switch from Claude to ChatGPT and you lose everything
- **Opaque** — You can't see, search, or export what's stored
- **No structure** — Just a flat list of facts with no organization
- **No skills** — You can't teach the AI reusable workflows
- **No control** — The provider decides what to remember and what to forget

With ctx4: your context is portable, visible, structured, and yours.

#### "Why not build your own MCP server?"

You absolutely could. ctx4 is open source specifically so you can learn from it or fork it. But out of the box, ctx4 gives you:

- **Auth & multi-tenancy** — OAuth 2.0, per-user isolation, JWT verification
- **Sandboxed execution** — Each user gets an isolated Firecracker microVM
- **GitHub sync** — Auto-commit and push on every change
- **Guide system** — Built-in instructions that teach the AI how to use your context
- **Skill framework** — Structured, reusable AI workflows
- **Onboarding** — Interactive setup that scaffolds your repo

#### What Makes ctx4 Different

Clean list of differentiators:

| | ctx4 | Built-in Memory | DIY MCP Server |
|---|---|---|---|
| **Portable** | Any MCP client | One provider only | Depends |
| **You own your data** | GitHub repo you control | Provider's servers | Depends |
| **Open source** | Apache 2.0 | No | N/A |
| **Structured** | Instructions, knowledge, skills | Flat list | Up to you |
| **Secure** | Isolated microVM per user | Provider managed | Up to you |
| **Free** | Yes | Varies | Self-hosted |

#### CTA

"Try it now" → Get Started button

---

## 4. Navigation / Linking

The docs pages should be discoverable:

- Homepage "How It Works" button → `/docs/how-it-works`
- Homepage "Learn more →" link → `/docs/how-it-works`
- How It Works page links to Why ctx4 and Getting Started
- Why ctx4 page links to Getting Started
- Consider a simple docs nav/breadcrumb if we're adding multiple docs pages

---

## 5. What We're NOT Doing

- No changes to Getting Started page (it's already good)
- No blog, changelog, or heavy marketing pages
- No screenshots or GIFs (can add later)
- No pricing page (it's free)
- No SEO optimization pass (can do later)

---

## Implementation Order

1. Homepage improvements (hero, feature cards, trust signals, teaser)
2. How It Works page
3. Why ctx4 page
4. Cross-linking between pages
