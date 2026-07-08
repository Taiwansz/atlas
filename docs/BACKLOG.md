# Atlas Product Backlog

Este backlog centraliza todos os requisitos de produto e tarefas de engenharia mapeados para a construção do **Atlas Engineering Operating System**, organizados por Épicos e priorizados conforme a esteira de sprints do projeto.

---

## 1. Épicos do Sistema

* **Épico 1: Shared Core Foundation (Atlas Core) — Sprint 1**
  * Infraestrutura compartilhada do monorepo, configuração, DI, logging, tracing, event-bus, exceções e pipeline de CI/CD.
* **Épico 2: CLI Interface & Dev Tooling — Sprint 2**
  * Comandos CLI (`agy`), loaders, helpers e scripts de inicialização de workspace.
* **Épico 3: Blueprint & Lifecycle Management — Sprint 2**
  * Parsers de YAML, validação Zod de esquemas e geração de lockfile de arquitetura.
* **Épico 4: Compliance & Drift Inspection Engine — Sprint 3**
  * AST parser de arquivos TypeScript, comparação contra blueprint e detecção de drifts.
* **Épico 5: Quality, Audits & Scoring (AQIS/AES) — Sprint 3**
  * Cálculo matemático do score de engenharia, relatórios de drift e portões de validação (Quality Gates).
* **Épico 6: Socratic Requirement Intake — Sprint 4**
  * Interface CLI adaptativa de perguntas e respostas para coleta de requisitos de negócio.
* **Épico 7: Project Memory & Knowledge Graph — Sprint 5**
  * Integração com vetores e Neo4j para persistência episódica e semântica de decisões.
* **Épico 8: Multi-Agent Orchestration Core (Maestro) — Sprint 6**
  * Orquestração distribuída LangGraph, DAG de tarefas de sprints e protocolo de comunicação AACP.

---

## 2. Detalhamento do Épico 1: Shared Core Foundation (Sprint 1)

Todas as tarefas desta sprint são de infraestrutura e possuem dependência cruzada.

---

### Feature 1.1: Sistema de Configuração Unificado e Ambientes
* **ID:** `US-1.1`  
* **Título:** Carregamento de Configurações de Ambiente com Validação Estática  
* **História de Usuário:** Como engenheiro de desenvolvimento do Atlas, desejo que as variáveis de ambiente (`.env`) sejam validadas e tipadas no início da execução da aplicação, para evitar falhas silenciosas de configuração em produção.  
* **Tarefas Técnicas:**
  1. Definir o esquema Zod `ConfigSchema` contendo ambiente, porta, logs, url do BD, chaves de provedores de IA e brokers Kafka.
  2. Implementar a classe `ConfigManager` que carrega e executa o parser Zod, lançando `ConfigurationException` em caso de falha.
  3. Escrever testes unitários validando cargas corretas e erros de validação sintática de portas e URIs.
* **Critérios de Aceitação:**
  * O comando `ConfigManager.load()` retorna um objeto congelado tipado pelo Zod.
  * Variáveis ausentes ou inválidas disparam uma exceção clara contendo a lista exata dos campos com erro.
* **Estimativa:** 3 Story Points (SP)  
* **Dependências:** Nenhuma.  
* **Riscos:** Lidar com variáveis ausentes em pipelines de CI que não possuem arquivo `.env`. Mitigado via fallback de valores padrão seguros.

---

### Feature 1.2: Container de Injeção de Dependências (DI)
* **ID:** `US-1.2`  
* **Título:** Gerenciamento de Dependências por Contêiner Leve  
* **História de Usuário:** Como desenvolvedor, desejo injetar instâncias de serviços e adaptadores de forma desacoplada via contêiner, para facilitar a escrita de testes unitários com mocks isolados.  
* **Tarefas Técnicas:**
  1. Criar a classe estática `Container` com mapas privados para instâncias singletons e fábricas (factories).
  2. Implementar métodos `register<T>()`, `registerFactory<T>()` e `resolve<T>()`.
  3. Criar utilitário `clear()` para reset de estado entre execuções de testes unitários.
* **Critérios de Aceitação:**
  * Resolução de tokens inexistentes dispara erro tipado.
  * O contêiner retorna exatamente a mesma instância de singleton para múltiplas chamadas de `resolve()`.
* **Estimativa:** 2 SP  
* **Dependências:** Nenhuma.  
* **Riscos:** Registro duplo de tokens. Mitigado lançando erro se o token já existir.

---

### Feature 1.3: Logger Estruturado JSON
* **ID:** `US-1.3`  
* **Título:** Logging Estruturado de Alta Performance com Contexto de Tracing  
* **História de Usuário:** Como operador do sistema, desejo que o sistema emita logs estruturados em JSON para stdout contendo o traceId ativo da requisição, para facilitar a depuração no Jaeger/Grafana.  
* **Tarefas Técnicas:**
  1. Criar a interface `ILogger` definindo métodos de níveis: debug, info, warn, error.
  2. Implementar a classe `WinstonLogger` envelopando a biblioteca Winston.
  3. Integrar extração automática do `traceId` e `spanId` do contexto ativo do OpenTelemetry.
* **Critérios de Aceitação:**
  * Logs emitidos em JSON estruturado de linha única.
  * Ausência de vazamento de dados de chaves ou PII sensíveis.
* **Estimativa:** 3 SP  
* **Dependências:** `US-1.1`  
* **Riscos:** Lentidão causada pela extração contínua do contexto do OpenTelemetry. Mitigado usando verificação condicional rápida.

---

### Feature 1.4: Telemetria e Tracing (OpenTelemetry)
* **ID:** `US-1.4`  
* **Título:** Rastreabilidade de Spans e Telemetria de Métricas  
* **História de Usuário:** Como arquiteto do sistema, desejo monitorar a performance e latência das chamadas internas do ecossistema de agentes por meio de traces distribuídos, para identificar gargalos em tempo real.  
* **Tarefas Técnicas:**
  1. Definir a interface `ITelemetry` para controle de spans e métricas de Prometheus.
  2. Implementar a classe `OpenTelemetryService` integrada com as APIs `@opentelemetry/api` e `@opentelemetry/sdk-node`.
  3. Criar contadores e medidores (counters/gauges) padrão de tráfego e erros.
* **Critérios de Aceitação:**
  * Capacidade de iniciar e encerrar spans propagando o contexto de rastreabilidade.
  * Métricas expostas compatíveis com Prometheus.
* **Estimativa:** 5 SP  
* **Dependências:** `US-1.1`, `US-1.3`  
* **Riscos:** Perda de conexão com o coletor OpenTelemetry (Jaeger/OTel Collector). Mitigado configurando exportadores com falha silenciosa (non-blocking).

---

### Feature 1.5: Barramento de Eventos Local (InMemoryEventBus)
* **ID:** `US-1.5`  
* **Título:** Comunicação Assíncrona via Eventos em Memória  
* **História de Usuário:** Como desenvolvedor de agentes, desejo publicar e assinar eventos técnicos de forma desacoplada em memória, para simular a arquitetura baseada em eventos do Kafka localmente sem latência de rede.  
* **Tarefas Técnicas:**
  1. Criar as interfaces `IEventEnvelope` e `IEventBus`.
  2. Implementar `InMemoryEventBus` utilizando o módulo nativo de Node.js `EventEmitter`.
  3. Adicionar processamento assíncrono não bloqueante via `setImmediate()` para despachos de handlers.
* **Critérios de Aceitação:**
  * A publicação de eventos não bloqueia a execução da thread principal do publicador.
  * Handlers com erro não quebram o fluxo de outros handlers inscritos no mesmo tópico.
* **Estimativa:** 3 SP  
* **Dependências:** `US-1.3`  
* **Riscos:** Vazamento de memória por múltiplos registros de ouvintes sem reset. Mitigado limitando o número máximo de ouvintes e provendo reset no teardown de testes.

---

### Feature 1.6: Sistema de Feature Flags Efêmero
* **ID:** `US-1.6`  
* **Título:** Controle de Lançamento Gradual de Funcionalidades  
* **História de Usuário:** Como gerente de produto, desejo ativar ou desativar caminhos de código dinamicamente via flags baseadas em contexto, para realizar lançamentos canários e testes controlados.  
* **Tarefas Técnicas:**
  1. Criar a interface `IFeatureFlagService`.
  2. Implementar `LocalFeatureFlagService` lendo configurações estáticas de variáveis de ambiente ou arquivos locais JSON.
  3. Criar testes unitários simulando cenários habilitados/desabilitados.
* **Critérios de Aceitação:**
  * Verificação rápida sem impacto perceptível de latência (< 1ms).
  * Retorno seguro de valores booleanos falsos por padrão se a chave da flag for inexistente.
* **Estimativa:** 2 SP  
* **Dependências:** `US-1.1`  

---

### Feature 1.7: Estrutura Base de Tratamento de Erros e Exceções
* **ID:** `US-1.7`  
* **Título:** Estruturação Hierárquica de Exceções Técnicas e de Domínio  
* **História de Usuário:** Como desenvolvedor, desejo lançar exceções tipadas de engenharia contendo códigos de erros semânticos e timestamps, para evitar o uso de erros genéricos (`Error`) do Javascript.  
* **Tarefas Técnicas:**
  1. Implementar a classe abstrata `AtlasException` estendendo a classe nativa `Error`.
  2. Criar exceções herdadas: `ConfigurationException`, `ConstitutionViolationException`, `DataDriftException`, `AIProviderException`, `EventBusException`.
* **Critérios de Aceitação:**
  * Todas as instâncias de exceção capturadas carregam um código semântico (`code`) e timestamp.
  * Compatibilidade total com capturas de pilha de execução (stack traces).
* **Estimativa:** 2 SP  
* **Dependências:** Nenhuma.  

---

### Feature 1.8: Pipeline CI/CD Básico de Validação
* **ID:** `US-1.8`  
* **Título:** Validação Automatizada de Qualidade no GitHub Actions  
* **História de Usuário:** Como líder de equipe, desejo que todo push ou pull request na branch `main` execute verificações de build, formatação, linter e testes unitários automaticamente, para evitar regressões na base de código.  
* **Tarefas Técnicas:**
  1. Criar arquivo de workflow `.github/workflows/ci.yml`.
  2. Configurar o setup de Node.js v20 e cache de pacotes.
  3. Configurar a execução sequencial de: `npm run format:check`, `npm run lint` e `npm run test`.
* **Critérios de Aceitação:**
  * O pipeline falha se houver erro de digitação, falha de tipagem do TypeScript ou testes unitários falhando.
* **Estimativa:** 2 SP  
* **Dependências:** Nenhuma.  
