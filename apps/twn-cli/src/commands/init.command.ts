import fs from 'fs';
import path from 'path';
import { stringifyBlueprintYaml, type AtlasBlueprint } from '@atlas/blueprint';

export interface InitOptions {
  domain?: string;
  agent?: string;
  projectPath?: string;
}

export function handleInit(projectName?: string, options: InitOptions = {}) {
  const targetDir = options.projectPath ? path.resolve(options.projectPath) : process.cwd();
  const name = projectName || path.basename(targetDir);
  const atlasDir = path.join(targetDir, '.atlas');

  console.log(`\n🚀 Initializing Atlas Engineering OS workspace: "${name}"`);

  // Create .atlas directory structure
  if (!fs.existsSync(atlasDir)) {
    fs.mkdirSync(atlasDir, { recursive: true });
  }

  const dirsToCreate = ['decisions', 'memory', 'specs'];
  dirsToCreate.forEach((sub) => {
    const dirPath = path.join(atlasDir, sub);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  // Scaffold default blueprint.yaml
  const defaultBlueprint: AtlasBlueprint = {
    apiVersion: 'atlas.engineering/v1',
    metadata: {
      name,
      version: '0.1.0',
      domain: options.domain || 'general',
      description: `Atlas governed workspace for ${name}`,
      owner: 'engineering-team'
    },
    architecture: {
      modularity: 'monorepo',
      primaryLanguage: 'TypeScript',
      framework: 'Node.js'
    },
    components: [
      {
        id: 'core-app',
        name: 'Core Application',
        type: 'app',
        description: 'Main application entrypoint',
        dependencies: []
      }
    ],
    constitutionRules: [
      {
        ruleId: 'CONSTITUTION-RULE-01',
        severity: 'CRITICAL',
        description: 'Blueprint Prerequisite & Anti-Bloat Invariant'
      }
    ]
  };

  const blueprintPath = path.join(atlasDir, 'blueprint.yaml');
  if (!fs.existsSync(blueprintPath)) {
    fs.writeFileSync(blueprintPath, stringifyBlueprintYaml(defaultBlueprint), 'utf-8');
    console.log(`  [+] Created .atlas/blueprint.yaml`);
  } else {
    console.log(`  [~] .atlas/blueprint.yaml already exists (skipping)`);
  }

  // Scaffold default constitution.md
  const constitutionPath = path.join(atlasDir, 'constitution.md');
  if (!fs.existsSync(constitutionPath)) {
    const constitutionContent = `# Workspace Constitution: ${name}

## Article I: Core Invariants
1. **The Blueprint Prerequisite:** No code changes shall be made without an updated Blueprint spec.
2. **Anti-Bloat Decision Ladder (Ponytail Rule):** Prevent code bloat, YAGNI violations, and unnecessary abstractions.
3. **Honest Quality Score:** Quality findings and drift reports must be surfaced without filter.
`;
    fs.writeFileSync(constitutionPath, constitutionContent, 'utf-8');
    console.log(`  [+] Created .atlas/constitution.md`);
  } else {
    console.log(`  [~] .atlas/constitution.md already exists (skipping)`);
  }

  // Agent skill integration if requested
  if (options.agent) {
    const agent = options.agent.toLowerCase();
    if (agent === 'cursor') {
      const cursorDir = path.join(targetDir, '.cursor', 'rules');
      fs.mkdirSync(cursorDir, { recursive: true });
      fs.writeFileSync(
        path.join(cursorDir, 'atlas.mdc'),
        `---
description: Atlas Engineering OS Governance & Anti-Bloat Rules
globs: *
---
# Atlas Agent Rule
Follow .atlas/blueprint.yaml and .atlas/constitution.md at all times.
Apply the Anti-Bloat Decision Ladder before generating code.
`,
        'utf-8'
      );
      console.log(`  [+] Installed Cursor skill: .cursor/rules/atlas.mdc`);
    } else if (agent === 'claude' || agent === 'codex') {
      const skillDir = path.join(targetDir, `.${agent}`, 'skills', 'atlas');
      fs.mkdirSync(skillDir, { recursive: true });
      fs.writeFileSync(
        path.join(skillDir, 'SKILL.md'),
        `# Atlas Engineering Skill for ${agent}
Follow .atlas/blueprint.yaml specifications.
Enforce Anti-Bloat Protocol (Ponytail Decision Ladder).
`,
        'utf-8'
      );
      console.log(`  [+] Installed ${agent} skill: .${agent}/skills/atlas/SKILL.md`);
    }
  }

  console.log(`\n✅ Atlas workspace initialized successfully! Run 'twn validate' to check your blueprint.\n`);
}
