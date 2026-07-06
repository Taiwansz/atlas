# Atlas Engineering OS — Engines Overview

> **Document Status:** Authoritative Reference  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-06  
> **Owner:** Atlas Architecture Team  
> **Scope:** All 15 Atlas Core Engines — Purpose, Inputs, Outputs, Internal Architecture, Algorithms, Integration Points, Performance Requirements, Data Models

---

## Table of Contents

1. [Engine Architecture Philosophy](#engine-architecture-philosophy)
2. [Engine Taxonomy & Dependency Graph](#engine-taxonomy--dependency-graph)
3. [Research Engine](#1-research-engine)
4. [Blueprint Engine](#2-blueprint-engine)
5. [Constitution Engine](#3-constitution-engine)
6. [Memory Engine](#4-memory-engine)
7. [Knowledge Graph Engine](#5-knowledge-graph-engine)
8. [Decision Engine](#6-decision-engine)
9. [Prompt Engine](#7-prompt-engine)
10. [Skill Engine](#8-skill-engine)
11. [MCP Engine](#9-mcp-engine)
12. [Planning Engine](#10-planning-engine)
13. [Simulation Engine](#11-simulation-engine)
14. [Red Team Engine](#12-red-team-engine)
15. [Audit Engine](#13-audit-engine)
16. [Score Engine](#14-score-engine)
17. [Evolution Engine](#15-evolution-engine)
18. [Cross-Engine Communication Protocol](#cross-engine-communication-protocol)

---

## Engine Architecture Philosophy

Atlas engines are discrete, independently deployable computational units that compose into a unified engineering intelligence system. Each engine adheres to the following invariants:

### Core Invariants

| Invariant | Description |
|-----------|-------------|
| **Idempotency** | Engines produce deterministic outputs for identical inputs, with versioned non-determinism windows for LLM-backed engines |
| **Isolation** | Engines communicate exclusively through the Atlas Event Bus; no direct function calls across engine boundaries |
| **Observability** | Every engine emits structured OpenTelemetry traces, metrics, and logs |
| **Resilience** | Engines implement circuit-breaker patterns and degrade gracefully under load or dependency failure |
| **Auditability** | All engine invocations are persisted with full input/output snapshots for replay and debugging |
| **Versioning** | Engines are independently versioned with semver; breaking changes require major version bumps |

### Engine Lifecycle

```
UNINITIALIZED → INITIALIZING → HEALTHY → DEGRADED → UNHEALTHY → TERMINATED
                                   ↕            ↕
                               BUSY         RECOVERING
```

### Shared Infrastructure

All engines inherit from the `AtlasBaseEngine` abstract class, which provides:

- **Event Bus integration** via `publish()` / `subscribe()` with guaranteed delivery
- **Distributed tracing** via OpenTelemetry SDK  
- **Caching layer** via Redis with configurable TTL strategies  
- **Rate limiting** via token-bucket algorithms  
- **Health probes** at `/health/live` and `/health/ready`  
- **Metrics endpoint** at `/metrics` (Prometheus format)  

---

## Engine Taxonomy & Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ATLAS ENGINE GRAPH                          │
│                                                                     │
│   ┌──────────┐    ┌──────────┐    ┌─────────────┐                  │
│   │ Research │    │  Memory  │    │  Knowledge  │                   │
│   │  Engine  │───▶│  Engine  │◀──▶│ Graph Eng.  │                  │
│   └────┬─────┘    └────┬─────┘    └──────┬──────┘                  │
│        │               │                  │                          │
│        ▼               ▼                  ▼                          │
│   ┌──────────┐    ┌──────────┐    ┌─────────────┐                  │
│   │ Blueprint│    │ Decision │    │   Planning  │                   │
│   │  Engine  │───▶│  Engine  │───▶│   Engine   │                   │
│   └────┬─────┘    └────┬─────┘    └──────┬──────┘                  │
│        │               │                  │                          │
│        ▼               ▼                  ▼                          │
│   ┌──────────┐    ┌──────────┐    ┌─────────────┐                  │
│   │Constitut.│    │  Prompt  │    │    Skill    │                   │
│   │  Engine  │    │  Engine  │    │   Engine   │                   │
│   └────┬─────┘    └────┬─────┘    └──────┬──────┘                  │
│        │               │                  │                          │
│        ▼               ▼                  ▼                          │
│   ┌──────────┐    ┌──────────┐    ┌─────────────┐                  │
│   │   MCP    │    │Simulation│    │  Red Team   │                   │
│   │  Engine  │    │  Engine  │    │   Engine   │                   │
│   └────┬─────┘    └────┬─────┘    └──────┬──────┘                  │
│        │               │                  │                          │
│        └───────────────┴──────────────────┘                         │
│                               │                                      │
│                    ┌──────────┴──────────┐                          │
│                    │    Audit Engine     │                           │
│                    └──────────┬──────────┘                          │
│                               │                                      │
│                    ┌──────────┴──────────┐                          │
│                    │    Score Engine     │                           │
│                    └──────────┬──────────┘                          │
│                               │                                      │
│                    ┌──────────┴──────────┐                          │
│                    │  Evolution Engine   │                           │
│                    └─────────────────────┘                          │
└─────────────────────────────────────────────────────────────────────┘
```

**Legend:** `→` data flow; `↔` bidirectional; upstream engines must be healthy for downstream engines to operate at full capacity.

---

## 1. Research Engine

### Purpose

The Research Engine is Atlas's intelligence-gathering core. It autonomously discovers, evaluates, synthesizes, and maintains a continuously updated knowledge base of state-of-the-art techniques, benchmarks, tools, papers, and industry practices relevant to any project context. It operates as a background service, performing scheduled sweeps and responding to on-demand research requests from other engines and agents.

### Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `research_query` | `ResearchQuery` | Any engine / agent | Structured query with domain, depth, and recency filters |
| `project_context` | `ProjectContext` | Memory Engine | Current project snapshot for relevance scoring |
| `topic_subscriptions` | `TopicList` | Constitution Engine | Auto-research topics tied to project invariants |
| `benchmark_request` | `BenchmarkSpec` | Score Engine | Request to gather performance benchmarks |
| `tech_radar_update` | `TriggerEvent` | Scheduler | Periodic full-spectrum radar refresh |

### Outputs

| Output | Type | Destination | Description |
|--------|------|-------------|-------------|
| `research_report` | `ResearchReport` | Requesting agent | Synthesized findings with citations, confidence, recency |
| `tech_radar_delta` | `TechRadarDelta` | Memory Engine | Net-new technologies to add/update on tech radar |
| `benchmark_results` | `BenchmarkResults` | Score Engine | Comparative benchmark data for scoring context |
| `state_of_art_summary` | `SotASummary` | Blueprint Engine | Best-practice summaries for blueprint recommendations |
| `paper_digest` | `PaperDigest` | Knowledge Graph Engine | Extracted structured entities from academic papers |

### Internal Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     RESEARCH ENGINE                          │
│                                                             │
│  ┌─────────────────┐    ┌──────────────────┐               │
│  │  Query Router   │───▶│  Source Selector │               │
│  └─────────────────┘    └────────┬─────────┘               │
│                                   │                          │
│         ┌─────────────────────────┼──────────────────┐      │
│         ▼                         ▼                   ▼      │
│  ┌─────────────┐    ┌──────────────────┐  ┌────────────────┐│
│  │  Web Crawler│    │  arXiv / Semantic│  │ GitHub / NPM / ││
│  │  (Playwright│    │  Scholar Client  │  │ PyPI Scrapers  ││
│  │   + Firecr.)│    └────────┬─────────┘  └───────┬────────┘│
│  └──────┬──────┘             │                     │         │
│         └─────────────┬──────┘─────────────────────┘         │
│                       ▼                                       │
│              ┌─────────────────┐                             │
│              │  Raw Ingestion  │                             │
│              │  Pipeline       │                             │
│              │  (dedup, parse) │                             │
│              └────────┬────────┘                             │
│                       ▼                                       │
│              ┌─────────────────┐                             │
│              │  LLM Synthesis  │  ← Prompt Engine            │
│              │  Layer          │                             │
│              │  (extraction,   │                             │
│              │   summarization,│                             │
│              │   scoring)      │                             │
│              └────────┬────────┘                             │
│                       ▼                                       │
│              ┌─────────────────┐                             │
│              │ Relevance Ranker│                             │
│              │ (BM25 + dense   │                             │
│              │  bi-encoder)    │                             │
│              └────────┬────────┘                             │
│                       ▼                                       │
│              ┌─────────────────┐                             │
│              │  Report Builder │                             │
│              └─────────────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Algorithms & Approaches

- **Hybrid Retrieval:** BM25 sparse retrieval combined with bi-encoder dense retrieval (all-MiniLM-L6-v2 or domain-specific) for source selection and result ranking.
- **Tiered Crawling:** Tier-1 (curated feeds: arXiv CS.*, Hacker News, GitHub Trending), Tier-2 (domain-specific blogs and docs), Tier-3 (open web via Playwright headless).
- **Citation Graph Traversal:** Follows references from high-signal papers up to depth-3 to surface foundational and derivative works.
- **Recency Decay Scoring:** `relevance = base_score × e^(-λ × days_old)` where λ is calibrated per domain (e.g., ML moves faster than database internals).
- **Deduplication:** SimHash fingerprinting with Hamming distance < 3 treated as duplicates; canonical version selected by source authority score.
- **LLM-Assisted Synthesis:** Multi-step prompting — extract → validate → compare → synthesize — with self-consistency sampling for confidence estimation.

### Integration Points

| Engine/Agent | Protocol | Direction | Purpose |
|-------------|---------|-----------|---------|
| Memory Engine | Event Bus | Bidirectional | Store/retrieve research findings |
| Knowledge Graph Engine | gRPC | Outbound | Push extracted entities and relations |
| Blueprint Engine | Event Bus | Inbound | On-demand queries during blueprint generation |
| Prompt Engine | gRPC | Inbound | Fetch optimized research prompts |
| Score Engine | Event Bus | Inbound | Benchmark data requests |

### Performance Requirements

| Metric | Target | SLO |
|--------|--------|-----|
| On-demand query latency (P95) | < 30s | 99.5% |
| Scheduled sweep cycle | < 4h | 99% |
| Source coverage (top-tier) | ≥ 98% daily | Weekly audit |
| LLM synthesis accuracy | > 90% factual | Monthly eval |
| Deduplication precision | > 99% | Continuous |

### Data Models

```typescript
interface ResearchQuery {
  id: string;                    // UUID v4
  topic: string;
  domain: DomainTag[];           // e.g., ["distributed-systems", "rust"]
  depth: "surface" | "standard" | "deep";
  recency_window_days: number;   // 0 = all time
  max_sources: number;
  requester_id: string;          // agent or engine id
  project_context_id: string;
}

interface ResearchReport {

  query_id: string;
  generated_at: ISO8601DateTime;
  findings: Finding[];
  synthesis: string;             // LLM-generated synthesis text
  confidence: number;            // 0.0–1.0
  sources: Source[];
  state_of_art: {
    leaders: TechItem[];
    emerging: TechItem[];
    deprecated: TechItem[];
  };
  benchmarks?: BenchmarkResult[];
}

interface Finding {
  title: string;
  summary: string;
  source_url: string;
  published_at: ISO8601DateTime;
  relevance_score: number;
  entity_type: "paper" | "tool" | "library" | "benchmark" | "blog";
  extracted_claims: Claim[];
}
```

---

## 2. Blueprint Engine

### Purpose

The Blueprint Engine transforms raw project requirements, discovery outputs, and research findings into comprehensive, structured project blueprints. A blueprint is the foundational technical document that defines system architecture, component breakdown, technology selections, API contracts, data models, and implementation roadmap at a level sufficient to begin development. It is the primary artifact produced during project onboarding and serves as the source of truth for all downstream planning.

### Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `requirements` | `RequirementSet` | Discovery Agent | Elicited and validated project requirements |
| `research_context` | `ResearchReport` | Research Engine | Relevant state-of-art findings |
| `constitution_constraints` | `ConstitutionConstraints` | Constitution Engine | Non-negotiable architectural invariants |
| `existing_codebase_analysis` | `CodebaseAnalysis` | Audit Engine | Analysis of existing code if brownfield |
| `technology_preferences` | `TechPreferences` | User/Orchestrator | Mandated or preferred technology choices |
| `similar_blueprints` | `BlueprintList` | Memory Engine | Past blueprints for pattern reuse |

### Outputs

| Output | Type | Destination | Description |
|--------|------|-------------|-------------|
| `project_blueprint` | `Blueprint` | All agents | Complete structured blueprint document |
| `architecture_diagram` | `ArchDiagram` | Documentation Agent | System architecture visualizations |
| `api_contracts` | `APIContract[]` | Code Agent, Test Agent | OpenAPI/AsyncAPI specifications |
| `data_models` | `DataModel[]` | Database Agent | Entity definitions and relationships |
| `tech_selection_report` | `TechSelectionReport` | Decision Engine | Recommended tech stack with rationale |
| `implementation_roadmap` | `Roadmap` | Planning Engine | Phased implementation plan |

### Internal Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     BLUEPRINT ENGINE                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 Requirement Processor                 │  │
│  │  (normalize, classify, prioritize, detect conflicts) │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Architecture Ideation Module             │  │
│  │  (LLM-driven multi-candidate generation: 3 variants) │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Architecture Evaluation Module           │  │
│  │  (Simulation Engine integration for trade-off eval)  │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Technology Selection Module              │  │
│  │  (Research Engine data + Decision Engine scoring)    │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Blueprint Document Assembler                │  │
│  │  (structured Markdown + JSON schema output)          │  │
│  └───────────────────────┬──────────────────────────────┘  │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Validation & Consistency Checker         │  │
│  │  (constraint satisfaction, completeness scoring)     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key Algorithms & Approaches

- **Multi-Candidate Generation:** Produces 3 architecture variants (minimal, balanced, maximal) and scores each against NFRs using a weighted decision matrix.
- **Constraint Propagation:** CSP solver ensures technology choices satisfy all constitution constraints and known compatibility matrices.
- **Pattern Library Matching:** Cosine similarity search against a vector store of 500+ architecture patterns (microservices, event-driven, CQRS, hexagonal, etc.).
- **Completeness Scoring:** Blueprint completeness measured against a 127-point checklist; incomplete blueprints trigger targeted LLM gap-filling passes.
- **Conflict Detection:** Detects contradictory requirements using semantic contradiction detection (NLI model fine-tuned on technical requirements).

### Integration Points

| Engine/Agent | Protocol | Direction | Purpose |
|-------------|---------|-----------|---------|
| Research Engine | Event Bus | Inbound | State-of-art context |
| Constitution Engine | gRPC | Inbound | Constraint injection |
| Decision Engine | Event Bus | Bidirectional | Technology scoring |
| Planning Engine | Event Bus | Outbound | Feed roadmap to planning |
| Memory Engine | Event Bus | Outbound | Persist blueprint |

### Performance Requirements

| Metric | Target | SLO |
|--------|--------|-----|
| Blueprint generation time | < 5 minutes | 99% |
| Completeness score | ≥ 85/100 | Per blueprint |
| Architecture variant generation | ≥ 3 variants | Always |
| Consistency check pass rate | 100% | Blocker |

### Data Models

```typescript
interface Blueprint {
  id: string;
  version: string;              // semver
  project_id: string;
  created_at: ISO8601DateTime;
  title: string;
  executive_summary: string;
  system_context: SystemContext;
  architecture: Architecture;
  components: Component[];
  api_contracts: APIContract[];
  data_models: DataModel[];
  technology_stack: TechStack;
  nfr_targets: NFRTargets;
  implementation_roadmap: Roadmap;
  risks: Risk[];
  open_questions: Question[];
  completeness_score: number;   // 0–100
}
```

---

## 3. Constitution Engine

### Purpose

The Constitution Engine generates, maintains, and enforces the project's Constitution — a living document of inviolable principles, invariants, constraints, and quality standards. Unlike a blueprint (which describes what to build), a constitution defines how it must always be built. The constitution acts as the guardian of project integrity, feeding its constraints into every downstream engine and serving as the ultimate arbitration layer for technical disputes.

### Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `project_blueprint` | `Blueprint` | Blueprint Engine | Architectural decisions to derive invariants from |
| `team_values` | `TeamValues` | Orchestrator | Explicit cultural/technical principles |
| `regulatory_requirements` | `RegSpec[]` | User | GDPR, HIPAA, SOC2, etc. |
| `security_baseline` | `SecurityBaseline` | Red Team Engine | Minimum security requirements |
| `existing_constitution` | `Constitution` | Memory Engine | Prior version for incremental update |
| `audit_findings` | `AuditReport` | Audit Engine | Findings that must become future invariants |

### Outputs

| Output | Type | Destination | Description |
|--------|------|-------------|-------------|
| `project_constitution` | `Constitution` | All engines/agents | Complete constitutional document |
| `enforcement_rules` | `RuleSet` | Audit Engine | Machine-executable rules derived from constitution |
| `violation_alerts` | `ViolationAlert[]` | Orchestrator | Real-time alerts when constitution is breached |
| `constitution_delta` | `ConstitutionDelta` | Memory Engine | Changes between versions for history tracking |

### Internal Architecture

The Constitution Engine uses a **Principle Extraction → Formalization → Consistency Checking → Publication** pipeline. Raw principles in natural language are transformed into formal constraints via a domain-specific language (ConstitutionDSL), validated for internal consistency, and published as both human-readable documents and machine-executable rule sets.

### Key Algorithms & Approaches

- **ConstitutionDSL:** A declarative constraint language supporting quantified statements: `ALWAYS`, `NEVER`, `WHEN ... THEN`, `MUST`, `SHOULD`, `MAY` with binding to specific code artifacts, APIs, or data models.
- **Conflict Detection:** Automated SAT-solver analysis of all rules to detect logical contradictions before publication.
- **Coverage Analysis:** Ensures every NFR from the blueprint maps to at least one constitutional rule.
- **Drift Monitoring:** Periodic scanning of committed code and architecture decisions against constitutional rules.

### Performance Requirements

| Metric | Target |
|--------|--------|
| Constitution generation time | < 3 minutes |
| Rule coverage of NFRs | 100% |
| Conflict-free publication rate | 100% (blocker) |
| Violation detection latency | < 60 seconds |

### Data Models

```typescript
interface Constitution {
  id: string;
  version: string;
  project_id: string;
  principles: Principle[];
  invariants: Invariant[];
  constraints: Constraint[];
  standards: Standard[];
  enforcement_level: "advisory" | "warning" | "blocking";
  ratified_at: ISO8601DateTime;
  ratified_by: string[];
}

interface Invariant {
  id: string;
  statement: string;            // Human-readable
  dsl_expression: string;       // ConstitutionDSL formal expression
  category: InvariantCategory;
  severity: "critical" | "major" | "minor";
  rationale: string;
  evidence_refs: string[];
}
```

---

## 4. Memory Engine

### Purpose

The Memory Engine provides Atlas with persistent, multi-modal project memory that survives across sessions, agent restarts, and project evolution. It maintains three distinct memory stores — episodic (what happened), semantic (what is known), and procedural (how things are done) — and orchestrates memory consolidation, retrieval, and forgetting in alignment with cognitive architecture principles. It is the singular source of project truth and enables Atlas to build deep, compounding institutional knowledge.

### Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `memory_write` | `MemoryEntry` | Any engine/agent | Any piece of project knowledge to persist |
| `retrieval_query` | `RetrievalQuery` | Any engine/agent | Semantic or exact memory lookup |
| `consolidation_trigger` | `TriggerEvent` | Scheduler | Nightly memory consolidation run |
| `project_event` | `ProjectEvent` | Event Bus | Automatically captured project lifecycle events |
| `context_snapshot` | `ContextSnapshot` | Orchestrator | Current session context for episodic recording |

### Outputs

| Output | Type | Destination | Description |
|--------|------|-------------|-------------|
| `memory_results` | `MemoryResult[]` | Requester | Retrieved memories ranked by relevance |
| `project_context` | `ProjectContext` | Any engine | Assembled current project context window |
| `knowledge_summary` | `KnowledgeSummary` | Orchestrator | Periodic distilled project knowledge |
| `memory_graph_update` | `GraphUpdate` | Knowledge Graph Engine | Consolidated entities/relations for graph |
| `forgotten_entries` | `ForgottenEntry[]` | Audit Engine | Memory retirement log for audit trail |

### Internal Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      MEMORY ENGINE                           │
│                                                             │
│   ┌──────────────────────────────────────────────────────┐ │
│   │                 Memory Intake Layer                   │ │
│   │  (normalize, timestamp, embed, classify memory type) │ │
│   └──────────────────┬───────────────────────────────────┘ │
│                      │                                       │
│    ┌─────────────────┼─────────────────────┐               │
│    ▼                 ▼                      ▼               │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Episodic │  │   Semantic   │  │     Procedural       │ │
│  │  Store   │  │    Store     │  │       Store          │ │
│  │(Timeline │  │(Vector DB +  │  │  (Workflow/Pattern   │ │
│  │ Events)  │  │ fact triples)│  │   Templates)         │ │
│  └──────────┘  └──────────────┘  └──────────────────────┘ │
│       │               │                    │                │
│       └───────────────┴────────────────────┘                │
│                       ▼                                      │
│           ┌───────────────────────┐                         │
│           │  Consolidation Engine │                         │
│           │  (nightly batch job)  │                         │
│           │  • compress episodic  │                         │
│           │  • extract semantic   │                         │
│           │  • update procedural  │                         │
│           └──────────┬────────────┘                         │
│                      ▼                                       │
│           ┌───────────────────────┐                         │
│           │  Retrieval & Ranking  │                         │
│           │  (hybrid BM25+dense,  │                         │
│           │   recency weighting,  │                         │
│           │   relevance scoring)  │                         │
│           └───────────────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### Key Algorithms & Approaches

- **Spaced Repetition Forgetting:** Low-relevance memories decay using `retention = e^(-t/S)` (Ebbinghaus curve), with relevance refreshes resetting the clock.
- **Hierarchical Summarization:** Nightly consolidation compresses verbose episodic entries into semantic summaries using recursive summarization (MemGPT-inspired).
- **Embedding Strategy:** OpenAI `text-embedding-3-large` (3072-dim) with FAISS HNSW index for sub-10ms approximate nearest-neighbor retrieval.
- **Context Window Assembly:** Dynamic context assembly fills the LLM context window optimally using marginal relevance maximization (MMR algorithm).
- **Memory Graph Construction:** Co-occurrence analysis and LLM-extracted entity relationships propagated to Knowledge Graph Engine during consolidation.

### Performance Requirements

| Metric | Target | SLO |
|--------|--------|-----|
| Memory write latency (P99) | < 100ms | 99.9% |
| Retrieval latency (P95) | < 200ms | 99.5% |
| Consolidation window | < 2h nightly | 99% |
| Embedding throughput | ≥ 1000 entries/min | Continuous |
| Storage efficiency | < 10GB per active project | Per project |

### Data Models

```typescript
interface MemoryEntry {
  id: string;
  project_id: string;
  memory_type: "episodic" | "semantic" | "procedural";
  content: string;
  structured_data?: Record<string, unknown>;
  embedding?: number[];          // 3072-dim
  tags: string[];
  created_at: ISO8601DateTime;
  last_accessed_at: ISO8601DateTime;
  access_count: number;
  importance_score: number;      // 0.0–1.0, decays over time
  source_agent: string;
  references: string[];          // Other memory IDs
}
```

---

## 5. Knowledge Graph Engine

### Purpose

The Knowledge Graph Engine builds and maintains a structured, queryable representation of all project knowledge as a property graph. It extracts entities (technologies, components, decisions, people, requirements) and relationships (depends-on, implements, violates, supersedes) from all Atlas documents and interactions, enabling sophisticated reasoning, impact analysis, and cross-artifact traceability that flat document stores cannot support.

### Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `document` | `AtlasDocument` | Any engine | Any structured document for entity extraction |
| `memory_graph_update` | `GraphUpdate` | Memory Engine | Consolidated entities from memory consolidation |
| `paper_digest` | `PaperDigest` | Research Engine | Entities from academic papers |
| `code_analysis` | `CodeGraph` | Audit Engine | Dependency graphs from static code analysis |
| `graph_query` | `GraphQuery` | Any engine/agent | Cypher/SPARQL-like queries against the graph |

### Outputs

| Output | Type | Destination | Description |
|--------|------|-------------|-------------|
| `query_results` | `GraphQueryResult` | Requester | Subgraph or path results |
| `impact_analysis` | `ImpactReport` | Decision Engine | Change impact traversal results |
| `knowledge_subgraph` | `Subgraph` | Blueprint/Planning | Domain-specific subgraph extracts |
| `contradiction_report` | `ContradictionReport` | Orchestrator | Detected contradictions in knowledge |
| `lineage_trace` | `LineageTrace` | Audit Engine | Full provenance chain for any artifact |

### Key Algorithms & Approaches

- **Entity Extraction:** SpaCy NER + LLM-assisted extraction for domain-specific entities (components, technologies, requirements, decisions).
- **Relation Classification:** Fine-tuned BERT classifier for 24 relation types with confidence thresholds.
- **Graph Store:** Neo4j for primary storage with periodic export to RDF for interoperability.
- **Reasoning:** OWL-based inference rules for transitive relationships (e.g., if A depends-on B, and B is deprecated, then A is at-risk).
- **Graph Embeddings:** Node2Vec embeddings for similarity-based graph queries ("find all nodes similar to X").

### Performance Requirements

| Metric | Target |
|--------|--------|
| Entity extraction latency | < 5s per document |
| Graph query response (simple) | < 100ms |
| Graph query response (complex) | < 2s |
| Graph size support | ≥ 10M nodes, 100M edges |

---

## 6. Decision Engine

### Purpose

The Decision Engine is Atlas's technical reasoning center. It generates Architecture Decision Records (ADRs), performs structured trade-off analysis, manages technical debt as first-class decisions, and maintains the project's decision history with full rationale. It combines decision theory, multi-criteria analysis, and LLM reasoning to produce defensible, well-documented technical decisions.

### Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `decision_request` | `DecisionRequest` | Any agent | A technical question requiring a decision |
| `alternatives` | `Alternative[]` | Requesting agent | Pre-identified alternatives to evaluate |
| `research_context` | `ResearchReport` | Research Engine | Relevant state-of-art for the decision |
| `constitution_constraints` | `ConstitutionConstraints` | Constitution Engine | Hard constraints to filter alternatives |
| `past_decisions` | `ADR[]` | Memory Engine | Previous related decisions for consistency |
| `simulation_results` | `SimulationReport` | Simulation Engine | What-if analysis for top alternatives |

### Outputs

| Output | Type | Destination | Description |
|--------|------|-------------|-------------|
| `adr` | `ADR` | Memory Engine, Docs | Complete Architecture Decision Record |
| `decision_matrix` | `DecisionMatrix` | Requesting agent | Multi-criteria scoring table |
| `recommendation` | `Recommendation` | Orchestrator | Chosen option with confidence and rationale |
| `risk_register_update` | `RiskUpdate` | Planning Engine | Risks introduced by the decision |
| `rejected_alternatives` | `RejectedAlternative[]` | Memory Engine | Discarded options with reasons |

### Key Algorithms & Approaches

- **MCDA Framework:** Analytic Hierarchy Process (AHP) for criterion weighting + TOPSIS for alternative ranking.
- **ADR Template:** Extended Nygard format with: Status, Context, Decision, Alternatives Considered, Consequences, Risks, Review Schedule.
- **Decision Consistency Checking:** New decisions are checked against existing ADRs via semantic similarity to flag potential contradictions.
- **Confidence Calibration:** Monte Carlo simulation over criterion weight uncertainty to compute decision confidence intervals.

### Performance Requirements

| Metric | Target |
|--------|--------|
| ADR generation time | < 2 minutes |
| Decision matrix completeness | 100% criteria coverage |
| ADR consistency check | Before every publication |

### Data Models

```typescript
interface ADR {
  id: string;               // ADR-NNNN format
  title: string;
  status: "proposed" | "accepted" | "deprecated" | "superseded";
  context: string;
  decision: string;
  alternatives_considered: Alternative[];
  consequences: Consequence[];
  risks: Risk[];
  metrics_for_review: string[];
  review_date: ISO8601DateTime;
  supersedes?: string[];    // ADR IDs
  related_adrs: string[];
  author: string;
  created_at: ISO8601DateTime;
}
```

---

## 7. Prompt Engine

### Purpose

The Prompt Engine manages the entire lifecycle of prompts used across Atlas. It dynamically generates, optimizes, versions, and A/B tests prompts for all LLM interactions in the system. Rather than treating prompts as static strings embedded in code, Atlas treats prompts as first-class, versioned artifacts subject to continuous improvement — measured, tested, and deployed like software.

### Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `prompt_request` | `PromptRequest` | Any engine/agent | Request for a prompt with context variables |
| `performance_feedback` | `PromptFeedback` | Any engine/agent | Success/failure signals for prompt improvement |
| `ab_test_assignment` | `ABTestConfig` | Internal | A/B test variant assignment for the request |
| `context_variables` | `ContextVars` | Requesting engine | Dynamic variables to inject into prompt templates |

### Outputs

| Output | Type | Destination | Description |
|--------|------|-------------|-------------|
| `rendered_prompt` | `RenderedPrompt` | Requesting engine | Fully rendered, optimized prompt |
| `prompt_metadata` | `PromptMetadata` | Observability | Version, variant, token count, estimated cost |
| `ab_test_result` | `ABTestResult` | Internal analytics | Performance outcome for variant evaluation |
| `optimization_suggestion` | `OptimizationSuggestion` | Human reviewer | Proposed prompt improvements from analysis |

### Key Algorithms & Approaches

- **Prompt DSL:** Jinja2-based templating with Atlas-specific extensions for memory injection, context sizing, and format enforcement.
- **A/B Testing:** Multi-armed bandit (Thompson Sampling) for online optimization across prompt variants.
- **Prompt Compression:** Token-efficient rewriting using LLMLingua-style compression while preserving semantic intent.
- **Chain-of-Thought Injection:** Automatic CoT prefix injection for reasoning-heavy tasks, calibrated by task complexity score.
- **Version Control:** Git-backed prompt store with semantic versioning, rollback capability, and audit trail.

---

## 8. Skill Engine

### Purpose

The Skill Engine discovers, composes, executes, and learns from reusable agent skills. A "skill" is an encapsulated capability — combining a prompt template, tool configuration, memory access pattern, and execution workflow — that agents can invoke without reimplementing common behaviors. The Skill Engine enables Atlas to accumulate institutional know-how as composable, reusable skill artifacts that improve with each execution.

### Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `skill_request` | `SkillRequest` | Any agent | Request to discover/execute a skill |
| `skill_definition` | `SkillDefinition` | Human/Atlas | New skill registration |
| `execution_trace` | `ExecutionTrace` | Any agent | Post-execution trace for skill learning |
| `composition_request` | `CompositionRequest` | Orchestrator | Request to compose multiple skills |

### Outputs

| Output | Type | Destination | Description |
|--------|------|-------------|-------------|
| `skill_result` | `SkillResult` | Requesting agent | Skill execution output |
| `skill_manifest` | `SkillManifest` | Any agent | Available skills with descriptions |
| `composed_skill` | `ComposedSkill` | Orchestrator | Multi-skill workflow definition |
| `skill_improvement` | `SkillImprovement` | Human reviewer | Learned improvements from execution traces |

### Key Algorithms & Approaches

- **Skill Discovery:** Embedding-based similarity search over skill manifests to find best-matching skill for a request.
- **Skill Composition:** DAG-based skill chaining with automatic dependency resolution and parallel execution where possible.
- **Learning from Traces:** Few-shot example extraction from successful executions appended to skill prompts to improve performance.
- **Skill Versioning:** Immutable skill versions with A/B testing capability via Prompt Engine integration.

---

## 9. MCP Engine

### Purpose

The MCP (Model Context Protocol) Engine manages the complete lifecycle of MCP servers within Atlas — from discovery and registration through routing, health monitoring, and deprecation. It enables Atlas agents to dynamically expand their tool set by connecting to any MCP-compliant server, local or remote, without manual configuration. The engine maintains a live capability map, ensuring agents always have access to the tools best suited for their current task.

### Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `discovery_request` | `MCPDiscoveryRequest` | MCP Discovery Agent | Request to find servers for a capability |
| `registration_request` | `MCPRegistration` | Any source | Manual or auto-discovered server registration |
| `tool_invocation` | `ToolInvocation` | Any agent | Request to invoke a specific MCP tool |
| `health_probe_result` | `HealthProbeResult` | Internal scheduler | Regular health check outcomes |
| `capability_query` | `CapabilityQuery` | Any agent | "What tools can do X?" query |

### Outputs

| Output | Type | Destination | Description |
|--------|------|-------------|-------------|
| `tool_result` | `ToolResult` | Requesting agent | Result from MCP tool invocation |
| `capability_map` | `CapabilityMap` | Any agent | Current available tools and their schemas |
| `server_health_report` | `ServerHealthReport` | Orchestrator | Health status of all registered servers |
| `routing_decision` | `RoutingDecision` | Internal | Which server to route a tool request to |
| `deprecation_alert` | `DeprecationAlert` | Orchestrator | Server marked unhealthy or unavailable |

### Key Algorithms & Approaches

- **Registry-First Discovery:** Checks Atlas MCP Registry (curated), then GitHub search (topic: `mcp-server`), then npm/PyPI for packages matching capability.
- **Capability Matching:** NLP-based matching of natural language capability requests to MCP tool schemas.
- **Circuit Breaker Routing:** Weighted round-robin routing across healthy servers; circuit breaker opens after 3 consecutive failures.
- **Schema Validation:** Every registered server's tool schemas are validated against MCP spec before acceptance.
- **Sandboxed Execution:** Tool invocations run in isolated containers with network egress controls and timeout enforcement.

### Performance Requirements

| Metric | Target |
|--------|--------|
| Tool invocation latency overhead | < 50ms added |
| Health check cycle | Every 30 seconds |
| Discovery response time | < 10 seconds |
| Server registration time | < 5 seconds |
| Capability map freshness | < 60 seconds |

---

## 10. Planning Engine

### Purpose

The Planning Engine translates project blueprints and architecture decisions into executable project plans — sprint plans, epics, user stories, tasks, and milestones — with effort estimation, dependency resolution, critical path analysis, and resource allocation. It bridges the gap between architectural intent and day-to-day execution, maintaining plan fidelity through continuous re-planning as the project evolves.

### Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `blueprint` | `Blueprint` | Blueprint Engine | Source of work decomposition |
| `team_capacity` | `TeamCapacity` | User/Orchestrator | Available developer hours by skill |
| `velocity_history` | `VelocityHistory` | Memory Engine | Historical sprint velocity data |
| `decision_risks` | `RiskRegister` | Decision Engine | Risks to factor into contingency |
| `existing_plan` | `ProjectPlan` | Memory Engine | Current plan for incremental updates |
| `dependency_graph` | `DependencyGraph` | Knowledge Graph Engine | Technical dependencies between components |

### Outputs

| Output | Type | Destination | Description |
|--------|------|-------------|-------------|
| `project_plan` | `ProjectPlan` | All agents | Complete plan with epics, stories, tasks |
| `sprint_backlog` | `SprintBacklog` | Planning Agent | Next sprint's prioritized task list |
| `milestone_schedule` | `MilestoneSchedule` | Orchestrator | Key milestones with dates and owners |
| `critical_path` | `CriticalPath` | Orchestrator | Tasks on the critical path |
| `risk_adjusted_timeline` | `Timeline` | Orchestrator | Monte Carlo–simulated schedule with P50/P80/P95 |
| `effort_estimates` | `EffortEstimate[]` | All | Story point and hour estimates per task |

### Key Algorithms & Approaches

- **Three-Point Estimation:** PERT estimates (O, M, P) for every task; distribution fitting for aggregation.
- **Monte Carlo Scheduling:** 10,000-iteration simulation over task duration distributions to compute schedule percentiles.
- **Critical Path Method (CPM):** Forward/backward pass over task dependency DAG to identify critical path.
- **Priority Scoring:** WSJF (Weighted Shortest Job First) for backlog prioritization: `WSJF = CoD / Job Size`.
- **Velocity Calibration:** Bayesian update of team velocity estimate after each sprint completion.
- **Dependency Resolution:** Topological sort with cycle detection; circular dependencies trigger escalation.

### Performance Requirements

| Metric | Target |
|--------|--------|
| Full plan generation | < 5 minutes |
| Re-planning (incremental) | < 60 seconds |
| Monte Carlo iterations | 10,000 minimum |
| Task decomposition depth | Up to 5 levels |

---

## 11. Simulation Engine

### Purpose

The Simulation Engine enables Atlas to evaluate hypothetical scenarios before committing to them. It models the projected behavior of architectural decisions, deployment configurations, load patterns, and technology choices through a combination of analytical modeling, discrete-event simulation, and LLM-assisted scenario analysis. It is the primary tool for de-risking major decisions before implementation.

### Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `simulation_spec` | `SimulationSpec` | Blueprint/Decision Engine | What to simulate and under what conditions |
| `architecture_model` | `ArchitectureModel` | Blueprint Engine | System topology for simulation |
| `load_profile` | `LoadProfile` | User/Research Engine | Expected traffic and usage patterns |
| `failure_scenarios` | `FailureScenario[]` | Red Team Engine | Failure modes to simulate |
| `historical_data` | `HistoricalData` | Memory Engine | Past performance data for calibration |

### Outputs

| Output | Type | Destination | Description |
|--------|------|-------------|-------------|
| `simulation_report` | `SimulationReport` | Decision Engine | Full simulation results with charts |
| `bottleneck_analysis` | `BottleneckReport` | Blueprint Engine | Identified performance bottlenecks |
| `failure_mode_analysis` | `FMEAReport` | Red Team Engine | Failure mode and effects analysis |
| `capacity_projections` | `CapacityProjection` | Planning Engine | Resource requirements over time |
| `architecture_recommendation` | `Recommendation` | Decision Engine | Data-backed architecture recommendation |

### Key Algorithms & Approaches

- **Queueing Theory Models:** M/M/c, M/G/1 queue models for service latency and throughput analysis.
- **Discrete Event Simulation (DES):** SimPy-based DES for complex multi-component interaction modeling.
- **Chaos Engineering Scenarios:** Pre-defined failure injection patterns (latency, partition, crash) to evaluate resilience.
- **Capacity Modeling:** Linear regression + seasonality decomposition for growth projection.
- **LLM Scenario Generation:** Generates novel failure scenarios beyond pre-defined catalog using adversarial prompting.

---

## 12. Red Team Engine

### Purpose

The Red Team Engine performs systematic adversarial evaluation of Atlas projects from a security-first perspective. It encompasses: OWASP Top 10 analysis, LLM-specific attack simulation (prompt injection, jailbreaks, data exfiltration), dependency vulnerability scanning, secrets detection, infrastructure misconfiguration analysis, and adversarial business logic testing. It operates as a continuous security intelligence layer, not a one-time scan.

### Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `scan_target` | `ScanTarget` | Orchestrator/Red Team Agent | What to evaluate (code, API, LLM interface, infra) |
| `threat_model` | `ThreatModel` | Architecture Agent | System threat model for contextual analysis |
| `constitution_security_rules` | `SecurityRules` | Constitution Engine | Mandatory security invariants to verify |
| `cve_feed` | `CVEFeed` | External (NVD, OSV) | Latest vulnerability data |
| `previous_findings` | `FindingList` | Memory Engine | Past findings for regression testing |

### Outputs

| Output | Type | Destination | Description |
|--------|------|-------------|-------------|
| `red_team_report` | `RedTeamReport` | Audit Engine | Comprehensive findings with CVSS scores |
| `vulnerability_list` | `Vulnerability[]` | Orchestrator | Sorted vulnerability list for remediation |
| `security_baseline_update` | `SecurityBaseline` | Constitution Engine | Updated minimum security requirements |
| `exploit_scenarios` | `ExploitScenario[]` | Simulation Engine | Scenarios for architecture simulation |
| `remediation_plan` | `RemediationPlan` | Planning Engine | Prioritized security remediation tasks |

### Key Algorithms & Approaches

- **LLM Attack Taxonomy:** Implements 50+ prompt injection patterns, jailbreak techniques, and data extraction attacks against any LLM-powered interface in the project.
- **DAST Integration:** Automated dynamic scanning via OWASP ZAP and Nuclei against running services.
- **SAST Pipeline:** AST-based static analysis with Semgrep rule sets (2000+ rules) for vulnerability patterns.
- **Dependency Analysis:** SBOM generation + OSV/NVD cross-reference for known vulnerabilities.
- **CVSS v3.1 Scoring:** Automated base/temporal/environmental score calculation for all findings.
- **Adversarial Business Logic Testing:** LLM-generated test cases targeting business logic bypass scenarios.

### Performance Requirements

| Metric | Target |
|--------|--------|
| SAST scan time (per 100k LoC) | < 5 minutes |
| LLM attack coverage | ≥ 50 attack patterns |
| CVSS score accuracy | ±0.5 vs. manual |
| False positive rate | < 10% |

---

## 13. Audit Engine

### Purpose

The Audit Engine performs comprehensive technical audits of Atlas projects across five dimensions: code quality, architecture conformance, performance benchmarking, security compliance, and documentation completeness. Unlike the Red Team Engine (adversarial focus), the Audit Engine takes a compliance and quality governance perspective, generating structured audit reports against defined standards and tracking remediation progress over time.

### Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `audit_request` | `AuditRequest` | Orchestrator | Trigger with scope and standards to audit against |
| `codebase_snapshot` | `CodebaseSnapshot` | Git | Current state of the codebase |
| `architecture_model` | `ArchitectureModel` | Blueprint Engine | Intended architecture for conformance checking |
| `constitution` | `Constitution` | Constitution Engine | Rules to validate compliance against |
| `previous_audit` | `AuditReport` | Memory Engine | Prior audit for delta reporting |

### Outputs

| Output | Type | Destination | Description |
|--------|------|-------------|-------------|
| `audit_report` | `AuditReport` | Orchestrator, Score Engine | Complete audit findings |
| `compliance_matrix` | `ComplianceMatrix` | Orchestrator | Pass/fail per standard/rule |
| `tech_debt_register` | `TechDebtRegister` | Evolution Engine | Quantified technical debt inventory |
| `architecture_drift_report` | `DriftReport` | Orchestrator | Deviations from intended architecture |
| `remediation_backlog` | `RemediationBacklog` | Planning Engine | Prioritized list of audit findings for fixing |

### Key Algorithms & Approaches

- **Architecture Conformance Checking:** Parses codebase dependency graph and compares against allowed dependency vectors from blueprint.
- **Code Quality Metrics:** Cyclomatic complexity, cognitive complexity, duplication ratio, test coverage, documentation coverage.
- **Technical Debt Quantification:** Squale model–inspired multi-characteristic technical debt scoring with hours-to-fix estimation.
- **Documentation Completeness:** NLP-based coverage analysis of public API surface vs. documented surface.

---

## 14. Score Engine

### Purpose

The Score Engine computes the Atlas Engineering Score — a composite, multi-dimensional quality metric that gives every project a defensible, objective engineering health score. The Engineering Score aggregates signals from code quality, test coverage, security posture, documentation, architecture conformance, velocity, and delivery reliability into a single 0–100 score with dimensional breakdowns. It enables objective project comparison, trend analysis, and continuous improvement target setting.

### Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `audit_report` | `AuditReport` | Audit Engine | Quality and compliance findings |
| `red_team_report` | `RedTeamReport` | Red Team Engine | Security posture |
| `velocity_metrics` | `VelocityMetrics` | Memory Engine | Sprint velocity and delivery reliability |
| `test_coverage` | `CoverageReport` | CI/CD | Code coverage by test type |
| `benchmark_results` | `BenchmarkResults` | Research Engine | Performance vs. industry benchmarks |
| `documentation_score` | `DocScore` | Documentation Agent | Documentation completeness |

### Outputs

| Output | Type | Destination | Description |
|--------|------|-------------|-------------|
| `engineering_score` | `EngineeringScore` | All stakeholders | Final composite score with breakdown |
| `dimension_scores` | `DimensionScore[]` | Orchestrator | Per-dimension scores with trends |
| `score_delta` | `ScoreDelta` | Evolution Engine | Change from previous score |
| `benchmark_comparison` | `BenchmarkComparison` | Orchestrator | Score vs. industry percentile |
| `improvement_targets` | `ImprovementTarget[]` | Evolution Engine | Highest-leverage improvement opportunities |

### Score Dimensions

| Dimension | Weight | Sub-metrics |
|-----------|--------|-------------|
| **Code Quality** | 20% | Cyclomatic complexity, duplication, smell count |
| **Test Robustness** | 20% | Coverage %, mutation score, test types distribution |
| **Security Posture** | 20% | CVSS weighted score, vulnerability count, fix rate |
| **Architecture Health** | 15% | Conformance %, coupling/cohesion metrics |
| **Documentation** | 10% | API coverage, guide completeness, ADR quality |
| **Delivery Performance** | 10% | Velocity stability, lead time, change failure rate |
| **Operational Readiness** | 5% | Observability, runbook coverage, SLO definitions |

### Key Algorithms & Approaches

- **Weighted Composite:** `Score = Σ(dimension_score × weight)` with non-linear normalization to prevent any single dimension from dominating.
- **Percentile Benchmarking:** Compares project scores against Atlas-aggregated project database (anonymized) to compute industry percentile.
- **Trend Detection:** EWMA-based trend detection to distinguish signal from noise in score changes.
- **Sensitivity Analysis:** Identifies which sub-metric improvements yield the largest score gains for prioritized improvement.

---

## 15. Evolution Engine

### Purpose

The Evolution Engine drives Atlas's commitment to continuous improvement. It analyzes project retrospectives, score trends, audit findings, and team feedback to generate specific, actionable improvement recommendations — then tracks their implementation and measures their impact. It manages technical debt as a strategic asset, monitors technology freshness, and ensures the project's architectural fitness improves over time rather than degrading.

### Inputs

| Input | Type | Source | Description |
|-------|------|--------|-------------|
| `score_delta` | `ScoreDelta` | Score Engine | Engineering Score changes |
| `retrospective_notes` | `Retrospective` | User/Planning Agent | Sprint/milestone retrospectives |
| `tech_debt_register` | `TechDebtRegister` | Audit Engine | Current tech debt inventory |
| `research_updates` | `TechRadarDelta` | Research Engine | New technologies relevant to the project |
| `improvement_history` | `ImprovementHistory` | Memory Engine | Past improvements and their outcomes |
| `constitution` | `Constitution` | Constitution Engine | Standards to improve toward |

### Outputs

| Output | Type | Destination | Description |
|--------|------|-------------|-------------|
| `evolution_plan` | `EvolutionPlan` | Orchestrator | Prioritized improvement roadmap |
| `tech_debt_paydown_schedule` | `PaydownSchedule` | Planning Engine | Scheduled debt remediation tasks |
| `technology_upgrade_plan` | `UpgradePlan` | Planning Engine | Dependency and framework upgrade plan |
| `constitution_amendment` | `ConstitutionAmendment` | Constitution Engine | Proposed constitution updates |
| `impact_report` | `ImpactReport` | Orchestrator | Measured impact of implemented improvements |

### Key Algorithms & Approaches

- **Technical Debt Portfolio Analysis:** Treats tech debt as a portfolio of financial options; calculates NPV of fixing each item vs. carrying cost.
- **Technology Lifecycle Tracking:** Monitors each dependency's release cadence, CVE rate, and community health to detect decay.
- **Causal Impact Analysis:** Uses Bayesian structural time series to attribute Engineering Score changes to specific interventions.
- **Retrospective Mining:** NLP analysis of retrospective notes to extract systemic issues and recurring patterns.
- **DORA Metrics Tracking:** Deployment frequency, lead time, change failure rate, MTTR — tracked continuously.

### Performance Requirements

| Metric | Target |
|--------|--------|
| Evolution plan generation | < 3 minutes |
| Impact measurement latency | ≤ 1 sprint cycle |
| Tech debt NPV accuracy | ±20% vs. actual remediation cost |
| Recommendation relevance | > 80% accepted by team |

---

## Cross-Engine Communication Protocol

All engines communicate via the Atlas Event Bus (backed by Apache Kafka with schema registry). Every message adheres to the Atlas CloudEvents envelope:

```json
{
  "specversion": "1.0",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "source": "atlas://engines/research",
  "type": "atlas.research.report.completed",
  "datacontenttype": "application/json",
  "dataschema": "https://atlas.schema/research-report/v1.0",
  "time": "2026-07-06T01:13:47Z",
  "traceparent": "00-...",
  "data": { ... }
}
```

**Synchronous calls** (latency-sensitive): gRPC with protobuf, deadline propagation, and retry with exponential backoff.

**Asynchronous events** (decoupled workflows): Kafka with exactly-once semantics (transactions), schema validation at producer and consumer, dead-letter queue with alert thresholds.

**Shared secrets**: HashiCorp Vault with dynamic secret generation; no static credentials in engine configuration.

---

*This document is the authoritative reference for Atlas Engine architecture. All engine implementations must conform to the specifications herein. Deviations require an ADR and constitution amendment.*
