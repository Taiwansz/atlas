import fs from 'fs';
import path from 'path';
import type { AtlasBlueprint, BlueprintComponent } from '@atlas/blueprint';

export interface AuditFinding {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  componentId?: string;
  ruleId?: string;
  filePath?: string;
  message: string;
  recommendation: string;
}

export interface AuditReport {
  timestamp: string;
  engineeringScore: number;
  status: 'PASSED' | 'FAILED_THRESHOLD' | 'CONSTITUTION_VIOLATION';
  summary: {
    totalComponents: number;
    driftCount: number;
    criticalFindings: number;
    highFindings: number;
  };
  findings: AuditFinding[];
}

export class AuditEngine {
  /**
   * Evaluates a project workspace against an Atlas Blueprint and produces an Engineering Score audit report.
   */
  public auditWorkspace(projectPath: string, blueprint: AtlasBlueprint): AuditReport {
    const findings: AuditFinding[] = [];
    const components = blueprint.components || [];

    let driftCount = 0;
    let criticalFindings = 0;
    let highFindings = 0;

    // Rule 1: Component Path Existence Check
    components.forEach((comp: BlueprintComponent) => {
      if (comp.path) {
        const fullPath = path.resolve(projectPath, comp.path);
        if (!fs.existsSync(fullPath)) {
          driftCount++;
          highFindings++;
          findings.push({
            id: `DRIFT-MISSING-PATH-${comp.id}`,
            severity: 'HIGH',
            componentId: comp.id,
            message: `Declared component "${comp.name}" path "${comp.path}" does not exist on disk.`,
            recommendation: `Create the component directory or update the Blueprint spec.`
          });
        }
      }
    });

    // Rule 2: Allowed Imports and Dependency Isolation Check
    components.forEach((comp: BlueprintComponent) => {
      if (comp.path && comp.allowedImports && comp.allowedImports.length > 0) {
        const compDir = path.resolve(projectPath, comp.path);
        if (fs.existsSync(compDir)) {
          this.scanDirectoryForImportViolations(
            compDir,
            comp,
            comp.allowedImports,
            findings
          );
        }
      }
    });

    // Rule 3: Constitution Rules Validation
    const constitutionRules = blueprint.constitutionRules || [];
    constitutionRules.forEach((rule) => {
      if (rule.severity === 'CRITICAL' && findings.some((f) => f.severity === 'CRITICAL')) {
        criticalFindings++;
      }
    });

    // Calculate Engineering Score (0-100)
    let score = 100;
    score -= criticalFindings * 25;
    score -= highFindings * 10;
    score -= driftCount * 5;
    if (score < 0) score = 0;

    let status: AuditReport['status'] = 'PASSED';
    if (criticalFindings > 0) {
      status = 'CONSTITUTION_VIOLATION';
    } else if (score < 70) {
      status = 'FAILED_THRESHOLD';
    }

    return {
      timestamp: new Date().toISOString(),
      engineeringScore: score,
      status,
      summary: {
        totalComponents: components.length,
        driftCount,
        criticalFindings,
        highFindings
      },
      findings
    };
  }

  private scanDirectoryForImportViolations(
    dirPath: string,
    component: BlueprintComponent,
    allowedImports: string[],
    findings: AuditFinding[]
  ): void {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== 'dist') {
          this.scanDirectoryForImportViolations(fullPath, component, allowedImports, findings);
        }
      } else if (entry.isFile() && /\.(ts|js|jsx|tsx)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
        let match: RegExpExecArray | null;

        while ((match = importRegex.exec(content)) !== null) {
          const importSource = match[1];
          if (importSource && importSource.startsWith('@') && !importSource.startsWith('.')) {
            const isAllowed = allowedImports.some((allowed) =>
              importSource.startsWith(allowed)
            );
            if (!isAllowed) {
              findings.push({
                id: `DRIFT-FORBIDDEN-IMPORT-${component.id}`,
                severity: 'HIGH',
                componentId: component.id,
                filePath: fullPath,
                message: `Component "${component.name}" imports forbidden module "${importSource}". Allowed imports: [${allowedImports.join(', ')}]`,
                recommendation: `Remove the import or add "${importSource}" to component.allowedImports in Blueprint.`
              });
            }
          }
        }
      }
    }
  }
}
