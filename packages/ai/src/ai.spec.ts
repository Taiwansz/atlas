import { AIProviderFactory } from './provider/ai-provider.factory';

describe('@atlas/ai Provider Factory', () => {
  it('should instantiate mock AI provider and complete requests', async () => {
    const provider = AIProviderFactory.createProvider('mock');
    const res = await provider.complete({ prompt: 'Hello Atlas' });

    expect(res.text).toContain('Hello Atlas');
    expect(res.model).toBe('atlas-mock-v1');
  });
});
