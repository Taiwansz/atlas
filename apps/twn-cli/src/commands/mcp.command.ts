import { AtlasMCPServer } from '@atlas/mcp';

export interface MCPOptions {
  projectPath?: string;
  list?: boolean;
}

export async function handleMCP(options: MCPOptions = {}) {
  const server = new AtlasMCPServer(options.projectPath);
  const tools = server.getToolDefinitions();

  console.log(`\n🔌 Atlas Model Context Protocol (MCP) Server`);
  console.log(`============================================`);
  console.log(`  - Tools Registered: ${tools.length}`);

  tools.forEach((t) => {
    console.log(`  - [Tool] ${t.name}: ${t.description}`);
  });

  console.log(`\n✅ MCP Server bindings active.\n`);
}
