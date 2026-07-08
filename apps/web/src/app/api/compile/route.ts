import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { projectName, projectStack, projectDesc, projectIdea, answers } = await request.json();

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'NVIDIA API Key not configured on server' }, { status: 500 });
    }

    const SYSTEM_PROMPT = `Você é o compilador cognitivo do Atlas Engineering Operating System.
Sua tarefa é traduzir a especificação técnica do projeto em um Blueprint JSON estruturado de alta fidelidade para o desenvolvedor.

Nome do Projeto: "${projectName}"
Stack Técnica: "${projectStack}"
Descrição da Ideia: "${projectDesc} / ${projectIdea}"
Respostas de Negócio da Entrevista: ${JSON.stringify(answers || {})}

Você DEVE retornar APENAS um objeto JSON válido, sem explicações extras, sem markdown e sem caixas de código (code blocks). A resposta deve ser diretamente parseável como JSON.

O JSON deve seguir EXATAMENTE a estrutura abaixo:
{
  "projectName": "${projectName}",
  "architecture": "Clean Architecture / Hexagonal Architecture / MVC (escolha a ideal para o projeto)",
  "stackLabel": "${projectStack === 'rust-actix' ? 'Rust Actix & SQLx' : projectStack === 'go-fiber' ? 'Go Fiber & SQLx' : 'Next.js & Fastify (TS)'}",
  "modules": [
    { "name": "ingress/api", "type": "ingress", "dependencies": ["logic"], "purpose": "Descrição do módulo de entrada", "allowedEgress": ["internet"] },
    { "name": "logic/core", "type": "logic", "dependencies": ["db"], "purpose": "Descrição das regras de negócio principais", "allowedEgress": [] },
    { "name": "db/postgres", "type": "core", "dependencies": [], "purpose": "Descrição da persistência", "allowedEgress": ["db"] }
  ],
  "constitution": [
    { "rule": "CONSTITUTION-RULE-01", "severity": "CRITICAL", "description": "Descrição da regra arquitetural específica para esta stack" },
    { "rule": "CONSTITUTION-RULE-02", "severity": "WARNING", "description": "Segunda regra específica da stack" }
  ],
  "adrs": [
    { "id": "ADR-001", "title": "Título da Decisão", "status": "APPROVED", "context": "Contexto do problema", "decision": "O que foi decidido", "consequence": "Consequência/Impacto" }
  ],
  "backlog": [
    { "id": "TASK-101", "title": "Título da tarefa técnica", "type": "TECH", "description": "Descrição da tarefa", "priority": "HIGH", "estimate": 3 },
    { "id": "TASK-102", "title": "Título da feature de negócio", "type": "FEAT", "description": "Descrição da feature", "priority": "MEDIUM", "estimate": 5 }
  ],
  "roadmap": [
    { "id": "SPRINT-1", "name": "Sprint 1: Bootstrap", "goal": "Alinhamento e esqueleto da stack", "tasks": ["TASK-101"], "risk": "Baixo risco" },
    { "id": "SPRINT-2", "name": "Sprint 2: Core Functions", "goal": "Lógica principal", "tasks": ["TASK-102"], "risk": "Médio risco" }
  ],
  "driftFile": "${projectStack === 'rust-actix' ? 'src/db/user_repository.rs' : projectStack === 'go-fiber' ? 'repository/user.go' : 'packages/core/src/db/raw-query.ts'}",
  "driftContract": "// Conteúdo do contrato de interface de repositório",
  "driftPhysical": "// Código físico drifted (com SQL cru/inseguro)",
  "driftResolved": "// Código limpo e seguro em conformidade com o contrato",
  "rfcProposal": {
    "id": "RFC-202",
    "title": "Migrate DB Access layers to Prisma-Next Integration",
    "status": "PENDING_APPROVAL",
    "impactScore": "+120 Engineering Score",
    "risk": "LOW (Tested in Sandbox)",
    "details": "Converts legacy SQL file queries to clean repository integration layer."
  },
  "aiPrompts": [
    {
      "step": "Etapa 1: Setup do Workspace e Invariants",
      "tool": "Claude Code / Cursor / Bolt",
      "prompt": "Instrução detalhada de prompt para configurar o repositório seguindo as regras da Constitution.md."
    },
    {
      "step": "Etapa 2: Modelagem e Contratos de Repositório",
      "tool": "Devin / Lovable / Cursor",
      "prompt": "Prompt detalhado instruindo a construir as interfaces de repositórios e tipos de dados."
    },
    {
      "step": "Etapa 3: Resolução de Vulnerabilidade de Drift",
      "tool": "Claude Code / Gemini CLI",
      "prompt": "Prompt contendo a refatoração do código drifted para alinhar com os contratos arquiteturais aprovados."
    }
  ]
}`;

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-ai/deepseek-v4-flash',
        max_tokens: 1800,
        temperature: 0.1,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: 'Compile o blueprint estruturado agora com os prompts de IA inclusos.' }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || errorData.message || 'Error from NVIDIA API');
    }

    const data = await response.json();
    let reply = (data.choices?.[0]?.message?.content || '').trim();

    // Clean up code blocks if present
    if (reply.includes('```')) {
      const match = reply.match(/```(?:json)?([\s\S]*?)```/);
      if (match && match[1]) {
        reply = match[1].trim();
      }
    }

    const parsed = JSON.parse(reply);
    return NextResponse.json(parsed);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
