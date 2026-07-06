# ADR-004: Neo4j as Primary Knowledge Graph Database

**Date:** 2026-07-06
**Status:** Accepted
**Deciders:** Atlas Architecture Council
**Technical Area:** Data Architecture / Knowledge Management

---

## Context and Problem Statement

Atlas's persistent project memory — its most differentiating capability — is built on the premise that all knowledge about a software project can be represented as a richly interconnected graph. Requirements connect to architectural decisions, which connect to code modules, which connect to test suites, which connect to deployment environments, which connect to incidents. When a requirement changes, Atlas must traverse this graph to identify all downstream impacts: which Blueprints need updating, which ADRs become stale, which code components are affected, which test cases must be re-evaluated.

This is fundamentally a **graph problem**. Relational databases (PostgreSQL tables with foreign keys) can represent connected data, but traversing deep relationships (5+ hops) requires complex recursive CTEs that are difficult to write, slow to execute, and nearly impossible to optimize at scale. Document databases (MongoDB) represent nested documents but struggle with many-to-many relationships and cross-document traversals. Native graph databases are designed precisely for this use case.

Beyond impact traversal, Atlas uses the knowledge graph for:
- **GraphRAG (Graph-Retrieval-Augmented Generation)**: Augmenting LLM context with structured graph relationships, not just vector-similar text chunks. When an agent generates a Blueprint, it queries the graph for related ADRs, existing architectural patterns, team preferences, and past decisions.
- **MCP Server Integration**: Atlas's MCP (Model Context Protocol) servers expose the knowledge graph as a structured data source that LLMs can query via tool calls during agent execution.
- **Dependency analysis**: Tracking which modules depend on which, which services consume which APIs, which teams own which components.
- **Temporal evolution**: The graph evolves over a project's lifetime. Atlas must query "what did the architecture look like at version 1.2?" — requiring temporal graph capabilities.
- **Pattern matching**: Identifying architectural anti-patterns by matching subgraph structures against known problem patterns.

The choice of graph database technology has implications for query expressiveness, operational complexity, scaling characteristics, ecosystem tooling, and integration with Atlas's broader technology stack.

---

## Decision Drivers

- **Cypher expressiveness**: The query language must support complex multi-hop traversals, pattern matching, aggregations, and path-finding algorithms natively
- **GraphRAG integration**: The database must support hybrid queries that combine graph traversal with semantic similarity (vector-augmented graph queries)
- **MCP server compatibility**: Must provide a query API that Atlas's MCP servers can expose to LLMs as structured tools
- **ACID guarantees**: Graph mutations during agent workflows must be transactional — partial graph writes during agent failures are unacceptable
- **Maturity and production readiness**: Must have demonstrated production deployments at similar scale
- **Kubernetes deployment**: Must run reliably in a containerized environment with persistent volume claims
- **SDK quality**: Must have first-class JavaScript/TypeScript and Python drivers for Atlas's polyglot services
- **Graph algorithms**: Native support for centrality, path finding, community detection — needed for Engineering Score computation
- **Temporal queries**: Support for point-in-time queries of graph state
- **Developer tooling**: Graph visualization, query REPL, schema browser

---

## Considered Options

### Option 1: Neo4j (by Neo4j, Inc.)

**Overview:** Neo4j is the world's most widely deployed native graph database. It uses the Labeled Property Graph (LPG) model and the Cypher query language. Available in Community (OSS) and Enterprise editions. Neo4j AuraDB is the managed cloud offering. Neo4j 5.x includes native vector index support (enabling hybrid graph+vector queries), temporal functions, and APOC procedure library.

**Architecture:** Nodes (labeled entities) and Relationships (typed, directional) both carry arbitrary key-value properties. Cypher queries traverse these structures using pattern matching syntax: `(n:Requirement)-[:INFORMS]->(d:ADR)`.

**Strengths:**
- **Cypher language**: Cypher is the most expressive and readable graph query language available. Complex multi-hop traversals that would require 50 lines of SQL are expressed in 5 lines of Cypher. The pattern-matching syntax (`()-[]->()`) is intuitive and maps directly to the mental model of a graph.
  ```cypher
  // Find all ADRs that are transitively impacted by a changing requirement
  MATCH path = (r:Requirement {id: $reqId})-[:INFORMS*1..5]->(adr:ADR)
  WHERE adr.status = 'Accepted'
  RETURN adr, length(path) as hops
  ORDER BY hops
  ```
- **Native vector index (Neo4j 5.11+)**: `CREATE VECTOR INDEX` creates an HNSW-based vector index on node properties, enabling semantic similarity queries that combine with graph traversal in a single Cypher query. This is the foundation of Atlas's GraphRAG system.
  ```cypher
  // Find semantically similar requirements AND their architectural decisions
  CALL db.index.vector.queryNodes('requirement-embeddings', 5, $queryVector)
  YIELD node, score
  MATCH (node)-[:INFORMS]->(adr:ADR)
  RETURN node, adr, score
  ```
- **APOC Procedures**: A rich library of 400+ stored procedures for data import/export, graph algorithms, text manipulation, and advanced traversal patterns — extending Cypher's capabilities significantly.
- **Graph Data Science (GDS) Library**: Native implementations of graph algorithms: PageRank (for identifying central architectural components), community detection (for finding related requirement clusters), shortest path, similarity algorithms. Essential for Engineering Score computation.
- **ACID transactions**: Full ACID compliance at the transaction level. Atomic graph writes ensure consistency during complex agent-driven graph mutations.
- **Temporal support**: Native datetime properties and temporal functions enable point-in-time queries of graph state.
- **Ecosystem maturity**: 15+ years of production deployments. Comprehensive documentation, extensive community, proven operational patterns.
- **Driver quality**: Official JavaScript driver (`neo4j-driver`) and Python driver (`neo4j`) are feature-complete, well-maintained, and actively developed.
- **Neo4j Browser**: Built-in graph visualization tool for exploring the knowledge graph structure — invaluable for debugging and development.
- **MCP integration**: Neo4j provides an official MCP server (`mcp-neo4j`) that exposes Cypher queries as LLM tools, enabling direct LLM interaction with the Atlas knowledge graph.

**Weaknesses:**
- **Single-master write scalability**: Neo4j Community is single-instance. Enterprise Causal Clustering enables replication and read scaling, but write throughput is limited to one leader. For Atlas's write patterns (agent-driven graph mutations), this is acceptable but requires monitoring.
- **Enterprise licensing cost**: Neo4j Enterprise features (causal clustering, advanced security, Neo4j Bloom) require a commercial license. Community Edition is sufficient for most Atlas workloads but lacks hot failover.
- **Memory requirements**: Neo4j performs best when the "hot" graph fits in the page cache (RAM). Large knowledge graphs (millions of nodes) require substantial RAM allocation.
- **Schema flexibility trade-off**: Neo4j's schema-optional model (nodes can have any labels/properties) requires disciplined schema governance — Atlas must maintain a Cypher schema documentation and enforce it via application-layer validation.
- **Container storage**: Neo4j requires persistent volume claims with ReadWriteOnce (RWO) access mode in Kubernetes — not compatible with StatefulSet horizontal scaling without Enterprise Causal Clustering.

---

### Option 2: Amazon Neptune

**Overview:** Amazon Neptune is a fully managed graph database service on AWS. It supports both the Property Graph model (via Gremlin/openCypher) and RDF/SPARQL. Neptune Serverless auto-scales capacity based on demand.

**Strengths:**
- **Fully managed**: No database administration — patching, backups, failover, and scaling are AWS responsibilities.
- **Multi-model**: Supports both LPG (Gremlin/openCypher) and RDF (SPARQL) — useful if Atlas needs to integrate with semantic web standards.
- **Neptune Analytics**: Integrated graph analytics engine with bulk loading and analytical query capabilities.
- **AWS ecosystem integration**: Native integration with S3, IAM, VPC, CloudWatch, Lambda.
- **Serverless option**: Neptune Serverless scales to zero, reducing cost for development environments.

**Weaknesses:**
- **Cloud vendor lock-in**: Neptune is AWS-only. Atlas's multi-cloud deployment strategy (ADR-012) is compromised if the knowledge graph is tied to AWS.
- **openCypher maturity**: Neptune's openCypher implementation lags behind Neo4j's Cypher in feature completeness. Some advanced APOC procedures and graph algorithms are not available.
- **No native vector index**: Neptune does not have native vector index support as of 2026. GraphRAG hybrid queries require an external vector database and application-layer joins — losing the elegance of a single Cypher query.
- **Latency**: Neptune, as a managed service in AWS, introduces network latency that is absent from an in-cluster Neo4j deployment on Kubernetes. For agent workflows that make dozens of graph queries per execution, this latency accumulates.
- **Cost at scale**: Neptune pricing is based on I/O requests, which can become expensive for graph-heavy workloads with many small traversal queries.
- **Limited tooling**: No equivalent to Neo4j Browser or Neo4j Bloom for graph visualization. Third-party tools required.
- **GDS absence**: No equivalent to Neo4j's Graph Data Science library for built-in algorithm execution.

**Verdict:** Eliminated due to vendor lock-in, absence of native vector index (disabling native GraphRAG), and inferior graph algorithm support.

---

### Option 3: TigerGraph

**Overview:** TigerGraph is a native parallel graph database designed for deep-link analytics at enterprise scale. It uses the GSQL query language and claims superior performance for large-scale graph analytics.

**Strengths:**
- **Performance at extreme scale**: TigerGraph's parallel processing model (MultiGraph, distributed execution) is designed for billion-node graphs.
- **GSQL expressiveness**: GSQL is more expressive than Cypher for complex analytical queries, supporting procedural logic, aggregations, and parallel pattern matching.
- **Graph ML integration**: TigerGraph Graph Studio includes ML Workbench for graph-based machine learning.
- **Scalability**: Horizontal scaling across multiple machines for both reads and writes.

**Weaknesses:**
- **GSQL learning curve**: GSQL is a specialized language with a steeper learning curve than Cypher. Engineer onboarding time is 2-4x that of Cypher.
- **Community size**: TigerGraph's community is significantly smaller than Neo4j's. Troubleshooting resources, community plugins, and third-party integrations are sparse.
- **Enterprise pricing**: TigerGraph is enterprise-first with pricing that is opaque and negotiated per-customer. No true community/open-source edition.
- **No native vector index**: Similar to Neptune, TigerGraph lacks native vector index support, requiring external vector store integration for GraphRAG.
- **Driver maturity**: JavaScript and Python drivers are less polished than Neo4j's. The TypeScript driver in particular is community-maintained.
- **Container deployment**: TigerGraph's Kubernetes deployment is complex and less documented than Neo4j's Helm chart.
- **Overkill for Atlas scale**: TigerGraph's extreme scale benefits are relevant at billions of nodes. Atlas's knowledge graph, even for large enterprise customers, is unlikely to exceed tens of millions of nodes.

**Verdict:** Over-engineered for Atlas's scale. GSQL complexity and lack of native vector index are disqualifying.

---

### Option 4: ArangoDB

**Overview:** ArangoDB is a multi-model database supporting documents, graphs, and key-value storage in a single engine. It uses AQL (ArangoDB Query Language) for all data models. ArangoGraph is the managed cloud offering.

**Strengths:**
- **Multi-model**: Graphs, documents, and key-value in one database — potentially replacing both Neo4j and portions of the document store.
- **Horizontal scaling**: Sharded cluster mode enables write scaling across multiple nodes.
- **Active community**: Reasonable community size with good documentation.
- **Open source**: Apache 2.0 license with no enterprise gate on core features.

**Weaknesses:**
- **AQL complexity**: AQL for graph traversals is more verbose than Cypher. The mental model switch between document AQL and graph AQL is disorienting.
- **No native vector index**: ArangoDB lacks native vector index support, making native GraphRAG impossible.
- **Graph performance**: ArangoDB's multi-model architecture means graph traversal performance is generally below Neo4j's native graph storage engine.
- **Smaller graph ecosystem**: Fewer graph visualization tools, less community content around graph-specific patterns.
- **GDS equivalent absent**: No native graph algorithm library comparable to Neo4j GDS.
- **MCP server**: No official ArangoDB MCP server — would require custom implementation.

**Verdict:** Attractive for its multi-model capability but disqualified by absence of native vector index and inferior graph performance vs. a dedicated graph database.

---

### Option 5: Custom Graph on PostgreSQL (pg_graph, recursive CTEs)

**Overview:** Model graph relationships using PostgreSQL adjacency lists or materialized paths, with recursive CTEs for traversal and pgvector for vector queries.

**Strengths:**
- **Single database**: Eliminates a separate database service — graph lives alongside relational data in PostgreSQL.
- **Full SQL expressiveness**: Any relational operation applicable to graph data.
- **ACID**: Shared transaction scope with other relational data.
- **Operational simplicity**: One fewer database to operate.

**Weaknesses:**
- **Traversal performance**: Recursive CTEs in PostgreSQL scale poorly for deep traversals (5+ hops). Query planning degrades non-linearly with graph depth.
- **No pattern matching**: SQL has no equivalent to Cypher's visual pattern matching syntax — complex graph patterns require deeply nested subqueries.
- **No graph algorithms**: No built-in PageRank, community detection, or path algorithms. All must be implemented in application code.
- **Schema rigidity**: Representing arbitrary node/relationship types in a relational schema requires either a deeply generic schema (entity-attribute-value) or a proliferation of tables.
- **Developer experience**: Writing graph queries in SQL is significantly harder than Cypher — higher bug rate, longer development time.
- **No graph visualization**: No native graph visualization tool.

**Verdict:** Acceptable only for trivial graphs (< 5 node types, < 3 relationship types). Atlas's knowledge graph complexity disqualifies this approach.

---

## Decision Outcome

**Chosen option: Neo4j**

Neo4j is selected as Atlas's primary knowledge graph database. The decision rests on three non-negotiable requirements that only Neo4j satisfies simultaneously:

1. **Native vector index** (Neo4j 5.11+) enables single-query GraphRAG: semantic similarity search combined with graph traversal in one Cypher statement — the architectural foundation of Atlas's intelligent context retrieval.
2. **Graph Data Science library** provides the algorithms (PageRank, community detection, shortest path) required for Engineering Score computation without additional infrastructure.
3. **Official MCP server** (`mcp-neo4j`) enables LLMs to directly query the Atlas knowledge graph during agent execution without custom MCP server implementation.

Cypher's expressiveness and Neo4j's 15-year production track record further validate the decision.

---

## Consequences

### Positive
- GraphRAG queries (semantic + graph hybrid) execute in a single Cypher statement — no application-layer join between vector store and graph database for basic queries
- APOC procedures enable rich data import (from ADR markdown files, code analysis outputs, etc.) without custom ETL code
- Neo4j GDS algorithms run directly against the knowledge graph — Engineering Score calculation becomes a graph analytics query
- Neo4j Browser provides development and debugging visualization of the project knowledge graph
- Official MCP server means Atlas's LLMs can query the knowledge graph as a first-class tool from day one
- Official JavaScript and Python drivers provide consistent APIs across Atlas's polyglot services

### Negative
- Neo4j is an additional stateful service to operate in Kubernetes (requires PVC, resource limits, backup strategy)
- Community Edition lacks causal clustering — production high availability requires Neo4j Enterprise licensing or an active/passive failover with PostgreSQL replication of checkpoint data
- Graph schema governance must be maintained manually — no DDL-style schema enforcement. Application-layer validation via Zod schemas for node/relationship properties is required
- Memory sizing: Neo4j's page cache should be sized to hold the working graph set. Budget 8-16GB RAM per Neo4j instance in production

### Neutral
- Neo4j version upgrades must follow a tested migration path — Cypher syntax changes between major versions require testing
- The Atlas knowledge graph schema (node labels, relationship types, property definitions) must be documented and version-controlled in `docs/graph-schema/` alongside the ADRs

---

## Implementation Notes

### Atlas Knowledge Graph Schema (Core Nodes)
```cypher
// Core node types
CREATE CONSTRAINT project_id IF NOT EXISTS
  FOR (p:Project) REQUIRE p.id IS UNIQUE;

CREATE CONSTRAINT requirement_id IF NOT EXISTS
  FOR (r:Requirement) REQUIRE r.id IS UNIQUE;

// Vector index for semantic search
CREATE VECTOR INDEX requirement_embeddings IF NOT EXISTS
  FOR (r:Requirement) ON r.embedding
  OPTIONS {indexConfig: {`vector.dimensions`: 1536, `vector.similarity_function`: 'cosine'}};

// Example relationship types
// (Requirement)-[:INFORMS]->(ADR)
// (ADR)-[:SUPERSEDES]->(ADR)
// (Requirement)-[:IMPLEMENTED_BY]->(CodeModule)
// (CodeModule)-[:DEPENDS_ON]->(CodeModule)
// (ADR)-[:GOVERNS]->(CodeModule)
// (Requirement)-[:CONFLICTS_WITH]->(Requirement)
// (Project)-[:HAS_BLUEPRINT]->(Blueprint)
// (Blueprint)-[:DERIVED_FROM]->(Requirement)
```

### GraphRAG Query Pattern
```cypher
// Hybrid vector + graph retrieval for agent context
CALL db.index.vector.queryNodes('requirement_embeddings', 10, $queryVector)
YIELD node AS req, score
WHERE score > 0.75
MATCH (req)-[:INFORMS]->(adr:ADR)
OPTIONAL MATCH (req)-[:IMPLEMENTED_BY]->(module:CodeModule)
OPTIONAL MATCH (req)-[:CONFLICTS_WITH]->(conflict:Requirement)
RETURN req.title, req.description, score,
       collect(DISTINCT adr.title) AS related_adrs,
       collect(DISTINCT module.path) AS implementations,
       collect(DISTINCT conflict.title) AS conflicts
ORDER BY score DESC
```

### Kubernetes Deployment
```yaml
# Helm chart: neo4j/neo4j
helm install atlas-neo4j neo4j/neo4j \
  --set neo4j.name=atlas \
  --set neo4j.password=$NEO4J_PASSWORD \
  --set neo4j.edition=community \
  --set volumes.data.mode=defaultStorageClass \
  --set neo4j.resources.requests.memory=8Gi \
  --set neo4j.resources.requests.cpu=2
```

### TypeScript Driver Usage
```typescript
import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

// Always use parameterized queries (Cypher injection prevention)
const session = driver.session();
const result = await session.run(
  `MATCH (p:Project {id: $projectId})-[:HAS_REQUIREMENT]->(r:Requirement)
   RETURN r ORDER BY r.priority DESC`,
  { projectId }
);
await session.close();
```

---

## Compliance Verification

- [ ] All Neo4j queries use parameterized Cypher — no string interpolation in query strings (verified by AST lint rule)
- [ ] Vector index exists for all node types that support semantic search — verified by schema test suite
- [ ] Graph schema documented in `docs/graph-schema/` with node types, relationship types, and property definitions
- [ ] Neo4j backup job runs nightly — dump to S3 via `neo4j-admin database dump` in CronJob
- [ ] GDS plugin installed and validated — `CALL gds.list()` in CI health check
- [ ] APOC plugin installed and validated — `CALL apoc.help('all')` in CI health check
- [ ] Node.js driver connection pool configured appropriately — max 50 connections per service

---

## Related Decisions

- [ADR-003](./ADR-003-agent-orchestration-framework.md) — LangGraph agent tools query Neo4j for context during agent execution
- [ADR-005](./ADR-005-vector-database-strategy.md) — Neo4j's native vector index handles graph-embedded vectors; Qdrant handles high-volume pure vector workloads
- [ADR-006](./ADR-006-primary-relational-database.md) — PostgreSQL stores structured metadata; Neo4j stores relationship topology
- [ADR-007](./ADR-007-api-design-strategy.md) — Graph queries are exposed via the GraphQL API layer for the frontend dashboard

---

## References

- [Neo4j Documentation](https://neo4j.com/docs/)
- [Neo4j Cypher Manual](https://neo4j.com/docs/cypher-manual/current/)
- [Neo4j Vector Index (5.11+)](https://neo4j.com/docs/cypher-manual/current/indexes/semantic-indexes/vector-indexes/)
- [Neo4j Graph Data Science Library](https://neo4j.com/docs/graph-data-science/current/)
- [APOC Procedures](https://neo4j.com/labs/apoc/)
- [Neo4j MCP Server](https://github.com/neo4j-contrib/mcp-neo4j)
- [GraphRAG: Unlocking LLM discovery on narrative private data](https://arxiv.org/abs/2404.16130)
- [Amazon Neptune Documentation](https://docs.aws.amazon.com/neptune/latest/userguide/)
- [TigerGraph Documentation](https://docs.tigergraph.com/)
- [ArangoDB Documentation](https://docs.arangodb.com/)
