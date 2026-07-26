import fs from 'fs';
import path from 'path';
import { parseBlueprintYaml, validateBlueprint } from '@atlas/blueprint';
import { AuditEngine } from '@atlas/audit';

export interface MCPToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export class AtlasMCPServer {
  private projectPath: string;

  constructor(projectPath?: string) {
    this.projectPath = projectPath || process.cwd();
  }

  public getToolDefinitions(): MCPToolDefinition[] {
    return [
      {
        name: 'read_blueprint',
        description: 'Reads and returns the authoritative .atlas/blueprint.yaml of the workspace',
        parameters: { type: 'object', properties: {} }
      },
      {
        name: 'validate_blueprint',
        description: 'Validates workspace .atlas/blueprint.yaml against Zod schema and returns errors',
        parameters: { type: 'object', properties: {} }
      },
      {
        name: 'audit_drift',
        description: 'Runs complete Engineering Score audit and physical AST code drift check',
        parameters: { type: 'object', properties: {} }
      },
      {
        name: 'record_decision',
        description: 'Records an Architectural Decision Record (ADR) in .atlas/decisions/',
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            status: { type: 'string' },
            context: { type: 'string' },
            decision: { type: 'string' }
          },
          required: ['title', 'status', 'context', 'decision']
        }
      }
    ];
  }

  public async executeTool(toolName: string, args: Record<string, unknown> = {}): Promise<unknown> {
    const blueprintPath = path.join(this.projectPath, '.atlas', 'blueprint.yaml');

    switch (toolName) {
      case 'read_blueprint': {
        if (!fs.existsSync(blueprintPath)) {
          throw new Error('No .atlas/blueprint.yaml found in workspace');
        }
        const yamlContent = fs.readFileSync(blueprintPath, 'utf-8');
        return { yamlContent, blueprint: parseBlueprintYaml(yamlContent) };
      }
      case 'validate_blueprint': {
        if (!fs.existsSync(blueprintPath)) {
          throw new Error('No .atlas/blueprint.yaml found in workspace');
        }
        const yamlContent = fs.readFileSync(blueprintPath, 'utf-8');
        const parsed = parseBlueprintYaml(yamlContent);
        return validateBlueprint(parsed);
      }
      case 'audit_drift': {
        if (!fs.existsSync(blueprintPath)) {
          throw new Error('No .atlas/blueprint.yaml found in workspace');
        }
        const yamlContent = fs.readFileSync(blueprintPath, 'utf-8');
        const blueprint = parseBlueprintYaml(yamlContent);
        const engine = new AuditEngine();
        return engine.auditWorkspace(this.projectPath, blueprint);
      }
      case 'record_decision': {
        const decisionsDir = path.join(this.projectPath, '.atlas', 'decisions');
        if (!fs.existsSync(decisionsDir)) {
          fs.mkdirSync(decisionsDir, { recursive: true });
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `ADR-${timestamp}.md`;
        const filePath = path.join(decisionsDir, filename);

        const adrContent = `# ADR: ${args['title']}

- **Status:** ${args['status']}
- **Date:** ${new Date().toISOString()}

## Context
${args['context']}

## Decision
${args['decision']}
`;
        fs.writeFileSync(filePath, adrContent, 'utf-8');
        return { success: true, filePath, filename };
      }
      default:
        throw new Error(`Unknown MCP Tool: ${toolName}`);
    }
  }
}
