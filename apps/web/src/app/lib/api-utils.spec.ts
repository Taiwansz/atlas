import {
  getAssistantContent,
  getErrorMessage,
  getProviderError,
  requireString,
  unwrapJsonCodeBlock,
} from './api-utils';

describe('API utilities', () => {
  it('extracts and trims assistant content from a provider response', () => {
    expect(
      getAssistantContent({
        choices: [{ message: { content: '  valid response  ' } }],
      }),
    ).toBe('valid response');
  });

  it('rejects provider responses without assistant content', () => {
    expect(() => getAssistantContent({ choices: [] })).toThrow(
      'AI provider response does not contain a message',
    );
  });

  it('prefers provider detail and falls back to a safe message', () => {
    expect(getProviderError({ detail: 'quota exceeded' }, 'fallback')).toBe('quota exceeded');
    expect(getProviderError({}, 'fallback')).toBe('fallback');
  });

  it('unwraps JSON code blocks without changing plain content', () => {
    expect(unwrapJsonCodeBlock('```json\n{"ok":true}\n```')).toBe('{"ok":true}');
    expect(unwrapJsonCodeBlock('{"ok":true}')).toBe('{"ok":true}');
  });

  it('validates required strings and normalizes unknown errors', () => {
    expect(requireString({ name: 'atlas' }, 'name')).toBe('atlas');
    expect(() => requireString({ name: ' ' }, 'name')).toThrow('name must be a non-empty string');
    expect(getErrorMessage(new Error('failure'))).toBe('failure');
    expect(getErrorMessage('failure')).toBe('Unexpected error');
  });
});
