# Atlas Architecture Patterns Library

> Reference document for architectural patterns used throughout Atlas. When implementing any component, consult this document first.

---

## 1. Multi-Agent Orchestration Patterns

### 1.1 Supervisor Pattern
```
┌─────────────────────────────────────────┐
│           Orchestrator Agent             │
│  (Supervisor — routes, delegates, reviews) │
└──────────┬──────────────────┬────────────┘
           │                  │
    ┌──────▼──────┐    ┌──────▼──────┐
    │  Research   │    │ Blueprint   │
    │   Agent     │    │   Agent     │
    └─────────────┘    └─────────────┘
```
**Use when**: A central coordinator needs to route tasks to specialist agents and review their outputs before proceeding.

**Atlas usage**: Core workflow orchestration, project discovery, blueprint generation.

### 1.2 Parallel Fan-Out Pattern
```
                  ┌──────────────────┐
                  │  Research Agent  │
                  │  (sub-topic A)   │
         ┌────────┴──────────────────┴────────┐
Trigger ─► MapAgent (split)           ReduceAgent (merge)
         └────────┬──────────────────┬────────┘
                  │  Research Agent  │
                  │  (sub-topic B)   │
                  └──────────────────┘
```
**Use when**: A task can be parallelized across multiple agents for speed.

**Atlas usage**: Research Engine (parallel topic research), Red Team (parallel attack vectors).

### 1.3 Sequential Pipeline Pattern
```
Input → AgentA → AgentB → AgentC → Output
         │         │         │
      checkpoint checkpoint checkpoint
```
**Use when**: Tasks have strict dependencies and must execute in order.

**Atlas usage**: Blueprint generation pipeline, audit pipeline.

### 1.4 Feedback Loop Pattern
```
         ┌──────────────────────────────┐
         │                              │
Input → Agent → Evaluator → Pass? ── Yes → Output
                    │
                   No
                    │
              (refine & retry, max N times)
```
**Use when**: Quality must meet a threshold before proceeding.

**Atlas usage**: Code generation (test-driven refinement), Red Team (iterative attack refinement).

---

## 2. Data Architecture Patterns

### 2.1 Hybrid Memory Pattern
```
┌─────────────────────────────────────────────────┐
│                   Memory Engine                  │
├─────────────────┬────────────────┬───────────────┤
│  Episodic       │   Semantic     │  Procedural   │
│  (what happened)│  (what is true)│  (how to do)  │
│                 │                │               │
│  PostgreSQL     │   Neo4j KG     │  Vector DB    │
│  (time-ordered) │   (entities)   │  (skill embed)│
└─────────────────┴────────────────┴───────────────┘
```

### 2.2 CQRS + Event Sourcing Pattern
```
Command Side:                Event Store:          Query Side:
User Action                  Events written         Read Models
   │                         to Kafka               │
   ▼                              │                  │
Command Handler ─────────────────►│◄─────────────────
(validates + emits events)        │    (projections)
                             (immutable log)
```
**Use when**: Write and read patterns differ significantly; full audit trail needed.

**Atlas usage**: All state-changing operations, agent action logging, Engineering Score history.

### 2.3 GraphRAG Pattern
```
Query
  │
  ├─► Vector Search ─► Relevant chunks (fuzzy)
  │                              │
  └─► Graph Traversal ─► Entity subgraph (precise)
                                 │
                    ┌────────────┘
                    │
              Merge & Rank
                    │
                    ▼
            Context for LLM
                    │
                    ▼
               Response
```

---

## 3. API Design Patterns

### 3.1 API Versioning Strategy
```
/api/v1/projects      → Production stable
/api/v2/projects      → New version (during transition)
/api/v1/projects      → Deprecated (but still working)
```
**Rule**: Maintain N-1 versions. Never break consumers without 6-month deprecation notice.

### 3.2 Pagination Standard
```json
{
  "data": [...],
  "pagination": {
    "cursor": "eyJpZCI6MTAwfQ==",
    "hasNextPage": true,
    "hasPreviousPage": false,
    "totalCount": 1523
  }
}
```
**Use cursor-based pagination** (not offset) for consistency and performance.

### 3.3 Error Response Standard
```json
{
  "error": {
    "code": "BLUEPRINT_VALIDATION_FAILED",
    "message": "Blueprint failed schema validation",
    "details": [
      {
        "field": "architecture.databases",
        "message": "At least one database must be specified"
      }
    ],
    "traceId": "01HWXYZ...",
    "timestamp": "2026-07-06T01:00:00Z",
    "docs": "https://docs.atlas.engineering/errors/BLUEPRINT_VALIDATION_FAILED"
  }
}
```

---

## 4. Security Patterns

### 4.1 Zero Trust for Agent Actions
```
Agent Request
     │
     ▼
Authenticate (JWT/service account)
     │
     ▼
Authorize (RBAC check: can this agent perform this action?)
     │
     ▼
Audit Log (record attempt regardless of outcome)
     │
     ▼
Rate Limit (per-agent quotas)
     │
     ▼
Execute (with least-privilege context)
     │
     ▼
Sanitize Output (before returning to next agent)
```

### 4.2 Prompt Injection Defense
```
User Input
     │
     ▼
Input Sanitization (strip injection patterns)
     │
     ▼
Structured Prompt (separate user content from instructions)
     │
     ▼
LLM with Constitutional System Prompt
     │
     ▼
Output Validation (check for instruction leakage)
     │
     ▼
Safe Output
```

### 4.3 MCP Server Sandboxing
```
Atlas Core ──(controlled interface)──► MCP Adapter
                                            │
                                      ┌─────┴─────┐
                                      │ Sandbox   │
                                      │ (no net,  │
                                      │  no fs,   │
                                      │  no exec) │
                                      └───────────┘
                                            │
                                      MCP Server Process
```

---

## 5. Observability Patterns

### 5.1 Distributed Trace for Agent Calls
```
span: api.request
  │
  └─► span: orchestrator.route
        │
        └─► span: research_agent.run
              │
              ├─► span: llm.call (openai/gpt-4o)
              │     attributes: model, tokens_in, tokens_out, cost_usd, latency_ms
              │
              └─► span: vector.search
                    attributes: collection, query_embedding_dim, results_count, latency_ms
```

### 5.2 AI-Specific Metrics
```
# Prometheus metric examples
atlas_llm_requests_total{provider="openai", model="gpt-4o", status="success"} 1523
atlas_llm_token_cost_usd_total{provider="openai", model="gpt-4o"} 4.27
atlas_agent_execution_duration_seconds{agent="research_agent"} 23.4
atlas_blueprint_generation_success_total 89
atlas_engineering_score{project_id="proj_123"} 87.3
atlas_mcp_server_health{server="github-mcp"} 1
```

---

## 6. Resilience Patterns

### 6.1 Circuit Breaker for LLM Calls
```
CLOSED (normal) → failures > threshold → OPEN (fail fast)
                                              │
                                         timeout expires
                                              │
                                         HALF-OPEN (probe)
                                              │
                                    success → CLOSED
                                    failure → OPEN
```

### 6.2 Retry with Exponential Backoff
```
Attempt 1: immediate
Attempt 2: wait 1s   + jitter
Attempt 3: wait 2s   + jitter
Attempt 4: wait 4s   + jitter
Attempt 5: wait 8s   + jitter
Max attempts: 5 (LLM calls), 3 (database), 10 (Kafka)
```

### 6.3 Fallback Chain for LLM Providers
```
Primary: Claude 3.5 Sonnet (Anthropic)
    │ fails?
    ▼
Fallback 1: GPT-4o (OpenAI)
    │ fails?
    ▼
Fallback 2: Gemini 1.5 Pro (Google)
    │ fails?
    ▼
Fallback 3: Llama 3 (Ollama local)
```

---

## 7. Event-Driven Patterns

### 7.1 Domain Events Standard
```
Topic naming: atlas.{domain}.{entity}.{action}
Examples:
  atlas.projects.project.created
  atlas.blueprints.blueprint.generated
  atlas.agents.agent_run.completed
  atlas.score.engineering_score.calculated
  atlas.security.red_team_report.published
```

### 7.2 Outbox Pattern (Reliable Event Publishing)
```
Database Transaction:
  1. Write business data to PostgreSQL
  2. Write event to outbox table (same transaction)
  ↓
Outbox Relay (async):
  3. Read from outbox table
  4. Publish to Kafka
  5. Mark as published
```

---

*This patterns library is a living document. When a new pattern is established, document it here. When a pattern is found to be anti-effective, mark it as deprecated with explanation.*
