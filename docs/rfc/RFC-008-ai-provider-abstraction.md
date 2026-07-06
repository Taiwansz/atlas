# RFC-008: AI Provider Abstraction Layer

**RFC Number:** 008  
**Author(s):** Atlas Architecture Team  
**Date:** 2026-07-06  
**Status:** Final  
**Category:** AI Core  

---

## 1. Abstract

This RFC specifies the interface and operational architecture of the **Atlas AI Provider Abstraction Layer**. This system decouples the Atlas agent orchestrator and engines from specific Large Language Model (LLM) vendors. It introduces a unified, type-safe API for model invocation, structured output parsing, token tracking, retry orchestration, and dynamic fallback routing across providers (Google Gemini, Anthropic, OpenAI, and local LLM backends).

---

## 2. Motivation

Different LLM providers exhibit varying strengths:
- **Google Gemini:** Excellent context windows (up to 2M tokens) and multimodal reasoning.
- **Anthropic Claude:** Superior code-generation, logic capabilities, and tool validation.
- **Local Llama/DeepSeek:** Privacy-preserving, offline execution for sensitive enterprises.

Without an abstraction layer, each engine would require custom API integrations. This leads to duplicate code, difficult rate-limiting maintenance, and hard-coded dependencies that prevent failovers during API outages.

---

## 3. Specification

### 3.1 The Unified Model Interface

All LLM requests inside Atlas are routed through the `IAIProvider` interface, which defines standard schemas for request options, message structures, token tallies, and structured output expectations.

```typescript
export interface IAIProvider {
  generateCompletion(
    request: IModelRequest
  ): Promise<IModelResponse>;

  generateStructuredOutput<T>(
    request: IStructuredModelRequest
  ): Promise<IStructuredModelResponse<T>>;
}

export interface IModelRequest {
  provider: "gemini" | "anthropic" | "openai" | "local";
  model: string;
  messages: IChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

export interface IChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string; // Optional name identifier for multi-agent conversations
}

export interface IModelResponse {
  content: string;
  usage: ITokenUsage;
  finishReason: "stop" | "length" | "content_filter" | "tool_calls";
  rawResponse: any; // Raw JSON payload from the vendor
}

export interface ITokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUSD?: number; // Estimated based on current pricing database
}
```

### 3.2 Structured Output Schema Control

To enforce predictable agent behavior, structured completions require JSON schema validation matching the requested type `T`. Under the hood, providers translate this into standard formats (e.g., Gemini Structured Outputs, OpenAI JSON Mode, or Instructor library parse flows).

```typescript
export interface IStructuredModelRequest extends IModelRequest {
  jsonSchema: object; // Canonical JSON Schema definition
}

export interface IStructuredModelResponse<T> {
  data: T;
  usage: ITokenUsage;
}
```

### 3.3 Dynamic Routing & Failover Pipeline

Atlas implements a multi-tier fallback architecture to maintain continuous agent operations during external provider degradation:

```
[Agent Service Request]
          │
          ▼
   [Primary LLM] (e.g., Claude 3.5 Sonnet) ──[Success]──▶ [Return Result]
          │
      [Failure / Timeout / Rate Limit]
          │
          ▼
   [Secondary LLM] (e.g., Gemini 1.5 Pro)  ──[Success]──▶ [Log Warning & Return]
          │
      [Failure]
          │
          ▼
   [Local Backup] (e.g., DeepSeek Coder 7B) ──[Success]──▶ [Log Warning & Return]
          │
      [Failure]
          │
          ▼
   [Throw SystemException]
```

### 3.4 Rate Limiting & Queue Orchestration

The Abstraction Layer wraps all provider calls in a queue system:
- **Token Bucket Limiter:** Restricts request rates per API key in compliance with model-specific TPM (Tokens Per Minute) and RPM (Requests Per Minute) limitations.
- **Backoff Controller:** Implements exponential backoff with jitter on HTTP `429` (Rate Limit Exceeded) responses.
- **Usage Metrics Event:** Emits cost and token usage events to the Kafka bus, enabling real-time billing calculations and project efficiency audits.
