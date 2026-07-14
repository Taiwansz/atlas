const DEFAULT_NVIDIA_MODEL = 'deepseek-ai/deepseek-v4-flash';

export interface IAiConfig {
  apiKey: string;
  model: string;
}

export function getAiConfig(): IAiConfig {
  const apiKey = process.env.NVIDIA_API_KEY;
  const configuredModel = process.env.ATLAS_AI_MODEL?.trim();

  if (!apiKey) {
    throw new Error('NVIDIA_API_KEY is not configured on the server');
  }

  return {
    apiKey,
    model: configuredModel && configuredModel.length > 0 ? configuredModel : DEFAULT_NVIDIA_MODEL,
  };
}
