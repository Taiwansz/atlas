export interface CompletionRequest {
  systemPrompt?: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface CompletionResponse {
  text: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface IAIProvider {
  name: string;
  complete(request: CompletionRequest): Promise<CompletionResponse>;
}

export class MockAIProvider implements IAIProvider {
  public name = 'mock-ai-provider';

  public async complete(request: CompletionRequest): Promise<CompletionResponse> {
    return {
      text: `[Atlas AI Response for: "${request.prompt}"]`,
      model: 'atlas-mock-v1',
      usage: {
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30
      }
    };
  }
}

export class AIProviderFactory {
  public static createProvider(providerName?: string, apiKey?: string): IAIProvider {
    const name = providerName || process.env.ATLAS_AI_PROVIDER || 'mock';
    if (name === 'mock' || !apiKey) {
      return new MockAIProvider();
    }
    return new MockAIProvider();
  }
}
