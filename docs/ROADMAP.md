# Atlas Product & Technical Roadmap (2026)

> **Document Status:** Authoritative Reference  
> **Version:** 2.0.0  
> **Last Updated:** 2026-07-08  
> **Owner:** Atlas Leadership & Architecture Team  

---

## 1. Visão de Linha do Tempo

O desenvolvimento do Atlas Engineering Operating System está estruturado em marcos de entrega incrementais, progredindo do núcleo de infraestrutura até a liberação do marketplace corporativo.

```
       Milestone 1             Milestone 2             Milestone 3             Milestone 4
     CORE FOUNDATION         MVP ENGINE RELEASE      INTELLIGENT INTAKE     ORCHESTRATION & SCALE
     ┌─────────────┐         ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
     │  Sprint 1   │ ──────▶ │ Sprints 2-3 │ ──────▶ │ Sprints 4-5 │ ──────▶ │ Sprints 6+  │
     │  Jul 2026   │         │  Ago 2026   │         │  Set 2026   │         │  Out 2026   │
     └─────────────┘         └─────────────┘         └─────────────┘         └─────────────┘
```

---

## 2. Registro de Marcos (Milestones)

### Milestone 1: Core Foundation & Infrastructure (Julho 2026)
* **Objetivo:** Estabelecer a infraestrutura de baixo acoplamento e alto padrão do monorepo, sem lógica de negócio.
* **Escopo (Sprint 1):**
  * Configuração unificada do monorepo Nx com regras de barreira de pacotes.
  * Implementação de container de injeção de dependência local e tratamento de exceções estruturado.
  * Logging JSON estruturado e telemetria OpenTelemetry (Tracing local).
  * Barramento de eventos local assíncrono em memória (`InMemoryEventBus`).
  * Pipelines básicos de CI/CD para validação automática de qualidade no GitHub Actions.
* **Critério de Sucesso:** A suite de testes unitários da infraestrutura roda com sucesso e o build é concluído com zero warnings.

---

### Milestone 2: MVP Release - Blueprint & Static Audit (Agosto 2026)
* **Objetivo:** Entregar a primeira versão funcional e demonstrável do loop de governança arquitetural do Atlas.
* **Escopo (Sprints 2 - 3):**
  * Interface CLI `agy` com comandos básicos de execução e validação.
  * Motor de Blueprint capaz de validar sintaxe e assinar arquivos `atlas.blueprint.yaml`.
  * Motor de Auditoria estática comparando a AST de projetos TypeScript locais com as declarações do Blueprint.
  * Cálculo dinâmico simplificado do Engineering Score (RFC-004), disparando penalidades por drifts de código.
* **Critério de Sucesso:** Um desenvolvedor tenta criar uma classe não listada no Blueprint; o comando `agy validate --drift-check` falha localmente e bloqueia a integração.

---

### Milestone 3: Intelligent Intake & Semantic Memory (Setembro 2026)
* **Objetivo:** Acoplar inteligência contextual à captura de requisitos de produto e persistir o conhecimento.
* **Escopo (Sprints 4 - 5):**
  * Interface Socratic Intake via CLI, guiando o usuário por questionários técnicos adaptativos.
  * Estruturação do arquivo `requirements.json` resultante de descobertas.
  * Integração com bancos vetoriais (pgvector/Qdrant) para busca e injeção de memórias episódicas e semanticamente consolidadas.
* **Critério de Sucesso:** O input socrático gera um plano de requisitos Zod-validado capaz de estruturar o rascunho inicial de um Blueprint.

---

### Milestone 4: Orchestration, Simulation & Security (Outubro 2026 em diante)
* **Objetivo:** Ativar a equipe de múltiplos agentes inteligentes operando em paralelo com segurança corporativa.
* **Escopo (Sprints 6+):**
  * Orquestrador de Agentes usando LangGraph e protocolo de comunicação AACP.
  * Sandbox de simulação de carga (K6) e modelagem comportamental.
  * Red Team Engine simulando vetores de ataque em ambiente isolado.
  * Web Dashboard unificado contendo o mapa de arquitetura e histórico de evolução do Engineering Score.
* **Critério de Sucesso:** Múltiplos agentes implementam módulos concorrentemente em sandboxes separadas, e o Maestro resolve divergências de design via Consenso Socrático sem quebras de build.

---

## 3. Gestão de Riscos Tecnológicos no Roadmap

1. **Latência de Processamento por IA:** O acúmulo de requisições de agentes paralelos no LangGraph pode tornar as sprints lentas e caras.
   * *Mitigation:* Cache rigoroso de respostas de IA baseado no hash da tarefa e injeção seletiva de contexto de memória para economizar tokens.
2. **Desvio de Nomenclatura no Código Físico:** IAs podem gerar variáveis ou arquivos fora das convenções de nomenclatura do AES.
   * *Mitigation:* Validação estática de linter atrelada ao gancho de pré-commit do Git (Husky) bloqueando alterações fora das convenções.
