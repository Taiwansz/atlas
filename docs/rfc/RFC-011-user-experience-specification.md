# RFC-011: Atlas User Experience (UX) & Design System Specification

**RFC Number:** 011  
**Author(s):** Atlas Design & Experience Committee  
**Date:** 2026-07-08  
**Status:** Final  
**Category:** UX/UI & Design System  

---

## Abstract

Este RFC especifica a experiência do usuário (UX), a arquitetura da informação e a linguagem visual (Design System) da plataforma **Atlas**. O objetivo do Atlas é transcender o modelo tradicional de chatbots reativos de IA, oferecendo uma experiência de software que transmita a sensação de trabalhar diretamente ao lado de um *Principal Engineer*. 

Este documento estabelece as diretrizes de design, a taxonomia de jornadas do usuário, a arquitetura de interfaces, as especificações detalhadas de design tokens (cores, tipografia, espaçamento, elevação, motion), os padrões de interação por teclado (keyboard-first), os wireframes conceituais em texto/diagrama e as justificativas técnicas e psicológicas para cada decisão estética adotada.

---

## 1. Princípios e Visão da Experiência

A interface do Atlas deve ser instantaneamente reconhecível e memorável, mesmo na ausência de logotipos ou marcas explícitas. Ela é construída sobre quatro princípios fundamentais de design:

### 1.1 Co-Piloto Ativo, Não Chatbot Reativo
Interfaces de IA convencionais baseiam-se em inputs de chat que geram paredes de texto estáticas e ad-hoc. O Atlas elimina essa barreira:
* **Interface Orientada a Estado:** A interface do Atlas é baseada em workspaces vivos (painel de Blueprint, logs de auditoria, árvore de código, gráficos de memória).
* **Interação Socrática Focada:** Diálogos ocorrem apenas em fases específicas de tomada de decisão ou esclarecimento de requisitos, utilizando painéis flutuantes (Cards) que não poluem a tela de trabalho principal.

### 1.2 "Keyboard-First" e Alta Velocidade
Desenvolvedores experientes operam prioritariamente via teclado. Toda e qualquer ação dentro do Atlas deve ser realizável em menos de 3 atalhos de teclado.
* A barra de comando (`Cmd+K` ou `Ctrl+K`) é a espinha dorsal de navegação do sistema.
* Atalhos curtos globais realizam transições de tela instantâneas.

### 1.3 Profundidade Háptica e Física de Hardware
Inspirada em interfaces industriais mecânicas e painéis digitais luxuosos (como interfaces da Teenage Engineering e consoles físicos), a interface do Atlas usa texturas escuras e profundas, overlays translúcidos de vidro e beiradas físicas (*Double-Bezel*) para criar a sensação de profundidade e massa física nos elementos digitais.

### 1.4 Clareza sob Incerteza
Sempre que a IA estiver processando uma tarefa complexa, a interface deve exibir telemetria em tempo real (como grafos de agentes trabalhando, logs de compilador e sub-tarefas ativas), eliminando a ansiedade gerada por indicadores de carregamento genéricos (spinners estáticos).

---

## 2. Jornadas e Personas do Usuário

O Atlas adapta a complexidade da sua interface de acordo com a senioridade e o contexto operacional do usuário:

```
┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
│  Persona: Iniciante  │      │  Persona: Sênior     │      │ Persona: Enterprise  │
├──────────────────────┤      ├──────────────────────┤      ├──────────────────────┤
│ • Foco: Orientação   │      │ • Foco: Velocidade   │      │ • Foco: Governança   │
│ • Interface visual   │      │ • CLI e atalhos      │      │ • Auditoria geral    │
│   explicativa        │      │ • Visualizador de    │      │ • Gráficos de custos │
│ • Socratic Intake    │      │   diffs cru          │      │ • Logs de segurança  │
│   passo a passo      │      │ • Comando direto     │      │ • SSO / Controle     │
└──────────────────────┘      └──────────────────────┘      └──────────────────────┘
```

### 2.1 Persona 1: O Desenvolvedor Iniciante / Júnior
* **Necessidade:** Compreender as decisões arquiteturais tomadas pelo sistema sem ficar sobrecarregado de conceitos abstratos.
* **Jornada de Primeiro Acesso:**
  1. O usuário digita uma ideia de software na barra inicial.
  2. O sistema inicia o **Socratic Intake** com perguntas de múltipla escolha focadas e cartões conceituais explicando os prós/contras das tecnologias.
  3. O Atlas gera uma árvore visual do projeto e o Blueprint detalhado com explicações em linguagem natural acessível sobre cada componente.
* **Interação no Dia a Dia:** Cards explicativos contextualizados mostram o raciocínio das tarefas sugeridas pelo Atlas.

### 2.2 Persona 2: O Desenvolvedor Sênior / Arquiteto
* **Necessidade:** Agilidade total, escape hatches para redefinir o design, ausência de ruído explicativo e controle completo de diffs de código.
* **Jornada de Primeiro Acesso:**
  1. Digita a ideia diretamente via CLI (`agy init --prompt "..."`).
  2. O Atlas gera o arquivo `atlas.blueprint.yaml`. O sênior abre o arquivo no VS Code e ajusta os contratos diretamente na sintaxe YAML.
  3. O Atlas detecta a edição no arquivo físico, recalcula o grafo de componentes instantaneamente e inicia a codificação.
* **Interação no Dia a Dia:** Uso intenso da barra de comando (`Cmd+K`) no Console Web para alternar entre auditoria de qualidade, logs de dependência e controle de branch dos agentes.

### 2.3 Persona 3: Equipes Enterprise e Liderança Técnica
* **Necessidade:** Conformidade com padrões de segurança corporativos, auditoria de licenças, controle de custos em tempo real de infraestrutura e telemetria de performance.
* **Jornada de Primeiro Acesso:**
  1. O líder técnico conecta o repositório da empresa na nuvem do Atlas.
  2. A plataforma avalia o histórico do repositório, calcula o primeiro **Engineering Score** e monta um dashboard de pendências prioritárias.
* **Interação no Dia a Dia:** Visualização periódica dos relatórios de auditoria e logs de conformidade de segurança integrados ao SSO da empresa.

---

## 3. Linguagem Visual & Design Tokens

O Atlas utiliza o arquétipo visual **Ethereal Obsidian & Machined Glass**. Ele é estruturado em torno de tons pretos profundos (OLED-friendly), bordas translúcidas de neon sutil que denotam status e tipografia espaçosa inspirada em layouts editoriais técnicos.

### 3.1 Design Tokens de Cores

| Categoria | Token | Valor Hex | Uso Contextual |
| :--- | :--- | :--- | :--- |
| **Fundo Principal**| `color-bg-base` | `#050505` | Preto absoluto OLED para o fundo do workspace. |
| **Fundo de Card** | `color-bg-surface`| `#0F0F0F` | Vantablack suave para cartões flutuantes e painéis. |
| **Bordas Físicas** | `color-border-hair`| `rgba(255,255,255,0.08)` | Bordas finas de 1px para delimitar os cards. |
| **Destaque Primário**| `color-brand-cyan` | `#00F5FF` | Ciano elétrico para elementos ativos e foco principal. |
| **Validação** | `color-status-ok` | `#10B981` | Verde esmeralda brilhante para estados validados. |
| **Aviso** | `color-status-warn`| `#F59E0B` | Amarelo âmbar para drift ou alertas menores. |
| **Falha/Erro** | `color-status-err` | `#EF4444` | Vermelho rubi para violações da Constituição ou falhas. |
| **Texto Primário** | `color-text-high` | `#FFFFFF` | Branco puro para títulos e conteúdos importantes. |
| **Texto Secundário**| `color-text-med` | `#8F8F8F` | Cinza mineral para descrições e metadados. |

### 3.2 Tipografia
Para manter a identidade técnica e premium, o Atlas utiliza a fonte **Geist** (Grotesk geométrica otimizada para legibilidade em código) combinada a um conjunto tipográfico estrito:

* **Títulos Principais (H1):** `font-size: 2.25rem (36px)`, `font-weight: 700`, `letter-spacing: -0.04em`.
* **Títulos de Seção (H2):** `font-size: 1.5rem (24px)`, `font-weight: 600`, `letter-spacing: -0.02em`.
* **Texto de Leitura (Body):** `font-size: 0.875rem (14px)`, `font-weight: 400`, `line-height: 1.6`.
* **Dados e Código (Mono):** `font-size: 0.8125rem (13px)`, fonte monoespaçada com espaçamento condensado.

### 3.3 A Técnica do "Double-Bezel" (Doppelrand)
Para conferir sensação de profundidade tridimensional física a todos os cartões e caixas de diálogo, aplica-se o padrão nested de duas bordas:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. OUTER SHELL: rounded-[2rem] bg-white/5 border-white/10    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 2. INNER CORE: rounded-[calc(2rem-8px)] bg-surface    │  │
│  │    shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]    │  │
│  │                                                       │  │
│  │    (Conteúdo e Controles Internos do Card)            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

### 3.4 Motion Design e Física de Animação
* **Sem Instantaneidade:** Todas as transições de estados devem ser animadas usando interpolação física de mola (Spring).
* **Fórmula do Cubic-Bezier Padrão:** `transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]`.
* **Microinterações Cinéticas:**
  * **Hover de Botão:** O botão reduz sutilmente (`active:scale-[0.98]`). Qualquer ícone interno translada ligeiramente na diagonal (`translate-x-[2px] translate-y-[-1px]`) dando sensação de tração.
  * **Entrada de Elementos:** Fade-in de baixo para cima com desfoque de movimento (`translate-y-6 blur-sm opacity-0` para `translate-y-0 blur-0 opacity-100`).

---

## 4. Arquitetura da Informação e Navegação

A arquitetura de informação do Atlas Web Console é estruturada de forma plana, evitando menus suspensos complexos e focando no painel unificado de controle de Workspace.

```
                  ┌──────────────────────┐
                  │    Workspace Root    │
                  └──────────┬───────────┘
                             │
     ┌───────────────────────┼───────────────────────┐
     ▼                       ▼                       ▼
┌──────────┐            ┌──────────┐            ┌──────────┐
│Cmd+K Menu│            │Sidebar   │            │StatusBar │
│(Comandos)│            │(Navegaç) │            │(Contexto)│
└──────────┘            └────┬─────┘            └──────────┘
                             │
       ┌───────────────┬─────┴─────────┬───────────────┐
       ▼               ▼               ▼               ▼
┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
│ Dashboard  │  │ Blueprint  │  │ Auditoria  │  │ Memória    │
│ do Projeto │  │ Visualizer │  │ & Score    │  │  Graph     │
└────────────┘  └────────────┘  └────────────┘  └────────────┘
```

* **Command Palette Menu (`Cmd+K`):** O centro operacional global. Permite executar comandos em lote, navegar para qualquer seção, acionar testes, invocar auditoria e alternar branches de agentes.
* **Floating Sidebar (Barra Lateral Flutuante):** Uma barra fina de ícones com visual Double-Bezel que flutua no lado esquerdo (`ml-4`). Ela se expande suavemente ao passar do mouse (hover) para revelar descrições textuais das telas.
* **Status Bar (Barra de Status):** Localizada na base inferior da tela. Exibe a telemetria em tempo real: o status atual do loop de agentes (ex: `Agent Code: implementing repository_auth.ts`), consumo de tokens, status do compilador local e o score de engenharia atual.

---

## 5. Workspaces e Elementos de Interação Principais

### 5.1 O Painel Socrático de Intake (Requirements Discovery)
Quando o usuário inicia um novo projeto ou funcionalidade, a interface foca em um único card centralizado com bordas Double-Bezel e fundo semitransparente. A tela ao fundo é levemente escurecida por um filtro de desfoque (`backdrop-blur-xl`).

* **Fluxo de Perguntas Adaptativas:** Cada pergunta se comporta como uma folha flutuante que desliza horizontalmente.
* **Respostas Interativas:** A IA sugere opções dinâmicas formatadas como botões com micro-ícones Phosphor Light.
* **Barra de Progresso Técnica:** Em vez de uma linha de progresso padrão, o Atlas mostra uma linha do tempo de componentes a serem descobertos (ex: `Domínio -> Persistência -> Autenticação -> Integração`).

---

### 5.2 O Blueprint Visualizer (RFC-001)
Uma área interativa tridimensional e bidimensional que renderiza o arquivo `atlas.blueprint.yaml` como um grafo vivo de conexões de software.

```
┌─────────────────────────────────────────────────────────────┐
│                      BLUEPRINT VISUALIZER                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         [ Módulo Auth ] ──(REST)──▶ [ Serv. Login ]         │
│               │                            │                │
│             (gRPC)                       (SQL)              │
│               ▼                            ▼                │
│         [ Core Engine ] ────────────▶ [ PostgreSQL ]        │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  Status: Validated | Componentes: 4 | Drift: 0 | Score: 920 │
└─────────────────────────────────────────────────────────────┘
```

* **Nós do Grafo:** Representam os componentes declarados. A cor do contorno do nó indica o status de conformidade:
  * **Ciano elétrico:** Declarado e implementado sem desvios de design.
  * **Amarelo âmbar:** Drift detectado (código difere do blueprint).
  * **Vermelho rubi:** Erro de compilação ou violação constitucional no componente.
* **Conexões (Edges):** Linhas de conexão que mostram dependências e fluxos. Clicar em uma linha exibe o contrato da API de comunicação (OpenAPI ou gRPC) em uma gaveta flutuante (Drawer) na lateral direita da tela.

---

### 5.3 O Painel de Auditoria e Score de Engenharia (RFC-004)
Este painel é o coração de governança do Atlas. Ele exibe em destaque o termômetro do score atual de engenharia de 0 a 1000 pontos.

* **Score Radial:** Um anel circular com cor dinâmica que muda gradualmente do vermelho para o ciano vibrante de acordo com o score.
* **Explosão de Deduções:** Uma lista sanfonada (Accordion) agrupa as penalidades aplicadas ao score por categoria. Clicar em uma infração abre o arquivo de código diretamente na linha do erro e exibe a justificativa da auditoria ao lado de um botão de ação rápida: `[ Auto-Fix ]`.

---

## 6. Wireframes Conceituais (Estrutura Física das Telas)

### 6.1 Layout Geral do Workspace (Dashboard Principal)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ (●) (●) (●)  Atlas Console | Project: atlas-core          | Branch: main    │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌─┐ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │░│ │ [Cmd+K] Buscar comandos ou fazer perguntas...                       │ │
│ │ │ ├─────────────────────────────────────────────────────────────────────┤ │
│ │ │ │                                                                     │ │
│ ├─┤ │  ┌────────────────────────┐         ┌────────────────────────────┐  │ │
│ │█│ │  │ ENGINEERING SCORE      │         │ ACTIVE AGENT LOOP          │  │ │
│ │ │ │  │                        │         │                            │  │ │
│ │ │ │  │     920 / 1000         │         │ Agent [Code-Agent] is      │  │ │
│ │ │ │  │     Grade: A+          │         │ writing database tests...  │  │ │
│ │ │ │  │     Status: Compliant  │         │ File: auth-repo.spec.ts    │  │ │
│ │ │ │  └────────────────────────┘         └────────────────────────────┘  │ │
│ │ │ │                                                                     │ │
│ │ │ │  ┌───────────────────────────────────────────────────────────────┐  │ │
│ │ │ │  │ BLUEPRINT SYSTEM STATUS                                       │  │ │
│ │ │ │  │ ⬤ Core Module (Compliant)   ⬤ Auth Module (Drift Warning)    │  │ │
│ │ │ │  │ ⬤ DB Adapter (Compliant)    ⬤ CLI Console (1 Error)          │  │ │
│ │ │ │  └───────────────────────────────────────────────────────────────┘  │ │
│ │ │ │                                                                     │ │
│ └─┘ └─────────────────────────────────────────────────────────────────────┘ │
│ [Trace: tr_84920] [Agent Status: ACTIVE] [Compilador: OK] [Score: 920] (↗)  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 O Menu de Comando Palette (`Cmd+K` Overlay)

```
      ┌───────────────────────────────────────────────────────────┐
      │  Search or type command...                  [ Esc ]       │
      ├───────────────────────────────────────────────────────────┤
      │  > Run engineering compliance audit    [ gy validate ]    │
      │  > Open blueprint architecture graph   [ g   a   g ]    │
      │  > View current active tasks of agents [ g   t   a ]    │
      │  > Edit project constitution rules     [ g   c   o ]    │
      ├───────────────────────────────────────────────────────────┤
      │  REPORTS & DATA MODELS                                    │
      │  - View REST API Specifications                           │
      │  - Open ADR history log                                   │
      └───────────────────────────────────────────────────────────┘
```

---

## 7. Justificativas do Design de Experiência

Para assegurar consistência científica por trás do layout, o Atlas adota escolhas ergonômicas justificadas:

1. **Predominância do Fundo Preto Absoluto (`#050505`):** Engenheiros de software trabalham sob forte estímulo visual contínuo de telas de IDEs. O uso do preto absoluto minimiza a fadiga visual, prolongando o foco operacional sem causar estresse óptico, além de otimizar a eficiência de bateria em displays OLED.
2. **Abandono do Layout Padrão de Chat Lateral:** Interfaces baseadas em chat vertical na lateral reduzem o espaço de visualização útil do código a 30% da tela. O Atlas foca na visualização integral do workspace (código, grafos e tabelas de auditoria), deixando o chat como um elemento flutuante, discreto e interativo temporário.
3. **Uso de Linhas de 1px Translúcidas em Vez de Bordas Sólidas Coloridas:** Bordas sólidas brilhantes criam forte ruído visual e aumentam a carga cognitiva. O Atlas utiliza bordas translúcidas sutis que interagem delicadamente com o gradiente de fundo, ajudando na separação de seções de forma natural e sofisticada.
4. **Animações de Entrada de Estado de Carregamento Baseadas em Telemetria:** A espera passiva por um spinner genérico causa ansiedade técnica no desenvolvedor. Exibir a linha de raciocínio lógico em cascata da IA e os subprocessos sendo disparados aumenta a percepção de utilidade do sistema, mantendo o usuário engajado e ciente de cada passo racional.

---

## 8. Conclusão

Esta especificação define o comportamento interativo e visual definitivo do Atlas. Qualquer interface do Atlas, seja em navegadores Web, terminais de linha de comando ou aplicativos desktop nativos, deve respeitar estes princípios, tokens de estilo e jornadas operacionais, garantindo que o usuário experimente a plataforma como uma ferramenta de alta engenharia, sofisticada, rápida e confiável.
