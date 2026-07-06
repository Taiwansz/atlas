# Atlas Engineering OS — System Architecture Specification V2.0

> **Document Status:** Authoritative Reference (Consolidated V2.0)  
> **Version:** 2.0.0  
> **Date:** 2026-07-06  
> **Authors:** Atlas Architecture Board (Stripe CTO, Vercel Architect, Google Principal Engineer, Anthropic Researcher, Linear Product Lead)  

---

## 1. Executive Summary & Design Shifts

Atlas V2.0 represents a complete architectural refinement. We have audited the initial V1.0 specifications to eliminate **operational bloat, data synchronization risks, and multi-agent latency bottlenecks**. 

The architecture shifts from a heavy distributed system to a **modular, local-first, compile-checked platform**.

### 1.1 Structural Changes (V1.0 vs. V2.0)

| Domain | V1.0 Specification | V2.0 Restructured Architecture (Stripe/Google/Vercel standard) |
|--------|---------------------|---------------------------------------------------------------|
| **Core Engines** | 15 isolated microservices | **4 Cohesive Services** (Intake, Blueprint, Orchestrator, Audit) |
| **Agent Roles** | 18 specialized agents | **4 Consolidated Roles** (Discovery, Architect, Coder, Auditor) |
| **Primary Databases**| PostgreSQL + Neo4j + Qdrant | **PostgreSQL (with pgvector)** as single source of truth |
| **Event Broker** | Mandatory Apache Kafka | **Pluggable Event Adapter** (In-Memory default; Kafka/SQS for prod) |
| **Constitution Guard**| LLM prompt-checks | **Static AST/Compiler Passes** (Deterministic verification) |
| **Plugin Isolation** | Node `isolated-vm` | **WebAssembly (Wasm)** sandbox modules |
| **Developer DX** | Multi-service local cluster | **Single Binary CLI (`agy dev`)** with embedded SQLite / Hot-reload |
| **UI Aesthetics** | Dark-mode terminal-centric | **Accessible Hybrid Theme** (Monochrome, Light/Dark, `Cmd+K` navigation) |

---

## 2. Consolidating the Engine Architecture

To eliminate overengineering and network overhead, the 15 V1.0 engines are consolidated into **4 core services** running within a modular runtime:

```
┌──────────────────────────────────────────────────────────────────┐
│                          ATLAS CORE RUNTIME                      │
│                                                                  │
│  ┌───────────────────────┐              ┌──────────────────────┐ │
│  │   1. Intake & Context │ ◀──────────▶ │ 2. Blueprint Engine  │ │
│  │   (Memory, Requirements)             │ (Schemas, ADRs, Lock)│ │
│  └───────────┬───────────┘              └──────────┬───────────┘ │
│              │                                     │             │
│              ▼                                     ▼             │
│  ┌───────────────────────┐              ┌──────────────────────┐ │
│  │ 3. Agent Orchestrator │ ◀──────────▶ │ 4. Audit & Eval      │ │
│  │ (LangGraph Core, Wasm)│              │ (Drift, Score, Sec)  │ │
│  └───────────────────────┘              └──────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

### 2.1 The 4 Core Engines

1.  **Intake & Context Engine:**
    *   *Responsibilities:* Manages interactive Socratic elicitation loops, parses natural language requirements, updates the project memory context, and computes vector embeddings.
    *   *Data Access:* Directly queries PostgreSQL tables and pgvector indices.
2.  **Blueprint Engine:**
    *   *Responsibilities:* Compiles proposed architectures into validated `atlas.blueprint.lock.yaml` files, enforces version schemas, and maintains the ADR decision registry.
3.  **Agent Orchestrator & Execution Engine:**
    *   *Responsibilities:* Runs the core LangGraph multi-agent execution loop. It spins up safe Wasm sandbox tasks to run tests and compile code delta changes.
4.  **Audit & Evaluation Engine:**
    *   *Responsibilities:* Compares codebase AST state against blueprint locks, calculates the numerical Engineering Score, and executes static vulnerability checks.

---

## 3. Database Consolidation: Single Source of Truth

Managing transactional states across PostgreSQL, Neo4j, and Qdrant in V1.0 introduced split-brain synchronization risks and heavy resource usage.

```
                    [Relational Tables]
                             │
                             ▼ (ACID Write)
                       [PostgreSQL] ──(pgvector Index)──▶ [Semantic Search]
                             ▲
                             │ (Recursive CTEs)
                    [Relational Graphs]
```

- **PostgreSQL standard:** All relational configurations, project structures, and semantic coordinates are consolidated into PostgreSQL.
- **Relational Graphing:** Requirements-to-component dependencies are queried using SQL recursive Common Table Expressions (CTEs) or standard join tables. This removes the necessity of running a Neo4j database locally.
- **pgvector Indexing:** We replace Qdrant with `pgvector` for indexing. All semantic search lookups of code segments, documents, and memory vectors are executed via SQL Cosine similarity queries (`<=>`).
- **Pluggability:** Qdrant or Neo4j remain optional connectors for large-scale enterprise clusters, implemented via a decoupled connector interface.

---

## 4. Decoupled Communication & Pluggable Messaging

To make local development instant while guaranteeing production throughput, we decouple messaging via the `IEventBus` interface:

```typescript
export interface IEventBus {
  publish(topic: string, event: IEventEnvelope): Promise<void>;
  subscribe(topic: string, handler: (event: IEventEnvelope) => Promise<void>): Promise<void>;
}
```

- **Local Driver:** In-memory EventEmitter executing tasks synchronously or on thread pools. Booting local development requires zero external brokers.
- **Production Driver:** Pluggable Apache Kafka / AWS SQS broker configurations deployed via Kubernetes configurations.

---

## 5. Structured Agent Roles & Execution

We consolidate agent responsibilities to reduce tool call latency and state size:

1.  **Discovery & Alignment Agent:** Conducts Socratic dialogue, validates stakeholder intent, and generates structured requirements.
2.  **Architect Agent:** Reads requirements delta, proposes blueprint schemas, writes contracts, and compiles ADRs.
3.  **Implementation Agent:** Executes file generation, writes tests, runs code modifications, and refactors components.
4.  **Auditor & Red Team Agent:** Compares AST logs against blueprint schemas, runs security penetration scripts, and scores build quality.

---

## 6. Secure WebAssembly (Wasm) Plugin Sandbox

To secure host environments from malicious third-party plugin executions, we migrate from JavaScript virtual machine scripts to strict **WebAssembly sandboxes**:

- **Compilation Target:** Plugins are compiled to `.wasm` binaries.
- **Runtime Host:** Atlas runs Wasm modules using **Wasmtime** or **Wasmer**.
- **WASI constraints:** System access is restricted via the WebAssembly System Interface (WASI). Plugins cannot access the network, filesystem, or env variables unless explicit capability-based security tokens are declared in `atlas.plugin.json`.

---

## 7. Next.js Dashboard: Accessibility & Cmd+K Navigation

We upgrade the dashboard interface to align with the visual standard of Linear and Vercel:

- **Accessible Layout:** Introduction of high-contrast light mode tokens alongside deep dark mode. We prioritize typography layout over visual noise.
- **Command Portal (`Cmd+K`):** Developers navigate, trigger audits, search memory, and approve blueprints instantly from a keyboard-focused command bar.
- **Tree-Based Topologies:** We deprecate complex node graphs in favor of a structured **Architectural Navigation Tree**, which maps requirements to code components and test statuses in a readable file-explorer interface.

---

## 8. Single-Binary CLI dev runtime (`agy dev`)

To optimize developer onboarding, we introduce:
```bash
agy dev
```
- **Description:** Runs a local development server in a single terminal process.
- **Workflow:** Automatically initializes an embedded SQLite database in `.atlas/local.db`, boots the Node/Python runtime handlers, and launches the hot-reloaded Web Dashboard, allowing local development within seconds.
