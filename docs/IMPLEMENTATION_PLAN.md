# Atlas Implementation Plan

## 1. Visão Geral e Alinhamento de Produto

Este plano estabelece a estratégia de engenharia para transformar as especificações e RFCs do **Atlas Engineering Operating System** em um software funcional e estável. A construção do Atlas segue rigorosamente a metodologia *Blueprint-First*, garantindo que cada componente seja documentado, validado e testado de acordo com o **Atlas Engineering Standard (AES)** ([RFC-010](file:///root/atlas/docs/rfc/RFC-010-engineering-standard.md)) antes de qualquer evolução.

---

## 2. A Estratégia do MVP (Mínimo Produto Viável)

Para validar a tese central do Atlas ("código governado por arquitetura viva"), definimos o **MVP do Atlas** focado no ciclo essencial de especificação e auditoria:

### 2.1 Escopo do MVP
1. **Definição de Blueprint:** Capacidade de ler e validar sintaticamente um arquivo `atlas.blueprint.yaml`.
2. **Auditoria de Desvio (Drift Check):** Um comando CLI (`agy validate --drift-check`) capaz de ler o diretório de um projeto TypeScript simples, inspecionar seus arquivos e comparar a Árvore de Sintaxe Abstrata (AST) física com os componentes declarados no Blueprint.
3. **Cálculo de Score Básico:** Implementação parcial do motor de pontuação da [RFC-004](file:///root/atlas/docs/rfc/RFC-004-engineering-score.md), deduzindo pontos se houver drift (código sem blueprint) ou complexidade excessiva.
4. **Interface CLI:** A estrutura base de linha de comando (`agy`) operando localmente no workspace.

### 2.2 Justificativa de Valor vs. Complexidade
Este MVP entrega o **maior valor perceptível** (provar que a IA não pode produzir código invisível ou desalinhado com a arquitetura) com a **menor complexidade operacional**:
* **Sem Grafos Complexos (Neo4j):** A persistência é simplificada em JSON local na pasta `.atlas/` para acelerar o desenvolvimento inicial antes do Neo4j.
* **Sem Loops Stateful de IA (LangGraph):** O loop de agentes é mockado ou executado linearmente por um script simples, adiando a complexidade da orquestração distribuída do Maestro para fases posteriores.
* **Sem Sandbox MicroVMs:** O linter e interpretadores rodam diretamente no Node.js do workspace do usuário sob restrições simples de processo, sem necessidade de isolamento via Firecracker ou gVisor na Fase 1.

---

## 3. Planejamento Geral de Sprints

A esteira de desenvolvimento do Atlas está dividida em 6 Sprints incrementais de 2 semanas cada:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Sprint 1   │ ──▶ │   Sprint 2   │ ──▶ │   Sprint 3   │
│  Atlas Core  │     │ Blueprint/CLI│     │ Drift Engine │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Sprint 6   │ ◀── │   Sprint 5   │ ◀── │   Sprint 4   │
│ Orquestrador │     │  Memory DB   │     │Socratic Intk │
└──────────────┘     └──────────────┘     └──────────────┘
```

* **Sprint 1: Infraestrutura Compartilhada (Atlas Core)** [ESTA SPRINT]
  * **Objetivo:** Estabelecer a fundação do monorepo, configuração unificada, injeção de dependência, logging estruturado, tracing OpenTelemetry, Event Bus em memória, tratamento de erros padrão, feature flags locais e pipelines básicos de CI/CD. Zero lógica de negócio.
* **Sprint 2: CLI Core & Blueprint Parser**
  * **Objetivo:** Criar a CLI base `agy` em Node/TypeScript e implementar o parser e validador sintático do `atlas.blueprint.yaml` com Zod.
* **Sprint 3: Drift Check AST & Scoring Engine (Entrega do MVP)**
  * **Objetivo:** Implementar o validador de desvio (AST parser) para arquivos TypeScript locais e o motor básico de pontuação do Engineering Score (dedução por drifts).
* **Sprint 4: Socratic Requirement Intake**
  * **Objetivo:** Desenvolver o assistente de descoberta de requisitos em terminal interativo, exportando o arquivo `requirements.json`.
* **Sprint 5: Project Memory & Vector Store**
  * **Objetivo:** Integrar o Qdrant/pgvector e criar a persistência de memórias episódicas, semânticas e procedurais de nível local.
* **Sprint 6: Maestro & LangGraph Orchestration**
  * **Objetivo:** Implementar o orquestrador distribuído base de agentes usando LangGraph e a comunicação entre agentes (AACP).

---

## 4. Gestão de Riscos Tecnológicos

| Risco Identificado | Severidade | Plano de Mitigação |
| :--- | :--- | :--- |
| **Incompatibilidade de Versões do Node/pnpm** | Alta | Homologar o uso de `pnpm@9.12.0` (compatível com Node v20 presente no ambiente do usuário) e configurar o motor do pnpm no `package.json`. |
| **Sobrecarga de Latência na Ingestão de Telemetria** | Média | Desenvolver buffers em memória para agregação de spans do OpenTelemetry antes de enviar dados a coletores externos. |
| **Instabilidade de Mocks em Testes de Integração** | Média | Seguir rigidamente o AES ([RFC-010](file:///root/atlas/docs/rfc/RFC-010-engineering-standard.md)), utilizando Testcontainers Docker para validar infraestrutura real em vez de mocks lógicos. |

---

## 5. Próximos Passos
O detalhamento do backlog de histórias e tarefas técnicas de todas as sprints encontra-se no arquivo de especificação do backlog: **[BACKLOG.md](file:///root/atlas/docs/BACKLOG.md)**.
