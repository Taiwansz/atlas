# ADR-002: TypeScript (Node.js) as Primary Backend Language

**Date:** 2026-07-06
**Status:** Accepted
**Deciders:** Atlas Architecture Council
**Technical Area:** Core Engineering / Language Strategy

---

## Context and Problem Statement

Atlas is an Engineering Operating System whose backend spans several distinct functional domains: API gateway services, agent orchestration engines, requirement processing pipelines, knowledge graph interactions, real-time WebSocket servers, CLI tooling, and ML inference bridges. Selecting a primary backend language determines not just syntax preference but has cascading effects on hiring, library availability, runtime performance characteristics, type safety guarantees, interoperability between services, and the velocity at which Atlas's core intelligence systems can be developed and iterated upon.

The language selection is complicated by the AI-native nature of Atlas. The best libraries for LLM interaction, vector operations, embedding generation, and ML pipeline execution exist predominantly in the **Python** ecosystem. At the same time, Atlas's API services, real-time coordination layers, and developer tooling have requirements — high concurrency, WebSocket performance, strong type safety, unified frontend/backend types — that align with the **TypeScript/Node.js** ecosystem.

This is not a theoretical choice. The decision directly impacts:
- Which LLM/agent frameworks are natively available (LangGraph, LangChain, CrewAI are Python-first)
- Whether Atlas engineers context-switch between languages daily
- Whether type contracts between frontend and backend can be shared (monorepo tRPC/Zod schemas)
- The available talent pool for hiring
- Runtime performance under concurrent load (WebSocket servers, streaming LLM responses)

The decision must establish a **primary language** while explicitly defining where **Python** is the required runtime for ML-heavy subsystems.

---

## Decision Drivers

- **Full-stack type unification**: Shared TypeScript types between frontend (Next.js) and backend eliminate an entire class of API contract bugs
- **LLM ecosystem access**: LangGraph, LangChain, Anthropic SDK, OpenAI SDK — Python has the richest and most current AI library ecosystem
- **Concurrency model**: Event-loop based (Node.js) vs. thread-based (Go) vs. async (Python) vs. fearless concurrency (Rust) — must match Atlas's workload profile
- **Hiring and team velocity**: Language choice must reflect available engineering talent for a startup scaling from 5 to 50 engineers
- **Monorepo coherence**: Primary language must integrate cleanly with the Nx monorepo (ADR-001)
- **Runtime performance**: API gateway and WebSocket server latency targets: p99 < 100ms
- **Library maturity**: ORM, HTTP framework, testing, authentication, observability — all must have production-grade libraries
- **Operational complexity**: Number of distinct runtime environments (Docker images, build chains) that must be maintained

---

## Considered Options

### Option 1: TypeScript (Node.js) — Primary Backend + Python for ML Subsystems

**Overview:** TypeScript/Node.js is the primary runtime for all API services, agent orchestration coordination, WebSocket servers, CLI tooling, and data pipeline orchestration. Python is explicitly the required runtime for ML-intensive subsystems: embedding generation, fine-tuning orchestration, RAG pipeline execution, and any component requiring direct NumPy/PyTorch/scikit-learn access. Inter-language communication occurs via gRPC or message queue boundaries.

**Strengths:**
- **Type sharing**: Zod schemas, Prisma types, and tRPC routers are shared directly between frontend (Next.js) and backend without code generation or contract files. A type change in a Prisma model is instantly visible in the frontend component via the monorepo.
- **AI SDK availability**: The official OpenAI, Anthropic, and Google AI TypeScript SDKs are maintained and feature-complete. The Vercel AI SDK (`ai`) provides streaming primitives, tool calling, and multi-provider abstraction in TypeScript.
- **LangChain.js**: While Python LangChain remains more feature-rich, LangChain.js is production-grade for many agent patterns. For Atlas's orchestration layer, it is sufficient.
- **Event loop for I/O-bound work**: Agent orchestration is fundamentally I/O-bound (waiting for LLM API responses, database queries, tool execution). Node.js's event loop excels at this — a single thread handles thousands of concurrent LLM API calls without blocking.
- **npm ecosystem depth**: `@nestjs`, `express`, `fastify`, `prisma`, `drizzle-orm`, `bullmq`, `socket.io`, `zod`, `vitest` — every infrastructure requirement has multiple mature options.
- **Monorepo coherence**: Nx is TypeScript-first. Building, testing, and linting TypeScript packages is the most polished experience.
- **Hiring velocity**: TypeScript engineers are the most abundant category. Full-stack engineers who can work across Next.js and NestJS are far easier to hire than polyglot Go+Python engineers.
- **Streaming excellence**: `ReadableStream`, Server-Sent Events, and WebSocket handling are first-class in Node.js. LLM response streaming to the frontend is natural.

**Weaknesses:**
- **Python ML ecosystem gap**: The richest ML libraries (PyTorch, NumPy, Hugging Face Transformers, LangGraph, sentence-transformers) are Python-only or significantly better in Python. Accessing them from TypeScript requires a cross-language bridge.
- **CPU-bound performance**: Node.js is single-threaded. CPU-intensive operations (token counting, local embedding generation, data processing) block the event loop. Worker threads mitigate this but add complexity.
- **Memory efficiency**: Node.js has higher memory overhead per process than Go or Rust. Large-scale concurrent processing (thousands of agent contexts) requires careful memory management.
- **Runtime immaturity for ML**: TypeScript ML libraries (TensorFlow.js, ONNX Runtime) lag significantly behind their Python counterparts in features, performance, and community support.

**Hybrid boundary definition:**
| Subsystem | Primary Language | Rationale |
|---|---|---|
| API Gateway | TypeScript | REST, GraphQL, WebSocket |
| Agent Orchestration (coord) | TypeScript | LangGraph.js, state management |
| CLI Tools | TypeScript | Shared types with backend |
| Knowledge Graph Bridge | TypeScript | Neo4j JS driver |
| ML Engine (embeddings) | Python | sentence-transformers |
| ML Engine (fine-tuning) | Python | PyTorch, HuggingFace |
| RAG Pipeline | Python | LangGraph (Python), FAISS |
| Simulation Engine | Python | NumPy, statistical modeling |

---

### Option 2: Python as Unified Backend Language

**Overview:** Python handles all backend services: FastAPI for REST/GraphQL, LangGraph for agent orchestration, SQLAlchemy for database access. The frontend remains Next.js (TypeScript) but communicates via generated API clients.

**Strengths:**
- **ML ecosystem unity**: No cross-language boundary for ML operations. LangGraph, LangChain, PyTorch, sentence-transformers, Hugging Face — all natively accessible without IPC overhead.
- **AI-native development velocity**: Engineers building agent logic don't context-switch between Python (LangGraph) and TypeScript (orchestration coordinator).
- **FastAPI excellence**: FastAPI is a world-class framework — automatic OpenAPI generation, Pydantic validation, async/await support, and excellent performance (on par with Node.js for I/O-bound work).
- **Data science tooling**: Pandas, NumPy, Jupyter integration — useful for analyzing Atlas project data, generating Engineering Score metrics.
- **Type safety**: Pydantic v2 provides runtime-validated models with mypy-compatible static types.

**Weaknesses:**
- **Type sharing with frontend**: No native type sharing between Python backend and TypeScript frontend. Requires OpenAPI schema generation + client code generation (openapi-generator, orval) — adding a build step and creating a contract boundary that can drift.
- **GIL limitations**: CPython's Global Interpreter Lock limits true parallelism for CPU-bound work. Async Python (asyncio) handles I/O concurrency well but is more complex than Node.js's event loop for hybrid workloads.
- **Monorepo coherence**: Nx has less mature Python support. The `@nxlv/python` plugin works but requires more configuration. Python packaging (poetry, uv) doesn't integrate as naturally into the npm workspace model.
- **WebSocket and streaming**: Python's async WebSocket handling (websockets, starlette) is capable but more complex to operate at scale than Node.js equivalents.
- **Hiring for API/backend**: The intersection of engineers who know Python AND modern API design (FastAPI, async, Pydantic) AND distributed systems is a smaller hiring pool than TypeScript full-stack engineers.
- **Startup time**: Python services have slower cold start times than Node.js, relevant for serverless and Kubernetes pod scaling scenarios.

**Verdict:** Strong for ML-heavy subsystems; insufficient as a unified backend language due to type-sharing deficit and monorepo coherence issues.

---

### Option 3: Go as Primary Backend Language

**Overview:** Go handles all API services and coordination layers. Python handles ML. TypeScript handles frontend. Three-language strategy.

**Strengths:**
- **Performance**: Go compiles to native binaries with extremely low memory footprint. A Go HTTP server handles more concurrent requests per GB of RAM than Node.js or Python.
- **Concurrency**: Goroutines provide true lightweight concurrency. Millions of goroutines can run in parallel, ideal for agent coordination at massive scale.
- **Static binary deployment**: Go produces single static binaries with no runtime dependencies. Docker images can be `FROM scratch`, drastically reducing attack surface and image size.
- **Strong typing**: Go's type system (with generics since 1.18) provides compile-time safety without the overhead of a type system as complex as TypeScript's.
- **Kubernetes tooling**: The Kubernetes ecosystem is predominantly Go. Atlas's platform engineering team can contribute to or fork tooling with native expertise.

**Weaknesses:**
- **Zero ML ecosystem**: No serious ML/AI libraries in Go. All AI work requires Python microservices. Three-language codebase (Go + Python + TypeScript) dramatically increases cognitive load and cross-team coordination cost.
- **No type sharing with frontend**: Same problem as Python — generated client code creates contract drift risk.
- **Slower iteration**: Go's compile-test loop, while fast for large codebases, is slower than TypeScript's `tsx` watch mode for rapid API iteration during early-stage product development.
- **AI SDK maturity**: Go AI SDKs (OpenAI, Anthropic) exist but are community-maintained and lag behind official Python and TypeScript SDKs.
- **Monorepo complexity**: Three languages in one monorepo (Go modules, Python packages, TypeScript packages) would require significant build tooling investment even with Nx.
- **Hiring complexity**: Finding engineers proficient in Go + distributed systems who also understand AI agent patterns is extremely difficult.

**Verdict:** Excellent for infrastructure tooling (CLI tools) but inappropriate as the primary backend language for Atlas's AI-centric services.

---

### Option 4: Rust as Primary Backend Language

**Overview:** Rust handles performance-critical services. Python handles ML. TypeScript handles frontend and non-critical services.

**Strengths:**
- **Memory safety without GC**: Rust's ownership model prevents entire classes of bugs (use-after-free, data races) at compile time, with zero garbage collection pauses.
- **Peak performance**: Rust is as fast as C/C++ for CPU-bound workloads. For local model inference, tokenization, and embedding operations, Rust is the fastest option.
- **WASM**: Rust compiles to WebAssembly, enabling shared logic between backend and browser without a separate JS runtime.
- **Long-term foundation**: If Atlas eventually ships on-premise hardware with local model inference, Rust provides the performance ceiling.

**Weaknesses:**
- **Extreme learning curve**: Rust's borrow checker and ownership model require 3-6 months for most engineers to become productive. This is prohibitive for a startup.
- **Development velocity**: Rust compile times are slow. Iteration speed for API services is far inferior to TypeScript or Python.
- **Ecosystem immaturity for web services**: While `axum`, `actix-web`, and `tokio` are excellent, the ecosystem for ORMs, auth, and AI tooling is nascent compared to TypeScript or Python.
- **Three-language complexity**: Rust + Python + TypeScript creates three distinct build chains, packaging systems, and expertise silos.

**Verdict:** Rejected for primary backend. Considered for specific WASM modules (parser, tokenizer utilities) deployed as npm packages.

---

## Decision Outcome

**Chosen option: TypeScript (Node.js) as Primary Backend, with Python as Required Runtime for ML Subsystems**

TypeScript is selected as the primary backend language for Atlas. Python is explicitly recognized as a **required secondary runtime** for ML-intensive subsystems, not as a fallback or implementation detail. The boundary between TypeScript and Python services is defined at the ADR level and enforced architecturally via gRPC service contracts.

The decision prioritizes:
1. **Developer velocity** during the critical 0-to-1 phase, where iteration speed determines product market fit
2. **Full-stack type safety** via shared Zod/Prisma types across the monorepo
3. **AI SDK completeness** — Vercel AI SDK, LangChain.js, and direct provider SDKs cover Atlas's orchestration needs
4. **Hiring pragmatics** — TypeScript engineers are most abundant and can be productive on day one

The Python subsystem boundary is not a compromise but a deliberate architectural separation that allows each language to operate in its zone of excellence.

---

## Consequences

### Positive
- Single primary language dramatically reduces cognitive load for engineers working across services
- Shared Zod schemas and Prisma types between frontend and backend eliminate API contract drift
- Node.js's event loop model is optimal for the I/O-bound LLM API call patterns that dominate Atlas agent workflows
- TypeScript's generics and conditional types enable expressive DSLs for Blueprint schemas, Constitution rules, and ADR templates
- Vercel AI SDK's streaming primitives align perfectly with Atlas's real-time agent output streaming requirements

### Negative
- Python ML subsystems must be maintained as separate services with their own Docker images, CI pipelines, and dependency management (poetry/uv)
- Cross-language gRPC boundaries introduce serialization overhead (~1-5ms per call) — acceptable for batch ML operations but must not be in hot paths
- Engineers working on ML subsystems must be bilingual (TypeScript + Python), constraining the team members who can own those services
- LangGraph (Python) is significantly more feature-rich than LangGraph.js — if Atlas's agent patterns outgrow LangGraph.js capabilities, the orchestration coordinator may need to migrate to Python

### Neutral
- Go will be evaluated for CLI tools distributed to end users (smaller binary, no runtime dependency), potentially creating a limited third language for tooling only
- Rust WASM modules may be introduced for specific performance-critical parsing operations without affecting the overall language strategy
- Python subsystem interfaces must be versioned via Protobuf definitions, following the same API governance as external-facing APIs

---

## Implementation Notes

### NestJS as Primary HTTP Framework
```typescript
// Standard service structure
@Module({
  imports: [AgentModule, KnowledgeGraphModule],
  controllers: [RequirementController],
  providers: [RequirementService],
})
export class RequirementModule {}
```

### Python Subsystem gRPC Interface
```protobuf
// proto/ml/embedding.proto
syntax = "proto3";
package ml.embedding;

service EmbeddingService {
  rpc GenerateEmbedding(EmbeddingRequest) returns (EmbeddingResponse);
  rpc GenerateBatch(BatchEmbeddingRequest) returns (BatchEmbeddingResponse);
}

message EmbeddingRequest {
  string text = 1;
  string model = 2; // "text-embedding-3-small" | "bge-m3"
}

message EmbeddingResponse {
  repeated float vector = 1;
  int32 dimensions = 2;
  string model_used = 3;
}
```

### Shared Type Strategy
```typescript
// packages/shared/src/schemas/project.ts
import { z } from 'zod';

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  status: z.enum(['active', 'archived', 'draft']),
  engineeringScore: z.number().min(0).max(100).nullable(),
});

export type Project = z.infer<typeof ProjectSchema>;
// This type is imported by both Next.js pages AND NestJS controllers
```

### Runtime Version Policy
| Runtime | Version | Update Policy |
|---|---|---|
| Node.js | 22 LTS | Follow LTS release, update within 3 months |
| TypeScript | 5.x latest | Update within 1 month of stable release |
| Python | 3.12+ | Follow minor releases for security patches |
| pnpm | 9.x | Update on security advisories |

---

## Compliance Verification

- [ ] All new backend services scaffolded via `nx generate @nx/nest:app` or `nx generate @nx/node:app`
- [ ] Python services must expose only gRPC interfaces — no direct database access from Python that is not via the TypeScript service layer
- [ ] No Python packages in the TypeScript service dependency tree (detected via CI lint)
- [ ] Shared schema packages (`@atlas/shared`) must have zero runtime dependencies on framework-specific code
- [ ] TypeScript strict mode (`"strict": true`) enforced in all `tsconfig.json` files — verified by CI

---

## Related Decisions

- [ADR-001](./ADR-001-monorepo-tool-selection.md) — Nx as monorepo tool; TypeScript-first choice reinforces Nx selection
- [ADR-003](./ADR-003-agent-orchestration-framework.md) — LangGraph selection influenced by this language decision
- [ADR-007](./ADR-007-api-design-strategy.md) — tRPC eligibility depends on TypeScript being the primary backend language
- [ADR-009](./ADR-009-frontend-framework.md) — Full-stack type sharing enabled by TypeScript on both ends

---

## References

- [TypeScript Official Documentation](https://www.typescriptlang.org/docs/)
- [Node.js LTS Releases](https://nodejs.org/en/about/previous-releases)
- [Vercel AI SDK](https://sdk.vercel.ai/docs/introduction)
- [LangChain.js](https://js.langchain.com/docs/introduction/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Go Programming Language](https://go.dev/)
- [Rust Programming Language](https://www.rust-lang.org/)
- [The State of AI Developer Tools 2025](https://stateofaidertools.com/)
