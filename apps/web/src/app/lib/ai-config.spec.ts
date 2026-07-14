import { getAiConfig } from './ai-config';

describe('getAiConfig', () => {
  const originalApiKey = process.env.NVIDIA_API_KEY;
  const originalModel = process.env.ATLAS_AI_MODEL;

  beforeEach(() => {
    delete process.env.NVIDIA_API_KEY;
    delete process.env.ATLAS_AI_MODEL;
  });

  afterAll(() => {
    if (originalApiKey === undefined) {
      delete process.env.NVIDIA_API_KEY;
    } else {
      process.env.NVIDIA_API_KEY = originalApiKey;
    }

    if (originalModel === undefined) {
      delete process.env.ATLAS_AI_MODEL;
    } else {
      process.env.ATLAS_AI_MODEL = originalModel;
    }
  });

  it('requires the NVIDIA API key', () => {
    expect(() => getAiConfig()).toThrow('NVIDIA_API_KEY is not configured on the server');
  });

  it('uses the default model when none is configured', () => {
    process.env.NVIDIA_API_KEY = 'test-key';

    expect(getAiConfig()).toEqual({
      apiKey: 'test-key',
      model: 'deepseek-ai/deepseek-v4-flash',
    });
  });

  it('uses a trimmed model configured by the environment', () => {
    process.env.NVIDIA_API_KEY = 'test-key';
    process.env.ATLAS_AI_MODEL = '  organization/custom-model  ';

    expect(getAiConfig()).toEqual({
      apiKey: 'test-key',
      model: 'organization/custom-model',
    });
  });
});
