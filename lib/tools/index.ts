import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerRollDiceTool } from "./roll-dice";
import { registerCtxBashTool } from "./ctx-bash";
import { registerCtxInstructionsTool } from "./ctx-instructions";

export function registerAllTools(server: McpServer) {
  registerRollDiceTool(server);
  registerCtxBashTool(server);
  registerCtxInstructionsTool(server);
}

export { registerRollDiceTool, registerCtxBashTool, registerCtxInstructionsTool };
