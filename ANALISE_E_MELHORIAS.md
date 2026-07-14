# Atlas Engineering OS — Análise Completa e Plano de Melhorias

> **Documento gerado em:** 2026-07-13  
> **Versão do projeto analisada:** 0.1.0-alpha  
> **Status do projeto:** Em Desenvolvimento Ativo — Fase Foundation completa, Fase Implementation em andamento

---

## Progresso de Implementação — 2026-07-13

| Item | Status | Resultado |
|---|---|---|
| MH-001 | Implementado | URL e chave anônima do Supabase removidas do código; configuração agora é obrigatória por ambiente |
| MH-002 | Implementado | TypeScript e ESLint reativados no build; erro JSX e configuração de testes corrigidos; exceção temporária ficou restrita ao componente legado `page.tsx` |
| MH-003 | Implementado, validação de runtime pendente | Bootstrap PostgreSQL criado com pgvector, tabelas, índices, triggers e banco local do Keycloak; Docker não está disponível no ambiente atual |
| MH-011 | Implementado | Modelo NVIDIA configurável por `ATLAS_AI_MODEL`; leitura e validação de respostas das APIs endurecidas |
| MH-020 | Pesquisa concluída, implementação pendente | 50 fontes avaliadas e consolidadas em 15 capacidades Atlas com packs e carregamento seletivo |
| MH-022 | Primeiro dogfood concluído | Sistema de estoque executável, validação Atlas-style sem drift e 12 testes; confirmou valor metodológico e ausência de automação no produto atual |

O direcionamento do produto foi refinado para um MVP **agent-native**: CLI + Blueprint + Skill instalável + MCP local antes da expansão do painel web e da orquestração multiagente. Consulte `docs/ROADMAP.md` v3.0.

---

## 1. O Que é o Atlas?

O **Atlas Engineering OS** é um "Sistema Operacional de Engenharia" para a era da IA — uma plataforma multiagente que atua como substrato inteligente entre a intenção humana e o software em produção. Seu objetivo central é resolver a crise de **amnésia institucional** do desenvolvimento moderno de software.

O Atlas não é um editor de código, nem um framework: é uma camada de orquestração persistente que:

- **Governa** o processo de desenvolvimento via Constituição e Blueprint
- **Documenta** decisões arquiteturais automaticamente via ADRs e memória de projeto
- **Audita** a integridade do código em tempo real (Drift Checking)
- **Orquestra** agentes de IA especializados para executar tarefas de engenharia
- **Preserva** o conhecimento técnico do projeto de forma permanente (Knowledge Graph + Vector DB)

### Filosofia Nuclear

```
Blueprint Primeiro → Governança Constitucional → Preservação de Memória
Honestidade Técnica → Soberania Humana
```

---

## 2. Estado Atual do Projeto

### 2.1 O Que Está Pronto e Bem Feito

#### Documentação de Fundação (100% concluída)

A base filosófica e arquitetural é extremamente robusta:

| Documento | Status |
|-----------|--------|
| `foundation/vision/VISION.md` | Completo |
| `foundation/manifesto/MANIFESTO.md` | Completo |
| `foundation/constitution/CONSTITUTION.md` | Completo |
| `foundation/values/VALUES.md` | Completo |
| `foundation/principles/ENGINEERING_PRINCIPLES.md` | Completo |
| `architecture/overview/ARCHITECTURE.md` | Completo |
| `architecture/engines/ENGINES_OVERVIEW.md` | Completo (15 motores especificados) |
| `architecture/agents/AGENTS_SPECIFICATION.md` | Completo (18 agentes especificados) |
| `docs/adr/ADR-001` a `ADR-012` | 12 ADRs |
| `docs/rfc/RFC-001` a `RFC-014` | 14 RFCs |
| `docs/specs/` | REST, CLI, SDK, Data Models |
| `modules/MODULES_SPECIFICATION.md` | 26 módulos especificados |
| `docs/ROADMAP.md` | Roadmap 2026 detalhado |
| `docs/BACKLOG.md` | Backlog priorizado por épicos |
| `docs/IMPLEMENTATION_PLAN.md` | Plano de 6 sprints |

#### Infraestrutura do Monorepo (Bem configurada)

- Nx monorepo com regras de barreira de pacotes
- TypeScript 5.4+ com configuração estrita
- pnpm workspaces
- ESLint + Prettier + Husky (pre-commit hooks)
- Docker Compose com stack completa (PostgreSQL+pgvector, Neo4j, Qdrant, Redis, Kafka, Keycloak, Jaeger, Prometheus, Grafana)
- GitHub Actions workflows
- Conventional Commits configurado

#### Package `@atlas/core` — Sprint 1 (Implementado)

O único pacote com código de produção real:

```
packages/core/src/
├── config/config.ts            ConfigManager com validação Zod
├── di/container.ts             Container de injeção de dependências
├── errors/errors.ts            Hierarquia de exceções tipadas
├── events/event-bus.ts         InMemoryEventBus (Node EventEmitter)
├── events/event.interface.ts
├── logging/logger.ts           WinstonLogger JSON estruturado
├── logging/logger.interface.ts
├── observability/telemetry.ts  OpenTelemetry integration
├── observability/telemetry.interface.ts
├── ai/ai-provider.interface.ts Abstração de provider de IA
├── feature-flags/feature-flags.ts LocalFeatureFlagService
├── feature-flags/feature-flags.interface.ts
└── core.spec.ts               Testes unitários do core
```

#### Web App Demo (Proof of Concept funcional)

A aplicação Next.js em `apps/web` é um demonstrador interativo do conceito Atlas:

- Interface de discovery socrático via chat com IA (NVIDIA API / DeepSeek)
- Painel de arquitetura em tempo real (domínio, topologia, governança, drift)
- Compilação de Blueprint JSON via IA
- Drift Auditor com resolução de código
- Conectada ao Supabase para persistência
- Design brutalist/militar com estética de terminal

---

## 3. O Que Está Faltando para Finalizar o Projeto

### 3.1 Gap Crítico: Implementação dos Módulos (0% implementado)

Todos os 26 módulos especificados em `modules/MODULES_SPECIFICATION.md` existem apenas como documentação. Nenhum tem código fonte:

```
modules/
├── core/          VAZIO (sem código)
├── agents/        VAZIO (sem código)
├── engines/       VAZIO (sem código)
├── integrations/  VAZIO (sem código)
├── interfaces/    VAZIO (sem código)
└── marketplace/   VAZIO (sem código)
```

#### Módulos que precisam ser criados (por prioridade de Sprint):

**Sprint 2 — CLI + Blueprint Parser:**
- `@atlas/config` — Módulo de configuração tipada (Zod schemas)
- `@atlas/cli` — CLI `agy` em Node.js/TypeScript com comandos `init`, `validate`, `audit`
- `@atlas/blueprint` — Parser e validador do `atlas.blueprint.yaml`

**Sprint 3 — Drift Engine + Auditoria:**
- `@atlas/audit` — AST parser TypeScript + comparação com Blueprint (drift checker)
- `@atlas/telemetry` — Módulo de telemetria desacoplado
- `@atlas/events` — Barramento de eventos (migrar do core)

**Sprint 4 — Intake Socrático:**
- `@atlas/ai` — Abstração de providers de IA (OpenAI, Anthropic, Gemini, NVIDIA)
- `@atlas/research` — Motor de discovery socrático de requisitos

**Sprint 5 — Memória e Grafos:**
- `@atlas/database` — Adaptador PostgreSQL/pgvector com Prisma
- `@atlas/graph` — Adaptador Neo4j para knowledge graph
- `@atlas/vector` — Adaptador Qdrant para busca semântica
- `@atlas/memory` — Motor de memória episódica e semântica do projeto

**Sprint 6 — Orquestração:**
- `@atlas/agents` — Base de agentes especializados
- `@atlas/orchestrator` — Orquestrador LangGraph multiagente
- `@atlas/mcp` — Motor de descoberta de MCP tools

**Fase Avançada:**
- `@atlas/auth` — Autenticação (Keycloak + JWT)
- `@atlas/constitution` — Motor de validação constitucional
- `@atlas/planning` — Motor de planejamento de sprints
- `@atlas/simulation` — Motor de simulação de carga
- `@atlas/redteam` — Motor de Red Team de segurança
- `@atlas/api` — Servidor REST/Fastify
- `@atlas/graphql` — Servidor GraphQL
- `@atlas/grpc` — Servidor gRPC
- `@atlas/sdk` — SDK público do Atlas
- `@atlas/marketplace` — Marketplace de plugins/integrações

---

### 3.2 Problemas Técnicos Identificados na Web App

#### [CRÍTICO] Credenciais hardcoded

```typescript
// apps/web/src/app/lib/supabase.ts — PROBLEMA
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

**Risco:** Chave de API do Supabase exposta diretamente no código-fonte. Viola o princípio de soberania de dados da Constituição do Atlas.

#### [CRÍTICO] TypeScript/ESLint ignorados no build

```javascript
// apps/web/next.config.js — PROBLEMA
typescript: { ignoreBuildErrors: true },
eslint: { ignoreDuringBuilds: true },
```

**Risco:** Erros de tipo silenciosos passam para produção. Contradiz o Engineering Standard do Atlas (RFC-010).

#### [ALTO] API de compilação sem autenticação

As rotas `api/chat`, `api/compile`, `api/workspace` e `api/audit` são públicas. Qualquer pessoa pode chamar a NVIDIA API usando a chave configurada no servidor.

#### [MÉDIO] Modelo de IA hardcoded

```typescript
model: 'deepseek-ai/deepseek-v4-flash'
```

O modelo está fixo no código. Deveria ser configurável via variável de ambiente.

#### [MÉDIO] Ausência de autenticação de usuários

A aplicação usa Supabase mas não implementa login/registro. A tabela de workspaces pode ser acessada sem autenticação.

#### [MÉDIO] Estimativa de horas hardcoded na UI

```tsx
<span>Trabalho estimado: 120-160h</span>
```

Valor fixo. Deveria ser calculado dinamicamente pelo compilador.

#### [MÉDIO] Sem persistência real de projetos

Cada sessão começa do zero. Não há fluxo de salvar/carregar workspaces no Supabase.

---

### 3.3 Funcionalidades Especificadas mas Não Implementadas

| Funcionalidade | Especificada em | Status |
|----------------|-----------------|--------|
| CLI `agy` com comandos reais | `docs/specs/CLI_SPECIFICATION.md` | Não implementado |
| Drift Check via AST TypeScript | `docs/BACKLOG.md` Épico 4 | Não implementado |
| Engineering Score Calculator | RFC-004 | Não implementado |
| Knowledge Graph (Neo4j) | RFC-003, ADR-004 | Não implementado |
| Busca Semântica (Qdrant) | ADR-005 | Não implementado |
| Orquestrador LangGraph | RFC-006, ADR-003 | Não implementado |
| IDE Plugins (VS Code/Cursor) | Architecture docs | Não implementado |
| Sistema de autenticação | ADR-008 | Não implementado |
| Persistência de workspace no Supabase | Web App specs | Parcial |
| Export de Blueprint YAML | Web App | Não implementado |
| Red Team Engine | Architecture docs | Não implementado |
| Simulation Engine | Architecture docs | Não implementado |
| Marketplace de plugins | `modules/marketplace/` | Não implementado |
| CONTRIBUTING.md | README.md referencia | Não criado |

---

### 3.4 Estrutura de Diretórios Incompleta

```
engines/      Diretório existe mas VAZIO
infra/        Sem scripts de inicialização do banco
integrations/ Diretório existe mas VAZIO
```

O `docker-compose.yml` referencia `./infra/docker/postgres/init.sql` mas esse arquivo não existe, causando erro ao tentar subir o stack Docker.

---

## 4. Plano de Melhorias Priorizadas

### PRIORIDADE CRÍTICA (Resolver Imediatamente)

#### MH-001: Remover credenciais hardcoded

```typescript
// ANTES (inseguro)
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGci...'

// DEPOIS (correto)
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseAnonKey) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada');
```

#### MH-002: Ativar validação TypeScript/ESLint no build

```javascript
// next.config.js — remover as linhas de ignore
const nextConfig = {
  reactStrictMode: true,
  // Remover: typescript: { ignoreBuildErrors: true }
  // Remover: eslint: { ignoreDuringBuilds: true }
};
```

#### MH-003: Criar `infra/docker/postgres/init.sql`

O arquivo de inicialização do PostgreSQL referenciado pelo Docker Compose precisa ser criado com extensões pgvector e tabelas iniciais.

---

### PRIORIDADE ALTA (Sprint 2 — Próximas 2 semanas)

#### MH-004: Implementar CLI `@atlas/cli`

Criar o pacote em `packages/cli/` com os comandos básicos:

```bash
agy init                    # Inicializa workspace Atlas
agy validate                # Valida blueprint.yaml
agy validate --drift-check  # Compara AST com blueprint
agy audit                   # Gera relatório de engineering score
agy status                  # Status do projeto
```

Stack sugerida: Commander.js + Chalk + Inquirer.js (Node.js/TypeScript)

#### MH-005: Implementar parser de Blueprint YAML (`@atlas/blueprint`)

```typescript
interface AtlasBlueprint {
  version: string;
  project: ProjectMeta;
  modules: ModuleDeclaration[];
  constitution: ConstitutionRule[];
  constraints: ArchitecturalConstraint[];
}
```

Parser com validação Zod, lockfile gerado em `.atlas/blueprint.lock.json`.

#### MH-006: Implementar persistência de workspaces no Supabase

Completar o fluxo de salvar/carregar projetos:
- `POST /api/workspace` — Salvar blueprint no Supabase
- `GET /api/workspace/:id` — Carregar workspace
- Listagem de projetos do usuário na UI

#### MH-007: Adicionar autenticação básica

Implementar login com GitHub OAuth via Supabase Auth, protegendo as rotas da API e associando workspaces a usuários.

---

### PRIORIDADE MÉDIA (Sprint 3-4)

#### MH-008: Drift Check Engine (`@atlas/audit`)

Motor de auditoria estático usando `ts-morph` para parsing de AST TypeScript:

```typescript
const driftReport = await AuditEngine.analyze({
  blueprintPath: '.atlas/blueprint.yaml',
  projectRoot: './src',
  rules: constitution.rules
});
```

#### MH-009: Engineering Score Calculator

Implementar o cálculo de score conforme RFC-004:
- Base Score: 1000 pontos
- Penalidades: Drift (-50/ocorrência), Complexidade Ciclomática (-10/função), Sem testes (-20/módulo)
- Bônus: Cobertura >80% (+50), ADR atualizado (+10)

#### MH-010: Export de Blueprint como YAML/PDF

Botão de export na Web App para baixar o blueprint gerado em formato YAML estruturado e/ou PDF formatado.

#### MH-011: Tornar modelo de IA configurável

```typescript
// Suporte múltiplos providers conforme RFC-008
const AI_PROVIDER = process.env.ATLAS_AI_PROVIDER || 'nvidia';
const AI_MODEL = process.env.ATLAS_AI_MODEL || 'deepseek-ai/deepseek-v4-flash';
```

#### MH-012: Criar `CONTRIBUTING.md`

O README referencia `CONTRIBUTING.md` que não existe. Documento essencial para contribuições externas.

#### MH-020: Criar Skill Atlas instalável e adaptadores de agente

Publicar uma skill canônica que ensine agentes a consultar Blueprint e Constituição, registrar decisões e validar mudanças. O comando `agy init --agent <adapter>` deve gerar os arquivos nativos de Codex, Claude Code e Cursor.

#### MH-021: Antecipar um servidor MCP local mínimo

Mover o MCP do fim do roadmap para o MVP, começando com leitura de Blueprint, validação de mudança, registro de decisão e recuperação de contexto do projeto.

#### MH-022: Criar programa de dogfooding e benchmark

Validar cada marco em projetos reais. O primeiro caso de referência é um sistema completo de controle de estoque, com relatório objetivo de utilidade, atritos, drift evitado e custo de contexto.

---

### PRIORIDADE BAIXA / FUTURO (Sprint 5-6+)

#### MH-013: Integração Neo4j — Knowledge Graph

Implementar `@atlas/graph` com Cypher queries para armazenar:
- Grafo de decisões (ADRs conectados a módulos)
- Histórico de evolução do engineering score
- Relações entre requisitos, componentes e testes

#### MH-014: Integração Qdrant — Busca Semântica

Implementar `@atlas/vector` para embeddings de código-fonte, documentação, ADRs e histórico de conversas do Discovery Engine.

#### MH-015: Orquestrador Multiagente (LangGraph)

Implementar `@atlas/orchestrator` para coordenar os 18 agentes especificados: Maestro, Blueprint Agent, Audit Agent, Research Agent, Memory Agent.

#### MH-016: IDE Plugin para VS Code/Cursor

Extension com Engineering Score em tempo real, alertas de drift inline, atalho para Discovery socrático e ADR viewer.

#### MH-017: Simulation Engine

Motor de simulação de concorrência e carga usando K6 para detectar gargalos antes da implementação.

#### MH-018: Red Team Engine

Simulação de vetores de ataque sobre as especificações de arquitetura antes do código ir para produção.

#### MH-019: Marketplace de Plugins

Plataforma para publicação e consumo de extensões: plugins de linting, integrações externas e templates de Blueprint por domínio.

---

## 5. Análise de Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Custo alto de API de IA por sessão | Alta | Médio | Cache de respostas por hash do input; billing alerts |
| Drift entre spec dos 26 módulos e implementação real | Alta | Alto | Manter `MODULES_SPECIFICATION.md` como fonte da verdade |
| Complexidade do LangGraph aumentar lead time | Média | Alto | Mockar orquestrador nas primeiras sprints |
| Exposição da NVIDIA API key sem rate limiting | Alta | Alto | Autenticação + rate limiting antes de qualquer deploy público |
| Acoplamento excessivo entre módulos | Baixa | Alto | Reforçar regras de barreira do Nx no CI/CD |
| Scope creep sem MVP definido | Média | Alto | Focar Sprint 2-3 em CLI + Blueprint + Drift Check |

---

## 6. Resumo Executivo

### Estado Real do Projeto

```
DOCUMENTACAO:    ████████████████████  100%  (Sprint Foundation completa)
INFRA/DEVOPS:    ██████████████░░░░░░   70%  (Docker incompleto - falta init.sql)
CORE PACKAGE:    ████████████████████  100%  (Sprint 1 concluida com testes)
WEB APP DEMO:    █████████████░░░░░░░   65%  (sem auth, sem persistencia real)
CLI (agy):       ░░░░░░░░░░░░░░░░░░░░    0%  (nao iniciado)
BLUEPRINT ENG:   ░░░░░░░░░░░░░░░░░░░░    0%  (nao iniciado)
AUDIT ENGINE:    ░░░░░░░░░░░░░░░░░░░░    0%  (nao iniciado)
AI ABSTRACTION:  ░░░░░░░░░░░░░░░░░░░░    0%  (so interface definida)
DB ADAPTERS:     ░░░░░░░░░░░░░░░░░░░░    0%  (nao iniciado)
ORCHESTRATOR:    ░░░░░░░░░░░░░░░░░░░░    0%  (nao iniciado)
```

### Próximos Passos Imediatos (Esta Semana)

1. Validar **[MH-003]** em um ambiente com Docker e PostgreSQL
2. **[MH-005]** Implementar o parser e schema do Blueprint
3. **[MH-004]** Implementar `agy init`, `validate`, `status` e `audit`
4. **[MH-020]** Criar a Skill Atlas canônica e o primeiro adaptador para Codex
5. **[MH-021]** Implementar o MCP local mínimo
6. **[MH-022]** Consolidar os achados do sistema de estoque no backlog
7. **[MH-012]** Criar `CONTRIBUTING.md`

### Estimativa de Esforço para MVP Completo

| Fase | Duração | Entregável |
|------|---------|------------|
| Sprint 2 | 2 semanas | CLI `agy` + Blueprint Parser |
| Sprint 3 | 2 semanas | Drift Engine + Engineering Score |
| Sprint 4 | 2 semanas | Discovery Socrático integrado |
| Sprint 5 | 2 semanas | Memória semântica (Neo4j + Qdrant) |
| Sprint 6 | 2 semanas | Orquestrador multiagente básico |
| **Total** | **~12 semanas** | **MVP completo e demonstrável** |

---

## 7. Pontos Fortes do Projeto

O Atlas tem uma base conceptual e arquitetural excepcionalmente sólida:

1. **Methodology Blueprint-First genuinamente aplicada** — A fundação veio antes do código, exatamente como pregado
2. **14 RFCs + 12 ADRs** — Decisões técnicas rastreáveis e justificadas
3. **26 módulos especificados** com interfaces públicas, dependências e camadas definidas
4. **Docker Compose completo** — Stack de desenvolvimento local enterprise-grade
5. **`@atlas/core` bem implementado** — Sprint 1 entregou infraestrutura de qualidade com testes
6. **Web App Proof of Concept funcional** — Demonstra o valor do produto de forma tangível
7. **Constituição e Princípios fortes** — Framework de governança que orienta todas as decisões

O principal gap é a transição da fase de especificação para a fase de implementação dos módulos restantes. Com a fundação sólida que existe, as sprints subsequentes têm um roadmap claro para seguir.

---

*Documento gerado por análise estática do repositório em 2026-07-13. Revisar ao final de cada sprint.*
