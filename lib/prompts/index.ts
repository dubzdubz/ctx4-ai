import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  getOnboardingPromptMessages,
  ONBOARDING_PROMPT_DESCRIPTION,
  ONBOARDING_PROMPT_NAME,
} from "./onboarding";

export function registerAllPrompts(server: McpServer) {
  // Register the onboarding prompt
  server.registerPrompt(
    ONBOARDING_PROMPT_NAME,
    {
      description: ONBOARDING_PROMPT_DESCRIPTION,
    },
    async () => {
      return getOnboardingPromptMessages();
    },
  );
}

export { getOnboardingPromptMessages, ONBOARDING_PROMPT_NAME };
