# ADR-007: Hybrid API Architecture (REST, GraphQL, and gRPC)

**Date:** 2026-07-06  
**Status:** Accepted  
**Deciders:** Atlas Architecture Council  
**Technical Area:** API Design / Network Communication  

---

## Context and Problem Statement

Atlas is composed of several independent services (engines) that must communicate with one another, as well as with client interfaces like the `agy` CLI, IDE plugins, and the web-based management dashboard. These communication paths have fundamentally different requirements:

1. **Inter-Engine Communication:** Needs to be extremely low-latency, strongly typed, and support bidirectional streaming (e.g., streaming agent logs, source code changes, or requirements graphs).
2. **Dashboard-to-Backend:** Requires fetching deeply nested relational graph models (e.g., visualizing requirements linked to code files, ADRs, test status, and audit records).
3. **CLI/IDE-to-Backend:** Demands standard, reliable, firewall-friendly protocols that are easily executable across developer systems, often with RESTful resource paradigms.

Using a single protocol (like REST or GraphQL) across all boundaries would lead to severe performance or developer-experience trade-offs.

---

## Decision Drivers

- **Performance & Latency:** Inter-engine communication must minimize overhead.
- **Graph Traversal Capability:** Web dashboard needs to pull complex, nested relation states without hitting N+1 request problems.
- **Interoperability:** Developer tools and IDE plugins must integrate without complex client generators.
- **Type Safety & Contracts:** API changes must be compiler-verifiable across TypeScript and Python boundaries.

---

## Considered Options

### Option 1: Unified REST API
- *Description:* Expose standard REST endpoints for all communication paths.
- *Pros:* Simple to build, globally understood, firewall friendly.
- *Cons:* Heavy payload overhead, lack of streaming options, severe N+1 query problem for dashboard graph traversals.

### Option 2: Unified GraphQL API
- *Description:* Use GraphQL for all client and inter-engine communication.
- *Pros:* Client defines data shape, excellent for graph-based engines (Neo4j).
- *Cons:* High overhead for simple inter-engine calls, complex subscription scaling, poor support for binary code streams.

### Option 3: Hybrid API (REST, GraphQL, and gRPC)
- *Description:* Apply the optimal protocol based on the boundary.
  - **gRPC (HTTP/2):** For inter-engine communication and CLI stream pipelines.
  - **GraphQL:** For dashboard queries traversing the Knowledge Graph.
  - **REST:** For CLI administration, webhook ingestion, and third-party API exposure.

---

## Decision Outcome

**Option 3 (Hybrid API Architecture)** was selected.

### Implementation Details:
1. **gRPC Layer:** Protobuf contracts are defined centrally in `packages/core/proto` and compiled into TS/Python. Services connect via HTTP/2 channels.
2. **GraphQL Gateway:** A unified gateway (Apollo Server) wraps internal gRPC microservices and provides a GraphQL API to the Web Dashboard.
3. **REST Gateway:** Standard REST endpoints exist for user auth, webhook targets, CLI uploads, and integration settings.
