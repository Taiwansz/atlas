import { AuditEngine } from './drift/drift-checker';
import type { AtlasBlueprint } from '@atlas/blueprint';

describe('@atlas/audit AuditEngine & Drift Checker', () => {
  const sampleBlueprint: AtlasBlueprint = {
    apiVersion: 'atlas.engineering/v1',
    metadata: {
      name: 'audit-test-system',
      version: '1.0.0',
      domain: 'fintech',
      description: 'System for testing audit engine',
      owner: 'qa'
    },
    architecture: {
      modularity: 'monorepo',
      primaryLanguage: 'TypeScript'
    },
    components: [
      {
        id: 'comp-1',
        name: 'Existing Component',
        type: 'package',
        path: 'packages/core',
        allowedImports: ['@atlas/core']
      },
      {
        id: 'comp-2',
        name: 'Missing Component',
        type: 'service',
        path: 'non/existent/path'
      }
    ],
    constitutionRules: [
      {
        ruleId: 'CONSTITUTION-RULE-01',
        severity: 'CRITICAL'
      }
    ]
  };

  it('should generate an Engineering Score audit report and detect missing component paths', () => {
    const auditEngine = new AuditEngine();
    const report = auditEngine.auditWorkspace(process.cwd(), sampleBlueprint);

    expect(report.engineeringScore).toBeLessThan(100);
    expect(report.summary.driftCount).toBe(1);
    expect(report.findings.some((f) => f.id.includes('DRIFT-MISSING-PATH'))).toBe(true);
  });
});
