import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerCtxBashTool } from "./ctx-bash";
import { registerCtxInstructionsTool } from "./ctx-instructions";
import { registerRollDiceTool } from "./roll-dice";

export function registerAllTools(server: McpServer) {
  registerRollDiceTool(server);
  registerCtxBashTool(server);
  registerCtxInstructionsTool(server);
}

export {
  registerRollDiceTool,
  registerCtxBashTool,
  registerCtxInstructionsTool,
};
