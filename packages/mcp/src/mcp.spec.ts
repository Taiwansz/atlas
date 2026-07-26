import { AtlasMCPServer } from './server/mcp-server';

describe('@atlas/mcp Server & Bindings', () => {
  it('should list available MCP tools', () => {
    const server = new AtlasMCPServer(process.cwd());
    const tools = server.getToolDefinitions();
    expect(tools.length).toBe(4);
    expect(tools.map((t) => t.name)).toContain('read_blueprint');
    expect(tools.map((t) => t.name)).toContain('audit_drift');
  });

  it('should execute record_decision tool successfully', async () => {
    const server = new AtlasMCPServer(process.cwd());
    const res = (await server.executeTool('record_decision', {
      title: 'Use TypeScript NodeNext',
      status: 'ACCEPTED',
      context: 'Need modern ESM/CJS module resolution',
      decision: 'Adopt NodeNext compiler options'
    })) as { success: boolean; filePath: string };

    expect(res.success).toBe(true);
    expect(res.filePath).toContain('.atlas/decisions');
  });
});
