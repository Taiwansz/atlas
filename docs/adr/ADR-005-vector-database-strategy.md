# ADR-005: Hybrid Vector Storage Strategy — pgvector + Qdrant

**Date:** 2026-07-06
**Status:** Accepted
**Deciders:** Atlas Architecture Council
**Technical Area:** Data Architecture / Semantic Search / RAG

---

## Context and Problem Statement

Atlas relies heavily on semantic similarity search as the backbone of its intelligent retrieval systems. Every major Atlas capability — Requirement Discovery (finding related prior requirements), Blueprint Generation (retrieving similar architecture decisions), Constitution Creation (semantic search over compliance rules), Engineering Score (comparing code patterns to quality benchmarks), and Red Team Evaluation (finding similar vulnerability patterns) — depends on the ability to store and query high-dimensional vector embeddings efficiently.

Vector embeddings are numerical representations of semantic meaning: a text chunk, code snippet, diagram description, or requirement statement is transformed into a 768-3072 dimensional float vector by an embedding model. Semantic similarity is computed as cosine distance between these vectors. Finding the top-K most semantically similar items to a query vector (Approximate Nearest Neighbor, ANN, search) is the core operation.

Atlas must manage multiple embedding spaces:
- **Requirement embeddings**: ~100K-1M vectors at enterprise scale, 1536 dimensions (OpenAI text-embedding-3-small)
- **Code chunk embeddings**: ~1M-10M vectors, representing indexed codebase chunks for code search
- **Document embeddings**: ADR content, Blueprint sections, Constitution clauses — ~50K-500K vectors
- **Knowledge graph node embeddings**: Stored directly in Neo4j (ADR-004) for graph-hybrid queries
- **Pattern library embeddings**: Known architecture patterns, anti-patterns, and code smells — ~10K-100K vectors

The challenge is balancing **operational simplicity** (fewer databases to operate) against **performance at scale** (purpose-built vector indexes vs. extension-based). A single vector database cannot optimally serve all use cases: some require tight integration with relational metadata (filter-first, then ANN), while others require high-throughput pure ANN search at scale.

---

## Decision Drivers

- **Hybrid search performance**: Must support filter-then-vector and vector-then-filter query patterns efficiently
- **Operational simplicity**: Minimize the number of distinct database systems to operate and monitor
- **Scalability**: Must handle 10M+ vectors without performance degradation (p99 ANN latency < 50ms)
- **Integration with PostgreSQL**: Some vector workloads benefit from co-location with relational metadata
- **Advanced indexing**: HNSW and IVF-Flat index support with tunable accuracy/performance trade-offs
- **Multi-tenancy**: Vectors must be namespace-isolated per customer project (single Atlas instance serves multiple customers)
- **Sparse + dense hybrid search**: Support for BM25-style sparse vector search combined with dense ANN — critical for code search where keyword matching and semantic similarity must be combined
- **Payload filtering**: Rich metadata filtering (by project, date, document type, author) combined with ANN search
- **Kubernetes deployment**: Self-hostable without managed cloud service dependency
- **Batch ingestion throughput**: Indexing large codebases (1M+ chunks) must complete in < 1 hour

---

## Considered Options

### Option 1: pgvector (PostgreSQL Extension) — Standalone

**Overview:** pgvector is a PostgreSQL extension that adds vector data types (`vector(n)`) and index types (HNSW, IVF-Flat) to PostgreSQL. Vector similarity queries use standard SQL operators (`<=>`, `<->`, `<#>`).

**Strengths:**
- **Zero new infrastructure**: pgvector runs inside the existing PostgreSQL instance (ADR-006). No additional database service to deploy, monitor, or backup.
- **SQL joins**: Vector similarity results can be directly joined with relational metadata in the same query — no application-layer join needed.
- **ACID transactions**: Vector inserts are transactional with relational data — insert a document and its embedding atomically.
- **Filtering**: PostgreSQL's full WHERE clause (indexes, partial indexes, expression indexes) applies to pre-filtering before vector search.
- **pgvector HNSW index**: pgvector 0.5.0+ includes HNSW index support with tunable `m` and `ef_construction` parameters. For datasets up to ~5M vectors, performance is competitive.
- **Operational simplicity**: One database to backup, one connection pool to manage, one monitoring dashboard.

**Weaknesses:**
- **Scale ceiling**: pgvector's ANN performance degrades at 5M+ vectors. HNSW index build time becomes prohibitive (hours for 10M+ vectors). Partitioning required for scale, adding complexity.
- **No sparse+dense hybrid**: pgvector handles dense vectors only. Sparse vector (BM25-style) hybrid search requires a separate full-text search system (e.g., pg_trgm + tsvector).
- **Single machine**: PostgreSQL (and thus pgvector) is not horizontally scalable for write-heavy workloads. Sharding vectors requires application-level routing.
- **No native payload indexing for vectors**: Filtering by metadata before or after ANN requires careful index design to avoid full-table scans on the vector space.
- **No multi-tenancy isolation**: All vectors live in shared tables — row-level security or table-per-tenant required for isolation.
- **Memory consumption**: HNSW indexes are held in memory for fast search. A 1M-vector HNSW index at 1536 dimensions consumes ~6-12GB RAM — shared with PostgreSQL's buffer pool.

---

### Option 2: Qdrant — Standalone

**Overview:** Qdrant is an open-source vector database written in Rust, designed for high-performance ANN search with rich filtering. It supports HNSW indexing, payload filtering, sparse vectors, and multi-vector queries.

**Strengths:**
- **Performance**: Written in Rust, Qdrant's HNSW implementation is highly optimized. ANN search at 1M+ vectors with filtering achieves p99 < 10ms.
- **Sparse + dense hybrid**: Native support for combining dense vector search with sparse BM25-style vectors in a single query — essential for code search.
- **Rich payload filtering**: Queries can filter by any payload field (project_id, document_type, date range, author) before or after ANN — using purpose-built payload indexes.
- **Collections**: Each vector collection is a namespace. Multi-tenancy is implemented as separate collections or payload-filtered partitions.
- **Horizontal scaling**: Qdrant supports distributed mode — sharding collections across multiple nodes for horizontal write and read scaling.
- **Quantization**: Scalar and product quantization reduce memory footprint by 4-16x with controlled accuracy trade-off.
- **Named vectors**: A single point can have multiple named vectors (e.g., `title_vector` and `content_vector`), supporting multi-vector retrieval without separate collections.
- **Kubernetes operator**: Official Qdrant Kubernetes operator with StatefulSet deployment and persistent volume support.
- **REST and gRPC APIs**: Well-documented REST API and high-performance gRPC API for batch operations.
- **On-disk indexing**: For cold data, Qdrant can store vectors on disk (SSD) with configurable in-memory/on-disk ratio.

**Weaknesses:**
- **Additional service**: One more database to deploy, monitor, backup, and update. Adds to operational burden.
- **No SQL joins**: Fetching vector results and joining with relational metadata (user info, project details) requires an application-layer join with PostgreSQL.
- **No ACID with relational data**: Vector insertion and relational record creation are in separate transactions — consistency depends on application-level retry logic.
- **Configuration complexity**: HNSW parameters, quantization settings, segment configuration, and collection parameters require tuning expertise.

---

### Option 3: Pinecone (Managed)

**Overview:** Pinecone is a fully managed vector database with serverless and pod-based deployment options. No infrastructure management required.

**Strengths:**
- **Zero operational overhead**: No database to deploy, scale, or backup — Pinecone handles infrastructure.
- **Performance**: Pinecone's managed infrastructure is optimized for ANN search at massive scale.
- **Serverless option**: Pinecone Serverless scales to zero, eliminating cost for low-traffic environments.
- **Simple API**: Clean SDK with Python and Node.js clients.

**Weaknesses:**
- **Vendor lock-in**: All vector data resides in Pinecone's proprietary cloud. Migrating away requires re-indexing all embeddings into a new system.
- **Cost at scale**: Pinecone pricing (per vector stored, per query) becomes very expensive at 10M+ vectors with high query rates. Atlas's enterprise workloads could cost $5,000-$50,000/month.
- **Data residency**: Customer data (code embeddings, requirement embeddings) stored in Pinecone's infrastructure may violate data residency requirements for regulated industries (banking, healthcare).
- **No self-hosting**: No option for air-gapped or on-premise deployment.
- **No sparse+dense hybrid**: Pinecone's hybrid search support is limited — Qdrant's implementation is more mature.
- **No SQL integration**: No relationship to PostgreSQL data.

**Verdict:** Eliminated due to vendor lock-in, cost at scale, and data residency concerns.

---

### Option 4: Weaviate

**Overview:** Weaviate is an open-source vector database with built-in modules for text vectorization, BM25 hybrid search, and multi-modal vectors. It uses a GraphQL-like query interface (WQL).

**Strengths:**
- **Built-in vectorization modules**: Weaviate can call embedding APIs (OpenAI, Cohere, Hugging Face) automatically on insert — no separate embedding pipeline.
- **Hybrid search**: Native BM25 + vector hybrid search with configurable alpha parameter.
- **GraphQL interface**: Familiar query pattern for developers who know GraphQL.
- **Schema classes**: Typed collections (classes) with enforced property schemas.
- **Multi-modal**: Supports image, text, and code vectors in the same database.

**Weaknesses:**
- **Go runtime complexity**: Weaviate is written in Go with a more complex operational model than Qdrant.
- **Memory requirements**: Weaviate holds indexes in memory; memory requirements at scale are high and harder to control than Qdrant's configurable on-disk storage.
- **Performance vs Qdrant**: In published benchmarks (ANN Benchmarks), Qdrant's HNSW implementation consistently outperforms Weaviate at equivalent recall.
- **Query complexity**: Weaviate's WQL (GraphQL variant) is more verbose than Qdrant's simple JSON filter API.
- **Module coupling**: The auto-vectorization modules create implicit dependency on external embedding APIs — if the API changes, collection behavior changes without explicit notice.
- **Horizontal scaling complexity**: Weaviate's multi-node deployment requires careful shard configuration.

**Verdict:** Strong competitor but inferior to Qdrant in performance benchmarks and operational flexibility. Hybrid search advantage is matched by Qdrant's sparse+dense support.

---

### Option 5: Chroma

**Overview:** Chroma is an open-source embedding database designed for developer simplicity. It supports persistent and in-memory modes, with Python and JavaScript clients.

**Strengths:**
- **Developer-friendly**: Extremely simple API. Getting started takes minutes.
- **Metadata filtering**: Basic metadata filtering on collection queries.
- **LangChain integration**: Chroma is a first-class LangChain vector store — easy integration with LangChain pipelines.

**Weaknesses:**
- **Scale limitations**: Chroma is not designed for large-scale production deployments (10M+ vectors). Performance degrades significantly at scale.
- **No HNSW tuning**: Limited control over index parameters.
- **No sparse+dense hybrid**: Dense vectors only.
- **No Kubernetes operator**: No production-grade Kubernetes deployment guidance.
- **No distributed mode**: Single-node only.
- **Production readiness concerns**: Chroma is excellent for prototyping and small-scale production but not positioned for enterprise-grade workloads.

**Verdict:** Appropriate for development/prototyping. Rejected for Atlas's production requirements.

---

## Decision Outcome

**Chosen option: Hybrid — pgvector for Integrated Relational-Vector Queries + Qdrant for High-Scale Pure Vector Workloads**

A two-tier vector storage strategy is adopted:

**Tier 1: pgvector (PostgreSQL)**
Used for vector workloads that benefit from tight relational integration:
- Knowledge graph node embeddings that mirror Neo4j (backup vector queries)
- ADR/Blueprint/Constitution document embeddings that require metadata joins
- User preference embeddings (personalization) with user account data
- Pattern library embeddings (small, bounded dataset)

**Tier 2: Qdrant**
Used for high-volume, high-performance pure vector workloads:
- Codebase chunk embeddings (10M+ vectors per enterprise customer)
- Requirement embeddings for large-scale semantic search across requirements
- Real-time similarity search (< 10ms p99 latency requirement)
- Sparse+dense hybrid code search

The routing logic is simple: if a query benefits from relational joins or requires ACID co-location with PostgreSQL data, use pgvector. If a query is pure ANN at scale or requires sparse+dense hybrid, use Qdrant.

---

## Consequences

### Positive
- pgvector queries co-located with PostgreSQL eliminate application-layer joins for relational-vector hybrid queries
- Qdrant provides the performance headroom for 10M+ vector workloads without compromising PostgreSQL stability
- Sparse+dense hybrid search in Qdrant enables Atlas's code search to combine semantic similarity with keyword matching
- Both systems are self-hostable — no vendor lock-in, data residency compliance for regulated industries
- Qdrant's quantization features reduce memory requirements by 4x for cold vector collections

### Negative
- Two vector systems increase operational complexity: two sets of connection pools, monitoring dashboards, backup procedures, and upgrade cycles
- Application logic must know which vector store to query based on the use case — routing logic must be documented and maintained
- Consistency between pgvector and Qdrant copies of the same embeddings (if any duplication occurs) must be managed
- Engineering team must develop expertise in both pgvector (SQL-based) and Qdrant (JSON API-based) query interfaces

### Neutral
- Vector embedding model changes (e.g., switching from text-embedding-3-small to text-embedding-3-large) require re-indexing all stored vectors in both systems — this is a planned operational procedure, not an emergency
- The boundary between pgvector and Qdrant workloads will evolve as Atlas scales. A quarterly review will assess whether to migrate workloads between tiers

---

## Implementation Notes

### pgvector Schema Example
```sql
-- Document embeddings (co-located with document metadata)
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'adr', 'blueprint', 'requirement', 'constitution'
  document_id UUID NOT NULL,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  model_version VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW index for approximate nearest neighbor search
CREATE INDEX ON document_embeddings
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Filtered similarity query (most common pattern)
SELECT content, 1 - (embedding <=> $1::vector) AS similarity
FROM document_embeddings
WHERE project_id = $2
  AND document_type = $3
  AND similarity > 0.75
ORDER BY embedding <=> $1::vector
LIMIT 10;
```

### Qdrant Collection Setup (Code Search)
```python
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance, VectorParams, SparseVectorParams,
    QuantizationConfig, ScalarQuantizationConfig, ScalarType
)

client = QdrantClient(url="http://qdrant.atlas-infra.svc:6333")

client.create_collection(
    collection_name="code_chunks",
    vectors_config={
        "dense": VectorParams(size=1536, distance=Distance.COSINE),
    },
    sparse_vectors_config={
        "sparse": SparseVectorParams(),  # BM25-style sparse vectors
    },
    quantization_config=QuantizationConfig(
        scalar=ScalarQuantizationConfig(
            type=ScalarType.INT8,
            quantile=0.99,
            always_ram=False,  # Store quantized vectors on disk for memory efficiency
        )
    ),
    on_disk_payload=True,  # Store payload on disk for large datasets
)

# Hybrid dense + sparse search
result = client.query_points(
    collection_name="code_chunks",
    prefetch=[
        {"query": dense_vector, "using": "dense", "limit": 50},
        {"query": sparse_vector, "using": "sparse", "limit": 50},
    ],
    query={"fusion": "rrf"},  # Reciprocal Rank Fusion
    filter={"must": [{"key": "project_id", "match": {"value": project_id}}]},
    limit=10,
)
```

### Vector Routing Service
```typescript
// packages/vector-router/src/router.ts
export class VectorRouter {
  async query(request: VectorQueryRequest): Promise<VectorQueryResult[]> {
    const tier = this.determineTier(request);
    if (tier === 'pgvector') {
      return this.pgVectorService.query(request);
    }
    return this.qdrantService.query(request);
  }

  private determineTier(request: VectorQueryRequest): 'pgvector' | 'qdrant' {
    // Use Qdrant for: code chunks, high-volume requirements, hybrid search
    if (request.collection === 'code_chunks') return 'qdrant';
    if (request.hybridSearch) return 'qdrant';
    if (request.estimatedVectorCount > 1_000_000) return 'qdrant';
    // Default to pgvector for relational-adjacent queries
    return 'pgvector';
  }
}
```

---

## Compliance Verification

- [ ] pgvector HNSW index exists for all vector columns — verified by `\d+ table_name` in CI schema check
- [ ] Qdrant collections have quantization enabled for collections > 1M vectors
- [ ] Vector ingestion pipelines include model version in metadata — allows identifying stale embeddings after model upgrades
- [ ] Qdrant backup via snapshot API runs nightly — snapshots stored in S3
- [ ] pgvector backup included in PostgreSQL backup strategy (inherits from ADR-006)
- [ ] Embedding model version governance: model changes require a migration ticket and re-indexing plan

---

## Related Decisions

- [ADR-004](./ADR-004-knowledge-graph-database.md) — Neo4j also stores node embeddings for graph-hybrid queries; pgvector and Neo4j vector indexes serve different access patterns
- [ADR-006](./ADR-006-primary-relational-database.md) — pgvector is a PostgreSQL extension; inherits all PostgreSQL operational decisions
- [ADR-003](./ADR-003-agent-orchestration-framework.md) — LangGraph agent tools use both pgvector and Qdrant as vector store retrievers
- [ADR-010](./ADR-010-observability-stack.md) — Vector query latency (p50, p99) and ANN recall rates monitored via Prometheus metrics

---

## References

- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [Qdrant Hybrid Search](https://qdrant.tech/documentation/concepts/hybrid-queries/)
- [Qdrant Quantization](https://qdrant.tech/documentation/guides/quantization/)
- [ANN Benchmarks](https://ann-benchmarks.com/)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [Weaviate Documentation](https://weaviate.io/developers/weaviate)
- [Chroma Documentation](https://docs.trychroma.com/)
- [HNSW Algorithm Paper](https://arxiv.org/abs/1603.09320)
- [Reciprocal Rank Fusion](https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf)
