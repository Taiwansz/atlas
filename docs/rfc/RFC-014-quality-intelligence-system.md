# RFC-014: Atlas Quality Intelligence System (AQIS)

**RFC Number:** 014  
**Author(s):** Atlas Quality & Governance Committee  
**Date:** 2026-07-08  
**Status:** Final  
**Category:** Quality & Governance  

---

## Abstract

Este RFC especifica o **Atlas Quality Intelligence System (AQIS)** — o ecossistema ativo de auditoria, validação estática/dinâmica e governança técnica responsável por garantir a excelência de todos os artefatos produzidos no ecossistema Atlas. O AQIS implementa um modelo multidimensional de qualidade composto por 18 dimensões críticas, define portões de qualidade (Quality Gates) obrigatórios para entrega de código, estabelece o protocolo de revisão cruzada por agentes especialistas (Multi-Agent Peer Review) e gera relatórios preditivos de regressão, tendências históricas e planos de melhoria priorizados com base no [Atlas Engineering Score (RFC-004)](file:///root/atlas/docs/rfc/RFC-004-engineering-score.md).

---

## 1. Introdução e Visão Geral

### 1.1 A Definição de Excelência no Atlas
No desenvolvimento tradicional acelerado por inteligência artificial, o código é frequentemente aceito assim que "funciona" ou passa em testes básicos de compilação. Essa abordagem reativa é inaceitável no Atlas. A conclusão de uma tarefa de engenharia não reside na ausência de erros, mas sim na **comprovação de conformidade** com padrões de excelência estruturais, de segurança e de performance.

### 1.2 O Papel do AQIS
O AQIS funciona como a barreira ativa de qualidade do Atlas. Ele orquestra os agentes de qualidade (**Audit Agent, Security Agent, Test Agent e Compliance Agent**) para executar análises em tempo real de cada Pull Request ou alteração de Blueprint. O sistema impede commits que não atinjam os limiares mínimos de qualidade e calcula dinamicamente o Engineering Score do repositório.

---

## 2. O Modelo Multidimensional de Qualidade (As 18 Dimensões)

O AQIS avalia todo artefato sob 18 dimensões específicas agrupadas em 4 macro-categorias de interesse. Cada dimensão possui peso próprio de 0 a 100 pontos, ponderada para compor a saúde geral do software.

```
       MÉTRICA MULTIDIMENSIONAL DO AQIS
 ┌──────────────────────────────────────────────┐
 │ ⬤ ENGENHARIA E DESIGN (Pesos: 30%)          │
 │   • Arquitetura  • Escalabilidade            │
 │   • Manutenibilidade  • Evolução             │
 ├──────────────────────────────────────────────┤
 │ ⬤ SEGURANÇA E OPERAÇÃO (Pesos: 30%)          │
 │   • Segurança  • Performance  • Custos       │
 │   • Observabilidade  • Tokens                │
 ├──────────────────────────────────────────────┤
 │ ⬤ QUALIDADE DE CÓDIGO (Pesos: 25%)           │
 │   • Legibilidade  • Cobertura de Testes      │
 │   • AES Adherence  • Constituição            │
 ├──────────────────────────────────────────────┤
 │ ⬤ EXPERIÊNCIA E INTERFACE (Pesos: 15%)      │
 │   • UX  • DX  • Acessibilidade               │
 └──────────────────────────────────────────────┘
```

---

### 2.1 Macro-Categoria A: Engenharia & Estrutura (Peso: 30%)
1. **Arquitetura:** Aderência estrita ao Blueprint (`atlas.blueprint.yaml`). Ausência de vazamento de camadas e acoplamento circular.
2. **Escalabilidade:** Capacidade do código de manter a performance sob aumento de carga e concorrência distribuída.
3. **Manutenibilidade:** Facilidade de refatoração, tamanho de métodos/classes (limite de 150 linhas) e acoplamento eferente/instabilidade.
4. **Sustentabilidade da Arquitetura:** Ausência de bibliotecas depreciadas ou dependências sem manutenção comunitária activa.
5. **Potencial de Evolução:** Modularidade das fronteiras de contexto, facilitando a substituição tecnológica (AEF - [RFC-013](file:///root/atlas/docs/rfc/RFC-013-evolution-framework.md)).

### 2.2 Macro-Categoria B: Operação & Viabilidade (Peso: 30%)
6. **Segurança:** Ausência de vulnerabilidades SAST/DAST, chaves expostas ou más práticas de criptografia.
7. **Performance:** Cumprimento dos orçamentos de latência (p95) e taxas de transferência (Throughput) exigidos.
8. **Custo Operacional:** Impacto financeiro estimado da infraestrutura na nuvem (Kubernetes, bancos de dados, conexões).
9. **Consumo de Tokens:** Eficiência das chamadas de inferência de IA realizadas para gerar e operar o código.
10. **Observabilidade:** Presença de métricas Prometheus, tracing OpenTelemetry e logs estruturados em JSON.

### 2.3 Macro-Categoria C: Qualidade Base (Peso: 25%)
11. **Legibilidade:** Complexidade ciclomática inferior a 10 por função. Uso semântico de nomes de classes e variáveis.
12. **Aderência ao AES:** Conformidade com o Atlas Engineering Standard ([RFC-010](file:///root/atlas/docs/rfc/RFC-010-engineering-standard.md)).
13. **Consistência Constitucional:** Zero violações às regras do `.atlas/constitution.json`.
14. **Cobertura de Testes:** Mínimo de 85% de cobertura de linhas em novos arquivos, com testes de integração funcionais.
15. **Documentação:** Presença de ADRs justificando decisões de design e atualização do `docs/INDEX.md`.

### 2.4 Macro-Categoria D: Usabilidade & Foco Humano (Peso: 15%)
16. **Experiência do Desenvolvedor (DX):** Clareza de logs de erros, tempo de build local do Nx e facilidade de setup.
17. **Experiência do Usuário (UX):** Aderência aos tokens visuais (Double-Bezel, cores, motion) descritos na [RFC-011](file:///root/atlas/docs/rfc/RFC-011-user-experience-specification.md).
18. **Acessibilidade:** Conformidade com as diretrizes WCAG 2.1 AA em componentes Web e usabilidade de comandos de terminal (CLI).

---

## 3. Limiares Mínimos de Aprovação e Quality Gates

O AQIS estabelece portões de validação (Quality Gates) obrigatórios que barram pipelines de CI/CD se as notas de dimensão ficarem abaixo dos seguintes limiares técnicos:

```
┌─────────────────────────────────────────────────────────────┐
│                 QUALITY GATES DO AQIS                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ⬤ SEGURANÇA:         100 / 100  (Zero tolerância)         │
│   ⬤ CONSTITUIÇÃO:      100 / 100  (Zero violações)          │
│   ⬤ ARQUITETURA (AES):   90 / 100  (Sem acoplamento cíclico) │
│   ⬤ TESTES:              85 / 100  (Cobertura de linhas)     │
│   ⬤ LEGBILIDADE:         80 / 100  (Complexidade < 10)       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

*Nota: Falhar em qualquer Quality Gate acima resulta em rejeição automática do commit e impede o merge de ramificações Git (branches).*

---

## 4. O Pipeline de Auditoria AQIS (Processo Ativo)

O processo de validação de qualquer alteração de código ou arquitetura segue 4 estágios lineares:

```
Alteração ──▶ 1. Análise Estática ──▶ 2. Peer Review ──▶ 3. Simulação ──▶ Merge/Aprovação
 (Commit)        (Linter & AST)        (Multi-Agent)      (Testcontainer) (Score Atualiz)
```

### 4.1 Estágio 1: Análise Estática de Código (AST & Lints)
O AQIS analisa a Árvore de Sintaxe Abstrata (AST) do arquivo alterado para verificar:
* Complexidade ciclomática e tamanho de arquivos/métodos.
* Violações estilísticas de nomenclatura (kebab-case, PascalCase, etc).
* Vazamento de camadas arquiteturais (ex: camada de Domínio importando drivers SQL).

### 4.2 Estágio 2: Revisão Cruzada de Agentes (Multi-Agent Peer Review)
O Maestro despacha o código para auditoria em paralelo pelos agentes de qualidade:
* **Security Agent:** Analisa vulnerabilidades de bibliotecas e injeções de SQL.
* **UX/UI Agent:** Compara os tokens CSS gerados contra a especificação de estilo.
* **Test Agent:** Verifica se os cenários Given-When-Then foram atendidos nos testes de cobertura.
* **Compliance Agent:** Compara a alteração de infraestrutura contra a Constituição.

Cada agente gera sua nota de dimensão assinando o respectivo relatório ERAJ.

### 4.3 Estágio 3: Simulação e Testes Dinâmicos
O código modificado é instanciado em sandbox:
* Executam-se testes de integração reais contra bancos Docker efêmeros via **Testcontainers**.
* Rodam-se testes de carga K6 para verificar o estouro de Latency Budgets.

### 4.4 Protocolo de Justificativa de Exceção (Exception Justification Protocol - EJP)
Sob circunstâncias de força maior de mercado ou infraestrutura (ex: tolerar latência acima de 50ms para chamadas de APIs de terceiros não otimizáveis), o engenheiro pode declarar uma Exceção de Qualidade.
* A exceção não pode violar a Constituição do Projeto.
* Exige a criação de um documento de **ADR** imutável contendo justificativa técnica formalizada e assinado pelo Arquiteto.
* O AQIS registra a exceção, degrada o Engineering Score em fator reduzido temporário e abre um ticket técnico para revisão e amortização da dívida em até 30 dias.

---

## 5. Histórico de Evolução, Tendências e Planos de Melhoria

O motor de banco de dados Graph do AQIS armazena o histórico de todas as execuções de auditoria no repositório.

### 5.1 Análise de Tendências e Regressões (Trend Analysis)
O AQIS monitora o gradiente do Engineering Score ao longo do histórico de commits:
* **Detecção de Regressão Silenciosa:** Se três commits seguidos reduzirem o score acumulado em mais de 15 pontos lógicos (mesmo que ainda acima dos Quality Gates), o AQIS dispara um sinal de alerta e congela alterações automáticas de agentes secundários até a estabilização do score.
* **Cálculo de Desvio de Qualidade:** Gráficos de tendências apontam quais dimensões estão sob risco de degradação devido a refatorações frequentes.

### 5.2 Geração Automática de Planos de Melhoria
Ao identificar vulnerabilidades latentes ou quedas de notas de dimensões (ex: a nota de manutenibilidade caiu para 75 devido ao acúmulo de complexidade em módulo legante), o AQIS:
1. Consolida os dados no relatório `/docs/audit/quality-backlog.json`.
2. Cria cartões de tarefas técnicos priorizados na fila do sprint (ex: `refactor: quebrar classe UserRepository em serviços SRP`).
3. Aloca o **Evolution Agent** para executar as refatorações preventivas na sprint seguinte de conformidade.

---

## 6. Conclusão

O **Atlas Quality Intelligence System (AQIS)** converte a avaliação de qualidade de software de um processo subjetivo humano em uma pipeline científica objetiva e ininterrupta. Ao exigir revisões cruzadas por múltiplos agentes inteligentes especializados, validar comportamentos dinâmicos em sandboxes e amarrar ganchos de bloqueio de CI/CD a Quality Gates matemáticos, o AQIS garante que a excelência arquitetural e a estabilidade operacional de qualquer base de código governada pelo Atlas permaneçam inabaláveis ao longo do tempo.
