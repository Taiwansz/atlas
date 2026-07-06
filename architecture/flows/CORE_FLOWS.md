# Atlas Engineering OS — Core System Flows

> **Document Status:** Authoritative Reference  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-06  
> **Owner:** Atlas Architecture Team  
> **Scope:** All 13 Core Atlas System Flows — Triggers, Sequences, Agents, Data, Error Handling, Success Criteria

---

## Table of Contents

1. [Flow Design Principles](#flow-design-principles)
2. [Flow Notation Guide](#flow-notation-guide)
3. [Project Discovery Flow](#1-project-discovery-flow)
4. [Blueprint Generation Flow](#2-blueprint-generation-flow)
5. [Constitution Generation Flow](#3-constitution-generation-flow)
6. [Research Flow](#4-research-flow)
7. [Architecture Decision Flow](#5-architecture-decision-flow)
8. [Planning Flow](#6-planning-flow)
9. [Code Generation Flow](#7-code-generation-flow)
10. [Audit Flow](#8-audit-flow)
11. [Red Team Flow](#9-red-team-flow)
12. [Score Calculation Flow](#10-score-calculation-flow)
13. [MCP Discovery Flow](#11-mcp-discovery-flow)
14. [Memory Consolidation Flow](#12-memory-consolidation-flow)
15. [Evolution Flow](#13-evolution-flow)
16. [Flow Interaction Map](#flow-interaction-map)

---

## Flow Design Principles

All Atlas core flows are designed around the following invariants:

| Principle | Description |
|-----------|-------------|
| **Deterministic Trigger** | Every flow has a clear, unambiguous trigger — no flows start implicitly |
| **Idempotent Design** | Flows can be safely re-triggered without duplicate side effects |
| **Checkpoint Persistence** | All flows checkpoint state at each step; can resume from any checkpoint |
| **Observable Progress** | Every flow emits progress events readable by Orchestrator and user |
| **Explicit Error Handling** | Every step has defined error handling; no silent failures |
| **Timeout Enforcement** | Every external call has a deadline; flows have overall time budgets |
| **Rollback Capability** | State-modifying flows define rollback procedures for each step |
| **Audit Trail** | Full input/output snapshot at every step persisted to Memory Engine |

---

## Flow Notation Guide

```
Actor/Agent    [ActorName]
Engine Call    {EngineName}
Decision       <condition?>
Artifact       |DocumentName|
Async Message  ~~~> 
Sync Call      --->
Response       <---
Error Path     =X=>
Rollback       <~~~ 
Checkpoint     [CP-N]
```

---

## 1. Project Discovery Flow

### Overview

The Project Discovery Flow is the entry point for all new Atlas projects. It transforms a user's initial idea or problem statement into a comprehensive, validated requirement set ready for blueprint generation. It is conversational, iterative, and driven by the Discovery Agent's intelligent questioning engine.

### Trigger

| Trigger Type | Event | Source |
|-------------|-------|--------|
| **Primary** | User submits new project request via Atlas CLI/UI | User |
| **Secondary** | Orchestrator receives `project.discovery.initiate` event | Event Bus |

### Pre-conditions

- [ ] Atlas system is operational (all critical engines healthy)  
- [ ] User has authenticated and has project creation permissions  
- [ ] Memory Engine is available (new project namespace allocated)  
- [ ] No active discovery session exists for this project  

### Agents Involved

| Agent | Role in Flow |
|-------|-------------|
| **Orchestrator Agent** | Flow controller, session management, final gate |
| **Discovery Agent** | Primary actor — conversational elicitation |
| **Research Agent** | Domain context enrichment (async, background) |
| **MCP Discovery Agent** | Triggered at end to identify relevant tool servers |

### Step-by-Step Sequence

```
┌────────────────────────────────────────────────────────────────────────┐
│                    PROJECT DISCOVERY FLOW                               │
└────────────────────────────────────────────────────────────────────────┘

[User]          [Orchestrator]      [Discovery]     [Research]    {Memory}
  │                   │                  │               │            │
  │--project_idea---->│                  │               │            │
  │                   │                  │               │            │
  │               [CP-1: Session Init]   │               │            │
  │                   │--create_session->│               │            │
  │                   │--init_project--->│               {Memory}     │
  │                   │                  │            ---write_ns---> │
  │                   │                  │               │            │
  │                   │                  │--domain_det-->│            │
  │                   │                  │    ~~~async_research~~~>   │
  │                   │                  │               │            │
  │           [CP-2: Discovery Start]    │               │            │
  │                   │--start_discovery>│               │            │
  │                   │                  │               │            │
  │<--opening_question│<-question--------│               │            │
  │                   │                  │               │            │
  │  ╔══════════════════════════════╗    │               │            │
  │  ║   DISCOVERY CONVERSATION     ║    │               │            │
  │  ║   LOOP (N iterations)        ║    │               │            │
  │  ╚══════════════════════════════╝    │               │            │
  │                   │                  │               │            │
  │--answer---------->│                  │               │            │
  │                   │--answer--------->│               │            │
  │                   │                  │--classify_req>│            │
  │                   │                  │--detect_conflict           │
  │                   │                  │               │            │
  │<--next_question---│<-question--------│               │            │
  │                   │                  │<--research_ctx│            │
  │                   │                  │  (async inject)            │
  │                   │                  │               │            │
  │              [CP-3: per iteration]   │               │            │
  │                   │                  │---write_req-->│            │
  │                   │                  │               │            │
  │  ╔══════════════════════════════╗    │               │            │
  │  ║   END LOOP when:             ║    │               │            │
  │  ║   • completeness ≥ threshold ║    │               │            │
  │  ║   • user signals completion  ║    │               │            │
  │  ║   • max questions reached    ║    │               │            │
  │  ╚══════════════════════════════╝    │               │            │
  │                   │                  │               │            │
  │           [CP-4: Validation Gate]    │               │            │
  │                   │                  │--validate_completeness      │
  │                   │                  │               │            │
  │                <completeness ≥ 75?>  │               │            │
  │                   │   [YES]          │               │            │
  │                   │   [NO]--continue_questions------>│            │
  │                   │                  │               │            │
  │           [CP-5: Requirement Set Build]              │            │
  │                   │                  │--build_req_set│            │
  │                   │                  │--prioritize_reqs           │
  │                   │                  │--assumption_register        │
  │                   │                  │               │            │
  │                   │<--req_set--------│               │            │
  │                   │                  │               │            │
  │           [CP-6: User Validation]    │               │            │
  │<--req_set_summary-│                  │               │            │
  │                   │                  │               │            │
  │--user_confirms--->│                  │               │            │
  │                   │                  │               │            │
  │           [CP-7: Persist & Publish]  │               │            │
  │                   │                  │----------write_final_reqs-> │
  │                   │~~~>blueprint.trigger.event        │            │
  │                   │~~~>mcp.discovery.trigger.event    │            │
  │                   │                  │               │            │
  │<--discovery_complete confirmation    │               │            │
  │                   │                  │               │            │
```

### Data Produced

| Artifact | Schema | Destination |
|----------|--------|-------------|
| `RequirementSet` | JSON, versioned | Memory Engine, Blueprint Engine |
| `AssumptionRegister` | Markdown + JSON | Memory Engine, Documentation Agent |
| `StakeholderMap` | JSON | Memory Engine |
| `OpenQuestions` | JSON | Orchestrator, user |
| `DiscoverySession` | JSON (episodic) | Memory Engine |
| `DomainClassification` | JSON | Research Engine, Blueprint Engine |

### Error Handling

| Error | Detection | Recovery |
|-------|-----------|---------|
| User goes idle > 30min | Timeout monitor | Save progress checkpoint, send reminder notification |
| Contradiction detected | Discovery Agent NLI | Surface contradiction to user, request resolution |
| Research Engine timeout | 30s deadline | Proceed without enrichment, log degraded mode |
| Memory write failure | Health check | Retry 3x with exponential backoff; alert Orchestrator |
| Low completeness after max questions | Completeness < 60% | Escalate to Orchestrator; request human review |

### Success Criteria

| Criterion | Threshold |
|-----------|-----------|
| Requirement completeness score | ≥ 75/100 |
| Open critical questions | = 0 |
| User validation | Explicit confirmation |
| All requirements classified | 100% |
| Assumption register populated | ≥ 1 entry |
| Memory persistence | Confirmed write |

### Performance Budget

| Phase | Target Duration |
|-------|----------------|
| Session initialization | < 5 seconds |
| Per question-answer cycle | < 10 seconds |
| Requirement set build | < 30 seconds |
| Full flow (typical) | 15–45 minutes |

---

## 2. Blueprint Generation Flow

### Overview

The Blueprint Generation Flow transforms a validated requirement set into a comprehensive project blueprint. It is the most complex Atlas flow, coordinating research, architecture, database, UX, and security agents alongside the Blueprint Engine to produce a complete, internally consistent technical specification.

### Trigger

| Trigger Type | Event | Source |
|-------------|-------|--------|
| **Primary** | `blueprint.generation.requested` event on Event Bus | Orchestrator |
| **Secondary** | Manual trigger via CLI: `atlas blueprint generate --project <id>` | User |

### Pre-conditions

- [ ] `RequirementSet` exists and is marked `validated`  
- [ ] Research Engine is available  
- [ ] Constitution Engine is available (for constraint injection)  
- [ ] Memory Engine is available  

### Agents Involved

| Agent | Role |
|-------|------|
| **Orchestrator** | Flow coordination, parallel task management |
| **Blueprint Agent** | Primary actor, blueprint assembly and validation |
| **Architecture Agent** | System architecture design input |
| **Research Agent** | State-of-art technology research |
| **Database Agent** | Data model and schema design |
| **UX Agent** | UX requirements and information architecture |
| **Security Agent** | Security architecture requirements |
| **Constitution Agent** | Constitutional constraint validation |

### Step-by-Step Sequence

```
┌────────────────────────────────────────────────────────────────────────┐
│                   BLUEPRINT GENERATION FLOW                             │
└────────────────────────────────────────────────────────────────────────┘

[Orchestrator]  [Blueprint]  [Architecture] [Research] [Database] [Security]
      │               │              │           │           │          │
trigger event         │              │           │           │          │
      │               │              │           │           │          │
  [CP-1: Gather Inputs]              │           │           │          │
      │--spawn_research_task-------->│           │           │          │
      │               │              │           │           │          │
      │   ┌───────────────────────────────────────────────────┐         │
      │   │           PARALLEL PHASE: Input Gathering         │         │
      │   │  Research Agent ───── research all domains        │         │
      │   │  Architecture Agent ─ sketch initial candidates   │         │
      │   │  Database Agent ───── draft entity model          │         │
      │   │  UX Agent ──────────── map user journeys          │         │
      │   │  Security Agent ────── threat model draft         │         │
      │   │  (all async, 10-minute window)                    │         │
      │   └───────────────────────────────────────────────────┘         │
      │               │              │           │           │          │
  [CP-2: Inputs Collected]           │           │           │          │
      │--inputs_ready--------------->│           │           │          │
      │               │              │           │           │          │
      │           [CP-3: Architecture Ideation]  │           │          │
      │               │--invoke_blueprint_engine │           │          │
      │               │              │           │           │          │
      │               │  {Blueprint Engine}      │           │          │
      │               │  • generate 3 variants   │           │          │
      │               │  • score vs NFRs         │           │          │
      │               │  • select best           │           │          │
      │               │              │           │           │          │
      │           [CP-4: Technology Selection]   │           │          │
      │               │--request_tech_research-->│           │          │
      │               │<--research_results--------           │          │
      │               │              │                       │          │
      │               │--invoke_decision_engine  │           │          │
      │               │  (for contested choices) │           │          │
      │               │              │           │           │          │
      │           [CP-5: Component Design]       │           │          │
      │               │<--arch_design------------│           │          │
      │               │<--data_models-----------------------------       │
      │               │<--ux_arch---------       │           │          │
      │               │<--security_arch---       │           │          │
      │               │              │           │           │          │
      │           [CP-6: Blueprint Assembly]     │           │          │
      │               │--assemble_blueprint      │           │          │
      │               │  (Blueprint Engine)      │           │          │
      │               │              │           │           │          │
      │           [CP-7: Completeness Check]     │           │          │
      │               │--validate_completeness   │           │          │
      │               │              │           │           │          │
      │          <completeness ≥ 85?>│           │           │          │
      │               │ [NO]                     │           │          │
      │               │---gap_fill_pass          │           │          │
      │               │ [YES]                    │           │          │
      │               │              │           │           │          │
      │           [CP-8: Constitution Review]    │           │          │
      │               │=============>│[ConstitutionAgent]               │
      │               │                 review_blueprint                │
      │               │<===constitution_approval=│           │          │
      │               │                          │           │          │
      │           [CP-9: Publication]            │           │          │
      │               │--publish_blueprint       │           │          │
      │               │--notify_all_agents       │           │          │
      │               │              │           │           │          │
      │<--blueprint_ready            │           │           │          │
      │               │              │           │           │          │
```

### Data Produced

| Artifact | Description |
|----------|-------------|
| `Blueprint` | Complete project blueprint document |
| `ArchitectureDiagrams` | C4 Level 1–3 diagrams in Mermaid |
| `APIContracts` | OpenAPI/AsyncAPI specifications |
| `DataModels` | Logical and physical data models |
| `TechSelectionReport` | Technology choices with ADR references |
| `ImplementationRoadmap` | Phased implementation plan |
| `RiskRegister` | Initial project risk register |

### Error Handling

| Error | Recovery |
|-------|---------|
| Research Engine timeout | Use cached results or proceed with lower confidence |
| Agent task failure | Retry once; escalate to Orchestrator on second failure |
| Completeness < 60% after 5 passes | Escalate to user for more requirements |
| Constitution conflict | Block publication; notify for resolution |
| Technology contradiction | Invoke Decision Engine for arbitration |

### Success Criteria

| Criterion | Threshold |
|-----------|-----------|
| Blueprint completeness score | ≥ 85/100 |
| All requirements traced | 100% |
| Constitution approval | Required |
| Zero unresolved contradictions | Required |
| All NFRs measurable | 100% |
| All components have defined interfaces | 100% |

---

## 3. Constitution Generation Flow

### Overview

The Constitution Generation Flow produces the project's foundational constitution — a versioned set of inviolable principles and executable rules. It runs once at project initiation and is re-triggered whenever significant project evolution demands constitutional amendment.

### Trigger

| Trigger Type | Event | Source |
|-------------|-------|--------|
| **Primary** | Blueprint publication (first time) | Blueprint Agent |
| **Secondary** | `constitution.amendment.requested` event | Constitution Agent |
| **Tertiary** | Audit finding requires new constitutional rule | Audit Agent |

### Agents Involved

| Agent | Role |
|-------|------|
| **Constitution Agent** | Primary actor |
| **Architecture Agent** | Architectural invariant input |
| **Security Agent** | Security baseline input |
| **Orchestrator** | Final ratification and publication |

### Step-by-Step Sequence

```
[Constitution] [Architecture]  [Security]  [Orchestrator]  {Constitution Engine}
      │               │              │            │                │
  Trigger received    │              │            │                │
      │               │              │            │                │
  [CP-1: Input Collection]           │            │                │
      │--request_arch_invariants---->│            │                │
      │--request_security_baseline-->│            │                │
      │<--arch_invariants------------│            │                │
      │<--security_baseline----------│            │                │
      │                              │            │                │
  [CP-2: Principle Extraction]       │            │                │
      │--invoke_constitution_engine->│            │           ───>run
      │            {Extract from: blueprint, reqs, regulations, values}
      │<──────────────raw_principles─────────────────────────────── │
      │                              │            │                │
  [CP-3: Rule Formalization]         │            │                │
      │--formalize_rules             │            │                │
      │  (NL → ConstitutionDSL)      │            │                │
      │                              │            │                │
  [CP-4: Consistency Check]          │            │                │
      │--run_sat_solver              │            │                │
      │   (detect contradictions)    │            │                │
      │                              │            │                │
  <contradictions found?>            │            │                │
      │ [YES]--resolve_conflicts     │            │                │
      │ [NO]                         │            │                │
      │                              │            │                │
  [CP-5: Coverage Analysis]          │            │                │
      │--check_nfr_coverage          │            │                │
      │--check_security_coverage     │            │                │
      │                              │            │                │
  <coverage gaps?>                   │            │                │
      │ [YES]--generate_missing_rules│            │                │
      │ [NO]                         │            │                │
      │                              │            │                │
  [CP-6: Ratification]               │            │                │
      │--submit_for_ratification---->│            │                │
      │                              │            │                │
      │                   <review_window: 24-48h> │                │
      │                              │            │                │
      │<──────────────────ratification_decision───│                │
      │                              │            │                │
  [CP-7: Publication]                │            │                │
      │--publish_constitution        │            │                │
      │--broadcast_to_all_agents     │            │                │
      │--start_violation_monitoring  │            │                │
      │                              │            │                │
```

### Data Produced

| Artifact | Description |
|----------|-------------|
| `Constitution` | Complete constitutional document with all rules |
| `EnforcementRuleSet` | Machine-executable rules in ConstitutionDSL |
| `ComplianceMatrix` | NFR-to-rule mapping matrix |
| `ConstitutionHistory` | Version history with change rationale |

### Success Criteria

| Criterion | Threshold |
|-----------|-----------|
| NFR coverage | 100% |
| Internal consistency (SAT check) | Pass |
| Rule formalization success | 100% |
| Ratification quorum | Orchestrator + Constitution Agent |
| Violation monitoring activated | Within 60s of publication |

---

## 4. Research Flow

### Overview

The Research Flow is executed both on-demand (triggered by agents needing specific knowledge) and on schedule (continuous background research to maintain the project's technology radar and knowledge base). It encompasses web research, academic paper ingestion, benchmark collection, and synthesis.

### Trigger

| Trigger Type | Event | Source |
|-------------|-------|--------|
| **On-demand** | `research.query.requested` event | Any agent |
| **Scheduled** | Cron: every 24h for tier-1 sweep, 72h for full sweep | Scheduler |
| **Reactive** | New technology mention detected in project artifacts | Knowledge Graph Engine |

### Agents Involved

| Agent | Role |
|-------|------|
| **Research Agent** | Primary actor |
| **Orchestrator** | Task routing and result distribution |

### Step-by-Step Sequence

```
[Orchestrator] [Research Agent]  {Research Engine}  {Memory}  {KG Engine}
      │               │                │                │          │
  trigger/request     │                │                │          │
      │--assign_task->│                │                │          │
      │               │                │                │          │
  [CP-1: Query Construction]           │                │          │
      │               │--invoke_engine>│                │          │
      │               │                │                │          │
      │               │  {Query Router}│                │          │
      │               │  {Source Select}               │          │
      │               │                │                │          │
  [CP-2: Parallel Source Crawl]        │                │          │
      │               │     ┌──────────────────────┐   │          │
      │               │     │ Web Crawler (async)   │   │          │
      │               │     │ arXiv Client (async)  │   │          │
      │               │     │ GitHub Scraper (async)│   │          │
      │               │     │ NPM/PyPI (async)      │   │          │
      │               │     └──────────────────────┘   │          │
      │               │                │                │          │
  [CP-3: Ingestion & Dedup]            │                │          │
      │               │   {Raw Ingestion Pipeline}      │          │
      │               │   (dedup, parse, normalize)     │          │
      │               │                │                │          │
  [CP-4: LLM Synthesis]                │                │          │
      │               │   {LLM Synthesis Layer}         │          │
      │               │   (extract, summarize, score)   │          │
      │               │                │                │          │
  [CP-5: Relevance Ranking]            │                │          │
      │               │   {BM25 + Dense Retrieval}      │          │
      │               │                │                │          │
  [CP-6: Report Assembly]              │                │          │
      │               │<-research_report               │          │
      │               │--persist_findings------------->│          │
      │               │--push_entities_to_kg---------------------------->
      │               │                │                │          │
      │<--report------│                │                │          │
      │               │                │                │          │
```

### Data Produced

| Artifact | Description |
|----------|-------------|
| `ResearchReport` | Synthesized findings with citations |
| `TechRadarDelta` | New/updated tech radar entries |
| `BenchmarkResults` | Comparative performance data |
| `PaperDigests` | Structured summaries of academic papers |
| `EntityExtracts` | Entities pushed to Knowledge Graph |

### Error Handling

| Error | Recovery |
|-------|---------|
| Source unreachable | Skip; log; use cached results if < 24h old |
| LLM synthesis failure | Retry with simplified prompt; return raw sources on second failure |
| Rate limit hit | Exponential backoff; deprioritize rate-limited source |
| Dedup collision (false positive) | Log and flag for review; present both versions |

### Success Criteria

| Criterion | Threshold |
|-----------|-----------|
| Sources processed | ≥ defined minimum per depth level |
| Synthesis confidence | ≥ 60% (medium+) |
| Report completeness | All query facets addressed |
| Persistence confirmed | Memory write acknowledged |

---

## 5. Architecture Decision Flow

### Overview

The Architecture Decision Flow is triggered whenever a significant technical decision must be made — technology selection, pattern choice, infrastructure design, API design, etc. It produces a fully documented ADR with alternatives analysis, trade-off matrix, and decision rationale. It is the primary mechanism for building and maintaining the project's decision audit trail.

### Trigger

| Trigger Type | Event | Source |
|-------------|-------|--------|
| **Primary** | `decision.required` event with decision context | Any agent |
| **Escalation** | Agent cannot resolve trade-off independently | Any agent |
| **Proactive** | Blueprint Engine detects unresolved technology choice | Blueprint Engine |

### Agents Involved

| Agent | Role |
|-------|------|
| **Architecture Agent** | Primary actor |
| **Research Agent** | Evidence gathering for alternatives |
| **Simulation Engine** | What-if analysis for top alternatives |
| **Decision Engine** | MCDA scoring and formal recommendation |
| **Orchestrator** | Final approval and ADR publication |

### Step-by-Step Sequence

```
[Architecture] [Research]  {Decision Eng}  {Simulation}  [Orchestrator]
      │             │              │              │             │
  Decision needed   │              │              │             │
      │             │              │              │             │
  [CP-1: Problem Definition]       │              │             │
      │--frame_decision            │              │             │
      │--identify_alternatives     │              │             │
      │             │              │              │             │
  [CP-2: Evidence Gathering]       │              │             │
      │--research_request--------->│              │             │
      │<--research_results---------│              │             │
      │             │              │              │             │
  [CP-3: Alternative Deep-Dive]    │              │             │
      │--for each alternative:     │              │             │
      │  research pros/cons        │              │             │
      │  gather benchmarks         │              │             │
      │  check constitution compat │              │             │
      │             │              │              │             │
  [CP-4: Simulation (Top 2)]       │              │             │
      │--invoke_simulation---------------------------->         │
      │<--simulation_results--------------------------│         │
      │             │              │              │             │
  [CP-5: MCDA Scoring]             │              │             │
      │--invoke_decision_engine---->│              │             │
      │  {AHP weighting}           │              │             │
      │  {TOPSIS scoring}          │              │             │
      │  {Confidence intervals}    │              │             │
      │<--decision_matrix----------│              │             │
      │<--recommendation-----------│              │             │
      │             │              │              │             │
  [CP-6: ADR Drafting]             │              │             │
      │--draft_adr                 │              │             │
      │  (full Nygard format)      │              │             │
      │             │              │              │             │
  [CP-7: Review & Approval]        │              │             │
      │--submit_adr_for_approval-------------------------->     │
      │                                           │             │
      │                              <consensus_required?>      │
      │                              [YES]--human_review        │
      │                              [NO]--auto_approve         │
      │                                           │             │
      │<──────────────────────────────approval────│             │
      │             │              │              │             │
  [CP-8: Publication]              │              │             │
      │--publish_adr               │              │             │
      │--update_memory             │              │             │
      │--update_knowledge_graph    │              │             │
      │--notify_affected_agents    │              │             │
      │             │              │              │             │
```

### Data Produced

| Artifact | Description |
|----------|-------------|
| `ADR` | Complete Architecture Decision Record |
| `DecisionMatrix` | Multi-criteria scoring table |
| `RejectedAlternatives` | Discarded options with documented rationale |
| `RiskRegisterUpdate` | New risks introduced by the decision |
| `KnowledgeGraphUpdate` | Decision entity + relationships |

### Success Criteria

| Criterion | Threshold |
|-----------|-----------|
| Alternatives considered | ≥ 3 (or all available) |
| Evidence cited per alternative | ≥ 2 sources each |
| MCDA criteria coverage | 100% of defined criteria |
| ADR completeness | All Nygard fields populated |
| Orchestrator approval | Required for MAJOR+ decisions |

---

## 6. Planning Flow

### Overview

The Planning Flow converts a project blueprint into an executable, sprint-ready plan. It uses the Planning Engine's Monte Carlo capabilities to produce realistic, risk-adjusted schedules. It runs at project initiation and re-runs at the start of every sprint.

### Trigger

| Trigger Type | Event | Source |
|-------------|-------|--------|
| **Initial** | Blueprint publication confirmed | Blueprint Agent |
| **Sprint** | Sprint end event | Scheduler / DevOps Agent |
| **Re-plan** | Significant scope change detected | Orchestrator |

### Agents Involved

| Agent | Role |
|-------|------|
| **Planning Agent** | Primary actor |
| **Architecture Agent** | Component dependency input |
| **Code Agent** | Effort estimate validation |
| **Orchestrator** | Plan approval and distribution |

### Step-by-Step Sequence

```
[Planning Agent]  [Architecture]  [Code Agent]  {Planning Eng}  [Orchestrator]
      │                 │               │              │               │
  Trigger received      │               │              │               │
      │                 │               │              │               │
  [CP-1: Work Decomposition]            │              │               │
      │--invoke_planning_engine--------->              │               │
      │  {Blueprint → Epics}            │              │               │
      │  {Epics → Stories}              │              │               │
      │  {Stories → Tasks}              │              │               │
      │                 │               │              │               │
  [CP-2: Dependency Mapping]            │              │               │
      │--get_component_deps------------>│              │               │
      │<--dependency_graph--------------│              │               │
      │--detect_circular_deps          │              │               │
      │                 │               │              │               │
  [CP-3: Effort Estimation]             │              │               │
      │--estimate_tasks  (PERT)         │              │               │
      │--calibrate_with_velocity        │              │               │
      │--request_code_agent_review------>               │               │
      │<--code_agent_estimate_review----│               │               │
      │                 │               │              │               │
  [CP-4: Monte Carlo Scheduling]        │              │               │
      │--run_monte_carlo (10K iterations)------------>│               │
      │<--p50_p80_p95_schedule---------------------------              │
      │                 │               │              │               │
  [CP-5: Sprint Construction]           │              │               │
      │--apply_wsjf_priority            │              │               │
      │--match_to_capacity              │              │               │
      │--build_sprint_backlogs          │              │               │
      │                 │               │              │               │
  [CP-6: Plan Publication]              │              │               │
      │--submit_plan_for_approval------>│              │         ───>review
      │<────────────────────────────────────────approval│               │
      │--publish_plan                   │              │               │
      │--sync_to_project_tracker        │              │               │
      │                 │               │              │               │
```

### Data Produced

| Artifact | Description |
|----------|-------------|
| `ProjectPlan` | Full hierarchical plan (epics → tasks) |
| `SprintBacklog` | Current sprint prioritized backlog |
| `MilestoneSchedule` | P50/P80/P95 milestone dates |
| `CriticalPath` | Critical path visualization |
| `RiskAdjustedTimeline` | Monte Carlo schedule distribution |

### Success Criteria

| Criterion | Threshold |
|-----------|-----------|
| All blueprint components decomposed | 100% |
| Estimates for all tasks | 100% |
| No circular dependencies | Required |
| Monte Carlo iterations run | ≥ 10,000 |
| Sprint fully capacity-matched | Within ±10% of capacity |

---

## 7. Code Generation Flow

### Overview

The Code Generation Flow converts user stories and task specifications into production-quality code, complete with tests, documentation, and compliance with project coding standards. It is the most frequently executed flow in a typical project lifecycle.

### Trigger

| Trigger Type | Event | Source |
|-------------|-------|--------|
| **Primary** | Developer assigns story to Code Agent | Planning/Developer |
| **Automated** | Sprint auto-assignment trigger | Orchestrator |

### Agents Involved

| Agent | Role |
|-------|------|
| **Code Agent** | Primary actor |
| **Test Agent** | Parallel test generation |
| **Security Agent** | Security review of generated code |
| **Documentation Agent** | Inline doc generation |
| **Architecture Agent** | On-call for design questions |

### Step-by-Step Sequence

```
[Code Agent]  [Test Agent]  [Security]  [Docs Agent]  {Memory}  [Orchestrator]
     │              │             │            │           │           │
 Task received      │             │            │           │           │
     │              │             │            │           │           │
 [CP-1: Context Gathering]        │            │           │           │
     │--read_blueprint             │            │           │           │
     │--read_constitution          │            │           │           │
     │--search_related_code        │            │     ─────>│           │
     │--read_api_contracts         │            │           │           │
     │              │             │            │           │           │
 [CP-2: Design]     │             │            │           │           │
     │--identify_patterns          │            │           │           │
     │--draft_interface_first      │            │           │           │
     │--check_arch_conformance     │            │           │           │
     │              │             │            │           │           │
 [CP-3: Implementation]           │            │           │           │
     │--generate_code              │            │           │           │
     │  (per language/framework    │            │           │           │
     │   standards from blueprint) │            │           │           │
     │              │             │            │           │           │
 [CP-4: Parallel: Test+Docs+Sec] ─┼────────────┼──────────>│           │
     │──────────────>│             │            │           │           │
     │               generate_tests            │           │           │
     │────────────────────────────>│            │           │           │
     │                    security_review       │           │           │
     │──────────────────────────────────────────>          │           │
     │                                  generate_docs      │           │
     │              │             │            │           │           │
 [CP-5: Self-Review]              │            │           │           │
     │--run_linter                 │            │           │           │
     │--check_complexity           │            │           │           │
     │--verify_constitution_rules  │            │           │           │
     │              │             │            │           │           │
 [CP-6: Results Assembly]         │            │           │           │
     │<─────────────tests_ready───│            │           │           │
     │<───────────────────────────security_findings        │           │
     │<────────────────────────────────────────docs_ready  │           │
     │              │             │            │           │           │
 [CP-7: Quality Gate Check]       │            │           │           │
     │<security_findings.CRITICAL?─>           │           │           │
     │  [YES]=X=> BLOCK, alert Orchestrator    │           │           │
     │  [NO]                       │            │           │           │
     │              │             │            │           │           │
 [CP-8: Output Delivery]          │            │           │           │
     │--write_to_memory---------------------------->       │           │
     │--notify_completion------------------------------------->         │
     │              │             │            │           │           │
```

### Data Produced

| Artifact | Description |
|----------|-------------|
| `GeneratedCode` | Production-ready implementation |
| `UnitTests` | Unit test suite |
| `IntegrationTests` | Integration test cases |
| `SecurityReview` | Inline security findings |
| `CodeDocumentation` | Docstrings, inline comments |

### Success Criteria

| Criterion | Threshold |
|-----------|-----------|
| Linter pass | Required |
| Static analysis CRITICAL findings | 0 |
| Unit test coverage | ≥ project target |
| Documentation coverage | 100% of public functions |
| Architecture conformance check | Pass |

---

## 8. Audit Flow

### Overview

The Audit Flow executes a comprehensive technical audit of the project at any point in its lifecycle. It examines code quality, architecture conformance, security compliance, documentation, and performance against NFR targets, producing a structured report with tracked findings.

### Trigger

| Trigger Type | Event | Source |
|-------------|-------|--------|
| **Scheduled** | End of milestone / end of quarter | Scheduler |
| **On-demand** | CLI: `atlas audit run --scope <scope>` | User/Orchestrator |
| **Reactive** | Score drops > 10 points | Score Engine |

### Agents Involved

| Agent | Role |
|-------|------|
| **Audit Agent** | Primary actor |
| **Security Agent** | Security compliance sub-audit |
| **Code Agent** | Code quality context |
| **Architecture Agent** | Architecture conformance review |
| **Orchestrator** | Report distribution, finding escalation |

### Step-by-Step Sequence

```
[Audit Agent]  [Security]  [Architecture]  {Audit Engine}  [Orchestrator]
      │             │             │              │               │
  Trigger received  │             │              │               │
      │             │             │              │               │
  [CP-1: Scope Definition]        │              │               │
      │--define_audit_scope        │              │               │
      │--fetch_previous_audit      │              │               │
      │--invoke_audit_engine------>│              │        ──────>│
      │             │             │              │               │
  [CP-2: Parallel Audit Streams]  │              │               │
      │  ┌──────────────────────────────────┐    │               │
      │  │ Code Quality Stream              │    │               │
      │  │ • complexity analysis            │    │               │
      │  │ • duplication detection          │    │               │
      │  │ • code smell catalog             │    │               │
      │  │                                  │    │               │
      │  │ Architecture Conformance Stream  │    │               │
      │  │ • dependency analysis            │    │               │
      │  │ • blueprint deviation detection  │    │               │
      │  │                                  │    │               │
      │  │ Security Compliance Stream ─────────>││               │
      │  │ • OWASP checklist                │    │               │
      │  │ • dependency CVE scan            │    │               │
      │  │ • secret scan                    │    │               │
      │  │                                  │    │               │
      │  │ Documentation Stream             │    │               │
      │  │ • coverage measurement           │    │               │
      │  │ • accuracy validation            │    │               │
      │  └──────────────────────────────────┘    │               │
      │             │             │              │               │
  [CP-3: Finding Classification]  │              │               │
      │--classify_findings         │              │               │
      │  (BLOCKER/CRITICAL/MAJOR/MINOR/ADVISORY)  │               │
      │--calculate_cvss_scores     │              │               │
      │             │             │              │               │
  [CP-4: Tech Debt Quantification]│              │               │
      │--quantify_tech_debt        │              │               │
      │  (Squale model)            │              │               │
      │--estimate_remediation_cost │              │               │
      │             │             │              │               │
  [CP-5: Delta Report]            │              │               │
      │--compare_to_previous_audit │              │               │
      │--trend_analysis            │              │               │
      │             │             │              │               │
  [CP-6: Report Assembly & Publish]             │               │
      │--generate_audit_report     │              │               │
      │--notify_orchestrator-------------------------------->      │
      │--feed_score_engine         │              │               │
      │--feed_evolution_engine     │              │               │
      │             │             │              │               │
```

### Data Produced

| Artifact | Description |
|----------|-------------|
| `AuditReport` | Complete findings with evidence and remediation |
| `ComplianceMatrix` | Pass/fail per standard/rule |
| `TechDebtRegister` | Quantified technical debt inventory |
| `ArchitectureDriftReport` | Deviations from intended architecture |
| `RemediationBacklog` | Prioritized remediation tasks |

### Success Criteria

| Criterion | Threshold |
|-----------|-----------|
| All audit streams completed | 100% |
| Every finding has evidence | 100% |
| Every BLOCKER has immediate notification | 100% |
| Tech debt fully quantified | 100% |
| Score Engine fed | Before report publication |

---

## 9. Red Team Flow

### Overview

The Red Team Flow executes adversarial testing against the project from an attacker's perspective. It covers LLM-specific attacks, API penetration testing, infrastructure security, and supply chain analysis. It produces a structured security assessment report and triggers remediation workflows for critical findings.

### Trigger

| Trigger Type | Event | Source |
|-------------|-------|--------|
| **Pre-release** | Deployment gate: before any production release | DevOps Agent |
| **Scheduled** | Monthly adversarial sweep | Scheduler |
| **Reactive** | New CVE published for dependency in SBOM | Security Agent |

### Agents Involved

| Agent | Role |
|-------|------|
| **Red Team Agent** | Primary actor |
| **Security Agent** | Threat model context provider |
| **Orchestrator** | Emergency escalation receiver |

### Step-by-Step Sequence

```
[Red Team Agent]  [Security Agent]  {Red Team Engine}  [Orchestrator]
      │                 │                 │                  │
  Trigger received      │                 │                  │
      │                 │                 │                  │
  [CP-1: Threat Model Acquisition]        │                  │
      │--request_threat_model------------>│                  │
      │<--threat_model--------------------│                  │
      │--identify_attack_surface          │                  │
      │                 │                 │                  │
  [CP-2: Attack Planning]                 │                  │
      │--generate_attack_plan             │                  │
      │  (based on system type + threat model)               │
      │                 │                 │                  │
  [CP-3: Parallel Attack Streams]         │                  │
      │  ┌─────────────────────────────────────────────┐    │
      │  │ Stream 1: LLM Attack Suite                  │    │
      │  │ • 50+ prompt injection patterns             │    │
      │  │ • jailbreak attempts                        │    │
      │  │ • data exfiltration probes                  │    │
      │  │                                             │    │
      │  │ Stream 2: API Security                      │    │
      │  │ • OWASP API Top 10                          │    │
      │  │ • authentication bypass                     │    │
      │  │ • IDOR probes                               │    │
      │  │                                             │    │
      │  │ Stream 3: Infrastructure                    │    │
      │  │ • misconfiguration scan                     │    │
      │  │ • network segmentation check                │    │
      │  │ • IAM over-permission detection             │    │
      │  │                                             │    │
      │  │ Stream 4: Supply Chain                      │    │
      │  │ • dependency analysis                       │    │
      │  │ • CI/CD pipeline security                   │    │
      │  │ • build artifact integrity                  │    │
      │  └─────────────────────────────────────────────┘    │
      │                 │                 │                  │
  [CP-4: Finding Triage]                  │                  │
      │  <CRITICAL finding?>              │                  │
      │   [YES]──────────────────────────────IMMEDIATE ALERT>│
      │   [NO]                            │                  │
      │--classify_all_findings            │                  │
      │--generate_cvss_scores             │                  │
      │--generate_poc_for_critical        │                  │
      │                 │                 │                  │
  [CP-5: Report Assembly]                 │                  │
      │--compile_red_team_report          │                  │
      │--generate_remediation_plan        │                  │
      │--update_security_baseline         │                  │
      │                 │                 │                  │
  [CP-6: Delivery]                        │                  │
      │--deliver_to_security_agent------->│                  │
      │--notify_orchestrator─────────────────────────────>  │
      │                 │                 │                  │
```

### Data Produced

| Artifact | Description |
|----------|-------------|
| `RedTeamReport` | All findings with CVSS scores and PoC |
| `VulnerabilityList` | Sorted by severity for remediation |
| `SecurityBaselineUpdate` | Updated minimum security requirements |
| `RemediationPlan` | Prioritized fix schedule |

### Success Criteria

| Criterion | Threshold |
|-----------|-----------|
| All planned attack streams executed | 100% |
| CRITICAL findings reported within 5min | 100% |
| Every finding has remediation guidance | 100% |
| CVSS score calculated | All findings |
| Security baseline updated | Post-report |

---

## 10. Score Calculation Flow

### Overview

The Score Calculation Flow computes the Atlas Engineering Score — a composite 0–100 metric reflecting overall project health. It aggregates signals from audit, security, testing, documentation, velocity, and operational readiness into a single defensible score with dimensional breakdowns and trend analysis.

### Trigger

| Trigger Type | Event | Source |
|-------------|-------|--------|
| **Post-audit** | Audit report published | Audit Agent |
| **Scheduled** | Weekly score refresh | Scheduler |
| **On-demand** | CLI: `atlas score` | User |

### Agents Involved

| Agent | Role |
|-------|------|
| **Orchestrator** | Trigger and result distribution |
| **Score Engine** | Primary computation actor (engine, no dedicated agent) |
| **Evolution Agent** | Consumes delta for improvement planning |

### Step-by-Step Sequence

```
[Orchestrator]  {Score Engine}  {Audit}  {Red Team}  {Memory}  [Evolution]
      │                │           │          │           │          │
  Trigger score        │           │          │           │          │
      │--invoke_score->│           │          │           │          │
      │                │           │          │           │          │
  [CP-1: Input Collection]         │          │           │          │
      │                │--fetch_audit_report->│          │          │
      │                │--fetch_redteam_report────────>  │          │
      │                │--fetch_velocity_metrics──────────>         │
      │                │--fetch_coverage_data ─────────────────>    │
      │                │--fetch_doc_score ──────────────────────>   │
      │                │           │          │           │          │
  [CP-2: Dimension Scoring]        │          │           │          │
      │                │  ┌─────────────────────────────────┐       │
      │                │  │ Code Quality:    raw → 0-100     │       │
      │                │  │ Test Robustness: raw → 0-100     │       │
      │                │  │ Security:        raw → 0-100     │       │
      │                │  │ Architecture:    raw → 0-100     │       │
      │                │  │ Documentation:   raw → 0-100     │       │
      │                │  │ Delivery Perf:   raw → 0-100     │       │
      │                │  │ Ops Readiness:   raw → 0-100     │       │
      │                │  └─────────────────────────────────┘       │
      │                │           │          │           │          │
  [CP-3: Composite Calculation]    │          │           │          │
      │                │  Score = Σ(dim × weight)         │          │
      │                │  Percentile benchmarking         │          │
      │                │  Trend (EWMA) analysis           │          │
      │                │           │          │           │          │
  [CP-4: Score Publication]        │          │           │          │
      │<─────score_report──────────│          │           │          │
      │                │--persist_to_memory──────────────>│          │
      │                │--notify_evolution─────────────────────────>│
      │                │           │          │           │          │
  [CP-5: Trend Analysis & Alerting]│          │           │          │
      │                │  <Score dropped > 5 points?>     │          │
      │                │  [YES]──────────alert_orchestrator          │
      │                │  [NO]                            │          │
      │                │           │          │           │          │
```

### Data Produced

| Artifact | Description |
|----------|-------------|
| `EngineeringScore` | Final composite score 0–100 |
| `DimensionScores` | Per-dimension breakdown with trends |
| `ScoreDelta` | Change from previous period |
| `BenchmarkComparison` | Industry percentile position |
| `ImprovementTargets` | Highest-leverage improvement opportunities |

### Success Criteria

| Criterion | Threshold |
|-----------|-----------|
| All 7 dimensions scored | 100% |
| Benchmark comparison computed | Always |
| Trend analysis complete | Always |
| Score persisted to Memory | Before notification |
| Evolution Agent notified | Always |

---

## 11. MCP Discovery Flow

### Overview

The MCP Discovery Flow automatically discovers, evaluates, and registers relevant MCP servers for a project. It runs at project initialization and periodically as the project evolves, ensuring the agent ecosystem always has access to the best tools for the current context.

### Trigger

| Trigger Type | Event | Source |
|-------------|-------|--------|
| **Project Init** | Blueprint published for first time | Blueprint Agent |
| **Scheduled** | Weekly capability gap scan | Scheduler |
| **On-demand** | Agent reports capability gap | Any agent |

### Agents Involved

| Agent | Role |
|-------|------|
| **MCP Discovery Agent** | Primary actor |
| **Security Agent** | Security evaluation of candidate servers |
| **Orchestrator** | Registration approval and distribution |

### Step-by-Step Sequence

```
[MCP Discovery]  [Security Agent]  {MCP Engine}  {Memory}  [Orchestrator]
      │                 │                │            │           │
  Trigger received      │                │            │           │
      │                 │                │            │           │
  [CP-1: Capability Gap Analysis]        │            │           │
      │--identify_current_capabilities   │            │           │
      │--identify_needed_capabilities    │            │           │
      │--compute_gaps                    │            │           │
      │                 │                │            │           │
  [CP-2: Discovery Scan]                 │            │           │
      │  ┌───────────────────────────────────┐        │           │
      │  │ Atlas MCP Registry (curated)      │        │           │
      │  │ GitHub topic: mcp-server          │        │           │
      │  │ npm: keywords:mcp                 │        │           │
      │  │ PyPI: mcp-server-*                │        │           │
      │  └───────────────────────────────────┘        │           │
      │                 │                │            │           │
  [CP-3: Relevance Scoring]              │            │           │
      │--score_relevance_per_candidate   │            │           │
      │--filter_below_threshold(7.0)     │            │           │
      │                 │                │            │           │
  [CP-4: Security Evaluation]            │            │           │
      │--request_security_eval---------->│            │           │
      │<--security_scores----------------│            │           │
      │  <security_score < 7.0?>         │            │           │
      │   [YES] REJECT — log reason      │            │           │
      │   [NO]  proceed                  │            │           │
      │                 │                │            │           │
  [CP-5: Connectivity Test]              │            │           │
      │--test_connectivity               │            │           │
      │--validate_schema                 │            │           │
      │--benchmark_latency               │            │           │
      │                 │                │            │           │
  [CP-6: Registration]                   │            │           │
      │--register_with_mcp_engine------->│            │           │
      │--update_capability_map           │            │           │
      │--notify_all_agents─────────────────────────────────────>│
      │                 │                │            │           │
```

### Success Criteria

| Criterion | Threshold |
|-----------|-----------|
| Capability gaps fully addressed | ≥ 80% |
| Security score gate enforced | 100% |
| Connectivity test before registration | 100% |
| All agents notified of new capabilities | 100% |

---

## 12. Memory Consolidation Flow

### Overview

The Memory Consolidation Flow runs nightly as a background process, compressing episodic memories into semantic knowledge, updating the Knowledge Graph, retiring low-importance stale memories, and ensuring the project's institutional knowledge remains dense, relevant, and efficiently retrievable.

### Trigger

| Trigger Type | Event | Source |
|-------------|-------|--------|
| **Scheduled** | Nightly cron: 02:00 UTC | Scheduler |
| **On-demand** | Manual trigger post-major-milestone | Orchestrator |

### Agents Involved

| Agent | Role |
|-------|------|
| **Orchestrator** | Trigger and completion monitoring |
| **Memory Engine** | Primary computation actor |
| **Knowledge Graph Engine** | Entity graph update recipient |

### Step-by-Step Sequence

```
[Orchestrator]  {Memory Engine}              {KG Engine}    {Vector DB}
      │                │                          │              │
  Nightly trigger       │                          │              │
      │--trigger_consolidation                     │              │
      │                │                          │              │
  [CP-1: Episodic Compression]                    │              │
      │                │--gather_raw_episodic      │              │
      │                │--hierarchical_summarize   │              │
      │                │  (MemGPT-style recursive) │              │
      │                │--write_semantic_summaries  │              │
      │                │                          │              │
  [CP-2: Retention Scoring]                       │              │
      │                │--score_all_memories       │              │
      │                │  (Ebbinghaus decay model) │              │
      │                │--identify_retirement_candidates          │
      │                │                          │              │
  [CP-3: Entity Extraction]                       │              │
      │                │--extract_entities_from_summaries        │
      │                │--push_to_kg─────────────>│              │
      │                │                          │              │
  [CP-4: Knowledge Graph Update]                  │              │
      │                │              {KG updates relations}      │
      │                │              {OWL inference run}        │
      │                │              {Contradiction detection}   │
      │                │                          │              │
  [CP-5: Embedding Update]                        │              │
      │                │--re-embed_updated_memories────────────>│
      │                │--update_faiss_index─────────────────>  │
      │                │                          │              │
  [CP-6: Memory Retirement]                       │              │
      │                │--archive_retired_memories │              │
      │                │--log_retirement_audit     │              │
      │                │                          │              │
  [CP-7: Completion Report]                       │              │
      │<──────────────consolidation_complete       │              │
      │                │                          │              │
```

### Data Produced

| Artifact | Description |
|----------|-------------|
| `SemanticSummaries` | Compressed episodic knowledge |
| `KnowledgeGraphUpdates` | New entities and relationships |
| `RetirementLog` | Audit trail of expired memories |
| `ConsolidationReport` | Statistics on memory health |

### Success Criteria

| Criterion | Threshold |
|-----------|-----------|
| All episodic memories older than 7d compressed | 100% |
| Knowledge Graph updated | Always |
| Embedding index refreshed | Always |
| Consolidation completes within window | < 2 hours |
| Retirement audit log written | Always |

---

## 13. Evolution Flow

### Overview

The Evolution Flow executes Atlas's continuous improvement cycle. It runs at the end of every sprint and every major milestone, analyzing what happened, what improved, what degraded, and what should change. It produces an evolution plan that feeds directly into the next planning cycle.

### Trigger

| Trigger Type | Event | Source |
|-------------|-------|--------|
| **Post-sprint** | Sprint closure event | Planning Agent |
| **Post-milestone** | Milestone completion event | Orchestrator |
| **Score-reactive** | Engineering Score drops > 10 points | Score Engine |

### Agents Involved

| Agent | Role |
|-------|------|
| **Evolution Agent** | Primary actor |
| **Audit Agent** | Provides audit delta |
| **Planning Agent** | Receives evolution plan input |
| **Orchestrator** | Evolution plan approval and broadcast |

### Step-by-Step Sequence

```
[Evolution Agent] [Audit Agent]  {Evolution Eng}  {Memory}  [Planning]  [Orchestrator]
      │                │               │              │          │             │
  Trigger received     │               │              │          │             │
      │                │               │              │          │             │
  [CP-1: Data Collection]              │              │          │             │
      │--fetch_score_delta              │              │          │             │
      │--fetch_audit_delta──────────>  │              │          │             │
      │<──────audit_delta──────────── │               │          │             │
      │--fetch_velocity_data           │              │          │             │
      │--fetch_dora_metrics            │              │          │             │
      │--fetch_retrospective_notes     │              │          │             │
      │                │               │              │          │             │
  [CP-2: Retrospective Analysis]       │              │          │             │
      │--invoke_evolution_engine────>  │              │          │             │
      │  {NLP retrospective mining}    │              │          │             │
      │  {DORA trend analysis}         │              │          │             │
      │  {Score trend analysis}        │              │          │             │
      │                │               │              │          │             │
  [CP-3: Tech Debt Portfolio Review]   │              │          │             │
      │--prioritize_tech_debt          │              │          │             │
      │  (NPV-based portfolio model)   │              │          │             │
      │--flag_critical_debt_items      │              │          │             │
      │                │               │              │          │             │
  [CP-4: Technology Lifecycle Check]   │              │          │             │
      │--check_dependency_staleness    │              │          │             │
      │--identify_upgrade_opportunities│              │          │             │
      │                │               │              │          │             │
  [CP-5: Improvement Prioritization]   │              │          │             │
      │--score_improvements            │              │          │             │
      │  (impact × urgency × feasibility)             │          │             │
      │--build_top_N_recommendations   │              │          │             │
      │                │               │              │          │             │
  [CP-6: Evolution Plan Assembly]      │              │          │             │
      │--generate_evolution_plan       │              │          │             │
      │--generate_paydown_schedule     │              │          │             │
      │--generate_upgrade_plan         │              │          │             │
      │                │               │              │          │             │
  [CP-7: Plan Submission]              │              │          │             │
      │--submit_to_orchestrator─────────────────────────────────────────────>│
      │<──────────────────────────────────────────────approval──────────────  │
      │--push_to_planning_agent────────────────────────────────>│             │
      │--persist_to_memory──────────────────────────>│          │             │
      │                │               │              │          │             │
```

### Data Produced

| Artifact | Description |
|----------|-------------|
| `EvolutionPlan` | Prioritized improvement roadmap |
| `TechDebtPaydownSchedule` | Sprint-by-sprint debt reduction plan |
| `TechnologyUpgradePlan` | Dependency upgrade schedule |
| `DORATrends` | Current and trending DORA metrics |
| `ImpactReport` | Measured impact of prior improvements |
| `ConstitutionAmendmentProposals` | Suggested constitutional updates |

### Error Handling

| Error | Recovery |
|-------|---------|
| No retrospective data | Run analysis on metrics only; flag missing retro |
| Audit data unavailable | Run partial evolution plan; note gaps |
| Planning Agent unreachable | Cache plan; retry on next planning cycle start |

### Success Criteria

| Criterion | Threshold |
|-----------|-----------|
| DORA metrics computed | All 4 metrics |
| Top-10 improvements identified | Always |
| Tech debt items reviewed | 100% of register |
| Evolution plan accepted by Orchestrator | Required |
| Planning Agent fed new priorities | Before next sprint |

---

## Flow Interaction Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ATLAS FLOW INTERACTION MAP                              │
│                                                                             │
│  ┌──────────────┐    triggers    ┌─────────────────┐                       │
│  │  Discovery   │───────────────▶│  Blueprint Gen  │                       │
│  │  Flow  [F1]  │                │  Flow  [F2]     │                       │
│  └──────────────┘                └────────┬────────┘                       │
│                                           │ triggers                        │
│                              ┌────────────┴────────────┐                  │
│                              │                          │                   │
│                    ┌─────────▼────────┐    ┌──────────▼──────────┐        │
│                    │  Constitution    │    │  Planning Flow [F6]  │        │
│                    │  Flow  [F3]     │    └──────────┬───────────┘        │
│                    └─────────────────┘               │                     │
│                                                       │                     │
│  ┌──────────────┐  on-demand ┌─────────────────┐     │ enables             │
│  │  Research    │◀───────────│  Architecture   │     │                     │
│  │  Flow  [F4]  │            │  Decision [F5]  │     ▼                     │
│  └──────────────┘            └─────────────────┘  ┌─────────────────┐     │
│                                                    │ Code Gen [F7]   │     │
│                                                    └────────┬────────┘     │
│                                                             │               │
│                              feeds results into             │               │
│  ┌──────────────┐◀────────────────────────────────────────┘               │
│  │  Audit Flow  │                                                           │
│  │  [F8]        │─────feeds────▶ Score Calc [F10] ──▶ Evolution [F13]     │
│  └──────────────┘                                    │                      │
│                                                       │                     │
│  ┌──────────────┐  feeds ┌─────────────────┐         │ planning input      │
│  │  Red Team    │───────▶│  Audit Flow [F8]│         ▼                     │
│  │  Flow  [F9]  │        └─────────────────┘    Planning Agent             │
│  └──────────────┘                                                           │
│                                                                             │
│  ┌──────────────┐  parallel at init ┌────────────────────────┐            │
│  │  MCP Discov. │◀──────────────────│  Blueprint Gen Flow     │            │
│  │  Flow [F11]  │                   └────────────────────────┘            │
│  └──────────────┘                                                           │
│                                                                             │
│  ┌──────────────┐  nightly, always running                                  │
│  │  Memory Cons.│──────────────────────────────▶ Knowledge Graph          │
│  │  Flow [F12]  │                                Engine (continuous)       │
│  └──────────────┘                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flow Timing Summary

| Flow | Typical Duration | Frequency |
|------|-----------------|-----------|
| Project Discovery [F1] | 15–45 minutes | Once per project |
| Blueprint Generation [F2] | 5–15 minutes | Once + on major changes |
| Constitution Generation [F3] | 3–10 minutes | Once + amendments |
| Research [F4] | 2–30 minutes | On-demand + daily sweep |
| Architecture Decision [F5] | 5–20 minutes | Per major decision |
| Planning [F6] | 5–15 minutes | Per sprint + milestone |
| Code Generation [F7] | 1–10 minutes | Per story/task |
| Audit [F8] | 15–60 minutes | Per milestone + on-demand |
| Red Team [F9] | 30–120 minutes | Pre-release + monthly |
| Score Calculation [F10] | 2–5 minutes | Weekly + post-audit |
| MCP Discovery [F11] | 5–15 minutes | On init + weekly |
| Memory Consolidation [F12] | 60–120 minutes | Nightly |
| Evolution [F13] | 5–15 minutes | Per sprint + milestone |

---

*This document is the authoritative specification for all Atlas core system flows. Any new flow introduced to the system must follow the same specification format and be added to this document. Flow changes affecting behavior require an ADR and version increment.*
