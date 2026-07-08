# RFC-012: Atlas Autonomous Engineering System (AAES)

**RFC Number:** 012  
**Author(s):** Atlas Agent Orchestration Group  
**Date:** 2026-07-08  
**Status:** Final  
**Category:** Agent Architecture  

---

## Abstract

Este RFC especifica o **Atlas Autonomous Engineering System (AAES)** — o motor organizacional de agentes que coordena o trabalho colaborativo entre múltiplos especialistas de inteligência artificial de forma determinística, escalável e segura. O AAES rege a criação, ciclo de vida, comunicação, debate, resolução de conflitos e avaliação de desempenho de todos os agentes do ecossistema Atlas. 

Ele introduz o papel do **Orchestrator Agent (O Maestro)**, define protocolos de consenso socrático para conciliar recomendações concorrentes, detalha mecanismos de prevenção de loops lógicos e duplicação de esforço, e estabelece uma arquitetura aberta e extensível que permite plugar novos agentes especializados sem alterar as engrenagens de coordenação principais da plataforma.

---

## 1. Introdução e Filosofia de Colaboração Multi-Agente

### 1.1 O Fim das IAs Isoladas
Modelos de IA isolados sofrem de severas limitações cognitivas: quanto mais amplo é o escopo de uma tarefa, maior é a taxa de erro e a probabilidade de alucinação estrutural. O Atlas resolve essa limitação por meio do princípio da **Divisão de Trabalho por Especialidade**. Em vez de usar um único modelo geral para escrever código, regras de banco de dados, fluxos de deploy e especificações de testes, o Atlas distribui essas responsabilidades para agentes especializados, cada um dotado de um prompt de papel estrito e ferramentas de menor privilégio (Princípio de Privilégio Mínimo).

### 1.2 O Conceito de Equipe Autônoma
O AAES transforma o ecossistema Atlas em uma equipe de engenharia digital operando sob um fluxo de governança predefinido. O sistema de agentes não apenas gera texto; ele debate soluções, defende trade-offs por meio de evidências quantificáveis (framework **ERAJ** definido na [RFC-009](file:///root/atlas/docs/rfc/RFC-009-cognitive-system.md)), audita as entregas dos colegas e realiza revisões estruturadas em pares (peer review) de forma completamente autônoma, escalando para intervenção humana apenas em cenários de alta sensibilidade arquitetural ou financeira.

---

## 2. O Maestro: Orquestrador Global de Tarefas

O **Orchestrator Agent (O Maestro)** é o elemento governante do AAES. Ele é responsável pelo planejamento macro, alocação dinâmica de carga, monitoramento de progresso e sincronização das branches lógicas de desenvolvimento.

```
                  ┌──────────────────────┐
                  │ Orchestrator (Maestro)│
                  └──────────┬───────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼ (Planejamento)                  ▼ (Execução)
┌───────────────────────┐          ┌───────────────────────┐
│ Geração de Grafo DAG  │          │ Despacho de Tarefas   │
│ de Dependências       │          │ a Agentes Paralelos   │
└───────────────────────┘          └───────────────────────┘
```

### 2.1 Mapeamento e Grafo Direcionado Acíclico (DAG)
Ao receber uma meta do usuário, o Maestro consome o Blueprint (`atlas.blueprint.yaml`) e os Requisitos para gerar um plano de sprint dividido em tarefas atômicas representadas por um Grafo Direcionado Acíclico (DAG):
1. **Nós do Grafo ($V$):** Tarefas específicas de engenharia (ex: criar migração SQL, escrever model, codificar rota HTTP, implementar UI, escrever teste de integração).
2. **Arestas Direcionadas ($E$):** Relações de precedência lógica (ex: a tarefa "Rota HTTP" depende logicamente da conclusão da tarefa "Serviço de Domínio").

### 2.2 Despacho Dinâmico e Controle de Concorrência
O Maestro analisa recursivamente o DAG para despachar, em paralelo, todas as tarefas que não possuam dependências ativas no grafo:
* **Fila de Execução Ativa:** Os agentes especializados associados recebem envelopes de mensagem do tipo `task.request` (conforme [RFC-006](file:///root/atlas/docs/rfc/RFC-006-agent-communication-protocol.md)).
* **Controle de Bloqueio (Locking):** O Maestro impede que dois agentes editem o mesmo arquivo ou namespace simultaneamente na branch ativa do workspace, usando travas de arquivos efêmeras.
* **Balanceamento de Carga:** Se um agente estiver sobrecarregado (ex: o *Code Agent* processando muitas rotas), o Maestro pode subdividir a tarefa ou delegar subprocessos para agentes instanciados secundários em sandboxes paralelas.

---

## 3. Ciclo de Vida do Agente Especializado

Cada agente sob o AAES segue um ciclo de vida estrito e monitorado de 5 etapas desde sua ativação até o encerramento do processo.

```
Instanciação ──▶ Inicialização ──▶ Execução de Loop ──▶ Revisão & Auditoria ──▶ Destruição
 (Spawn)          (Prompt Layer)     (Ferramentas)         (Autodeclaração)      (Tear-Down)
```

### 3.1 Instanciação (Spawn)
Quando o Maestro determina que a tarefa $T_1$ está pronta para execução, ele instancia o agente especialista correspondente (ex: *Database Agent*). A instanciação envolve:
* Criação de um identificador único de sessão do agente (`agentSessionId`).
* Alocação de uma sandbox isolada do Git baseada em uma branch de trabalho secundária (`feature/task-T1`).

### 3.2 Inicialização e Camadas de Prompt (Context Loading)
O agente recebe seu prompt de sistema montado dinamicamente em três camadas:
1. **Camada de Base:** Regras gerais de comunicação (AACP), formato de saída e restrições constitucionais universais do Atlas.
2. **Camada de Papel:** Persona técnica especializada, limites de autoridade, diretrizes do AES ([RFC-010](file:///root/atlas/docs/rfc/RFC-010-engineering-standard.md)) aplicadas à sua disciplina e lista de ferramentas autorizadas.
3. **Camada de Contexto Vivo:** Detalhes exatos da tarefa a ser executada, fragmentos relevantes da memória do projeto (extraídos via vetorização na pgvector/Qdrant) e referências aos arquivos envolvidos.

### 3.3 Execução e Loop de Ferramentas
O agente entra em seu loop cognitivo interno. Ele analisa o workspace, toma decisões utilizando o framework ERAJ e chama ferramentas autorizadas via protocolo MCP (leitura, escrita, execução de testes).

### 3.4 Revisão e Autodeclaração
Antes de retornar o resultado para o Maestro, o agente executa localmente o **Checklist Cognitivo Obrigatório** (especificado na [RFC-010](file:///root/atlas/docs/rfc/RFC-010-engineering-standard.md)). Se qualquer asserção falhar, o agente deve refatorar seu próprio código antes de submetê-lo. Uma vez validado, ele envia a mensagem `task.response` contendo a justificativa racional e as alterações sugeridas.

### 3.5 Destruição (Tear-Down)
Após a validação da entrega pelo Maestro e o merge de sua branch de trabalho, a sandbox do agente é destruída e a memória episódica gerada durante o ciclo de vida é persistida e direcionada para a pipeline de consolidação do sistema.

---

## 4. Matriz de Agentes Especializados (A Equipe Atlas)

A equipe é composta por 14 agentes especializados atuando sob o barramento de comunicação do Maestro.

| Agente | Disciplina de Atuação | Principais Ferramentas MCP | Mandato Central |
| :--- | :--- | :--- | :--- |
| **Produto** | Levantamento de escopo e Golden Paths | Socratic Interview Tool | Assegurar que as solicitações de usuários atendam a um problema real de negócio. |
| **Arquitetura** | Topologia do sistema e modularidade | Graph Visualizer Tool | Validar limites de camadas e aplicar os princípios SOLID e Clean Arch. |
| **Backend** | Lógica de negócio e serviços | Sandbox Code Execution | Implementar algoritmos limpos, otimizados e tipados. |
| **Frontend** | Raciocínio de interface e componentes| AST React Parser | Garantir componentização modular e acessibilidade de interface. |
| **UX** | Jornada de telas e design visual | Figma/Mockup Viewer | Garantir a técnica Double-Bezel e tokens do Design System. |
| **Segurança** | Criptografia, auth e análise SAST | SonarQube Scanner, Vault | Impedir exposição de segredos, falhas OWASP e vulnerabilidades. |
| **DevOps** | CI/CD, IaC e infraestrutura de nuvem | Terraform CLI, Helm | Gerenciar manifests Kubernetes, Dockers e pipelines de deployment. |
| **Banco de Dados**| SQL, Neo4j, índices e migrações | DB Schema Inspector | Criar migrações zero-downtime e otimizar queries e transações. |
| **Testes** | Geração e validação de suites de teste| Jest Runner, Testcontainers | Assegurar cobertura de testes unitários > 85% e testes de integração de fluxo. |
| **Performance** | Otimização, latência e profiling | K6 Load Tester, Profiler | Monitorar orçamentos de latência e consumo de CPU/Memória. |
| **Pesquisa** | Documentações de terceiros e mercado | Web Search, Docs Scraper | Validar premissas e realizar experimentos de Spike em sandbox. |
| **Documentação** | ADRs, especificações e living docs | Git/Markdown Updater | Manter os documentos técnicos e o `docs/INDEX.md` livres de drifts. |
| **Compliance** | Regras constitutivas e padrões legais | Constitution Parser | Validar conformidade de todas as saídas contra a Constituição do Atlas. |
| **IA** | Abstração de provedores e LLM Runtime | AI Model Registry | Otimizar chamadas de LLM, custos de tokens e fallbacks dinâmicos. |

---

## 5. Protocolo de Consenso Socrático e Resolução de Conflitos

Quando agentes tomam decisões concorrentes ou conflitantes (por exemplo, o *UX Agent* solicita uma renderização rica com blur enquanto o *Performance Agent* aponta estouro no orçamento de renderização da GPU), o AAES aciona o **Protocolo de Consenso Socrático**.

```
                   ┌──────────────────────────────────┐
                   │    Divergência Detectada pelo     │
                   │            Maestro               │
                   └────────────────┬─────────────────┘
                                    │
                                    ▼
                   ┌──────────────────────────────────┐
                   │ Geração de Argumentos ERAJ por   │
                   │        cada Agente               │
                   └────────────────┬─────────────────┘
                                    │
                                    ▼
                   ┌──────────────────────────────────┐
                   │  Atribuição de Mediador Neutro   │
                   │      (ex: Architecture Agent)    │
                   └────────────────┬─────────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼ (Consenso Atingido)               ▼ (Bloqueio)
     ┌────────────────────────┐            ┌────────────────────────┐
     │ Execução da Solução    │            │ Relatório de Trade-off │
     │       Sintetizada      │            │   Escalado ao Humano   │
     └────────────────────────┘            └────────────────────────┘
```

1. **Identificação e Pausa:** O Maestro detecta a concorrência de decisões de design sobre o mesmo arquivo/componente e pausa a execução de ambos os fluxos, isolando as branches de trabalho envolvidas.
2. **Defesa Formal (ERAJ):** Cada agente conflitante gera um artefato ERAJ justificando sua escolha técnica baseada em métricas e evidências formais.
3. **Mediação por Papel:** O Maestro escala a discussão para um agente mediador de escopo neutro correspondente à área do conflito (ex: se o conflito é de dados, usa o *Database Agent*; se é de estrutura, usa o *Architecture Agent*).
4. **Síntese Socrática:** O mediador avalia as alternativas ERAJ e calcula a pontuação ponderada das soluções. Ele propõe uma terceira via sintetizada que mitigue ambos os riscos apontados.
5. **Escalação Estruturada:** Se o score de confiança da síntese socrática for inferior a `0.80` e não houver consenso entre os agentes em duas rodadas de discussão, o Maestro gera um relatório de trade-off comparativo e notifica o Usuário Humano via interface visual para decisão final de arquitetura.

---

## 6. Mecanismos Anti-Loop e Prevenção de Ineficiências

Para evitar desperdício de tokens, loops infinitos de correção mútua de bugs e duplicação de esforço, o AAES aplica barreiras lógicas determinísticas:

### 6.1 Detecção e Prevenção de Loops Infinitos
* **Contador de Retentativas de Ciclo (Max Retry Gate):** Se um agente falhar no linter ou nos testes unitários repetidas vezes, ele poderá realizar no máximo 3 tentativas automáticas de auto-correção. Na 4ª falha, o loop é travado e a tarefa é escalada para o Maestro como falha de execução.
* **Token Decay e Taxa de Aprendizado:** Cada iteração de correção de código reduz a temperatura de inferência do LLM associado ao agente para forçar respostas mais determinísticas e menos criativas.
* **Assinatura de Raciocínio Repetido:** O Maestro armazena o hash do código gerado e a mensagem de erro associada. Se o agente gerar a mesma assinatura de código pela segunda vez, o sistema cancela a execução, apontando loop lógico.

### 6.2 Prevenção de Duplicação de Trabalho
* **Bloqueio de Recurso do Blueprint:** Nenhuma tarefa de escrita pode ser despachada para dois agentes distintos no mesmo componente do blueprint.
* **Namespace Isolation:** Cada agente escreve código exclusivamente dentro do diretório delimitado por sua tarefa no arquivo `/docs/plans/sprint-[N]-plan.json`. Modificações fora do escopo do namespace do agente disparam erros imediatos de validação de linter.

---

## 7. Extensibilidade: O Protocolo Open-Closed Agent (Registry)

Novos agentes podem ser introduzidos na equipe do Atlas dinamicamente sem necessidade de reescrever ou recompilar o Maestro Core. Isso é possível através do **Agent Registry System**.

### 7.1 Esquema de Registro de Agente (Agent Manifest)
Todo novo agente deve disponibilizar um arquivo de manifesto `agent.manifest.json` que detalha suas capacidades, esquema de entrada e ferramentas associadas:

```json
{
  "$schema": "https://atlas.engineering/schemas/agent-manifest/v1.json",
  "id": "localization-agent",
  "name": "Agente de Internacionalização",
  "role_description": "Especialista em internacionalização, suporte a múltiplos idiomas, formatação de datas e moedas em sistemas distribuídos.",
  "disciplines": ["localization", "translation", "formatting"],
  "system_prompt_template_ref": "file:///root/atlas/packages/agents/localization/prompts/system.md",
  "capabilities": [
    {
      "name": "translate_resources",
      "description": "Traduz arquivos de recursos de internacionalização (JSON/YAML) para novos idiomas mantendo a integridade das chaves.",
      "input_schema": {
        "type": "object",
        "required": ["source_files", "target_languages"],
        "properties": {
          "source_files": { "type": "array", "items": { "type": "string" } },
          "target_languages": { "type": "array", "items": { "type": "string" } }
        }
      }
    }
  ],
  "mcp_servers": ["mcp-file-translator-server"]
}
```

### 7.2 Registro Dinâmico
Durante a inicialização do workspace, o Maestro lê recursivamente a pasta `/packages/agents/` para registrar todos os manifestos ativos. O Maestro mapeia as disciplinas dos agentes para a árvore de tarefas do DAG, direcionando dinamicamente tarefas de internacionalização para o `localization-agent` recém-descoberto, mantendo a arquitetura principal fechada para modificações e aberta para extensões.

---

## 8. Métricas de Avaliação de Desempenho dos Agentes

O AAES acompanha o desempenho individual de cada agente e a eficiência do coletivo para gerar benchmarks de otimização contínua.

### 8.1 Métricas Individuais
* **Taxa de Compilação Direta (Compiler Pass Rate):** % de códigos gerados pelo agente que compilam com sucesso sem requerer iterações de correção (alvo: > 80%).
* **Eficiência de Tokens (Token Economy):** Relação entre a quantidade de tokens consumidos e o número de linhas de código úteis geradas.
* **Precisão de Testes (Test Coverage Velocity):** % de cobertura de testes unitários atingida no primeiro commit gerado para a tarefa (alvo: > 85%).
* **Taxa de Reversão de Peer Review:** Frequência com que as entregas do agente são rejeitadas por outros agentes durante o peer review de segurança ou arquitetura (alvo: < 10%).

### 8.2 Métricas Coletivas (Eficiência do Time)
* **Tempo de Resolução do Grafo (DAG Completion Time):** Tempo total gasto para finalizar a sprint completa desde a geração dos requisitos.
* **Índice de Conflito de Consenso:** Frequência de acionamento do Protocolo de Consenso Socrático. Índices muito altos indicam problemas de acoplamento nos contratos de componentes do Blueprint.
* **Estabilidade do Engineering Score:** Flutuação do score do projeto após as alterações integradas pela equipe de agentes.

---

## 9. Conclusão

O **Atlas Autonomous Engineering System (AAES)** estabelece o protocolo de colaboração para a nova era de engenharia de software automatizada. Ao estruturar os agentes em uma matriz especializada, gerir suas execuções através do planejamento por DAGs sob a batuta do Maestro e fornecer mecanismos claros de resolução socrática de conflitos e prevenção de loops, o AAES garante que o produto de software final gerado de forma autônoma seja arquiteturalmente superior e mais estável do que o código produzido por qualquer IA operando isoladamente.
