import type { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";

export const ONBOARDING_PROMPT_NAME = "onboarding";
export const ONBOARDING_PROMPT_DESCRIPTION =
  "Scaffold your context repo and gather initial information";

export function getOnboardingPromptMessages(): GetPromptResult {
  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `You are helping a user set up their ctx4.ai context data repository.

**Optional template reference**: https://github.com/dubzdubz/ctx4-data-template
(This is just an example - you can organize their context however they prefer)

## Phase 1: Scaffold (if needed)

1. **Check current state**: Call \`ctx_instructions()\` to see what's in the repo

2. **If the repo is empty**, offer to scaffold it:
   - Explore the template repo above to see the suggested structure
   - Typical files include \`resources/instructions.md\`, \`resources/context.md\`, \`knowledge/personal.md\`
   - Use \`ctx_bash\` to create files if the user wants them
   - **(Optional)** You can copy the skill-creator skill from the template

## Phase 2: Personalize Context

**IMPORTANT - Check existing context first:**
- Before asking any questions, review your conversation history and any memory/context you already have about the user
- If you have existing information (name, role, preferences, work style, etc.), propose using it to populate the context files
- **Confirm with the user first** before writing anything based on existing context

### If Starting Fresh

If you don't have existing context, ask questions to gather information. Examples include:
- About them (name, role, what they work on)
- How they prefer to work and communicate
- What you (the AI) should remember about them

### Always useful questions
- How they want you to remember information about them in the future. Should you proactively save information or should you ask first?

(These are just examples - adapt based on the conversation and what makes sense)

### Saving Information

Map information to appropriate files:
- Agent behavior and guidelines → \`resources/instructions.md\`
- Current context and key facts → \`resources/context.md\`
- Personal details and background → \`knowledge/personal.md\`
- Or suggest a different structure if it fits better
`,
        },
      },
    ],
  };
}
