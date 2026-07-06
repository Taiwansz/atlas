# Atlas Engineering OS — Technology Stack Specification

> **Document Status:** Authoritative Reference  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-06  
> **Owner:** Atlas Architecture Team  

---

## 1. Stack Overview & Design Philosophy

The Atlas technology stack is selected to balance performance, scalability, development speed, and suitability for multi-agent AI integration. We prioritize tools with strict type systems, robust integration layers, and mature cloud-native support.

```
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND / INTERFACES: Next.js 15, Rust CLI       │
└────────────────────────────────┬────────────────────────────────┘
                                 │ HTTP/gRPC
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│      SERVICES & BACKEND: Node.js/TypeScript (Nx Monorepo)       │
│      AI & ORCHESTRATION: Python 3.11 (LangGraph, PyTorch)       │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Kafka / gRPC
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│      DATA LAYER: PostgreSQL, Neo4j Graph, Qdrant Vector DB       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Stack Breakdown

### 2.1 Core Platform & Monorepo
- **Tooling:** **Nx Monorepo Engine**
  - *Rationale:* Out-of-the-box support for multi-language workspaces (TypeScript + Python), caching builds, dependency graphing, and scalable workspaces.
  - *Details:* Reference [ADR-001](../../docs/adr/ADR-001-monorepo-tool-selection.md).
- **Primary Languages:** **TypeScript (Node.js 22)** & **Python 3.11**
  - *TypeScript:* Used for business services, microservice APIs, state orchestrations, and web services where strong types and concurrency are required. Reference [ADR-002](../../docs/adr/ADR-002-primary-language-backend.md).
  - *Python:* Dedicated to agent orchestration, machine learning wrappers, requirements discovery NLP tasks, and statistical analysis.

### 2.2 Agent Orchestration Core
- **Framework:** **LangGraph (LangChain Ecosystem)**
  - *Rationale:* Implements stateful, multi-agent workflows as a cyclic graph. Allows exact control over agent transitions, parallel execution branches, state rollback, and human-in-the-loop validation.
  - *Details:* Reference [ADR-003](../../docs/adr/ADR-003-agent-orchestration-framework.md).

### 2.3 Data Architecture
- **Primary Relational DB:** **PostgreSQL 16**
  - *Rationale:* Extremely mature, ACID compliant, support for native SQL operations, and relational models (users, orgs, job runs). Reference [ADR-006](../../docs/adr/ADR-006-primary-relational-database.md).
- **Graph Database:** **Neo4j Enterprise**
  - *Rationale:* Stores the project Knowledge Graph containing structural topologies, requirements-to-code traceability, and ADR links. Reference [ADR-004](../../docs/adr/ADR-004-knowledge-graph-database.md).
- **Vector Database Strategy:** **pgvector** (for local metadata indexing) + **Qdrant** (for production codebase embedding retrieval). Reference [ADR-005](../../docs/adr/ADR-005-vector-database-strategy.md).

### 2.4 API & Communication
- **External Web Clients:** **REST API & GraphQL (Apollo Client)**
  - REST endpoints handle standard resource management, CLI commands, and webhooks. GraphQL handles rich, relational dashboard views. Reference [ADR-007](../../docs/adr/ADR-007-api-design-strategy.md).
- **Internal Microservices:** **gRPC (HTTP/2 Protocol Buffers)**
  - Provides low latency, type safety, and streaming capabilities between core engines (e.g., Memory Engine to Orchestrator).
- **Asynchronous Messaging:** **Apache Kafka**
  - Used as the distributed commit log for event-driven engine choreography and audit logs. Reference [ADR-011](../../docs/adr/ADR-011-message-queue-event-streaming.md).

### 2.5 Security, Authentication & Identity
- **Protocol:** **OAuth2 / OpenID Connect (OIDC)**
- **Identity Provider:** **Keycloak** (Self-hosted/Managed)
  - Rationale: Multi-tenant tenant segregation, single sign-on (SSO), support for custom token mappings, and active developer-focused integrations. Reference [ADR-008](../../docs/adr/ADR-008-authentication-authorization.md).

### 2.6 Frontend Layer
- **Framework:** **Next.js 15 (React 19)**
  - *Styling:* Vanilla CSS with CSS Modules for maximum performance, flexibility, and anti-generic visual layout.
  - *Details:* Reference [ADR-009](../../docs/adr/ADR-009-frontend-framework.md).

### 2.7 Observability & Observability Stack
- **Standard:** **OpenTelemetry (OTel)**
- **Collector:** **OTel Collector** forwarding to **Prometheus** (metrics) and **Jaeger / Tempo** (traces) with visualizations in **Grafana**. Reference [ADR-010](../../docs/adr/ADR-010-observability-stack.md).

### 2.8 Infrastructure & Deployment
- **Containerization:** **Docker & OCI Images**
- **Orchestration:** **Kubernetes (K8s)**
  - *Details:* Reference [ADR-012](../../docs/adr/ADR-012-container-orchestration.md).
- **Local Dev:** **Docker Compose** mimicking production environments.

---

## 3. Technology Lifecycle & Radar

We follow a strict Technology Lifecycle policy to prevent dependency rot:
- **Adopt:** Stable, fully verified tools (PostgreSQL, TypeScript, LangGraph, Neo4j, Next.js).
- **Trial:** Technologies undergoing evaluation in non-critical components (pgvector for smaller sub-graphs).
- **Assess:** Emerging patterns (WebAssembly for browser-based local simulations).
- **Hold:** Generic AI frameworks that abstract away model controls; we enforce direct API integrations.
