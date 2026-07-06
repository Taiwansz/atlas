# RFC-003: Atlas Memory Architecture

**RFC Number:** 003
**Author(s):** Atlas Engineering Team
**Date:** 2026-07-06
**Status:** Final
**Category:** Core

---

## Abstract

This RFC defines the **Atlas Memory System** — the persistent, structured, multi-tier information store that enables Atlas agents to learn from past interactions, accumulate project knowledge, recall procedural patterns, and reason over a rich knowledge graph. The Memory System provides agents with continuity across sessions, context beyond the LLM context window, and institutional project knowledge that grows richer over time. This document specifies the three-tier memory taxonomy, encoding formats, retrieval algorithms, consolidation processes, privacy policies, query APIs, knowledge graph integration, and performance requirements.

---

## Motivation

Large Language Models are stateless by design — each API call starts from a blank slate. In complex, long-lived software projects, this creates a fundamental tension: the work requires deep contextual knowledge accumulated over weeks and months, but the AI backend resets on every invocation.

The Atlas Memory System solves this by maintaining:

1. **Project continuity**: Agents "remember" previous decisions, discussions, and code patterns
2. **Knowledge accumulation**: Every interaction enriches the project's knowledge base
3. **Cross-agent coordination**: Agents share memory namespaces, enabling collaborative reasoning
4. **Institutional memory**: Project history, rationale, and lessons learned persist indefinitely

### Goals

- Define a three-tier memory taxonomy with clear semantics for each tier
- Specify encoding formats optimized for LLM retrieval
- Define retrieval algorithms that maximize relevance while respecting token budgets
- Establish memory consolidation processes that distill episodic memories into semantic knowledge
- Enforce privacy, retention, and access control policies
- Define the Memory Query API with sufficient expressiveness for complex agent needs
- Specify Knowledge Graph integration for relational reasoning
- Define performance SLAs for all memory operations

### Non-Goals

- Defining specific vector database implementations (Atlas abstracts over providers)
- Specifying LLM fine-tuning procedures based on memory content
- Replacing agent context windows with memory (memory supplements, not replaces)

---

## Specification

### 4.1 Three-Tier Memory Taxonomy

```
┌─────────────────────────────────────────────────────────────────┐
│                    ATLAS MEMORY SYSTEM                          │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌───────────────┐  │
│  │    EPISODIC      │  │    SEMANTIC      │  │  PROCEDURAL   │  │
│  │    MEMORY        │  │    MEMORY        │  │    MEMORY     │  │
│  │                  │  │                  │  │               │  │
│  │ • Interactions   │  │ • Facts          │  │ • Workflows   │  │
│  │ • Decisions      │  │ • Concepts       │  │ • Patterns    │  │
│  │ • Events         │  │ • Relationships  │  │ • Algorithms  │  │
│  │ • Conversations  │  │ • Ontologies     │  │ • Templates   │  │
│  │                  │  │                  │  │               │  │
│  │ Retention: 90d   │  │ Retention: ∞     │  │ Retention: ∞  │  │
│  │ Decay: Yes       │  │ Decay: No        │  │ Decay: No     │  │
│  │ Consolidation:↓  │  │                  │  │               │  │
│  └────────┬─────────┘  └────────▲─────────┘  └───────────────┘  │
│           │                     │                                │
│           └─────── Consolidation Pipeline ──────────────────────┘
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   KNOWLEDGE GRAPH                        │   │
│  │  (Entity-Relationship store spanning all memory tiers)   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

#### 4.1.1 Episodic Memory

**Definition**: Time-stamped records of specific events, interactions, and decisions that occurred during project development.

**Characteristics:**
- Temporally ordered
- Tied to specific agents, sessions, and timestamps
- Subject to decay (relevance diminishes over time)
- Eligible for consolidation into Semantic memory
- Retained for up to 90 days by default (configurable)

**Content types:**
| Type | Description | Example |
|------|-------------|---------|
| `agent-interaction` | Complete agent session with input/output | "Architect agent discussed API gateway options on 2026-05-12" |
| `decision` | Recorded architectural or product decision | "Chose PostgreSQL over MongoDB for user data — Jan 2026" |
| `code-event` | Notable code change or refactor | "Migrated auth module from JWT to Paseto on commit abc123" |
| `review-event` | Code review feedback and resolution | "Security agent flagged SQL injection in search.py — fixed in v2" |
| `incident` | Operational incident and post-mortem | "2026-03-15 database failover — RCA: connection pool exhaustion" |
| `conversation` | Human-agent dialogue | "User clarified that users should be able to export their data as CSV" |

#### 4.1.2 Semantic Memory

**Definition**: Distilled, structured knowledge about the project domain, technology, and organizational context. Semantic memories are facts, concepts, and relationships extracted and validated from episodic events.

**Characteristics:**
- Not tied to specific time or event
- Validated and de-duplicated before storage
- Persistent (no decay, no default retention limit)
- Organized by ontology and knowledge graph relationships
- Queryable by concept, entity, and relationship

**Content types:**
| Type | Description |
|------|-------------|
| `domain-concept` | Business domain concept with definition |
| `technology-fact` | Fact about a technology choice or constraint |
| `architectural-principle` | Design principle adopted by the project |
| `code-pattern` | Recurring code pattern with rationale |
| `team-preference` | Team coding or process preference |
| `glossary-term` | Project-specific term definition |
| `dependency-fact` | Known behavior, version constraint, or limitation of a dependency |

#### 4.1.3 Procedural Memory

**Definition**: Step-by-step processes, workflows, algorithms, and templates that agents can recall and apply when performing routine tasks.

**Characteristics:**
- Executable or directly applicable
- Versioned (procedures evolve as better methods are discovered)
- Reusable across projects (with namespace isolation)
- Validated through execution feedback

**Content types:**
| Type | Description |
|------|-------------|
| `workflow` | Multi-step process (e.g., "deploy to staging") |
| `algorithm` | Specific computational procedure |
| `template` | Reusable code or document template |
| `runbook` | Operational procedure for incident response |
| `test-pattern` | Pattern for testing a specific type of component |
| `code-recipe` | Specific coding pattern for a recurring problem |

---

### 4.2 Memory Encoding Formats

All memories are stored in a unified **Memory Record** envelope with tier-specific payload:

#### 4.2.1 Universal Memory Record Schema

```json
{
  "$schema": "https://atlas.engineering/schemas/memory-record/v1.json",
  "type": "object",
  "required": ["id", "tier", "namespace", "created_at", "content", "embedding"],
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "Globally unique memory record identifier"
    },
    "tier": {
      "type": "string",
      "enum": ["episodic", "semantic", "procedural"]
    },
    "namespace": {
      "type": "string",
      "pattern": "^[a-z0-9-]+(/[a-z0-9-]+)*$",
      "description": "Hierarchical namespace: 'project-id/component/topic'"
    },
    "content_type": {
      "type": "string",
      "description": "Tier-specific content type (e.g., 'decision', 'domain-concept', 'workflow')"
    },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" },
    "expires_at": { "type": "string", "format": "date-time", "description": "Null = no expiry" },
    "source": {
      "type": "object",
      "properties": {
        "agent_id": { "type": "string" },
        "session_id": { "type": "string" },
        "commit_sha": { "type": "string" },
        "artifact_ref": { "type": "string" }
      }
    },
    "content": {
      "type": "object",
      "description": "Tier-specific content payload"
    },
    "summary": {
      "type": "string",
      "maxLength": 512,
      "description": "Token-efficient summary for context injection"
    },
    "embedding": {
      "type": "object",
      "properties": {
        "model": { "type": "string" },
        "vector": { "type": "array", "items": { "type": "number" } },
        "dimensions": { "type": "integer" }
      }
    },
    "metadata": {
      "type": "object",
      "properties": {
        "importance": { "type": "number", "minimum": 0, "maximum": 1 },
        "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
        "access_count": { "type": "integer" },
        "last_accessed_at": { "type": "string", "format": "date-time" },
        "tags": { "type": "array", "items": { "type": "string" } },
        "relations": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "record_id": { "type": "string", "format": "uuid" },
              "relation_type": { "type": "string" }
            }
          }
        }
      }
    },
    "access_control": {
      "type": "object",
      "properties": {
        "read_agents": {
          "oneOf": [
            { "type": "string", "enum": ["all"] },
            { "type": "array", "items": { "type": "string" } }
          ]
        },
        "write_agents": {
          "oneOf": [
            { "type": "string", "enum": ["all"] },
            { "type": "array", "items": { "type": "string" } }
          ]
        },
        "classification": {
          "type": "string",
          "enum": ["public", "internal", "confidential", "restricted"]
        }
      }
    }
  }
}
```

#### 4.2.2 Episodic Memory Content Payload

```json
{
  "content": {
    "type": "decision",
    "title": "Database Engine Selection",
    "context": "Evaluating storage options for user profile data with >10M records",
    "decision": "Use PostgreSQL 16 with JSONB columns for flexible profile attributes",
    "alternatives_considered": [
      { "option": "MongoDB", "rejected_reason": "Team has stronger PostgreSQL expertise; ACID requirements" },
      { "option": "DynamoDB", "rejected_reason": "Vendor lock-in risk; complex query patterns better served by SQL" }
    ],
    "stakeholders": ["backend-agent", "architect-agent", "cto"],
    "confidence": 0.92,
    "revisit_trigger": "If profile schema complexity exceeds 50 attributes or query latency exceeds 50ms p95"
  }
}
```

#### 4.2.3 Semantic Memory Content Payload

```json
{
  "content": {
    "type": "domain-concept",
    "term": "Subscription Grace Period",
    "definition": "A 7-day period after subscription expiry during which users retain full access while payment retry is attempted",
    "related_concepts": ["subscription", "payment-retry", "access-control"],
    "business_rules": [
      "Grace period begins at UTC midnight of expiry date",
      "Maximum 3 payment retry attempts during grace period",
      "User receives email notifications at day 0, day 3, and day 6"
    ],
    "code_references": ["src/billing/subscription.py:SubscriptionGracePeriod", "src/auth/access.py:check_grace_period"]
  }
}
```

#### 4.2.4 Procedural Memory Content Payload

```json
{
  "content": {
    "type": "workflow",
    "name": "Database Migration Deployment",
    "description": "Procedure for safely deploying database schema migrations to production",
    "prerequisites": ["Migration tested in staging", "Backup taken within 24h", "Rollback script prepared"],
    "steps": [
      { "step": 1, "action": "Enable maintenance mode on affected services", "tool": "kubectl", "command": "kubectl scale deployment api --replicas=0" },
      { "step": 2, "action": "Verify all in-flight transactions complete", "wait_seconds": 30 },
      { "step": 3, "action": "Execute migration", "tool": "alembic", "command": "alembic upgrade head" },
      { "step": 4, "action": "Validate migration success", "tool": "psql", "command": "SELECT version_num FROM alembic_version;" },
      { "step": 5, "action": "Scale services back up", "tool": "kubectl", "command": "kubectl scale deployment api --replicas=3" },
      { "step": 6, "action": "Monitor error rates for 5 minutes", "success_criteria": "error_rate < 0.1%" }
    ],
    "rollback_procedure": "Execute 'alembic downgrade -1' then restore backup if data corruption detected",
    "success_rate": 0.98,
    "avg_duration_minutes": 12,
    "last_used_at": "2026-07-01T14:00:00Z"
  }
}
```

---

### 4.3 Memory Retrieval Algorithms

Atlas uses a **multi-strategy retrieval** approach that combines several techniques:

#### 4.3.1 Retrieval Strategy Matrix

| Query Type | Primary Strategy | Secondary Strategy | Fusion Method |
|-----------|-----------------|-------------------|--------------|
| Conceptual query | Dense vector search | Knowledge graph traversal | RRF |
| Keyword query | BM25 full-text search | Dense vector search | RRF |
| Temporal query | Time-range filter + relevance | BM25 | Weighted sum |
| Agent-specific | Namespace filter + dense | BM25 | Weighted sum |
| Relational query | Knowledge graph traversal | Dense vector search | Graph-first |

**RRF = Reciprocal Rank Fusion**

#### 4.3.2 Dense Vector Search

All memory records are embedded using the configured embedding model. Retrieval uses approximate nearest neighbor (ANN) search:

```
Algorithm: HNSW (Hierarchical Navigable Small World)
Distance metric: Cosine similarity
ef_search: 128 (configurable)
top_k: configurable (default: 20 candidates before re-ranking)
```

**Embedding models supported:**
- `text-embedding-3-large` (OpenAI) — 3072 dimensions
- `text-embedding-3-small` (OpenAI) — 1536 dimensions
- `embed-english-v3.0` (Cohere) — 1024 dimensions
- `models/text-embedding-004` (Google) — 768 dimensions
- Custom models via provider abstraction

#### 4.3.3 BM25 Full-Text Search

For keyword-heavy queries (code symbols, error messages, version strings), BM25 provides higher precision than dense search:

```
BM25 Parameters:
  k1: 1.5  (term frequency saturation)
  b:  0.75  (document length normalization)
Index fields: summary, content.title, content.definition, tags
```

#### 4.3.4 Reciprocal Rank Fusion

Dense and BM25 results are fused using RRF to produce a single ranked list:

```python
def reciprocal_rank_fusion(
    dense_results: list[MemoryRecord],
    bm25_results: list[MemoryRecord],
    k: int = 60
) -> list[tuple[MemoryRecord, float]]:
    """
    Fuse two ranked lists using Reciprocal Rank Fusion.
    k=60 is empirically proven to work well across domains.
    """
    scores: dict[str, float] = {}
    record_map: dict[str, MemoryRecord] = {}

    for rank, record in enumerate(dense_results):
        scores[record.id] = scores.get(record.id, 0) + 1.0 / (k + rank + 1)
        record_map[record.id] = record

    for rank, record in enumerate(bm25_results):
        scores[record.id] = scores.get(record.id, 0) + 1.0 / (k + rank + 1)
        record_map[record.id] = record

    return sorted(
        [(record_map[id], score) for id, score in scores.items()],
        key=lambda x: x[1],
        reverse=True
    )
```

#### 4.3.5 Temporal Decay Factor

For episodic memories, a time-based decay factor adjusts scores:

```
decay(memory) = base_score × e^(-λ × age_days)

where:
  λ (decay rate) = 0.02 for standard memories
  λ = 0.005 for decisions (slower decay — decisions remain relevant longer)
  λ = 0.05 for conversations (faster decay — conversations become stale quickly)
```

#### 4.3.6 Re-ranking

After fusion, the top-k candidates are re-ranked using a cross-encoder model:

```
Input to cross-encoder: (query_text, memory_summary)
Output: relevance_score ∈ [0, 1]
Model: cross-encoder/ms-marco-MiniLM-L-6-v2 or equivalent
Final top-n: configurable (default: 5 for context injection)
```

---

### 4.4 Memory Consolidation Process

Consolidation runs as a scheduled background job that promotes episodic memories into semantic knowledge:

```
Consolidation Pipeline:

1. SELECT episodic memories WHERE:
   - age > 24 hours
   - access_count > 2 OR importance > 0.7
   - NOT already_consolidated

2. Cluster by semantic similarity (DBSCAN, ε=0.2, min_samples=3)

3. For each cluster:
   a. Extract key facts using structured extraction LLM
   b. Validate facts against existing Semantic memory (dedup)
   c. Merge with existing Semantic record if contradiction_score < 0.3
   d. Create new Semantic record if no match found
   e. Update Knowledge Graph with extracted entities and relations

4. Mark episodic memories as consolidated
   (retain originals until expiry for audit purposes)

5. Emit consolidation report to Memory Monitor
```

**Consolidation Schedule:**
- Default: nightly at 02:00 UTC
- Trigger-based: immediately when episodic memory count for a namespace exceeds 1000
- Manual: `atlas memory consolidate --namespace <ns>`

---

### 4.5 Memory Privacy and Retention Policies

#### 4.5.1 Data Classification

| Classification | Description | Access | Retention |
|---------------|-------------|--------|----------|
| `public` | General project knowledge | All agents | Indefinite |
| `internal` | Team-specific knowledge | Project agents | 2 years |
| `confidential` | Sensitive business information | Named agents only | 1 year |
| `restricted` | PII, secrets references | Orchestrator only | 90 days |

#### 4.5.2 PII Handling

Memory records containing PII must:
1. Be classified `restricted`
2. Have PII automatically redacted from embeddings and summaries
3. Be stored encrypted at rest with AES-256
4. Have access logs audited monthly
5. Be subject to right-to-erasure workflows

#### 4.5.3 Retention Configuration

```yaml
# Per-namespace retention policy
memory:
  namespaces:
    - pattern: "*/conversations"
      tier: episodic
      retention_days: 30
    - pattern: "*/decisions"
      tier: episodic
      retention_days: 365
    - pattern: "*/pii"
      tier: episodic
      retention_days: 90
      encryption_required: true
    - pattern: "*/semantic/*"
      tier: semantic
      retention_days: null  # indefinite
```

#### 4.5.4 Data Deletion

```bash
# Delete all memories in a namespace
atlas memory delete --namespace "project-id/conversations" --before "2026-01-01"

# Right-to-erasure: delete all memories referencing a user ID
atlas memory purge-user --user-id "user-abc123" --confirm

# Export memories for GDPR data portability
atlas memory export --namespace "project-id" --format jsonl
```

---

### 4.6 Memory Search and Query API

#### 4.6.1 REST API

```
Base URL: /api/v1/memory
Authentication: Bearer token (agent auth)
```

**Endpoints:**

```yaml
# Store a memory record
POST /api/v1/memory/records
Content-Type: application/json
Body: MemoryRecord (without id, created_at, embedding — auto-generated)
Response: { id: uuid, embedding_model: string, created_at: datetime }

# Retrieve a specific record
GET /api/v1/memory/records/{id}
Response: MemoryRecord

# Search memories
POST /api/v1/memory/search
Body:
  query: string            # Natural language query
  namespaces: string[]     # Restrict to namespaces
  tiers: string[]          # Filter by tier
  content_types: string[]  # Filter by content type
  top_k: integer           # Max results (default: 10)
  min_score: number        # Minimum relevance score (0-1)
  since: datetime          # Temporal filter (episodic)
  include_expired: boolean # Include past-expiry records
Response: { results: Array<{ record: MemoryRecord, score: float }> }

# Semantic similarity search
POST /api/v1/memory/similar
Body:
  record_id: uuid         # Find similar to this record
  top_k: integer
  tier_filter: string
Response: { results: Array<{ record: MemoryRecord, similarity: float }> }

# Update memory record
PATCH /api/v1/memory/records/{id}
Body: Partial<MemoryRecord> (only content, metadata, access_control updatable)

# Delete memory record
DELETE /api/v1/memory/records/{id}

# List namespaces
GET /api/v1/memory/namespaces
Response: { namespaces: Array<{ path: string, record_count: int, size_bytes: int }> }

# Get memory statistics
GET /api/v1/memory/stats
Response: { total_records: int, by_tier: object, by_namespace: object, embedding_model: string }
```

#### 4.6.2 Memory Query Language (MQL)

For complex queries, Atlas provides MQL — a structured query language:

```
# Find all decisions made in the last 30 days with high confidence
SEARCH tier:episodic content_type:decision confidence:>0.8 since:30d

# Find semantic memories related to authentication
SEARCH tier:semantic NEAR("authentication", "JWT", "session management") top:5

# Find procedural memories for a specific workflow category
SEARCH tier:procedural content_type:workflow tags:database top:3

# Knowledge graph query — find concepts related to "payment"
GRAPH RELATED TO concept:"payment" DEPTH 2 RELATION_TYPES:["relates-to", "implements", "depends-on"]

# Combined query: recent decisions affecting the auth module
SEARCH tier:episodic content_type:decision code_references:CONTAINS("auth") since:90d ORDER BY importance DESC
```

#### 4.6.3 Programmatic SDK

```python
from atlas.memory import MemoryClient, SearchQuery, Tier

client = MemoryClient(agent_id="backend-agent", namespace="project-abc")

# Store a memory
record_id = await client.store(
    tier=Tier.SEMANTIC,
    content_type="domain-concept",
    content={
        "term": "Order Saga",
        "definition": "Distributed transaction pattern managing order lifecycle across services"
    },
    summary="Order Saga: distributed transaction pattern for order lifecycle",
    tags=["patterns", "distributed-systems", "orders"]
)

# Search memories
results = await client.search(
    query="How does the payment retry mechanism work?",
    tiers=[Tier.EPISODIC, Tier.SEMANTIC],
    top_k=5
)

for result in results:
    print(f"[{result.score:.3f}] {result.record.summary}")

# Recall procedural memory
workflow = await client.recall_procedure("database migration")
if workflow:
    for step in workflow.content["steps"]:
        print(f"Step {step['step']}: {step['action']}")
```

---

### 4.7 Knowledge Graph Integration

The Knowledge Graph provides relational structure over all memory tiers.

#### 4.7.1 Graph Schema

```
Nodes:
  - Entity (id, type, label, namespace, attributes)
    Types: Component, Concept, Person, Technology, Requirement, Decision, Pattern

Edges:
  - Relation (from_id, to_id, type, weight, metadata)
    Types:
      depends_on, implements, relates_to, supersedes, violates,
      decided_by, authored_by, references, conflicts_with, resolves
```

#### 4.7.2 Automatic Graph Population

Atlas agents automatically extract entities and relations from memory content:

```
New MemoryRecord stored
        │
        ▼
Entity Extraction (NER + structured extraction)
        │
        ▼
Relation Extraction (dependency analysis)
        │
        ▼
Graph Update (upsert nodes, create edges)
        │
        ▼
Conflict Detection (find contradicting relations)
        │
        ▼
Conflict Resolution (escalate if contradiction found)
```

#### 4.7.3 Graph Query Examples

```cypher
// Find all components that depend on the auth service
MATCH (c:Component)-[:depends_on]->(auth:Component {label: "auth-service"})
RETURN c.label, c.type

// Find decisions that conflict with current architecture
MATCH (d:Decision)-[:conflicts_with]->(a:Component)
WHERE d.created_at > datetime("2026-01-01")
RETURN d, a

// Trace the origin of a design pattern
MATCH path = (p:Pattern {label: "CQRS"})-[:implements|relates_to*1..3]->(c:Concept)
RETURN path
```

---

### 4.8 Performance Requirements

| Operation | SLA (p50) | SLA (p99) | Notes |
|-----------|-----------|-----------|-------|
| Memory record write | < 50ms | < 200ms | Includes embedding generation |
| Embedding generation | < 30ms | < 150ms | Cached for identical content |
| Dense vector search | < 20ms | < 80ms | Top-100 ANN search |
| BM25 search | < 10ms | < 40ms | Full-text index lookup |
| RRF fusion | < 5ms | < 20ms | In-memory merge |
| Cross-encoder rerank | < 100ms | < 400ms | Top-20 to top-5 |
| **End-to-end search** | **< 200ms** | **< 700ms** | Full retrieval pipeline |
| Consolidation (1000 records) | < 5 minutes | < 15 minutes | Background job |
| Knowledge graph write | < 30ms | < 100ms | Graph DB upsert |
| Knowledge graph traversal (depth 3) | < 50ms | < 200ms | AQL/Cypher query |

**Scalability Targets:**
- Memory records per project: up to 10 million
- Namespaces per project: up to 1000
- Concurrent search queries: up to 100 RPS per project
- Embedding vector store: supports up to 10B vectors with sharding

---

### 4.9 Memory System Architecture

```
                    ┌─────────────────────────────────────┐
                    │          Atlas Memory API            │
                    │  REST /api/v1/memory  |  gRPC        │
                    └──────────────┬──────────────────────┘
                                   │
                    ┌──────────────▼──────────────────────┐
                    │        Memory Router                  │
                    │  (namespace auth, tier routing)       │
                    └──┬───────────┬────────────┬──────────┘
                       │           │            │
              ┌────────▼──┐  ┌─────▼──────┐  ┌─▼────────────┐
              │ Episodic  │  │  Semantic  │  │  Procedural  │
              │  Store    │  │   Store    │  │    Store     │
              │ (Qdrant)  │  │ (Qdrant)  │  │  (Qdrant)   │
              └────┬──────┘  └─────┬──────┘  └──────┬───────┘
                   │               │                 │
              ┌────▼───────────────▼─────────────────▼───────┐
              │          BM25 Full-Text Index (Meilisearch)   │
              └────────────────────┬──────────────────────────┘
                                   │
              ┌────────────────────▼──────────────────────────┐
              │          Knowledge Graph (ArangoDB)            │
              └────────────────────┬──────────────────────────┘
                                   │
              ┌────────────────────▼──────────────────────────┐
              │          Consolidation Worker                  │
              │  (nightly job + trigger-based)                │
              └───────────────────────────────────────────────┘
```

---

## Rationale

### Why three memory tiers instead of a flat store?

Different types of knowledge have fundamentally different lifecycle, decay properties, and query patterns. A flat store would require all retrieval queries to handle the full heterogeneity of memory content, reducing precision. Three tiers allow specialized storage, indexing, and retrieval strategies optimized per tier.

### Why Reciprocal Rank Fusion over learned fusion models?

RRF requires no training data, is parameter-free (except the k constant which is empirically stable), and degrades gracefully. Learned fusion models introduce training data requirements, potential distribution shift, and additional inference latency. RRF is empirically competitive with learned fusion for most retrieval tasks.

### Why consolidation vs. direct semantic storage?

Requiring agents to directly write semantic memories would require agents to correctly classify and structure knowledge — an error-prone process. Episodic memories are easy for agents to write (just log what happened), and the consolidation pipeline applies structured extraction with validation, producing higher-quality semantic memories.

---

## Backwards Compatibility

- Memory Record schema v1 supported through Atlas OS 2.x
- `embedding.vector` dimensions are model-specific; re-indexing required when changing embedding models
- The `atlas memory reindex` command handles embedding model migrations
- Namespace paths are stable identifiers — renaming a namespace creates a redirect

---

## Security Considerations

1. **Agent Namespace Isolation**: Agents can only read/write namespaces listed in their `memory_namespaces` Blueprint config.
2. **Embedding Privacy**: Embeddings encode semantic content; they must not be returned to clients who lack read access to the source record.
3. **Injection Prevention**: User-provided content used as memory queries is sanitized to prevent prompt injection via retrieved memory.
4. **Encryption at Rest**: All memory stores are encrypted at rest with AES-256.
5. **Audit Logging**: All memory writes and reads are logged with agent identity, timestamp, and namespace.
6. **PII Scrubbing**: Automatic PII detection before embedding generation prevents sensitive data from being encoded in vectors.

---

## Implementation Plan

### Phase 1: Core Storage (Weeks 1–6)
- [ ] Memory Record schema implementation and validation
- [ ] Episodic memory store (Qdrant)
- [ ] Basic REST API (write/read/delete)
- [ ] BM25 indexing integration

### Phase 2: Retrieval Pipeline (Weeks 7–12)
- [ ] Dense vector search
- [ ] RRF fusion implementation
- [ ] Cross-encoder re-ranking
- [ ] Temporal decay factors
- [ ] Memory Query Language parser

### Phase 3: Semantic + Procedural Tiers (Weeks 13–18)
- [ ] Semantic memory store
- [ ] Procedural memory store
- [ ] Consolidation pipeline
- [ ] Knowledge graph integration (ArangoDB)
- [ ] Automatic entity/relation extraction

### Phase 4: Privacy and Operations (Weeks 19–22)
- [ ] PII detection and scrubbing
- [ ] Retention policy enforcement
- [ ] Right-to-erasure workflow
- [ ] Performance profiling and optimization

---

## Open Questions

1. **Shared semantic memory across projects**: Should an organization maintain a shared Semantic memory pool across projects (for shared domain knowledge)? Deferred to v2.
2. **Memory conflict resolution**: When two agents store contradicting semantic facts, who wins? Current resolution: higher-confidence record wins, conflict logged for human review.
3. **Memory size limits**: Should individual memory records have maximum content size? Current: 64KB content limit with reference pointers to larger artifacts.

---

## References

- [RFC-001: Atlas Blueprint Specification](./RFC-001-blueprint-specification.md)
- [RFC-006: Agent Communication Protocol](./RFC-006-agent-communication-protocol.md)
- [Retrieval-Augmented Generation (Lewis et al., 2020)](https://arxiv.org/abs/2005.11401)
- [Reciprocal Rank Fusion (Cormack et al., 2009)](https://dl.acm.org/doi/10.1145/1571941.1572114)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [ArangoDB Multi-Model Database](https://arangodb.com/documentation/)
- [Episodic Memory in AI Systems (Survey, 2024)](https://arxiv.org/abs/2404.00928)
