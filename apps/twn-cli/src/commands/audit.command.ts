import fs from 'fs';
import path from 'path';
import { parseBlueprintYaml } from '@atlas/blueprint';
import { AuditEngine } from '@atlas/audit';

export interface AuditOptions {
  projectPath?: string;
  json?: boolean;
}

export function handleAudit(options: AuditOptions = {}) {
  const targetDir = options.projectPath ? path.resolve(options.projectPath) : process.cwd();
  const blueprintPath = path.join(targetDir, '.atlas', 'blueprint.yaml');

  if (!fs.existsSync(blueprintPath)) {
    console.error(`\n❌ Error: No .atlas/blueprint.yaml found at ${blueprintPath}`);
    process.exit(2);
  }

  try {
    const yamlContent = fs.readFileSync(blueprintPath, 'utf-8');
    const blueprint = parseBlueprintYaml(yamlContent);

    const engine = new AuditEngine();
    const report = engine.auditWorkspace(targetDir, blueprint);

    if (options.json) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }

    console.log(`\n🛡️  Atlas Engineering Score Audit Report`);
    console.log(`========================================`);
    console.log(`  - Status: ${report.status}`);
    console.log(`  - Engineering Score: ${report.engineeringScore} / 100`);
    console.log(`  - Total Components: ${report.summary.totalComponents}`);
    console.log(`  - Code Drift Count: ${report.summary.driftCount}`);
    console.log(`  - Critical Findings: ${report.summary.criticalFindings}`);

    if (report.findings.length > 0) {
      console.log(`\n📋 Audit Findings (${report.findings.length}):`);
      report.findings.forEach((finding, idx) => {
        console.log(`  ${idx + 1}. [${finding.severity}] ${finding.message}`);
        console.log(`     💡 Recommendation: ${finding.recommendation}`);
      });
    } else {
      console.log(`\n✨ Perfect Audit! Zero drift and zero violations detected.`);
    }
    console.log('');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n❌ Audit Failed: ${message}\n`);
    process.exit(1);
  }
}
