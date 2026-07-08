# RFC-009: Atlas Cognitive System Specification

**RFC Number:** 009  
**Author(s):** Atlas Architecture & Cognitive Systems Team  
**Date:** 2026-07-08  
**Status:** Final  
**Category:** Cognitive Architecture  

---

## Abstract

Este RFC define a especificação formal do **Sistema Cognitivo do Atlas (Atlas Cognitive System)** — o motor de raciocínio, tomada de decisão e coordenação de agentes que rege o Atlas Engineering Operating System. Em vez de operar como um assistente de código ad-hoc reativo, o Atlas executa uma metodologia determinística de engenharia de software baseada em princípios formais, análise rigorosa e validação contínua. 

Esta especificação detalha o ciclo de vida completo do desenvolvimento de software orientado pelo Atlas (desde a ideia inicial até a entrega contínua), a taxonomia de tomada de decisão, o modelo de governança e aprovação humana, a resolução de conflitos por síntese socrática, o modelo de confiança baseado no framework ERAJ (Evidências, Riscos, Alternativas, Justificativas) e a integração com o ecossistema de memória de longo prazo, Skills e Model Context Protocol (MCP).

---

## 1. Introdução e Motivação

### 1.1 O Problema da IA Reativa na Engenharia de Software
Modelos de linguagem generativa tradicionais operam em regime de "próxima palavra" (next-token prediction), o que induz a comportamentos reativos, geração de código desalinhado com a arquitetura geral (arquitetura ad-hoc) e ausência de uma visão sistêmica de longo prazo. Em ambientes corporativos complexos, a aceleração de desenvolvimento por IA sem governança arquitetural gera o que chamamos de *dívida técnica acelerada por máquina*: código gerado a alta velocidade, porém sem consistência de design, testes robustos ou alinhamento com as regras constitucionais do projeto.

### 1.2 A Solução: Raciocínio Determinístico Orientado a Engenharia
O Atlas Cognitive System substitui o empirismo probabilístico por um ciclo de vida de engenharia determinístico e disciplinado. Ele garante que:
1. **Design precede a Implementação (Blueprint-First):** Nenhum código é escrito sem que a especificação formal de sua arquitetura tenha sido modelada, testada e aprovada pelo usuário.
2. **Tomada de Decisão Baseada em Evidências:** Todas as decisões arquiteturais significativas seguem um modelo de confiança formalizado.
3. **Ciclo de Vida Integrado:** Do intake socrático à auditoria de conformidade no pipeline de CI/CD, cada etapa produz artefatos imutáveis (`requirements.json`, `atlas.blueprint.yaml`, ADRs).
4. **Independência de Modelo:** O comportamento racional do Atlas é governado por protocolos cognitivos, tornando a arquitetura adaptável a qualquer modelo fundacional (Gemini, Claude, GPT ou LLMs locais).

---

## 2. A Ontologia de Raciocínio do Atlas

O pensamento do Atlas não é uma caixa preta; ele segue uma estrutura formal baseada no loop OODA (Observe, Orient, Decide, Act) adaptado para engenharia de software, integrado a um processo de **Metacognição** (raciocínio sobre o próprio raciocínio).

```
 ┌─────────────────────────────────────────────────────────────┐
 │                 LOOP COGNITIVO DO ATLAS                     │
 ├─────────────────────────────────────────────────────────────┤
 │                                                             │
 │   ┌───────────────┐     ┌───────────────┐     ┌─────────┐   │
 │   │  1. OBSERVAR  │ ──▶ │ 2. ORIENTAR   │ ──▶ │3.DECIDIR│   │
 │   │  • Código AST │     │  • Contexto   │     │• Avaliar│   │
 │   │  • Logs/Erros │     │  • Restrições │     │  Confia │   │
 │   │  • Input User │     │  • Memória    │     │  (ERAJ) │   │
 │   └───────────────┘     └───────────────┘     └────┬────┘   │
 │           ▲                                        │        │
 │           │                                        ▼        │
 │   ┌───────┴───────┐                         ┌───────────┐   │
 │   │  5. VERIFICAR │ ◀────────────────────── │  4. AGIR  │   │
 │   │  • Compilação │                         │  • Code   │   │
 │   │  • Testes Unit│                         │  • Exec   │   │
 │   │  • Drift Check│                         │  • Tool   │   │
 │   └───────────────┘                         └───────────┘   │
 │                                                             │
 └─────────────────────────────────────────────────────────────┘
```

### 2.1 Passos do Loop Cognitivo (OODA-V)

1. **Observar (Observe):** Coleta e ingestão de telemetria e estado atual. Isso inclui a leitura da árvore de sintaxe abstrata (AST) do projeto, consulta ao grafo de dependências, leitura de logs do compilador/interpretador e captura exata do prompt e intenção do usuário.
2. **Orientar (Orient):** Alinhamento do estado atual com o contexto histórico do projeto. Consulta-se a Memória Semântica (decisões passadas), a Constituição do Sistema (regras invioláveis), as restrições tecnológicas descritas no Blueprint e a documentação técnica relevante.
3. **Decidir (Decide):** Geração de alternativas com cálculo de confiança. É aqui que o framework **ERAJ** (ver Seção 5) é instanciado. O Atlas avalia se possui autoridade para decidir autonomamente ou se deve solicitar aprovação.
4. **Agir (Act):** Execução da decisão através de ferramentas estruturadas (MCP, execução de código em sandbox, modificação de arquivos via diffs estruturados).
5. **Verificar (Verify):** Fase crítica de fechamento do loop. O Atlas executa testes automatizados, ferramentas de linting, auditoria estática e análise de desvio (drift analysis) em relação ao Blueprint. Se houver falha, o loop reinicia com o erro como nova observação.

### 2.2 Estrutura da Cadeia de Raciocínio (Metacognição)
Antes de realizar qualquer chamada de ferramenta ou propor modificações, o Atlas gera um bloco de raciocínio interno (`<thought>`) estruturado sob as seguintes seções abstratas:
- **`CURRENT_STATE`**: Diagnóstico preciso da situação atual do workspace.
- **`CONSTRAINTS_CHECK`**: Validação de restrições constitucionais ou tecnológicas do projeto.
- **`HYPOTHESIS`**: O que o Atlas acredita ser a causa raiz ou a melhor solução arquitetural.
- **`RISK_ASSESSMENT`**: Impactos colaterais potenciais da ação planejada.
- **`ACTION_SEQUENCE`**: O plano de execução passo a passo antes de sua chamada real.

---

## 3. Ciclo de Vida do Software: Do Intake à Evolução Contínua

O desenvolvimento de software no Atlas segue uma esteira determinística composta por 8 fases lineares e cíclicas. Cada fase possui inputs definidos, agentes especializados alocados e outputs imutáveis com validação estática.

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ 1.Intake │ ──▶ │ 2.Spike  │ ──▶ │ 3.Design │ ──▶ │4.Blueprnt│
│ & Descov │     │ & Hipót. │     │ & Arch   │     │  & Const │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                                                        │
                                                        ▼
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│8.Evolução│ ◀── │ 7.Audit  │ ◀── │ 6.Qualid │ ◀── │ 5.Plan & │
│ Contínua │     │  & Review│     │  & Test  │     │  Implem  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
```

---

### Fase 1: Intake & Descoberta de Requisitos (Entrevistas Adaptativas)

Esta fase é conduzida pelo **Discovery Agent** e pelo **Research Agent**. Seu objetivo é transformar ideias abstratas e linguagem natural informal em especificações de engenharia rigorosas.

#### 1. Entrevistas Adaptativas (Socratic Dialogue)
O Atlas não aceita descrições de requisitos incompletas de forma passiva. Ele inicia uma rodada de entrevista socrática iterativa. O diálogo é guiado pela busca por:
- **Problema de Negócio (O "Porquê"):** Identificar a dor real por trás da solicitação de funcionalidade.
- **Limites do Escopo:** Determinar o que está expressamente fora do escopo do projeto (Out of Scope).
- **Requisitos Não-Funcionais (NFRs):** Latência esperada, concorrência, requisitos de segurança, persistência e metas de custo de infraestrutura.
- **Casos de Uso Principais (Golden Paths):** A jornada perfeita do usuário através da funcionalidade.

#### 2. Pesquisa de Documentação Oficial e Análise de Estado da Arte
Antes de propor uma arquitetura, o **Research Agent**:
- Realiza consultas na documentação oficial de frameworks e bibliotecas envolvidas via MCP ou web search.
- Analisa boas práticas vigentes e problemas conhecidos (GitHub Issues, CVEs) das dependências recomendadas.
- Efetua análise de mercado ou arquiteturas de referência para o domínio do problema se aplicável.

#### 3. Output da Fase
O produto desta fase é o arquivo `/docs/intake/requirements.json` contendo o schema de requisitos estruturado, assinado digitalmente pelo Discovery Agent.

---

### Fase 2: Geração e Validação de Hipóteses (Spike Phase)

Nesta fase, o **Research Agent** e o **Orchestrator Agent** validam premissas tecnológicas e diminuem o grau de incerteza técnica.

#### 1. Identificação de Incógnitas (Unknowns)
Se um requisito envolve integração complexa ou tecnologia não experimentada anteriormente no projeto, o Atlas cria uma lista de hipóteses técnicas a serem provadas.

#### 2. Experimentos em Sandbox (Spikes)
O Atlas instancia um ambiente isolado (sandbox ou pasta `scratch` do projeto) e escreve pequenos scripts autocontidos (Spikes) para:
- Testar a compatibilidade de APIs de terceiros.
- Validar a performance de um algoritmo sob carga simulada.
- Verificar o comportamento do parser de uma biblioteca.

#### 3. Output da Fase
Um relatório de Spike armazenado em `/research/spikes/<spike-name>.md` detalhando as premissas testadas, os dados brutos de telemetria coletados e a hipótese vencedora recomendada para a fase de design.

---

### Fase 3: Definição da Arquitetura e Escrita de ADRs

Liderada pelo **Architecture Agent** e **Database Agent**, esta fase define as bases do sistema.

#### 1. Mapeamento de Topologia e Componentes
O sistema é estruturado em subdomínios, módulos, microserviços ou pacotes internos, especificando claramente a barreira de contexto (bounded contexts) de cada elemento.

#### 2. Escrita de Architectural Decision Records (ADRs)
Toda decisão que possuir impacto arquitetural permanente (por exemplo, escolha do banco de dados, estratégia de autenticação ou protocolo de mensageria) deve gerar um documento de ADR no formato canonical de Nygard:
- **Título:** Identificador único (ex: `ADR-013-cache-strategy`).
- **Contexto:** Os fatos, restrições e cenário de negócio que motivaram a discussão.
- **Decisão:** A opção escolhida expressa de forma imperativa.
- **Status:** `Proposed`, `Accepted`, `Superseded` (referenciando a nova decisão) ou `Rejected`.
- **Consequências:** Os trade-offs aceitos pela equipe (impacto positivo e negativo).

*Localização padrão:* `/docs/adr/ADR-[NNN]-[nome-da-decisao].md`

---

### Fase 4: Criação do Blueprint e Constituição do Projeto

O **Blueprint Agent** e o **Constitution Agent** codificam a arquitetura em especificações de máquina.

#### 1. Formulação do Blueprint (`atlas.blueprint.yaml`)
O Blueprint do projeto é gerado em YAML seguindo rigidamente o schema especificado na [RFC-001](file:///root/atlas/docs/rfc/RFC-001-blueprint-specification.md). Ele define:
- Metadados do projeto e stacks tecnológicas homologadas.
- Lista completa de módulos e componentes (com caminhos de arquivo associados).
- Contratos de API OpenAPI, AsyncAPI ou gRPC.
- Alocações e papéis específicos dos agentes na fase de implementação.

#### 2. Constituição do Projeto (`.atlas/constitution.json`)
A Constituição define as diretrizes éticas, padrões de segurança (ex: "nunca usar MD5 para hashes de senhas"), restrições de custo mensal na nuvem e limites operacionais (ex: "cobertura mínima de testes = 90%"). Nenhuma modificação futura poderá violar a Constituição.

---

### Fase 5: Plano de Implementação e Divisão de Trabalho

Conduzida pelo **Planning Agent**, que mapeia a árvore de execução técnica de maneira determinística.

#### 1. Divisão em Unidades de Trabalho (Work Packages)
O Planning Agent quebra o Blueprint em uma árvore hierárquica de tarefas autocontidas:
```
┌────────────────────────────────────────────────────────┐
│               ÁRVORE DE EXECUÇÃO TÉCNICA               │
├────────────────────────────────────────────────────────┤
│                                                        │
│  [Módulo de Autenticação]                              │
│    ├── Tarefa 1.1: Migração de Schema (DB Agent)       │
│    ├── Tarefa 1.2: Implementação do Repositório        │
│    ├── Tarefa 1.3: Serviço de Geração de Tokens        │
│    └── Tarefa 1.4: Endpoint HTTP de Login              │
│                                                        │
└────────────────────────────────────────────────────────┘
```

#### 2. Grafo de Dependências de Tarefas
As tarefas são ordenadas em um Grafo Direcionado Acíclico (DAG). Tarefas sem dependências mútuas são marcadas para execução paralela imediata por múltiplos agentes sob a supervisão do Orchestrator.

#### 3. Output da Fase
O arquivo `/docs/plans/sprint-[N]-plan.json` que detalha a fila de execução, dependências, agentes alocados e critérios de aceitação para cada tarefa individual.

---

### Fase 6: Critérios de Qualidade e Estratégia de Testes

Definido em conjunto pelo **Test Agent** e **Security Agent** antes de qualquer linha de código de produção ser escrita (Test-Driven Design).

#### 1. Especificação de Testes Baseada em Comportamento (BDD)
Para cada componente definido no Blueprint, são gerados arquivos de teste esqueleto contendo cenários de teste formais (Given-When-Then).

#### 2. Definição das Barreiras de Qualidade (Quality Gates)
São criadas regras rigorosas de validação, tais como:
- **Cobertura de Linha:** Mínimo de 85% para código de negócio e 100% para componentes críticos de segurança.
- **Complexidade Ciclomática:** Máximo de 10 por função/método.
- **Análise Estática de Segurança:** Zero vulnerabilidades críticas (SAST) aceitas.

---

### Fase 7: Auditoria, Execução e Revisão

Executado pelo **Audit Agent**, **Security Agent** e **Red Team Agent** ao final de cada iteração de código.

#### 1. Verificação de Desvio de Design (Drift Check)
O Audit Agent analisa recursivamente os arquivos do repositório através do comando `agy validate --drift-check` para garantir a invariante fundamental: **Nenhum código pode existir sem representação prévia no Blueprint.** Qualquer classe, endpoint ou tabela detectados no código físico que não estejam listados no Blueprint travam o build.

#### 2. Simulações do Red Team e Segurança
O Red Team Agent realiza ataques simulados contra o código gerado: tenta injetar payloads maliciosos em parâmetros, simula condições de concorrência (Race Conditions) e verifica o tratamento correto de erros para evitar vazamento de informações do sistema.

#### 3. Cálculo do Score de Engenharia (Engineering Score)
Ao fim da auditoria, é calculado o score atualizado do projeto (ver [RFC-004](file:///root/atlas/docs/rfc/RFC-004-engineering-score.md)), gerando o relatório final `/docs/audit/audit-report-v[N].json`.

---

### Fase 8: Evolução Contínua e Refatoração

Operado pelo **Evolution Agent**. O Atlas não aplica patches ou modificações diretamente no código.

#### 1. Início pelo Topo
Qualquer alteração de requisito ou correção de bug de design inicia obrigatoriamente na **Fase 1** (Intake). O Blueprint é alterado e validado primeiro.
#### 2. Refatoração Baseada em Blueprint
O Evolution Agent compara as alterações do Blueprint com a base de código legada e gera um plano de migração e refatoração estrita, mantendo a compatibilidade com versões anteriores das APIs (backward compatibility) e integridade dos dados históricos.

---

## 4. Governança de Decisões e Coordenação de Agentes

Para garantir a operação estável, segura e ágil do Atlas, as decisões do sistema são classificadas em níveis de governança de acordo com sua sensibilidade e impacto arquitetural.

### 4.1 Taxonomia de Governança de Decisões

| Categoria | Descrição | Nível de Autonomia | Ação em Caso de Falha | Exemplos de Ações |
| :--- | :--- | :--- | :--- | :--- |
| **Classe A: Crítica** | Decisões que impactam permanentemente a arquitetura, segurança central ou custos operacionais. | **Humano na Linha (HITL - Human-In-The-Loop)**. Bloqueio obrigatório até aprovação explícita. | Reversão imediata do estado e reabertura do intake de design. | Alterar provedor de banco de dados; modificar regras da Constituição; deploy em produção. |
| **Classe B: Tática** | Decisões de design de módulos específicos, escolha de bibliotecas não essenciais ou interfaces locais. | **Autônoma com Notificação**. Execução automática, com envio imediato de sumário pós-fato para revisão do usuário. | Alerta prioritário no canal de controle e rebaixamento do Engineering Score. | Adicionar uma tabela auxiliar; criar um novo endpoint em módulo existente; implementar cache local. |
| **Classe C: Operacional** | Tarefas rotineiras de codificação, geração de testes, correção de erros de compilação ou linting. | **Totalmente Autônoma**. Execução silenciosa sem necessidade de notificação por ação. | Tentativa automática de correção (máx 3 loops) antes de escalação para Classe B. | Resolver erros de digitação; atualizar dependências de patch; refatorar complexidade de funções. |

---

### 4.2 Modelo de Coordenação e Paralelização de Agentes

O **Orchestrator Agent** coordena a árvore de execução distribuindo tarefas aos agentes em paralelo de acordo com o seguinte protocolo de mensageria:

```
                      ┌──────────────────────┐
                      │  Orchestrator Agent  │
                      └──────────┬───────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │ (Paralelo)            │ (Paralelo)            │ (Paralelo)
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Code Agent    │     │   Test Agent    │     │ Security Agent  │
│  (Escreve a     │     │  (Implementa    │     │  (Audita em     │
│   lógica)       │     │   os testes)    │     │   tempo real)   │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 ▼
                     ┌───────────────────────┐
                     │   Sincronização &     │
                     │    Merge (Audit)      │
                     └───────────────────────┘
```

1. **Desacoplamento de Tarefas:** Cada agente atua em uma cópia isolada do espaço de trabalho (Sandbox/Git branch).
2. **Ciclo de Sincronização:** Após o término de atividades paralelas, as alterações passam pela auditoria estática do Audit Agent antes de serem mescladas na branch principal do projeto.

---

### 4.3 Protocolo de Resolução de Divergências (Síntese Socrática)

Quando dois ou mais agentes apresentam recomendações divergentes sobre um mesmo componente técnico, o Orchestrator não decide de forma arbitrária. É acionado o **Protocolo de Síntese Socrática**:

```
                       ┌─────────────────────────┐
                       │   Security Agent:       │
                       │   "Bloquear acesso por  │
                       │   segurança estrita"    │
                       └────────────┬────────────┘
                                    │
                                    ▼
┌─────────────────────────┐    ┌─────────┐    ┌─────────────────────────┐
│   UX Agent:             │──▶ │ Mediator│ ◀──│   Database Agent:       │
│   "Gargalo de latência, │    │  Agent  │    │   "Indexação custosa no │
│   precisamos de bypass" │    │ (Arch)  │    │    banco relacional"    │
└─────────────────────────┘    └────┬────┘    └─────────────────────────┘
                                    │
                                    ▼
                       ┌─────────────────────────┐
                       │    Síntese Consensual   │
                       │   (Token de Confiança)  │
                       └─────────────────────────┘
```

1. **Apresentação de Argumentos (ERAJ):** Cada agente conflitante gera um registro ERAJ justificando sua tese de design.
2. **Atribuição do Mediador:** O Orchestrator define um terceiro agente neutro como Mediador (normalmente o **Architecture Agent** para questões estruturais ou o **Constitution Agent** para conformidade normativa).
3. **Loop de Refinamento:** O Mediador analisa ambos os relatórios ERAJ e propõe uma terceira via sintetizada (ex: no conflito acima, sugere a adoção de um cache criptografado em memória Redis com TTL ultracurto, resolvendo a segurança e a performance simultaneamente).
4. **Resolução por Escalação:** Se a síntese não atingir o limiar mínimo de confiança configurado (0.80), a divergência é consolidada em um relatório de trade-off e escalada ao Usuário Humano para decisão final com interface visual comparativa.

---

## 5. Modelo de Confiança e Validação Racional: O Framework ERAJ

Para cada tomada de decisão significativa no sistema, o Atlas deve gerar e persistir uma estrutura de dados de análise racional chamada **ERAJ** (Evidências, Riscos, Alternativas, Justificativas). O framework ERAJ serve para mitigar alucinações de IA, garantir rastreabilidade histórica e expor a anatomia das decisões técnicas para os engenheiros humanos.

### 5.1 Estrutura do Documento ERAJ

```json
{
  "$schema": "https://atlas.engineering/schemas/eraj/v1.json",
  "decision_id": "DEC-2026-0708-001",
  "topic": "Escolha do mecanismo de fila de mensagens para processamento assíncrono de relatórios",
  "timestamp": "2026-07-08T03:19:00Z",
  "author_agent": "architecture-agent",
  "confidence_score": 0.92,
  "era": {
    "evidences": [
      {
        "source": "official-docs",
        "description": "Documentação do RabbitMQ v4.0 sobre confirmações de leitura (publisher confirms)",
        "reference_url": "https://www.rabbitmq.com/docs/publishers#confirms",
        "verification_status": "verified"
      },
      {
        "source": "local-spike",
        "description": "Spike executado em /research/spikes/rabbitmq-throughput.md validando 5000 msg/s",
        "reference_path": "file:///root/atlas/research/spikes/rabbitmq-throughput.md",
        "verification_status": "verified"
      }
    ],
    "riscos": [
      {
        "risk_type": "operational",
        "description": "Sobrecarga de memória RAM no nó do RabbitMQ caso a fila acumule mensagens não processadas",
        "severity": "medium",
        "mitigation": "Configurar política de limite de mensagens (Max Length Policy) e DLQ (Dead Letter Queue)"
      }
    ],
    "alternativas": [
      {
        "option_name": "Apache Kafka",
        "pros": "Excelente escalabilidade horizontal e retenção persistente baseada em log",
        "cons": "Complexidade de infraestrutura desproporcional para a escala inicial do projeto",
        "reason_rejected": "Aumento excessivo do custo operacional de manutenção do cluster Zookeeper/KRaft"
      },
      {
        "option_name": "Redis Pub/Sub",
        "pros": "Latência extremamente baixa e já está instalado na stack do projeto",
        "cons": "Falta de garantia de entrega 'at-least-once' e ausência de persistência confiável de mensagens",
        "reason_rejected": "Risco inaceitável de perda de dados de relatórios financeiros caso o servidor Redis sofra reinicialização"
      }
    ],
    "justificativas": {
      "rationale": "O RabbitMQ v4 foi escolhido por atender perfeitamente aos requisitos de entrega at-least-once com confirmação de recebimento, possuir custos operacionais moderados e curva de aprendizado baixa. O risco de consumo excessivo de memória foi mitigado via infraestrutura definindo limites físicos nos contêineres e filas parametrizadas.",
      "constitutional_compliance": true
    }
  }
}
```

---

### 5.2 Algoritmo de Cálculo do Score de Confiança ($C$)

O nível de confiança de uma decisão técnica é calculado deterministicamente através da soma ponderada de quatro fatores de validação:

$$C = (w_e \cdot E) + (w_s \cdot S) - (w_r \cdot R) + (w_c \cdot K)$$

Onde:
- **$E$ (Evidências):** Peso $w_e = 0.35$. Grau de validação das fontes de informação. Fontes oficiais e spikes locais computam valor máximo (1.0). Blogs informais ou opiniões de fóruns reduzem para (0.3).
- **$S$ (Simulação/Spike):** Peso $w_s = 0.30$. Presença de testes de hipótese executados em sandbox com sucesso comprovado (1.0 se executado, 0.0 caso contrário).
- **$R$ (Riscos não Mitigados):** Fator redutor com peso $w_r = 0.20$. Quantidade de riscos sem plano de mitigação explícito mapeados no relatório.
- **$K$ (Conformidade Constitucional):** Peso $w_c = 0.15$. Alinhamento com a Constituição do Sistema (1.0 se alinhado, -1.0 se violar alguma regra, derrubando severamente a confiança final).

#### Gatilhos de Ação baseados no Score de Confiança ($C$):

```
 ┌───────────────────────┬────────────────────────┬────────────────────────┐
 │        C < 0.50       │     0.50 <= C < 0.85   │        C >= 0.85       │
 ├───────────────────────┼────────────────────────┼────────────────────────┤
 │   BLOCKED             │    WARNING / HITL      │   AUTONOMOUS           │
 │   • Bloqueio total    │    • Alerta gerado     │   • Execução           │
 │   • Escalação humana  │    • Revisão manual    │     direta autorizada  │
 │     obrigatória       │      ou aprovação      │   • Log silencioso     │
 └───────────────────────┴────────────────────────┴────────────────────────┘
```

---

## 6. Sistema de Memória de Longo Prazo e Ciclo de Aprendizado

A capacidade de evolução contínua do Atlas se baseia no reaproveitamento de conhecimento de engenharia entre iterações e projetos, operacionalizada através de sua arquitetura de memória baseada na [RFC-003](file:///root/atlas/docs/rfc/RFC-003-memory-architecture.md).

```
  ┌────────────────────────────────────────────────────────┐
  │                 LOOP DE APRENDIZADO DO ATLAS           │
  ├────────────────────────────────────────────────────────┤
  │                                                        │
  │                      ┌───────────┐                     │
  │                      │ Interação │                     │
  │                      │  Humana   │                     │
  │                      └─────┬─────┘                     │
  │                            │                           │
  │                            ▼                           │
  │                      ┌───────────┐                     │
  │                      │ Memória   │                     │
  │                      │ Episódica │                     │
  │                      └─────┬─────┘                     │
  │                            │ (Processo de              │
  │                            │  Consolidação)            │
  │                            ▼                           │
  │                      ┌───────────┐                     │
  │                      │  Memória  │                     │
  │                      │ Semântica │                     │
  │                      └─────┬─────┘                     │
  │                            │                           │
  │         ┌──────────────────┴──────────────────┐        │
  │         ▼                                     ▼        │
  │   ┌───────────┐                         ┌───────────┐  │
  │   │  Projetos │                         │  Padrões  │  │
  │   │   Locais  │                         │ Globais & │  │
  │   │           │                         │  Recipes  │  │
  │   └───────────┘                         └───────────┘  │
  │                                                        │
  └────────────────────────────────────────────────────────┘
```

### 6.1 Integração com Tiers de Memória (RFC-003)

- **Consolidação de Memória Episódica para Semântica:** Ao final de cada ciclo de desenvolvimento (Sprint/Release), a pipeline de consolidação do Atlas varre as discussões, commits e relatórios ERAJ. O sistema extrai padrões recorrentes (ex: "Erros de concorrência com o cache Redis em picos de tráfego") e os insere na Memória Semântica como Fatos de Engenharia permanentes.
- **Memória Procedural Reutilizável:** Processos operacionais validados (por exemplo, "Configuração do deploy seguro de microserviços Node.js na AWS") são persistidos como receitas de código (`recipes`) e fluxos reutilizáveis compartilhados entre projetos.

---

### 6.2 Aprendizado Entre Projetos (Cross-Project Learning)

O Atlas possui um espaço de memória global (Global Namespace) protegido por regras de privacidade configuráveis.
- **Transferência de Heurísticas:** Quando uma solução robusta para um bug complexo de biblioteca de terceiro é desenvolvida no Projeto A, o Atlas abstrai a correção para sua base de conhecimento global de dependências. Ao iniciar o Projeto B que utiliza a mesma versão da biblioteca, o Atlas adverte o desenvolvedor sobre o risco no design inicial, fornecendo a solução preventiva de forma proativa.
- **Consolidação de Padrões de Design:** Melhores práticas de desenvolvimento de software consolidadas em projetos bem-sucedidos alimentam continuamente as diretrizes arquiteturais sugeridas pelos agentes do Atlas.

---

### 6.3 Uso de Skills, MCPs e Atualização de Conhecimento

1. **Skills (Habilidades Especializadas):** O Atlas consome e estende de forma dinâmica módulos de código e instruções específicas chamados *Skills* (por exemplo, a skill `brandkit` para geração visual ou `industrial-brutalist-ui` para padrões de UI). As skills funcionam como plugins de conhecimento e capacidade computacional dos agentes.
2. **Model Context Protocol (MCP):** O Atlas se comunica com servidores externos (bancos de dados, sistemas de arquivos locais, motores de busca especializados) exclusivamente via protocolo MCP. O **MCP Discovery Agent** monitora continuamente a rede local do Atlas para descobrir novos servidores e recursos úteis disponíveis para o ecossistema.
3. **Living Documentation (Documentação Viva):** Nenhuma alteração arquitetural é concluída sem que a documentação técnica seja atualizada. O **Documentation Agent** atualiza em cascata o arquivo `docs/INDEX.md`, glossários, especificações de dados e guias de contribuição sempre que uma decisão de design é alterada, eliminando permanentemente a dívida de documentação desatualizada.

---

## 7. Critérios de Validação e Conformidade

Uma implementação física do Atlas Cognitive System será considerada em conformidade (compliant) se, e somente se, satisfizer as seguintes asserções de engenharia:

1. **Invariabilidade de Blueprint-First:** Falhar na validação do build (`agy validate`) se for detectado código executável no projeto sem uma declaração explícita em `atlas.blueprint.yaml`.
2. **Imutabilidade de ADRs:** Garantir que novos caminhos arquiteturais não editem arquivos de ADR antigos diretamente, mas sim adicionem novos logs arquiteturais que alterem o status dos anteriores para `Superseded` via commits rastreáveis.
3. **Garantia de Geração ERAJ:** Emitir um erro fatal em tempo de design se qualquer decisão de classe A ou B for proposta sem a geração do payload JSON de análise estruturado ERAJ com pontuação de confiança igual ou superior a 0.85 (ou aprovação humana manual).
4. **Isolamento de Sandbox de Spike:** Todo experimento técnico e script de prova de conceito (Spike) deve rodar obrigatoriamente sob restrições de permissões sandbox, sem acesso de escrita na raiz produtiva do repositório até sua aprovação em design.

---

## 8. Conclusão

O Atlas Cognitive System fornece o alicerce determinístico necessário para a engenharia de software inteligente no horizonte de 2030. Ao formalizar as etapas do ciclo de vida, classificar a governança de decisões, estruturar as evidências técnicas e integrá-las aos repositórios de memória ativa, o Atlas deixa de ser um mero autocompletar de código para se tornar um arquiteto e construtor digital de extrema confiança técnica, garantindo a longevidade, robustez e qualidade de bases de código complexas de nível de software empresarial.
