import { BaseAtlasAgent } from './base/base-agent';

describe('@atlas/agents BaseAtlasAgent', () => {
  it('should execute tasks adhering to Ponytail anti-bloat rules', async () => {
    const agent = new BaseAtlasAgent('Code Agent');
    const result = await agent.executeTask({
      taskId: 'TASK-101',
      instruction: 'Refactor user authentication handler'
    });

    expect(result.status).toBe('COMPLETED');
    expect(result.appliedPonytailRules).toContain('YAGNI_VERIFIED');
  });
});
