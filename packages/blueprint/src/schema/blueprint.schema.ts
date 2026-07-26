import { z } from 'zod';

/**
 * Component Type Schema
 */
export const ComponentTypeSchema = z.enum([
  'app',
  'engine',
  'package',
  'integration',
  'database',
  'service'
]);
export type ComponentType = z.infer<typeof ComponentTypeSchema>;

/**
 * Component Contract/Topology Schema
 */
export const BlueprintComponentSchema = z.object({
  id: z.string().min(1, 'Component ID is required'),
  name: z.string().min(1, 'Component name is required'),
  type: ComponentTypeSchema,
  description: z.string().default(''),
  path: z.string().optional(),
  dependencies: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  allowedImports: z.array(z.string()).optional()
});
export type BlueprintComponent = z.infer<typeof BlueprintComponentSchema>;

/**
 * Architecture Specification Schema
 */
export const ArchitectureSpecSchema = z.object({
  modularity: z.enum(['monorepo', 'microservices', 'monolith', 'modular-monolith']).default('monorepo'),
  primaryLanguage: z.string().min(1, 'Primary language is required'),
  framework: z.string().optional(),
  database: z.string().optional(),
  vectorDb: z.string().optional(),
  graphDb: z.string().optional()
});
export type ArchitectureSpec = z.infer<typeof ArchitectureSpecSchema>;

/**
 * Constitution Rule Reference Schema
 */
export const ConstitutionRuleRefSchema = z.object({
  ruleId: z.string().min(1, 'Rule ID is required'),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).default('HIGH'),
  description: z.string().optional()
});
export type ConstitutionRuleRef = z.infer<typeof ConstitutionRuleRefSchema>;

/**
 * Authoritative Atlas Blueprint Schema
 */
export const AtlasBlueprintSchema = z.object({
  apiVersion: z.string().default('atlas.engineering/v1'),
  metadata: z.object({
    name: z.string().min(1, 'Blueprint name is required'),
    version: z.string().default('1.0.0'),
    domain: z.string().default('general'),
    description: z.string().default(''),
    owner: z.string().default('architecture-team'),
    repository: z.string().optional()
  }),
  architecture: ArchitectureSpecSchema,
  components: z.array(BlueprintComponentSchema).default([]),
  constitutionRules: z.array(ConstitutionRuleRefSchema).default([])
});

export type AtlasBlueprint = z.infer<typeof AtlasBlueprintSchema>;
