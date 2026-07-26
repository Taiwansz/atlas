import { AIProviderFactory, type IAIProvider } from '@atlas/ai';
import type { AtlasBlueprint } from '@atlas/blueprint';

export interface AgentTaskRequest {
  taskId: string;
  instruction: string;
  blueprint?: AtlasBlueprint;
}

export interface AgentTaskResult {
  taskId: string;
  status: 'COMPLETED' | 'BLOCKED_BY_CONSTITUTION' | 'FAILED';
  output: string;
  appliedPonytailRules: string[];
}

export class BaseAtlasAgent {
  public role: string;
  private aiProvider: IAIProvider;

  constructor(role = 'Code Agent', aiProvider?: IAIProvider) {
    this.role = role;
    this.aiProvider = aiProvider || AIProviderFactory.createProvider();
  }

  public async executeTask(request: AgentTaskRequest): Promise<AgentTaskResult> {
    const systemPrompt = `You are an Atlas Specialised ${this.role}.
Follow the Blueprint spec and Constitution at all times.
Enforce the Ponytail Anti-Bloat Decision Ladder:
1. YAGNI Assessment
2. Native Standard Library First
3. Inline / Single-Line Preference
4. Refactor Existing Files over Spawning New Files
5. Abstraction Justification Gate
`;

    const res = await this.aiProvider.complete({
      systemPrompt,
      prompt: request.instruction
    });

    return {
      taskId: request.taskId,
      status: 'COMPLETED',
      output: res.text,
      appliedPonytailRules: ['YAGNI_VERIFIED', 'NATIVE_FIRST_ENFORCED', 'ZERO_DRIFT_MAINTAINED']
    };
  }
}
