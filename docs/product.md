# Product Overview

## Vision

A memory/context layer for AI agents that persists across conversations. Users connect their Claude or ChatGPT to the MCP server, and the AI can read and write memories that survive session boundaries.

## Target Users

Prosumers and non-technical people in startups who rely on ChatGPT/Claude for daily work. Users who want their AI assistant to remember context without manually re-explaining it every time.

## Core Value Proposition

**Stop repeating yourself.** Tell the AI once about your preferences, company processes, or project context. The AI remembers and uses that context in future conversations.

## Memory Types

The system supports three categories of persistent memory:

1. **Personal Context** - User preferences, role, communication style
   - "I'm the CEO of Acme Corp, prefer concise answers"
   - "I work in UTC+1 timezone"

2. **Knowledge Base** - Company processes, documentation, shared knowledge
   - Product specs, API documentation
   - Team processes and workflows

3. **Extracted Learnings** - Insights and patterns from past conversations
   - Solutions to recurring problems
   - Decisions made and their rationale
   - Note: Not raw conversation history, but distilled insights

## User Experience

### Initial Setup

Users run the `/ctx4:onboarding` prompt after connecting their MCP client. This:
- Sets up the context repo structure if not already present
- Asks a few questions about user preferences and workflow
- Saves initial context to the appropriate files

**Recommended system prompt** for best results:
```
Use the ctx4 MCP to manage my long-term context and memory. Always call ctx_instructions first before using ctx_bash to understand how to interact with my context. Use it to store preferences, learnings, and anything that should persist across conversations.
```

### Memory Creation

**AI-initiated by default** - The AI proactively notices information worth remembering and saves it. This feels magical - users don't think about memory management, it just works.

Users can also explicitly request: "remember this" or "save this for later."

### Organization

**AI auto-organized** - The AI decides where to store memories using a sensible folder structure. Users can browse and override if needed, but the default should "just work."

### Browsing Memories

**Primary use case for MVP** - Users can browse what the AI knows about them. Answers the question: "what context is my AI working with?"

Editing and curation can come later.

## Design Philosophy

- **Magical by default** - AI manages memory automatically
- **Transparent** - Users can see what's stored
- **Simple** - No complex memory management required
- **Persistent** - Memories survive across sessions and clients

## MCP Interface

### Tools (model-controlled)
- `ctx_instructions()` — returns the full context bootstrap: guide + instructions + context + resource/skill indexes. **Primary entry point for LLMs** — the LLM calls this proactively to discover stored context and skills.
- `ctx_bash({ command, comment? })` — sandboxed bash access to `/vercel/sandbox` with auto git sync. Executes in a Vercel Sandbox microVM.

### Data Organization (in sandbox at `/vercel/sandbox/`)
- `resources/` — exposed context resources with frontmatter (name, description)
- `skills/` — structured skill definitions (SKILL.md per skill with frontmatter)
- `knowledge/` — general knowledge, memories, notes

## MVP Scope

### In Scope

- Basic memory operations (read, write, search) via `ctx_bash`
- MCP resources for instructions, context overview, and skills
- AI-initiated memory creation
- Multi-client sync (last-write-wins)
- Full audit trail of changes
- GitHub-based browsing interface

### Deferred

- Custom web UI (use GitHub for MVP)
- Advanced conflict resolution
- Manual memory curation/editing
- Collaborative/shared memories

## Success Metrics

- Users stop repeating context to their AI
- Active memory creation (AI-initiated and explicit)
- Users browse their memories to understand their AI's context
- Memories are actually used in subsequent conversations
