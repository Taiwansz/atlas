# RFC-010: Atlas Engineering Standard (AES)

**RFC Number:** 010  
**Author(s):** Atlas Architecture & Standards Committee  
**Date:** 2026-07-08  
**Status:** Final  
**Category:** Standards  

---

## Abstract

Este RFC define o **Atlas Engineering Standard (AES)** — o conjunto definitivo de padrões, princípios de design, regras de codificação, requisitos de qualidade e processos operacionais que toda implementação do ecossistema Atlas deve seguir obrigatoriamente. O AES unifica as práticas de engenharia tradicional de alto nível com as restrições da engenharia orientada a agentes de inteligência artificial. 

Ele especifica regras para a organização do monorepo, convenções de nomenclatura, a aplicação prática de Clean Architecture e Domain-Driven Design (DDD), padrões de comunicação e segurança, o ciclo de testes, as regras de controle de release e a governança de auditoria automatizada. Por fim, este padrão introduz a **Definition of Done (DoD) Universal** e o **Checklist Cognitivo Obrigatório** que toda IA ou agente deve cumprir antes de submeter alterações de código para integração.

---

## 1. Introdução, Escopo e Relação com o Engineering Score

### 1.1 Objetivo do Padrão
O desenvolvimento acelerado por IA exige diretrizes mais rígidas do que o desenvolvimento puramente humano. Sem regras estruturais determinísticas, os modelos de linguagem geram variações inconsistentes na sintaxe, ignoram limites de camadas de software, criam acoplamentos cíclicos e subestimam a cobertura de testes. O AES resolve essa assimetria definindo um padrão técnico unificado e acionável.

### 1.2 Relação entre o Engineering Standard (Padrão) e o Engineering Score (Métrica)
Enquanto a [RFC-004: Atlas Engineering Score](file:///root/atlas/docs/rfc/RFC-004-engineering-score.md) define as fórmulas matemáticas e sub-métricas quantitativas de pontuação do projeto (0 a 1000), este documento (AES) especifica as regras de conformidade que o código deve seguir para obter essa pontuação. Toda violação a uma regra descrita neste padrão (AES) impacta diretamente as dimensões correspondentes do Engineering Score por meio da ferramenta de auditoria estática do Atlas (`agy validate --aes`).

---

## 2. Organização do Monorepo e Estrutura de Pastas

Toda implementação do Atlas baseia-se em um monorepo gerenciado pela ferramenta **Nx** (conforme [ADR-001](file:///root/atlas/docs/adr/ADR-001-monorepo-tool-selection.md)), respeitando a divisão rigorosa de responsabilidades.

### 2.1 Estrutura de Diretórios
A raiz do workspace deve seguir a topologia abaixo:

```
/root/atlas/
├── apps/                         # Aplicações finais executáveis (ex: CLI, Web UI)
│   ├── cli/                      # Interface de Linha de Comando (agy)
│   └── web/                      # Console Web Administrativo (Next.js)
├── engines/                      # Os 15 motores lógicos independentes do Atlas
│   ├── memory/                   # Motor de memória (RFC-003)
│   ├── blueprint/                # Motor de blueprint (RFC-001)
│   └── audit/                    # Motor de auditoria e cálculo de score (RFC-004)
├── packages/                     # Bibliotecas compartilhadas e agentes
│   ├── agents/                   # Os 18 agentes especializados
│   │   ├── orchestrator/
│   │   └── code/
│   ├── core/                     # Utilitários compartilhados e interfaces base
│   └── mcp/                      # Implementação do protocolo MCP (RFC-005)
├── foundation/                   # Princípios e documentos de governança constitutivos
│   ├── constitution/
│   └── principles/
├── infrastructure/               # Configurações de infraestrutura
│   ├── docker/                   # Compose e imagens base
│   ├── terraform/                # Definições de infraestrutura como código (IaC)
│   └── k8s/                      # Manifestos Kubernetes para deploy
└── docs/                         # Documentação técnica e de referência viva
    ├── adr/                      # Architectural Decision Records (ADRs)
    ├── rfc/                      # Requests for Comments (RFCs)
    └── specs/                    # Especificações técnicas de APIs e modelos
```

### 2.2 Convenções de Nomenclatura (Naming Conventions)

Para evitar desvios estilísticos e garantir consistência semântica:
* **Arquivos e Pastas:** Usar obrigatoriamente `kebab-case` (ex: `user-repository.ts`, `auth-controller.spec.ts`).
* **Classes, Interfaces e Tipos:** Usar `PascalCase` (ex: `UserRepository`, `IModelRequest`). Interfaces devem ser prefixadas com a letra `I` maiúscula (ex: `IAIProvider`).
* **Métodos, Funções e Variáveis:** Usar `camelCase` (ex: `generateStructuredOutput()`, `maxTokens`).
* **Constantes e Variáveis de Ambiente:** Usar `UPPER_SNAKE_CASE` (ex: `MAX_RETRY_ATTEMPTS`, `DATABASE_URL`).
* **Testes unitários:** Devem possuir a extensão `.spec.ts` ou `.test.ts` e residir no mesmo diretório do arquivo sob teste.

---

## 3. Fundações Arquiteturais: Clean Architecture & Domain-Driven Design (DDD)

Para assegurar testabilidade, desacoplamento e portabilidade tecnológica, toda lógica de negócio do Atlas deve ser isolada de frameworks externos usando os princípios da arquitetura limpa (Clean Architecture) e do design orientado ao domínio (DDD).

```
 ┌─────────────────────────────────────────────────────────────┐
 │                      CLEAN ARCHITECTURE                     │
 ├─────────────────────────────────────────────────────────────┤
 │                                                             │
 │   [Camada externa: Infraestrutura / Adapters]               │
 │     • Repositórios SQL, Servidores HTTP, Ferramentas MCP    │
 │                                                             │
 │       ▼ (Inversão de Dependências)                          │
 │                                                             │
 │     [Camada intermediária: Aplicação / Casos de Uso]        │
 │       • Command/Query Handlers, Portas (Interfaces)         │
 │                                                             │
 │         ▼                                                   │
 │                                                             │
 │       [Camada interna: Domínio]                             │
 │         • Entidades, Value Objects, Eventos de Domínio      │
 │                                                             │
 └─────────────────────────────────────────────────────────────┘
```

### 3.1 Camada de Domínio (Domain Layer)
* **Entidades (Entities):** Objetos de negócio com identidade única e ciclo de vida. Devem ser livres de dependências externas (como bibliotecas ORM ou annotations de persistência).
* **Objetos de Valor (Value Objects):** Imutáveis, sem identidade própria, definidos por seus atributos (ex: `ConfidenceScore`, `TokenUsage`).
* **Eventos de Domínio (Domain Events):** Capturam ocorrências relevantes no domínio (ex: `BlueprintValidatedEvent`).
* **Invariantes:** A camada de domínio deve conter apenas regras puras de negócio e lógica matemática autocontida.

### 3.2 Camada de Aplicação (Application Layer)
* **Casos de Uso (Use Cases):** Orquestram o fluxo de dados vindos e direcionados ao domínio.
* **Portas (Ports/Interfaces):** Definem os contratos que a infraestrutura deve implementar (ex: `IUserRepository`, `IEmailService`).
* **DTOs (Data Transfer Objects):** Estruturas de dados simples usadas para entrada e saída de dados da aplicação.

### 3.3 Camada de Infraestrutura (Infrastructure/Adapters Layer)
* **Adaptadores (Adapters):** Implementam as portas definidas na aplicação. Contêm acoplamentos com frameworks (ex: `KnexUserRepository`, `FastifyHttpController`, `RabbitMQEventPublisher`).
* **Proibição de Vazamento:** Nenhuma tecnologia da camada de infraestrutura (como conexões com bancos de dados, conexões de socket ou frameworks de rotas) pode passar pela fronteira das portas para a aplicação ou domínio.

### 3.4 Princípios SOLID Aplicados
* **S (Single Responsibility):** Cada classe ou arquivo deve ter apenas um motivo para mudar. Funções e classes gigantescas (mais de 150 linhas) devem ser refatoradas.
* **O (Open-Closed):** O sistema deve aceitar novas extensões por meio de polimorfismo ou injeção de dependência sem modificar a lógica base do núcleo.
* **L (Liskov Substitution):** Subtipos devem ser completamente substituíveis por seus tipos base sem alterar o comportamento do programa.
* **I (Interface Segregation):** Clientes não devem ser forçados a depender de métodos que não utilizam. Interfaces com muitos métodos devem ser quebradas.
* **D (Dependency Inversion):** Depender de abstrações (interfaces), nunca de implementações concretas. O uso de contêineres de Injeção de Dependência (DI) é obrigatório para ligar adaptadores aos casos de uso.

### 3.5 Isolamento Modular e Contratos Públicos
* **Ponto de Entrada Único:** Cada módulo ou biblioteca no monorepo deve expor suas funcionalidades exclusivamente através de um arquivo `index.ts` na raiz do pacote.
* **Linter Lint-Bounds:** É expressamente proibida a importação de submódulos internos (ex: `import { x } from '@atlas/memory/src/internal/db'`). Todo consumo deve referenciar o contrato público exportado no index.
* **Barreiras Estáticas:** O Nx deve estar configurado com regras de `tags` que proíbam dependências cíclicas entre motores (ex: o motor de memória não pode importar o motor de auditoria).

---

## 4. Comunicação, APIs e Tratamento de Erros

### 4.1 Padrões de APIs

* **RESTful HTTP:**
  * Uso correto de verbos HTTP: `GET` (leitura), `POST` (criação), `PUT` (atualização total), `PATCH` (atualização parcial) e `DELETE` (exclusão).
  * URIs em plural e kebab-case: `/v1/blueprints`, `/v1/audit-reports`.
  * Códigos de status HTTP semânticos: `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `422 Unprocessable Entity` (erros de regra de negócio) e `500 Internal Server Error`.
  * Todas as payloads de erro HTTP devem seguir a RFC-7807 (Problem Details for HTTP APIs).
* **gRPC:** Utilizado para comunicação interna de alta performance entre motores locais. Buffers de protocolo (`.proto`) devem ser versionados e compilados automaticamente.

### 4.2 Arquitetura Baseada em Eventos (Event-Driven)
* **Mensageria com Kafka:** Todos os eventos de integração devem ser publicados em tópicos organizados por domínio (ex: `atlas.domain.blueprint.validated`).
* **Transactional Outbox Pattern:** O código de infraestrutura de persistência deve salvar o evento no banco de dados local na mesma transação lógica da entidade de negócio, garantindo a publicação de eventos mesmo sob falhas de conexão de rede com o Kafka.
* **Garantia de Entrega:** Assinantes de eventos devem ser idempotentes para lidar com entregas duplicadas ("at-least-once").

### 4.3 Tratamento de Erros e Exceções
* **Hierarquia Unificada de Exceções:** Toda exceção do sistema deve herdar de uma classe base `AtlasException`.
* **Proibição de Erros Genéricos:** Lançar strings ou instâncias brutas de `Error` é inaceitável. O sistema deve usar exceções tipadas como `ValidationException`, `EntityNotFoundException` ou `SecurityException`.
* **Camuflagem de Erros de Infraestrutura:** Exceções originadas em drivers de terceiros (como `pg-query-error`) devem ser capturadas e envelopadas em exceções de domínio adequadas antes de cruzarem a fronteira do adaptador para a aplicação, para evitar vazamento de detalhes do banco de dados na pilha de logs.

---

## 5. Preocupações Transversais (Cross-Cutting Concerns)

### 5.1 Observabilidade
* **OpenTelemetry (OTel):** Todas as transações importantes devem ser rastreadas usando OTel Tracing. O identificador único de rastreamento (`traceId`) deve ser repassado em todas as chamadas internas gRPC, HTTP ou mensagens Kafka.
* **Métricas com Prometheus:** Cada motor deve expor métricas operacionais no endpoint `/metrics` usando os formatos do Prometheus:
  * Contadores (`Counter`) para requisições totais, erros e uso de tokens.
  * Medidores (`Gauge`) para conexão ativa e status de filas.
  * Histogramas (`Histogram`) para latência de requisições.
* **Logging Estruturado:** Logs devem ser emitidos no console padrão (stdout) em formato JSON contendo obrigatoriamente:
  * `timestamp`, `level` (DEBUG, INFO, WARN, ERROR, FATAL).
  * `traceId`, `spanId` (se houver trace ativo).
  * `agentId`, `taskId` (se disparado por um agente).
  * `message` e metadados contextuais em chaves planas (sem objetos aninhados profundos).
  * **LGPD / Privacidade:** É estritamente proibido incluir informações pessoais (PII), senhas, tokens ou chaves de API nos logs.

### 5.2 Segurança, Autenticação e Autorização
* **Autenticação:** Baseada em OAuth2 e OpenID Connect (OIDC). Chaves JWT devem ser validadas localmente usando chaves públicas expostas pelo provedor de identidade (Keycloak).
* **Autorização Baseada em Papel e Atributo (RBAC/ABAC):** O controle de acesso a endpoints ou serviços internos deve ser validado via annotations/guards declarativas no código (ex: `@RequiresPermission("blueprint:write")`).
* **Segurança de Dados e Segredos:**
  * Dados confidenciais em repouso devem ser criptografados usando AES-256-GCM.
  * Chaves secretas nunca devem ser inseridas no código fonte. Devem ser lidas em tempo de execução a partir de variáveis de ambiente gerenciadas no Kubernetes ou injetadas diretamente por cofres de segredos (HashiCorp Vault).

### 5.3 Rollout e Migrações de Banco de Dados
* **Zero Downtime Migrations:** Alterações de banco de dados devem ser não destrutivas e seguir a abordagem "Expand and Contract". Migrações que quebram retrocompatibilidade no banco relacional (como renomear ou remover colunas sob uso ativo) são proibidas.
* **Feature Flags:** Novas rotas e fluxos de negócio críticos devem ser envelopados em feature flags para permitir ativação dinâmica em produção, testes em canário e rollback imediato sem necessidade de re-deploy.

---

## 6. Estratégia de Testes e Qualidade

O ciclo de testes do Atlas divide-se em três camadas de responsabilidade, integradas a validações estáticas e simulações.

```
┌─────────────────────────────────────────────────────────────┐
│                      PIRÂMIDE DE TESTES                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   [Camada superior: Testes E2E (Simulação)]                 │
│     • Fluxos completos do usuário / Golden Paths            │
│     • Ferramentas: Playwright, Cypress                      │
│                                                             │
│   [Camada intermediária: Testes de Integração]              │
│     • Validação de APIs, Repositórios contra BD real        │
│     • Ferramentas: Testcontainers                           │
│                                                             │
│   [Camada inferior: Testes Unitários]                       │
│     • Regras de negócio puras, domínio, lógica isolada      │
│     • Cobertura mínima: 85%                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.1 Camadas de Teste
1. **Testes Unitários:** Focados em isolar a lógica de negócio do domínio e casos de uso. Devem usar mocks apenas para serviços externos (I/O, rede, banco). O framework padrão é o Jest.
2. **Testes de Integração:** Validam a comunicação real com dependências. É obrigatório o uso de bancos de dados efêmeros ou simuladores locais de infraestrutura via **Testcontainers** para testes de repositórios SQL, Neo4j, Redis ou Kafka. Mockar conexões locais de banco de dados em testes de integração é proibido.
3. **Testes E2E:** Simulam o fluxo ponta a ponta do usuário. APIs devem ser testadas em ambiente de staging ou containerizado contra endpoints reais.

### 6.2 Testes de Performance
* **Carga e Stress com K6:** Toda alteração significativa que impacte caminhos críticos do sistema deve ser acompanhada de um script de teste de carga K6 com validação de orçamentos de latência (Latency Budgets):
  * **Leitura simples:** p95 < 50ms.
  * **Escrita transacional:** p95 < 150ms.
  * **Validação de Blueprint complexo:** p95 < 2000ms.

---

## 7. Processos, Definição de Done (DoD) e Checklist Cognitivo da IA

Para garantir consistência técnica e conformidade constante com os padrões de engenharia estabelecidos, criamos barreiras operacionais que devem ser cumpridas antes de qualquer entrega de código.

### 7.1 Definition of Done (DoD) Universal

Qualquer tarefa de implementação (criada por humanos ou IAs) só poderá ser declarada como "Concluída" (Done) se cumprir integralmente os seguintes critérios objetivos:

1. **Compilação sem Erros:** O código compila sem warnings e sem qualquer tipo de erro de compilação no compilador TypeScript (`tsc --noEmit`).
2. **Drift-Check Aprovado:** A validação estática de conformidade arquitetural contra o blueprint (`agy validate --drift-check`) retorna sucesso.
3. **Padrão de Cobertura de Testes Atingido:**
   * Cobertura de testes unitários mínima de **85% das linhas** para arquivos criados ou modificados.
   * Cobertura de testes unitários de **100%** em módulos de autenticação, criptografia ou transações financeiras.
4. **Sem Vulnerabilidades de Segurança (SAST/DAST):** As ferramentas de segurança integradas não apontam vulnerabilidades críticas ou altas no código modificado.
5. **Documentação Atualizada:**
   * Todos os novos endpoints, classes e tabelas foram declarados no Blueprint.
   * Modificações de impacto geraram ou supersederam ADRs aplicáveis.
   * APIs e glossários do projeto foram atualizados no índice central de documentação (`docs/INDEX.md`).
6. **Métricas de Código Respeitadas:**
   * Complexidade ciclomática de todas as novas funções e métodos é inferior ou igual a 10.
   * Acoplamento eferente/instabilidade dos pacotes novos respeita os limites estabelecidos no Nx.

---

### 7.2 Checklist Cognitivo Obrigatório para IAs (Pre-flight Validation)

Este checklist representa um protocolo interno e obrigatório de metacognição que o Atlas (e seus subagentes) deve preencher e validar internamente antes de gerar ou submeter qualquer PR (Pull Request) ou merge de código:

```
[ ] 1. CONSTITUIÇÃO: Verifiquei se o código atende às regras invioláveis de .atlas/constitution.json?
[ ] 2. BLUEPRINT: Modifiquei e validei o blueprint primeiro, antes de codificar a solução física?
[ ] 3. SOLID: Validei se nenhuma nova classe viola o Princípio da Responsabilidade Única (SRP) ou Inversão de Dependência (DIP)?
[ ] 4. MOCKS: Garantido que mocks NÃO foram utilizados para testes de integração contra bancos ou filas (usei Testcontainers)?
[ ] 5. LOGS: Confirmei se os logs estruturados emitidos contêm traceId e não expõem senhas, tokens ou dados de PII de usuários?
[ ] 6. ERROS: Mapeei todos os possíveis erros de I/O em exceções estruturadas herdadas de AtlasException, evitando Error genérico?
[ ] 7. ADR: Se tomei alguma decisão técnica com trade-offs, criei o respectivo ADR immutable em docs/adr/?
[ ] 8. DRIFT-CHECK: Executei `agy validate --drift-check` localmente no workspace e obtive validação bem-sucedida?
```

*Nota: O descumprimento injustificado de qualquer um dos itens acima bloqueia automaticamente o commit no gancho de pré-commit (git pre-commit hook) gerenciado pelo Husky.*

---

## 8. Auditoria Automatizada e Cálculo do Engineering Score

O **Audit Agent** é o responsável por certificar continuamente a integridade do código contra este padrão técnico, gerando relatórios de drift e aplicando deduções no Engineering Score em caso de violação.

### 8.1 Comando `agy validate`
Durante o processo de desenvolvimento e em pipelines de Integração Contínua (CI/CD), executa-se a auditoria com o comando:
```bash
agy validate --aes --detailed
```
Este comando analisa estaticamente o código-fonte, a estrutura de pastas e a documentação técnica, cruzando as informações com as diretrizes deste documento (AES).

### 8.2 Matriz de Penalidades de Desvio de Qualidade do Score

O descumprimento das regras do AES acarreta deduções diretas nas pontuações das dimensões do [Atlas Engineering Score (RFC-004)](file:///root/atlas/docs/rfc/RFC-004-engineering-score.md). Cada infração possui um peso de dedução formal:

| Regra AES Violada | Tipo de Impacto no Score | Penalidade Unitária | Dimensão Afetada no Score |
| :--- | :--- | :--- | :--- |
| **Código sem Blueprint** | Bloqueio / Crítico | -30 pontos | Dimensão 1: Architecture Quality |
| **Dependência Cíclica de Módulos** | Grave | -25 pontos | Dimensão 1: Architecture Quality |
| **Lançar erro genérico (`Error`)** | Moderado | -10 pontos | Dimensão 2: Code Quality |
| **Complexidade Ciclomática > 10** | Moderado | -15 pontos | Dimensão 2: Code Quality |
| **Segredo exposto no código fonte** | Bloqueio / Crítico | -45 pontos | Dimensão 3: Security |
| **Falta de traceId nos logs estruturados** | Leve | -5 pontos | Dimensão 7: Maintainability |
| **Falta de Testcontainers no teste de integração**| Moderado | -20 pontos | Dimensão 6: Testing |
| **Cobertura de novos arquivos < 85%** | Grave | -25 pontos | Dimensão 6: Testing |
| **Falta de ADR associada a alteração no Blueprint**| Grave | -20 pontos | Dimensão 5: Documentation |

---

### 8.3 Exemplo de Estrutura do Relatório de Auditoria AES

Em caso de falhas encontradas pelo comando `agy validate --aes`, o Audit Agent gera o relatório de saída `/docs/audit/aes-compliance-report.json`:

```json
{
  "$schema": "https://atlas.engineering/schemas/aes-report/v1.json",
  "project_name": "atlas-core",
  "timestamp": "2026-07-08T03:20:00Z",
  "compliance_status": "failed",
  "overall_aes_score_deductions": -55,
  "violations": [
    {
      "rule_id": "AES-CODE-UNBLUEPRINTED",
      "severity": "critical",
      "file_path": "file:///root/atlas/packages/core/src/auth/new-security-helper.ts",
      "message": "O arquivo 'new-security-helper.ts' foi criado mas não está declarado como um componente no 'atlas.blueprint.yaml'.",
      "penalty": -30,
      "remediation_suggestion": "Adicione o componente na seção 'architecture.components' do blueprint com o caminho correto do arquivo."
    },
    {
      "rule_id": "AES-TEST-MOCKING-DATABASE",
      "severity": "medium",
      "file_path": "file:///root/atlas/packages/core/src/auth/user-repository.spec.ts#L45",
      "message": "Teste de integração utiliza mocks para simular a classe 'DatabaseConnection'. Testes de integração de repositório devem usar Testcontainers SQL.",
      "penalty": -20,
      "remediation_suggestion": "Substitua a declaração de mock do banco por uma instância limpa de PostgreSqlContainer usando testcontainers."
    },
    {
      "rule_id": "AES-LOG-MISSING-TRACEID",
      "severity": "low",
      "file_path": "file:///root/atlas/packages/core/src/auth/auth-service.ts#L102",
      "message": "Chamada de logger.info() não repassa o contexto do traceId atual.",
      "penalty": -5,
      "remediation_suggestion": "Adicione o traceId como parte do objeto estruturado no primeiro parâmetro da chamada do logger."
    }
  ]
}
```

---

## 9. Conclusão

O **Atlas Engineering Standard (AES)** garante que o ecossistema Atlas permaneça robusto, seguro, legível e altamente testável ao longo do tempo. Ao introduzir o checklist de conformidade cognitiva para IAs e indexar a dedução de score de engenharia a falhas formais de codificação, o AES converte preceitos subjetivos de "qualidade de código" em asserções computacionais objetivas, permitindo que a própria plataforma monitore e previna a degradação de sua arquitetura de forma autônoma.
