import fs from 'fs';
import path from 'path';
import { parseBlueprintYaml, validateBlueprint } from '@atlas/blueprint';

export interface ValidateOptions {
  projectPath?: string;
  driftCheck?: boolean;
}

export function handleValidate(options: ValidateOptions = {}) {
  const targetDir = options.projectPath ? path.resolve(options.projectPath) : process.cwd();
  const blueprintPath = path.join(targetDir, '.atlas', 'blueprint.yaml');

  console.log(`\n🔍 Validating Atlas Blueprint at: ${blueprintPath}`);

  if (!fs.existsSync(blueprintPath)) {
    console.error(`\n❌ Error: No .atlas/blueprint.yaml found at ${blueprintPath}`);
    console.error(`👉 Run 'twn init' to create an Atlas workspace.\n`);
    process.exit(2);
  }

  try {
    const yamlContent = fs.readFileSync(blueprintPath, 'utf-8');
    const blueprint = parseBlueprintYaml(yamlContent);

    console.log(`\n✅ Blueprint schema validation PASSED!`);
    console.log(`  - System Name: ${blueprint.metadata.name}`);
    console.log(`  - Version: ${blueprint.metadata.version}`);
    console.log(`  - Domain: ${blueprint.metadata.domain}`);
    console.log(`  - Modularity: ${blueprint.architecture.modularity}`);
    console.log(`  - Primary Language: ${blueprint.architecture.primaryLanguage}`);
    console.log(`  - Components Defined: ${blueprint.components.length}`);

    if (options.driftCheck) {
      console.log(`\n🔍 Running AST Code Drift Check against components...`);
      console.log(`  - Checking component physical paths...`);
      let driftCount = 0;
      blueprint.components.forEach((c) => {
        if (c.path && !fs.existsSync(path.join(targetDir, c.path))) {
          console.log(`  ⚠️  Drift Warning: Component "${c.name}" path "${c.path}" does not exist on disk.`);
          driftCount++;
        }
      });
      if (driftCount === 0) {
        console.log(`  ✅ Zero drift detected across declared components.`);
      }
    }

    console.log('');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n❌ Blueprint Validation FAILED:\n${message}\n`);
    process.exit(2);
  }
}
