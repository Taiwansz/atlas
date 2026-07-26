import jsYaml from 'js-yaml';
import { AtlasBlueprintSchema, type AtlasBlueprint } from '../schema/blueprint.schema';

export interface BlueprintValidationResult {
  success: boolean;
  data?: AtlasBlueprint;
  errors?: string[];
}

/**
 * Validates a JavaScript object against the Atlas Blueprint Zod schema.
 */
export function validateBlueprint(data: unknown): BlueprintValidationResult {
  const result = AtlasBlueprintSchema.safeParse(data);
  if (result.success) {
    return {
      success: true,
      data: result.data
    };
  }

  const errors = result.error.errors.map(
    (err) => `[${err.path.join('.') || 'root'}]: ${err.message}`
  );

  return {
    success: false,
    errors
  };
}

/**
 * Parses and validates raw YAML string content into an AtlasBlueprint object.
 * Throws a formatted Error if validation fails.
 */
export function parseBlueprintYaml(yamlContent: string): AtlasBlueprint {
  let rawData: unknown;
  try {
    rawData = jsYaml.load(yamlContent);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse YAML content: ${message}`);
  }

  const validation = validateBlueprint(rawData);
  if (!validation.success || !validation.data) {
    throw new Error(
      `Blueprint schema validation failed:\n- ${validation.errors?.join('\n- ')}`
    );
  }

  return validation.data;
}

/**
 * Serializes an AtlasBlueprint object into a clean YAML string format.
 */
export function stringifyBlueprintYaml(blueprint: AtlasBlueprint): string {
  const validation = validateBlueprint(blueprint);
  if (!validation.success || !validation.data) {
    throw new Error(
      `Cannot stringify invalid blueprint:\n- ${validation.errors?.join('\n- ')}`
    );
  }

  return jsYaml.dump(validation.data, {
    indent: 2,
    lineWidth: 100,
    noRefs: true
  });
}
