import fs from 'fs';
import path from 'path';

export function handleStatus(projectPath?: string) {
  const targetDir = projectPath ? path.resolve(projectPath) : process.cwd();
  const atlasDir = path.join(targetDir, '.atlas');
  const blueprintPath = path.join(atlasDir, 'blueprint.yaml');
  const constitutionPath = path.join(atlasDir, 'constitution.md');

  console.log(`\n📊 Atlas Engineering OS Workspace Status:`);
  console.log(`  - Target Directory: ${targetDir}`);

  if (!fs.existsSync(atlasDir)) {
    console.log(`  - Workspace State: ❌ Not Initialized (Run 'twn init')\n`);
    return;
  }

  console.log(`  - Workspace State: ✅ Initialized (.atlas/)`);
  console.log(`  - Blueprint: ${fs.existsSync(blueprintPath) ? '✅ Present' : '❌ Missing'}`);
  console.log(`  - Constitution: ${fs.existsSync(constitutionPath) ? '✅ Present' : '❌ Missing'}`);
  console.log(`  - Decisions Directory: ${fs.existsSync(path.join(atlasDir, 'decisions')) ? '✅ Present' : '❌ Missing'}`);
  console.log(`  - Memory Index: ${fs.existsSync(path.join(atlasDir, 'memory')) ? '✅ Present' : '❌ Missing'}\n`);
}
