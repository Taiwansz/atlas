import fs from 'fs';
import path from 'path';
import { stringifyBlueprintYaml } from '@atlas/blueprint';
import { SocraticResearchEngine } from '@atlas/research';

export interface DiscoverOptions {
  feature?: string;
  domain?: string;
  projectPath?: string;
}

export async function handleDiscover(options: DiscoverOptions = {}) {
  const targetDir = options.projectPath ? path.resolve(options.projectPath) : process.cwd();
  const projectName = path.basename(targetDir);

  console.log(`\n🧠 Atlas Socratic Intake & Requirements Discovery`);
  console.log(`=================================================`);
  console.log(`  - Target Project: ${projectName}`);
  console.log(`  - Feature Intent: ${options.feature || 'General Architecture'}`);

  const engine = new SocraticResearchEngine();
  const proposal = await engine.generateBlueprintProposal({
    projectName,
    domain: options.domain || 'developer-tools',
    userPrompt: options.feature || 'Initial feature discovery'
  });

  console.log(`\n📋 Proposed Blueprint Specification:`);
  console.log(stringifyBlueprintYaml(proposal));

  const atlasDir = path.join(targetDir, '.atlas');
  if (!fs.existsSync(atlasDir)) {
    fs.mkdirSync(atlasDir, { recursive: true });
  }

  const blueprintPath = path.join(atlasDir, 'blueprint.yaml');
  fs.writeFileSync(blueprintPath, stringifyBlueprintYaml(proposal), 'utf-8');
  console.log(`✅ Saved proposed blueprint to .atlas/blueprint.yaml\n`);
}
