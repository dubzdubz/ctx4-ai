export const GUIDE_CONTENT = `# ctx4-ai Guide

## Overview
This MCP provides persistent memory for AI agents. Context is stored in files within a git repository that auto-syncs to GitHub.

## Progressive Discovery

Context is loaded in layers — you don't need to read everything at once.

**Layer 1: ctx_instructions()** — Call this at the start of every conversation. Returns:
- Your stored **instructions** (behavioral rules, preferences)
- Your **context overview** (see below) — a curated summary of the most important context
- An **index** of all available resources and skills (name + description only)

**Layer 2: Read on demand** — Use \`ctx_bash\` to read the full content of any resource, skill, or knowledge file when it's relevant to the current task. Don't load everything upfront — load what you need, when you need it.

**Layer 3: Save as you go** — Store new knowledge, update context, and create files during your work.

## The Context Overview (\`resources/context.md\`)

The context overview is the most important file in the memory system. It is returned by \`ctx_instructions()\` and loaded into every conversation. It should contain:

- **Key facts and context** that are always relevant (e.g., project names, tech stack, current priorities)
- **Pointers to deeper content** — reference specific resources, skills, or knowledge files by name so you know what to load when needed
- **Current state** — what you're working on, recent decisions, open questions

The context overview is NOT a full index (the resource/skill indexes already handle that). Think of it as a **curated briefing** — the 20% of context that's useful 80% of the time.

**Keep it maintained.** When you learn something important during a conversation, update the context overview so future conversations start with that knowledge. When information becomes stale, remove or update it.

## Available Tools

### ctx_instructions
**Call this at the start of every conversation.** Returns your instructions, context overview, and resource/skill indexes. This is your entry point for discovering stored context.

### ctx_bash
Execute bash commands in the memory directory (/vercel/sandbox). Any file changes are automatically committed and pushed.

\`\`\`
ctx_bash({ command: "cat resources/instructions.md" })
ctx_bash({ command: "cat skills/my-skill/SKILL.md" })
ctx_bash({ command: "echo '# Notes' > knowledge/notes.md", comment: "Added notes file" })
\`\`\`

## File Organization
- \`resources/\` — context resources (instructions, context overview, etc.)
- \`skills/\` — agent skills and workflows (SKILL.md per skill)
- \`knowledge/\` — general knowledge, memories, and notes

## Recommended Workflow
1. **Call ctx_instructions()** to load your context and discover what's available
2. Use \`ctx_bash\` to read specific resources, skills, or knowledge files relevant to the current task
3. Work on the task, saving knowledge as you go
4. **Update \`resources/context.md\`** if you learned something important or the current state changed
`;
