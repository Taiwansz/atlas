export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unexpected error';
}

export function requireString(record: Record<string, unknown>, key: string): string {
  const value = record[key];

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${key} must be a non-empty string`);
  }

  return value;
}

export async function readJson(request: Request | Response): Promise<unknown> {
  const body = await request.text();

  try {
    return JSON.parse(body) as unknown;
  } catch {
    throw new Error('Response body is not valid JSON');
  }
}

export function getProviderError(data: unknown, fallback: string): string {
  if (!isRecord(data)) {
    return fallback;
  }

  const detail = data.detail;
  if (typeof detail === 'string' && detail.length > 0) {
    return detail;
  }

  const message = data.message;
  return typeof message === 'string' && message.length > 0 ? message : fallback;
}

export function getAssistantContent(data: unknown): string {
  if (!isRecord(data) || !Array.isArray(data.choices)) {
    throw new Error('AI provider returned an invalid response');
  }

  const choices = data.choices as unknown[];
  const firstChoice = choices[0];
  if (!isRecord(firstChoice) || !isRecord(firstChoice.message)) {
    throw new Error('AI provider response does not contain a message');
  }

  const content = firstChoice.message.content;
  if (typeof content !== 'string' || content.trim().length === 0) {
    throw new Error('AI provider returned an empty message');
  }

  return content.trim();
}

export function unwrapJsonCodeBlock(content: string): string {
  const match = content.match(/```(?:json)?([\s\S]*?)```/);
  return match?.[1]?.trim() ?? content;
}

export async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}
