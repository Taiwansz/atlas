export interface IChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
}

export interface ITokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUSD?: number;
}

export interface IModelRequest {
  provider: 'gemini' | 'anthropic' | 'openai' | 'local';
  model: string;
  messages: IChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

export interface IModelResponse {
  content: string;
  usage: ITokenUsage;
  finishReason: 'stop' | 'length' | 'content_filter' | 'tool_calls';
  rawResponse: unknown;
}

export interface IStructuredModelRequest extends IModelRequest {
  jsonSchema: Record<string, unknown>;
}

export interface IStructuredModelResponse<T> {
  data: T;
  usage: ITokenUsage;
}

export interface IAIProvider {
  generateCompletion(request: IModelRequest): Promise<IModelResponse>;
  generateStructuredOutput<T>(
    request: IStructuredModelRequest
  ): Promise<IStructuredModelResponse<T>>;
}
