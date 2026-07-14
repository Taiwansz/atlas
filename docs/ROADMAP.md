# Atlas Product & Technical Roadmap (2026)

> **Document Status:** Authoritative Reference  
> **Version:** 3.0.0
> **Last Updated:** 2026-07-13
> **Owner:** Atlas Leadership & Architecture Team

---

## 1. Tese de Produto

O Atlas é a camada persistente de engenharia que permite a agentes de IA transformar intenção humana em software sem perder arquitetura, decisões, contexto ou governança ao longo do tempo.

O produto deve ser **agent-native e local-first**. O painel web é uma interface opcional; o núcleo de valor precisa funcionar dentro de qualquer repositório e ser consumido por Codex, Claude Code, Cursor e outros agentes por meio de quatro superfícies:

1. **Blueprint e Constituição:** contexto versionado que orienta cada mudança.
2. **Skill de agente:** instruções instaláveis que ensinam a IA a operar segundo o método Atlas.
3. **CLI:** criação, validação, auditoria e manutenção dos artefatos locais.
4. **MCP:** ferramentas dinâmicas para leitura, validação, memória e registro de decisões.

### Loop principal de interação

```text
Intenção do usuário
       ↓
Discovery socrático curto
       ↓
Blueprint + Constituição + ADRs + Backlog
       ↓ aprovação humana
Agente implementa usando a Skill e as ferramentas MCP
       ↓
CLI/Audit valida código, testes, decisões e drift
       ↓
Memória do projeto é atualizada para a próxima interação
```

---

## 2. Modelo de Distribuição

O primeiro uso do Atlas não deve exigir uma plataforma hospedada. A experiência-alvo é:

```bash
pnpm add -D @atlas/cli @atlas/skill
pnpm exec agy init --agent codex
pnpm exec agy validate
pnpm exec agy audit
```

O comando `init` deve criar, sem sobrescrever arquivos existentes:

```text
.atlas/
├── blueprint.yaml
├── constitution.md
├── decisions/
└── memory/

.codex/skills/atlas/SKILL.md       # quando --agent codex
.claude/skills/atlas/SKILL.md      # quando --agent claude
.cursor/rules/atlas.mdc            # quando --agent cursor
```

Os nomes dos pacotes são nomes de trabalho e dependem de validação de disponibilidade no registry. O binário `agy` permanece como nome definido na especificação atual da CLI.

---

## 3. Visão de Linha do Tempo

```text
      Milestone 1              Milestone 2             Milestone 3             Milestone 4             Milestone 5
   FOUNDATION HARDENING      AGENT-NATIVE MVP        GOVERNANCE LOOP        MEMORY & INTAKE          ORCHESTRATION
   ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐     ┌─────────────────┐      ┌─────────────────┐
   │ Jul 2026        │ ───▶ │ Jul-Ago 2026   │ ───▶ │ Ago 2026       │ ──▶ │ Set 2026       │ ───▶ │ Out 2026+      │
   └─────────────────┘      └─────────────────┘      └─────────────────┘     └─────────────────┘      └─────────────────┘
```

---

## 4. Registro de Marcos

### Milestone 1: Foundation Hardening (Julho 2026)

**Objetivo:** garantir que a fundação existente seja segura, reproduzível e honestamente validada.

**Escopo:**

- Remover credenciais hardcoded e documentar todas as variáveis obrigatórias.
- Ativar TypeScript e ESLint no build, isolando explicitamente apenas dívida legada conhecida.
- Criar o bootstrap PostgreSQL/pgvector referenciado pelo Docker Compose.
- Estabelecer build, testes e lint como gates reais, sem flags globais de bypass.
- Decompor gradualmente o protótipo monolítico da Web App.

**Critério de sucesso:** clone limpo com instalação reproduzível; build e testes passam sem erros; nenhum segredo real existe no repositório.

**Status em 2026-07-13:** em andamento.

---

### Milestone 2: Agent-Native MVP (Julho–Agosto 2026)

**Objetivo:** permitir que um desenvolvedor instale o Atlas em um repositório e faça uma IA seguir o método Atlas sem depender do painel web.

**Escopo:**

- Implementar `@atlas/blueprint` com schema Zod, parser YAML, validação e lockfile.
- Implementar `@atlas/cli` com o vertical slice `init → discover → blueprint validate → blueprint approve → status → audit`.
- Implementar a skill Atlas canônica e geradores de adaptadores para Codex, Claude Code e Cursor.
- Implementar um servidor MCP local mínimo com ferramentas:
  - `atlas_context_get`
  - `atlas_blueprint_validate`
  - `atlas_change_check`
  - `atlas_decision_record`
- Gerar configuração por agente via `agy init --agent <adapter>`.
- Publicar um projeto de exemplo e um teste de instalação em repositório vazio.
- Detectar colisões com executáveis `agy` não relacionados e falhar com diagnóstico claro; decidir o nome público definitivo antes da publicação.

**Critério de sucesso:** após instalar o Atlas, um agente cria uma feature respeitando o Blueprint, registra uma decisão e recebe bloqueio ao tentar violar uma regra constitucional.

---

### Milestone 3: Governance Loop & Static Audit (Agosto 2026)

**Objetivo:** fechar o ciclo entre intenção, artefatos do Atlas e código físico.

**Escopo:**

- Auditoria AST para TypeScript usando `ts-morph`.
- Drift check entre módulos, dependências, contratos e o Blueprint.
- Engineering Score inicial, explicável e reproduzível.
- Geração e evolução assistida de ADRs.
- Hooks opcionais de pre-commit e gate de CI.
- Relatório de auditoria legível por humano e estruturado para agentes.

**Critério de sucesso:** `agy validate --drift-check` detecta uma dependência ou classe proibida, explica a regra violada e propõe caminhos de resolução sem alterar código automaticamente.

---

### Milestone 4: Intelligent Intake & Project Memory (Setembro 2026)

**Objetivo:** capturar requisitos com qualidade e preservar conhecimento útil entre sessões e agentes.

**Escopo:**

- Discovery socrático acessível por CLI, chat e adaptadores de agente.
- Saída estruturada e validada de requisitos, riscos e critérios de aceite.
- Memória local versionável como baseline; PostgreSQL/pgvector, Neo4j e Qdrant como backends opcionais.
- Seleção de contexto por relevância e orçamento de tokens.
- Painel web consumindo as mesmas APIs do CLI/MCP, sem lógica exclusiva.

**Critério de sucesso:** uma nova sessão ou um agente diferente recupera decisões relevantes, explica por que elas existem e atualiza o Blueprint sem perder rastreabilidade.

---

### Milestone 5: Multi-Agent Orchestration, Simulation & Security (Outubro 2026 em diante)

**Objetivo:** coordenar agentes especializados em sandboxes isoladas depois que o loop local de governança estiver comprovado.

**Escopo:**

- Orquestrador multiagente com protocolo de tarefas, handoff e aprovação humana.
- Worktrees/sandboxes isolados e integração controlada de mudanças.
- Simulation Engine, Red Team Engine e análise de supply chain.
- Observabilidade de custo, latência, falhas e qualidade por agente.
- Catálogo de skills e integrações com política de confiança, licença e versão.

**Critério de sucesso:** múltiplos agentes entregam mudanças paralelas verificáveis, sem quebrar o Blueprint, com toda decisão estrutural atribuída e aprovada.

---

## 5. Trilha Contínua de Dogfooding

O Atlas será validado em projetos reais desde o Milestone 1. O primeiro caso de referência é um **sistema completo de controle de estoque**, cobrindo produtos/SKUs, armazéns, entradas, saídas, transferências, ajustes, reservas, inventário e alertas.

Cada execução deve produzir um relatório com:

- tempo e esforço por etapa;
- artefatos usados e ignorados;
- decisões que o Atlas tornou mais claras;
- erros ou drift evitados;
- contexto redundante e consumo desnecessário de tokens;
- operações que ainda dependeram de trabalho manual;
- melhorias acionáveis no CLI, Skill, MCP e schemas.

Um marco só é considerado concluído quando o caso de referência comprovar seu critério de sucesso.

---

## 6. Estratégia de Skills

Skills externas não entram automaticamente no núcleo. Toda candidata deve passar por avaliação de origem, licença, manutenção, segurança, sobreposição e custo de contexto.

Classificação de adoção:

- **Core:** comportamento indispensável e mantido pelo Atlas.
- **Adapter:** integração específica de agente ou plataforma.
- **Optional Pack:** capacidade de domínio instalada sob demanda.
- **Inspiration Only:** padrões incorporados em uma skill própria, sem copiar dependência externa.
- **Rejected:** risco, licença, baixa manutenção ou sobreposição injustificável.

O catálogo inicial deve cobrir frontend, backend, testes, segurança, DevOps, dados, observabilidade, documentação, arquitetura e produto, mas o contexto carregado em cada tarefa deve conter apenas as skills necessárias.

### Shortlist inicial de capacidades Atlas

A triagem inicial de 50 fontes externas foi consolidada nas 15 capacidades abaixo. Elas são contratos mantidos pelo Atlas, não aliases que carregam todos os upstreams no prompt.

| Prioridade | Capacidade                | Distribuição proposta       |
| ---------: | ------------------------- | --------------------------- |
|          1 | `atlas.discovery`         | `@atlas/pack-core`          |
|          2 | `atlas.context-grounding` | `@atlas/pack-core`          |
|          3 | `atlas.planning`          | `@atlas/pack-core`          |
|          4 | `atlas.implementation`    | `@atlas/pack-core`          |
|          5 | `atlas.debugging`         | `@atlas/pack-core`          |
|          6 | `atlas.review`            | `@atlas/pack-core`          |
|          7 | `atlas.api-contracts`     | `@atlas/pack-backend`       |
|          8 | `atlas.ui-web`            | `@atlas/pack-web`           |
|          9 | `atlas.browser-qa`        | `@atlas/pack-web`           |
|         10 | `atlas.security`          | `@atlas/pack-security`      |
|         11 | `atlas.data-postgres`     | `@atlas/pack-data-postgres` |
|         12 | `atlas.delivery`          | `@atlas/pack-delivery`      |
|         13 | `atlas.observability`     | `@atlas/pack-observability` |
|         14 | `atlas.living-docs`       | `@atlas/pack-product-sync`  |
|         15 | `atlas.cloud`             | `@atlas/pack-cloud-*`       |

Sequência inicial: definir `atlas.skill.json`, níveis de risco e lock de proveniência; implementar roteamento progressivo no `@atlas/skill`; entregar primeiro discovery, grounding, debugging e review; depois abrir packs web e segurança. Adapters executáveis permanecem desligados e read-only por padrão até negociação explícita de permissões.

---

## 7. Métricas de Efetividade

O Atlas será avaliado por resultados de engenharia, não por volume de artefatos ou número de agentes:

| Métrica                                             |             Meta inicial |
| --------------------------------------------------- | -----------------------: |
| Tempo até primeiro Blueprint validado               |                 < 15 min |
| Mudanças estruturais com decisão rastreável         |                     100% |
| Violações constitucionais detectadas antes do merge |                    > 90% |
| Falsos positivos do drift checker                   |                    < 10% |
| Contexto reutilizado entre sessões                  |                    > 60% |
| Instalação até primeira validação                   |                  < 5 min |
| Projetos de referência concluídos com Atlas         | ≥ 3 antes do Milestone 5 |

---

## 8. Gestão de Riscos

1. **Atlas virar apenas documentação extensa.**

   _Mitigação:_ todo artefato precisa alimentar uma validação, ferramenta MCP ou decisão executável.

2. **Atlas virar apenas uma aplicação que chama IA.**

   _Mitigação:_ CLI, Skill e MCP são o núcleo; o painel web consome o mesmo núcleo.

3. **Contexto excessivo reduzir a qualidade do agente.**

   _Mitigação:_ roteamento seletivo de skills e memória por tarefa, com orçamento de tokens mensurável.

4. **Dependência de um único agente ou fornecedor.**

   _Mitigação:_ contrato canônico do Atlas com adaptadores pequenos e testados por plataforma.

5. **Skills externas introduzirem risco de supply chain ou licença.**

   _Mitigação:_ catálogo curado, pin de versão, revisão humana e execução isolada antes de adoção.

6. **Orquestração multiagente aumentar custo antes de provar valor.**

   _Mitigação:_ somente iniciar Milestone 5 depois que o loop de um único agente passar no dogfooding.

7. **O binário `agy` colidir com uma ferramenta já instalada e não relacionada.**

   _Mitigação:_ verificar identidade e versão no instalador, usar execução pelo pacote com escopo e decidir um binário público não ambíguo antes do Milestone 2.
