import {
  parseBlueprintYaml,
  stringifyBlueprintYaml,
  validateBlueprint
} from './parser/blueprint.parser';

describe('@atlas/blueprint Parser & Schema', () => {
  const sampleValidYaml = `
apiVersion: atlas.engineering/v1
metadata:
  name: atlas-core-system
  version: 1.0.0
  domain: developer-tools
  description: Monorepo system blueprint
  owner: architecture-team
architecture:
  modularity: monorepo
  primaryLanguage: TypeScript
  framework: Next.js
  database: PostgreSQL
components:
  - id: app-web
    name: Web Dashboard
    type: app
    description: Administration dashboard
    dependencies:
      - engine-blueprint
  - id: engine-blueprint
    name: Blueprint Engine
    type: engine
    description: Schema parser and validator
constitutionRules:
  - ruleId: CONSTITUTION-RULE-01
    severity: CRITICAL
    description: Blueprint Prerequisite Invariant
`;

  it('should validate a correct Blueprint object', () => {
    const data = {
      metadata: {
        name: 'test-app'
      },
      architecture: {
        primaryLanguage: 'TypeScript'
      }
    };

    const result = validateBlueprint(data);
    expect(result.success).toBe(true);
    expect(result.data?.metadata.name).toBe('test-app');
    expect(result.data?.architecture.modularity).toBe('monorepo');
  });

  it('should parse valid YAML content into AtlasBlueprint', () => {
    const blueprint = parseBlueprintYaml(sampleValidYaml);
    expect(blueprint.metadata.name).toBe('atlas-core-system');
    expect(blueprint.components.length).toBe(2);
    expect(blueprint.components[0]?.id).toBe('app-web');
    expect(blueprint.constitutionRules[0]?.ruleId).toBe('CONSTITUTION-RULE-01');
  });

  it('should throw an error when parsing invalid schema YAML', () => {
    const invalidYaml = `
metadata:
  version: 1.0.0
architecture:
  modularity: invalid-modularity-type
`;

    expect(() => parseBlueprintYaml(invalidYaml)).toThrow(
      /Blueprint schema validation failed/
    );
  });

  it('should stringify an AtlasBlueprint object back to valid YAML', () => {
    const blueprint = parseBlueprintYaml(sampleValidYaml);
    const yamlOutput = stringifyBlueprintYaml(blueprint);
    expect(yamlOutput).toContain('name: atlas-core-system');
    expect(yamlOutput).toContain('modularity: monorepo');
  });
});
