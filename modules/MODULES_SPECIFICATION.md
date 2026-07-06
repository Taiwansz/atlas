# Atlas Engineering OS — Module Specifications

**Version:** 1.0.0  
**Status:** Living Document  
**Last Updated:** 2026-07-06  
**Maintainer:** Atlas Core Team  

---

## Table of Contents

1. [@atlas/core](#atlascore)
2. [@atlas/config](#atlasconfig)
3. [@atlas/auth](#atlasauth)
4. [@atlas/database](#atlasdatabase)
5. [@atlas/graph](#atlasgraph)
6. [@atlas/vector](#atlasvector)
7. [@atlas/ai](#atlasai)
8. [@atlas/memory](#atlasmemory)
9. [@atlas/agents](#atlasagents)
10. [@atlas/orchestrator](#atlasorchestrator)
11. [@atlas/mcp](#atlasmcp)
12. [@atlas/research](#atlasresearch)
13. [@atlas/blueprint](#atlasblueprint)
14. [@atlas/constitution](#atlasconstitution)
15. [@atlas/planning](#atlasplanning)
16. [@atlas/audit](#atlasaudit)
17. [@atlas/simulation](#atlassimulation)
18. [@atlas/redteam](#atlasredteam)
19. [@atlas/telemetry](#atlastelemetry)
20. [@atlas/events](#atlasevents)
21. [@atlas/api](#atlasapi)
22. [@atlas/graphql](#atlasgraphql)
23. [@atlas/grpc](#atlasgrpc)
24. [@atlas/cli](#atlascli)
25. [@atlas/sdk](#atlassdk)
26. [@atlas/marketplace](#atlasmarketplace)

---

## Overview

Atlas modules follow a strict layered architecture. Lower-layer modules are consumed by upper layers; circular dependencies are forbidden at build time via Nx boundary rules.

```
Layer 0 (Infrastructure):  @atlas/core, @atlas/config, @atlas/telemetry, @atlas/events
Layer 1 (Data):            @atlas/database, @atlas/graph, @atlas/vector, @atlas/auth
Layer 2 (AI & Memory):     @atlas/ai, @atlas/memory
Layer 3 (Agents):          @atlas/agents, @atlas/mcp, @atlas/orchestrator
Layer 4 (Engines):         @atlas/research, @atlas/blueprint, @atlas/constitution,
                           @atlas/planning, @atlas/audit, @atlas/simulation, @atlas/redteam
Layer 5 (Interface):       @atlas/api, @atlas/graphql, @atlas/grpc, @atlas/cli, @atlas/sdk
Layer 6 (Marketplace):     @atlas/marketplace
```

All modules are TypeScript-first, ship with full type definitions, and target Node.js >= 22.

---

## @atlas/core

### Purpose

The universal foundation of the Atlas platform. Provides shared primitive types, branded type utilities, error hierarchy, structured logging primitives, common constants, result types, and utility functions used by every other module. Zero runtime dependencies outside of Node.js built-ins.

### Public API Surface

```typescript
// Result type (Railway-oriented programming)
export type Result<T, E extends AtlasError = AtlasError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never>;
export function err<E extends AtlasError>(error: E): Result<never, E>;
export function isOk<T, E extends AtlasError>(r: Result<T, E>): r is { ok: true; value: T };
export function isErr<T, E extends AtlasError>(r: Result<T, E>): r is { ok: false; error: E };
export function unwrap<T>(r: Result<T>): T;
export function unwrapOr<T>(r: Result<T>, fallback: T): T;
export function mapResult<T, U>(r: Result<T>, fn: (v: T) => U): Result<U>;
export function flatMap<T, U>(r: Result<T>, fn: (v: T) => Result<U>): Result<U>;

// Branded ID types
export type ProjectId    = string & { readonly __brand: 'ProjectId' };
export type BlueprintId  = string & { readonly __brand: 'BlueprintId' };
export type AgentId      = string & { readonly __brand: 'AgentId' };
export type UserId       = string & { readonly __brand: 'UserId' };
export type OrgId        = string & { readonly __brand: 'OrgId' };
export type MemoryId     = string & { readonly __brand: 'MemoryId' };
export type EventId      = string & { readonly __brand: 'EventId' };
export type RunId        = string & { readonly __brand: 'RunId' };

export function createId<T extends string>(prefix: string): T;
export function parseId<T>(raw: string): Result<T>;

// Error hierarchy
export abstract class AtlasError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly context: Record<string, unknown>;
  readonly timestamp: Date;
  toJSON(): ErrorJSON;
  toHTTP(): { status: number; body: ErrorJSON };
}

export class ValidationError   extends AtlasError { readonly fields: FieldError[]; }
export class NotFoundError     extends AtlasError { readonly resource: string; readonly id: string; }
export class ConflictError     extends AtlasError {}
export class UnauthorizedError extends AtlasError {}
export class ForbiddenError    extends AtlasError {}
export class RateLimitError    extends AtlasError { readonly retryAfterMs: number; }
export class TimeoutError      extends AtlasError { readonly durationMs: number; }
export class ExternalError     extends AtlasError { readonly service: string; }
export class InternalError     extends AtlasError {}

// Utility functions
export function deepMerge<T extends object>(target: T, ...sources: Partial<T>[]): T;
export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
export function chunk<T>(arr: T[], size: number): T[][];
export function unique<T>(arr: T[], key?: (item: T) => unknown): T[];
export function sleep(ms: number): Promise<void>;
export function retry<T>(fn: () => Promise<T>, opts: RetryOptions): Promise<T>;
export function timeout<T>(fn: () => Promise<T>, ms: number): Promise<T>;
export function memoize<T>(fn: (...args: unknown[]) => T, opts?: MemoizeOptions): typeof fn;

// Timestamps
export type ISODateString = string & { readonly __brand: 'ISODateString' };
export function now(): ISODateString;
export function toISO(date: Date): ISODateString;
export function fromISO(str: string): Date;
export function diffMs(a: ISODateString, b: ISODateString): number;

// Constants
export const ATLAS_VERSION: string;
export const MAX_CONTEXT_TOKENS: number;    // 128_000
export const MAX_AGENT_ITERATIONS: number;  // 50
export const DEFAULT_TIMEOUT_MS: number;    // 30_000
export const SUPPORTED_LLM_PROVIDERS: readonly string[];
export const SUPPORTED_EMBEDDING_MODELS: readonly string[];
```

### Internal Architecture

```
@atlas/core/
├── src/
│   ├── result/       # Result<T,E> monad implementation
│   ├── errors/       # Error class hierarchy
│   ├── ids/          # Branded ID generation (ULID-based)
│   ├── types/        # Shared primitive types and interfaces
│   ├── utils/        # Pure utility functions
│   ├── constants/    # Platform-wide constants
│   └── index.ts      # Barrel export
```

IDs are generated using ULID (Universally Unique Lexicographically Sortable Identifiers) to ensure monotonic ordering and database index efficiency.

### Dependencies

None — zero external dependencies.

### Configuration Interface

None — configuration-free by design.

### Error Types

The AtlasError hierarchy covers all error conditions across the platform. Each error class carries a unique `code` string for machine-readable handling and an HTTP `statusCode` for transport-layer mapping.

### Performance Characteristics

- ID generation: < 1 µs per call
- `deepMerge` on 10 KB object: < 50 µs
- `retry` overhead: zero when no retry needed
- Zero heap allocation for `Result` type wrappers in hot paths

### Testing Strategy

- 100% unit test coverage required
- Property-based tests for all utility functions (fast-check)
- Snapshot tests for error serialization format

---

## @atlas/config

### Purpose

Centralized, type-safe, environment-aware configuration management. Validates all configuration at startup using Zod schemas. Supports layered configuration (defaults → environment-specific files → environment variables → CLI flags). Fails fast with actionable error messages if required config is absent or malformed.

### Public API Surface

```typescript
export interface AtlasConfig {
  env: 'development' | 'staging' | 'production' | 'test';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  database: DatabaseConfig;
  redis: RedisConfig;
  neo4j: Neo4jConfig;
  qdrant: QdrantConfig;
  kafka: KafkaConfig;
  ai: AIProvidersConfig;
  auth: AuthConfig;
  api: APIConfig;
  telemetry: TelemetryConfig;
  storage: StorageConfig;
  mcp: MCPConfig;
  features: FeatureFlags;
}

export function loadConfig(overrides?: Partial<AtlasConfig>): Promise<AtlasConfig>;
export function getConfig(): AtlasConfig;
export function validateConfig(raw: unknown): AtlasConfig;
export function watchConfig(handler: (next: AtlasConfig, prev: AtlasConfig) => void): Disposable;
export function isEnabled(flag: keyof FeatureFlags): boolean;
```

### Configuration Layers (Priority Order)

1. `atlas.defaults.yaml` — shipped defaults
2. `atlas.{env}.yaml` — environment-specific overrides
3. `atlas.local.yaml` — local developer overrides (gitignored)
4. Environment variables — `ATLAS_*` prefix
5. CLI flags — highest priority, runtime only

### Feature Flags

```typescript
export interface FeatureFlags {
  evolutionEngine:      boolean;
  redTeamEngine:        boolean;
  simulationEngine:     boolean;
  marketplacePublish:   boolean;
  crossProjectLearning: boolean;
  atlasAcademy:         boolean;
}
```

### Error Types

```typescript
export class ConfigLoadError     extends AtlasError { readonly path: string; }
export class ConfigValidateError extends AtlasError { readonly issues: ZodIssue[]; }
export class ConfigMissingError  extends AtlasError { readonly key: string; }
```

### Testing Strategy

- Unit: validate each config section independently with Zod
- Integration: load from fixture `.env` files
- Negative: assert fail-fast on missing required values

---

## @atlas/auth

### Purpose

Authentication (who you are) and authorization (what you can do). Provides JWT issuance and verification, API key management, RBAC permission enforcement, SSO integration (OIDC/SAML), and session management. Multi-tenant aware — every permission check is scoped to an organization.

### Public API Surface

```typescript
// Authentication
export function issueJWT(subject: UserId, claims: JWTClaims): Promise<SignedJWT>;
export function verifyJWT(token: string): Promise<Result<JWTPayload>>;
export function refreshJWT(refreshToken: string): Promise<Result<TokenPair>>;
export function revokeJWT(jti: string): Promise<void>;

// API Keys
export function createAPIKey(opts: CreateAPIKeyOpts): Promise<APIKeyRecord>;
export function verifyAPIKey(raw: string): Promise<Result<APIKeyRecord>>;
export function revokeAPIKey(id: string): Promise<void>;
export function listAPIKeys(userId: UserId): Promise<APIKeyRecord[]>;

// RBAC
export function checkPermission(ctx: AuthContext, permission: Permission): Promise<boolean>;
export function requirePermission(ctx: AuthContext, permission: Permission): Promise<void>;
export function getEffectivePermissions(ctx: AuthContext): Promise<Permission[]>;
export function assignRole(userId: UserId, role: Role, orgId: OrgId): Promise<void>;
export function revokeRole(userId: UserId, role: Role, orgId: OrgId): Promise<void>;

// Middleware factory
export function createAuthMiddleware(opts: AuthMiddlewareOpts): RequestHandler;
export function createAPIKeyMiddleware(opts: APIKeyMiddlewareOpts): RequestHandler;

// SSO
export function beginSSOFlow(provider: SSOProvider, redirectUri: string): Promise<SSOInitiation>;
export function completeSSOFlow(provider: SSOProvider, code: string, state: string): Promise<SSOResult>;
```

### Roles and Permissions

```typescript
export type Role = 'owner' | 'admin' | 'engineer' | 'viewer' | 'agent';

export type Permission =
  | 'project:create' | 'project:read' | 'project:update' | 'project:delete'
  | 'blueprint:generate' | 'blueprint:read'
  | 'agent:spawn' | 'agent:terminate' | 'agent:read'
  | 'memory:read' | 'memory:write'
  | 'audit:run' | 'audit:read'
  | 'admin:users' | 'admin:billing' | 'admin:config'
  | 'apikey:create' | 'apikey:delete';
```

### Internal Architecture

- JWT: `jose` library, RS256 signing with rotating key pairs
- API keys: BLAKE3 hash stored in DB; raw key shown once to user
- RBAC: permissions resolved from DB and cached in Redis (TTL: 60s)
- Sessions: stored in Redis with sliding expiry

### Dependencies

- `@atlas/core`, `@atlas/config`, `@atlas/database`

### Error Types

```typescript
export class TokenExpiredError  extends AtlasError {}
export class TokenInvalidError  extends AtlasError {}
export class PermissionDenied   extends AtlasError { readonly required: Permission; }
export class InvalidAPIKeyError extends AtlasError {}
export class SSOFlowError       extends AtlasError { readonly provider: string; }
```

### Performance Characteristics

- JWT verification: < 2 ms (crypto cached)
- RBAC lookup with cache hit: < 0.5 ms
- API key verification (BLAKE3): < 0.1 ms

---

## @atlas/database

### Purpose

Database access layer. Provides typed PostgreSQL client (via Drizzle ORM), connection pooling, health checking, migration runner, and transactional helpers. All queries are parameterized; raw string interpolation is forbidden and enforced by ESLint rule.

### Public API Surface

```typescript
export function createDatabaseClient(config: DatabaseConfig): DatabaseClient;

export interface DatabaseClient {
  query<T>(sql: SQL<T>): Promise<T[]>;
  queryOne<T>(sql: SQL<T>): Promise<T | null>;
  execute(sql: SQL): Promise<{ rowCount: number }>;
  transaction<T>(fn: (tx: Transaction) => Promise<T>): Promise<T>;
  healthCheck(): Promise<HealthStatus>;
  close(): Promise<void>;
}

// Migrations
export function runMigrations(client: DatabaseClient): Promise<MigrationResult>;
export function rollbackMigration(client: DatabaseClient, version: string): Promise<void>;
export function getMigrationStatus(client: DatabaseClient): Promise<MigrationStatus[]>;

// Helpers
export function paginate<T>(query: SQL<T>, opts: PaginationOpts): SQL<Page<T>>;
export function withSoftDelete<T>(query: SQL<T>): SQL<T>;
```

### Schema Conventions

- All tables have: `id`, `created_at`, `updated_at`, `deleted_at` (soft delete)
- Timestamps stored as `TIMESTAMPTZ` (always UTC)
- IDs are `TEXT` storing ULIDs (not UUID, for ordering consistency)
- `org_id` foreign key on all multi-tenant tables

### Connection Pool Settings

| Setting          | Value | Rationale                                 |
|-----------------|-------|-------------------------------------------|
| `min`            | 2     | Maintain warm connections                 |
| `max`            | 20    | Safe upper bound for pg_bouncer handoff   |
| `idleTimeout`    | 10s   | Release unused connections quickly        |
| `acquireTimeout` | 5s    | Fast-fail rather than queue indefinitely  |
| `maxUses`        | 7500  | Prevent connection staleness              |

### Migration Strategy

- Schema migrations: Drizzle Kit generated SQL files, versioned sequentially
- Data migrations: separate `data-migrations/` directory, run after schema
- Every `up.sql` has a corresponding `down.sql` (always reversible)
- Run in CI before tests; run at startup in production (idempotent)

### Dependencies

- `@atlas/core`, `@atlas/config`
- External: `drizzle-orm`, `postgres`, `drizzle-kit`

### Error Types

```typescript
export class QueryError       extends AtlasError { readonly query: string; }
export class ConnectionError  extends AtlasError { readonly host: string; }
export class MigrationError   extends AtlasError { readonly version: string; }
export class TransactionError extends AtlasError {}
export class DeadlockError    extends TransactionError {}
```

### Performance Characteristics

- Simple SELECT with index: < 2 ms p99
- Complex join (5 tables): < 20 ms p99
- Connection acquire from pool: < 1 ms p99
- Transaction commit: < 5 ms p99

---

## @atlas/graph

### Purpose

Neo4j client and Knowledge Graph operations layer. Provides a typed Cypher query builder, graph traversal helpers, schema enforcement, graph analytics, and the full Knowledge Graph CRUD API. Stores inter-entity relationships that are impossible to efficiently express in relational tables.

### Public API Surface

```typescript
export function createGraphClient(config: Neo4jConfig): GraphClient;

export interface GraphClient {
  run<T>(query: CypherQuery<T>): Promise<T[]>;
  runOne<T>(query: CypherQuery<T>): Promise<T | null>;
  write<T>(query: CypherQuery<T>): Promise<T[]>;
  transaction<T>(fn: (tx: GraphTransaction) => Promise<T>): Promise<T>;
  healthCheck(): Promise<HealthStatus>;
  close(): Promise<void>;
}

export class CypherBuilder {
  match(pattern: NodePattern | RelPattern): this;
  where(conditions: Conditions): this;
  with(vars: string[]): this;
  create(pattern: NodePattern | RelPattern): this;
  merge(pattern: NodePattern | RelPattern): this;
  set(props: PropertyMap): this;
  delete(vars: string[]): this;
  return(vars: string[] | ReturnMap): this;
  limit(n: number): this;
  skip(n: number): this;
  orderBy(field: string, dir?: 'ASC' | 'DESC'): this;
  build(): CypherQuery;
}

export class KnowledgeGraph {
  createNode(label: NodeLabel, props: NodeProps): Promise<KnowledgeNode>;
  updateNode(id: string, props: Partial<NodeProps>): Promise<KnowledgeNode>;
  deleteNode(id: string): Promise<void>;
  getNode(id: string): Promise<KnowledgeNode | null>;
  findNodes(label: NodeLabel, filter: Filter): Promise<KnowledgeNode[]>;
  createEdge(from: string, to: string, type: EdgeType, props?: EdgeProps): Promise<KnowledgeEdge>;
  deleteEdge(id: string): Promise<void>;
  shortestPath(from: string, to: string, maxDepth?: number): Promise<GraphPath | null>;
  neighbors(id: string, depth?: number, edgeTypes?: EdgeType[]): Promise<KnowledgeNode[]>;
  subgraph(rootId: string, depth: number): Promise<GraphSubgraph>;
  pageRank(label?: NodeLabel): Promise<Map<string, number>>;
  communityDetection(algorithm: 'louvain' | 'label-propagation'): Promise<Community[]>;
  searchNodes(query: string, labels?: NodeLabel[]): Promise<KnowledgeNode[]>;
}

export type NodeLabel = 
  | 'Project' | 'Technology' | 'Pattern' | 'Risk' | 'Decision'
  | 'Requirement' | 'Component' | 'Team' | 'Concept' | 'Entity';

export type EdgeType =
  | 'DEPENDS_ON' | 'USES' | 'IMPLEMENTS' | 'CONFLICTS_WITH' | 'SUPERSEDES'
  | 'RELATED_TO' | 'BELONGS_TO' | 'INFLUENCES' | 'MITIGATES' | 'EXPOSES';
```

### Internal Architecture

- Connections: Neo4j JavaScript driver v5, pool of 25 sessions
- Query safety: all parameters bound; no string interpolation in Cypher
- Schema constraints: enforced via `CREATE CONSTRAINT` on startup
- Fulltext index on `name`, `description` for all node types

### Dependencies

- `@atlas/core`, `@atlas/config`
- External: `neo4j-driver`

### Error Types

```typescript
export class GraphQueryError      extends AtlasError {}
export class NodeNotFoundError    extends AtlasError { readonly nodeId: string; }
export class GraphConstraintError extends AtlasError {}
export class GraphConnectionError extends AtlasError {}
```

---

## @atlas/vector

### Purpose

Vector storage, embedding generation, and semantic similarity search. Wraps Qdrant as the vector database and provides provider-agnostic embedding generation (OpenAI, Cohere, local). Powers the semantic layer of the Memory Engine and enables fuzzy matching across all Atlas entities.

### Public API Surface

```typescript
export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
  dimensions: number;
  model: string;
}

export function createEmbeddingProvider(opts: EmbeddingProviderOpts): EmbeddingProvider;

export interface VectorStore {
  upsert(collection: string, points: VectorPoint[]): Promise<void>;
  delete(collection: string, ids: string[]): Promise<void>;
  search(collection: string, opts: SearchOpts): Promise<SearchResult[]>;
  searchByText(collection: string, text: string, opts?: SearchOpts): Promise<SearchResult[]>;
  getPoint(collection: string, id: string): Promise<VectorPoint | null>;
  createCollection(name: string, opts: CollectionOpts): Promise<void>;
  deleteCollection(name: string): Promise<void>;
  collectionInfo(name: string): Promise<CollectionInfo>;
  healthCheck(): Promise<HealthStatus>;
}

export function createVectorStore(config: QdrantConfig): VectorStore;

export interface VectorPoint {
  id: string;
  vector: number[];
  payload: Record<string, unknown>;
}

export interface SearchOpts {
  limit: number;            // default: 10
  scoreThreshold?: number;  // default: 0.7
  filter?: QdrantFilter;
  withPayload?: boolean;    // default: true
  withVector?: boolean;     // default: false
}

export const COLLECTIONS = {
  MEMORY:     'atlas_memory',
  BLUEPRINTS: 'atlas_blueprints',
  RESEARCH:   'atlas_research',
  CODE:       'atlas_code',
  DECISIONS:  'atlas_decisions',
} as const;
```

### Embedding Models Reference

| Provider | Model                  | Dimensions | Max Tokens | Cost/1M Tokens |
|----------|------------------------|-----------|------------|----------------|
| OpenAI   | text-embedding-3-large | 3072      | 8192       | $0.13          |
| OpenAI   | text-embedding-3-small | 1536      | 8192       | $0.02          |
| Cohere   | embed-english-v3.0     | 1024      | 512        | $0.10          |
| Local    | nomic-embed-text       | 768       | 8192       | Free           |

### Dependencies

- `@atlas/core`, `@atlas/config`
- External: `@qdrant/js-client-rest`, `openai`, `cohere-ai`

---

## @atlas/ai

### Purpose

Unified AI provider abstraction layer. Normalizes OpenAI, Anthropic, Google Gemini, and local Ollama models behind a single interface. Handles streaming responses, structured output (JSON mode), token counting, cost tracking, rate limiting, provider fallback, and prompt caching.

### Public API Surface

```typescript
export interface AIClient {
  complete(opts: CompletionOpts): Promise<CompletionResult>;
  stream(opts: CompletionOpts): AsyncIterable<CompletionChunk>;
  completeStructured<T>(opts: StructuredCompletionOpts<T>): Promise<T>;
  countTokens(text: string): number;
  estimateCost(opts: CostEstimateOpts): CostEstimate;
}

export function createAIClient(config: AIConfig): AIClient;
export function createProviderRouter(providers: AIProviderConfig[]): AIClient;

export interface CompletionOpts {
  model: ModelRef;
  messages: Message[];
  system?: string;
  temperature?: number;       // 0.0–2.0, default 0.7
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
  tools?: ToolDefinition[];
  toolChoice?: 'auto' | 'none' | ToolRef;
  responseFormat?: 'text' | 'json_object';
  seed?: number;
  timeout?: number;
  metadata?: Record<string, string>;
}

export interface CompletionResult {
  id: string;
  model: string;
  content: string;
  toolCalls?: ToolCall[];
  usage: TokenUsage;
  cost: CostUSD;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter';
  latencyMs: number;
  provider: string;
  cached: boolean;
}

export interface CostTracker {
  record(run: CostRecord): void;
  getTotal(filter?: CostFilter): Promise<CostSummary>;
  getBudgetStatus(projectId: ProjectId): Promise<BudgetStatus>;
  setBudget(projectId: ProjectId, limitUSD: number): Promise<void>;
}

export const MODELS = {
  CLAUDE_4_5:      'anthropic/claude-sonnet-4-5',
  GPT_4O:          'openai/gpt-4o',
  GEMINI_2_5_PRO:  'google/gemini-2.5-pro',
  LLAMA_3_3_70B:   'ollama/llama3.3:70b',
  MISTRAL_LARGE:   'mistral/mistral-large-latest',
} as const;
```

### Provider Fallback Chain

```
Primary → Secondary → Tertiary → Circuit-Open Error
  Rate limited? → rotate to next provider
  Error 5xx?    → backoff + retry → next provider
  Timeout?      → cancel + try next provider
```

### Dependencies

- `@atlas/core`, `@atlas/config`, `@atlas/database`, `@atlas/telemetry`
- External: `openai`, `@anthropic-ai/sdk`, `@google/generative-ai`, `ollama`

### Error Types

```typescript
export class AIProviderError   extends AtlasError { readonly provider: string; }
export class TokenLimitError   extends AtlasError { readonly limit: number; readonly used: number; }
export class BudgetExceeded    extends AtlasError { readonly limitUSD: number; }
export class ToolCallError     extends AtlasError { readonly toolName: string; }
export class StructuredError   extends AtlasError { readonly schema: string; }
```

---

## @atlas/memory

### Purpose

Persistent project memory management. Implements three memory types: **Episodic** (timestamped past events), **Semantic** (factual knowledge about the project), and **Procedural** (how-to knowledge and patterns). Integrates with `@atlas/vector` for similarity retrieval and `@atlas/graph` for relationship-aware recall.

### Public API Surface

```typescript
export interface MemoryEngine {
  remember(item: MemoryInput): Promise<Memory>;
  rememberBatch(items: MemoryInput[]): Promise<Memory[]>;
  forget(id: MemoryId): Promise<void>;
  recall(query: RecallQuery): Promise<Memory[]>;
  recallById(id: MemoryId): Promise<Memory | null>;
  recallByType(type: MemoryType, projectId: ProjectId, limit?: number): Promise<Memory[]>;
  buildContext(query: string, opts: ContextBuildOpts): Promise<MemoryContext>;
  consolidate(projectId: ProjectId): Promise<ConsolidationResult>;
  prune(projectId: ProjectId, strategy: PruneStrategy): Promise<PruneResult>;
  summarize(memories: Memory[]): Promise<string>;
  stats(projectId: ProjectId): Promise<MemoryStats>;
}

export type MemoryType = 'episodic' | 'semantic' | 'procedural';

export interface MemoryInput {
  projectId: ProjectId;
  type: MemoryType;
  content: string;
  source: string;       // 'agent:researcher', 'user:interaction', etc.
  importance: number;   // 0.0–1.0
  tags?: string[];
  linkedNodeIds?: string[];
  ttlDays?: number;     // null = permanent
}

export interface RecallQuery {
  projectId: ProjectId;
  query: string;
  types?: MemoryType[];
  limit?: number;       // default: 20
  minScore?: number;    // default: 0.65
  recency?: 'recent' | 'all';
  tags?: string[];
}

export interface MemoryContext {
  memories: Memory[];
  totalTokens: number;
  summary?: string;
}
```

### Memory Consolidation Algorithm

1. Cluster similar episodic memories using vector similarity (cosine)
2. Promote high-importance clusters to semantic memories
3. Extract recurring patterns into procedural memories
4. Apply forgetting curve decay to importance scores (Ebbinghaus model)
5. Prune memories below threshold after TTL expiry

### Memory Storage

- Primary store: PostgreSQL (`memories` table) for durability and filtering
- Vector store: Qdrant `atlas_memory` collection for similarity search
- Graph layer: Neo4j nodes linked to relevant KnowledgeNodes

### Dependencies

- `@atlas/core`, `@atlas/config`, `@atlas/database`, `@atlas/vector`, `@atlas/graph`, `@atlas/ai`

---

## @atlas/agents

### Purpose

Agent base class, lifecycle management, capability registry, and inter-agent communication primitives. Every specialized Atlas agent extends `BaseAgent`. Provides the agent execution loop, tool invocation, state persistence, and sandboxed execution context.

### Public API Surface

```typescript
export abstract class BaseAgent {
  abstract readonly id: AgentId;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly capabilities: Capability[];
  abstract readonly defaultModel: ModelRef;

  abstract execute(input: AgentInput, ctx: AgentContext): Promise<AgentOutput>;

  protected onStart?(ctx: AgentContext): Promise<void>;
  protected onComplete?(output: AgentOutput, ctx: AgentContext): Promise<void>;
  protected onError?(error: AtlasError, ctx: AgentContext): Promise<void>;
  protected onTimeout?(ctx: AgentContext): Promise<void>;

  protected recall(query: string): Promise<Memory[]>;
  protected remember(content: string, type: MemoryType): Promise<void>;
  protected emit(event: AgentEvent): Promise<void>;
  protected callTool(name: string, input: unknown): Promise<unknown>;
  protected delegate(agentId: AgentId, input: AgentInput): Promise<AgentOutput>;
  protected think(prompt: string, opts?: ThinkOpts): Promise<string>;
  protected plan(goal: string): Promise<Plan>;
}

export interface AgentRegistry {
  register(agent: BaseAgent): void;
  get(id: AgentId): BaseAgent | null;
  getByCapability(capability: Capability): BaseAgent[];
  list(): AgentManifest[];
  healthCheck(): Promise<AgentHealthReport>;
}

export interface AgentLifecycleManager {
  spawn(agentId: AgentId, input: AgentInput, opts?: SpawnOpts): Promise<AgentRun>;
  terminate(runId: RunId): Promise<void>;
  getRunStatus(runId: RunId): Promise<AgentRunStatus>;
  getRun(runId: RunId): Promise<AgentRun | null>;
  listRuns(filter?: RunFilter): Promise<AgentRun[]>;
  replayRun(runId: RunId): Promise<AgentRun>;
}

export const AGENT_IDS = {
  REQUIREMENT_ANALYST:  'agent:requirement-analyst'  as AgentId,
  SOLUTION_ARCHITECT:   'agent:solution-architect'   as AgentId,
  RESEARCHER:           'agent:researcher'            as AgentId,
  BLUEPRINT_GENERATOR:  'agent:blueprint-generator'  as AgentId,
  CONSTITUTION_DRAFTER: 'agent:constitution-drafter' as AgentId,
  TECH_AUDITOR:         'agent:tech-auditor'          as AgentId,
  PLANNER:              'agent:planner'               as AgentId,
  RED_TEAM_LEADER:      'agent:red-team-leader'       as AgentId,
  SIMULATOR:            'agent:simulator'             as AgentId,
  MEMORY_CURATOR:       'agent:memory-curator'        as AgentId,
  MCP_SCOUT:            'agent:mcp-scout'             as AgentId,
  CODE_REVIEWER:        'agent:code-reviewer'         as AgentId,
  DOCUMENTATION_WRITER: 'agent:doc-writer'            as AgentId,
  SECURITY_ANALYST:     'agent:security-analyst'      as AgentId,
  PERFORMANCE_ENGINEER: 'agent:performance-engineer'  as AgentId,
  DATA_MODELER:         'agent:data-modeler'          as AgentId,
  API_DESIGNER:         'agent:api-designer'          as AgentId,
  DEVOPS_ENGINEER:      'agent:devops-engineer'       as AgentId,
} as const;
```

### Agent Execution Loop

```
Input Received
     |
     v
OnStart Hook ---> Memory Recall ---> Build Prompt
                                          |
                                          v
                                  LLM Completion <---------------------+
                                          |                            |
                          +--------------+------------------+          |
                          v                                 v          |
                   Tool Call?                        Final Answer      |
                          |                                 |          |
                          v                                 |          |
                   Execute Tool ----------------------------->---------+
                          |                          Max Iterations?
                          |
                   Memory Write + Event Emit
```

### Dependencies

- `@atlas/core`, `@atlas/config`, `@atlas/database`, `@atlas/ai`, `@atlas/memory`, `@atlas/telemetry`, `@atlas/events`

---

## @atlas/orchestrator

### Purpose

LangGraph-based multi-agent workflow orchestration. Defines the Atlas Orchestration Graph (AOG) — a directed, stateful graph where nodes are agents or engines and edges are conditional transitions. Manages workflow checkpointing, parallel execution, human-in-the-loop interrupts, and workflow replay.

### Public API Surface

```typescript
export class WorkflowBuilder {
  addNode(name: string, executor: NodeExecutor): this;
  addEdge(from: string, to: string): this;
  addConditionalEdge(from: string, router: EdgeRouter): this;
  addParallelBranch(from: string, branches: string[]): this;
  setEntryPoint(name: string): this;
  setFinishPoint(name: string): this;
  addCheckpoint(nodeName: string): this;
  addHIL(nodeName: string, timeout?: number): this;
  compile(): CompiledWorkflow;
}

export interface CompiledWorkflow {
  run(input: WorkflowInput, opts?: RunOpts): Promise<WorkflowResult>;
  stream(input: WorkflowInput, opts?: RunOpts): AsyncIterable<WorkflowEvent>;
  resume(checkpointId: string, decision: HILDecision): Promise<WorkflowResult>;
  getState(runId: RunId): Promise<WorkflowState>;
  visualize(): WorkflowDiagram;
}

export const WORKFLOWS = {
  FULL_PROJECT_GENESIS: createFullGenesisWorkflow,
  QUICK_BLUEPRINT:      createQuickBlueprintWorkflow,
  INCREMENTAL_AUDIT:    createIncrementalAuditWorkflow,
  RED_TEAM_SIMULATION:  createRedTeamWorkflow,
  MEMORY_CONSOLIDATION: createMemoryConsolidationWorkflow,
} as const;
```

### Atlas Orchestration Graph (AOG)

```
[User Input]
     |
[Requirement Analyst] --> [Solution Architect]
                                  |
     +----------------------------+----------------------------+
     v                            v                           v
[Researcher]              [Data Modeler]              [Security Analyst]
     |                            |                           |
     +----------------------------+----------------------------+
                                  |
                          [Blueprint Generator]
                                  |
                          [Constitution Drafter]
                                  |
                  +---------------+----------------+
                  v               v                v
           [Tech Auditor]  [Red Team Leader]  [Simulator]
                  |               |                |
                  +---------------+----------------+
                                  |
                    [Planner (ADR + Sprint 0)]
                                  |
                          [Engineering Score]
                                  |
                          [Memory Curator]
                                  |
                        [Output / Complete]
```

### Dependencies

- `@atlas/core`, `@atlas/config`, `@atlas/agents`, `@atlas/events`, `@atlas/database`, `@atlas/telemetry`
- External: `@langchain/langgraph`

---

## @atlas/mcp

### Purpose

Model Context Protocol server registry, client management, tool routing, and automated MCP discovery. Enables Atlas agents to consume any MCP-compatible tool server. Implements MCP Discovery Engine that automatically finds, evaluates, and registers relevant MCP servers for a project.

### Public API Surface

```typescript
export interface MCPClient {
  connect(server: MCPServerConfig): Promise<MCPConnection>;
  disconnect(serverId: string): Promise<void>;
  listTools(serverId: string): Promise<MCPTool[]>;
  callTool(serverId: string, toolName: string, input: unknown): Promise<MCPToolResult>;
  listResources(serverId: string): Promise<MCPResource[]>;
  readResource(serverId: string, uri: string): Promise<MCPResourceContent>;
}

export interface MCPRegistry {
  register(server: MCPServerConfig): Promise<void>;
  unregister(serverId: string): Promise<void>;
  get(serverId: string): MCPServerRecord | null;
  listAll(): MCPServerRecord[];
  listByCategory(category: MCPCategory): MCPServerRecord[];
  search(query: string): MCPServerRecord[];
  healthCheck(serverId: string): Promise<MCPHealthStatus>;
}

export interface MCPDiscoveryEngine {
  discoverForProject(project: Project, opts?: DiscoveryOpts): Promise<DiscoveryResult>;
  evaluateServer(server: MCPServerConfig): Promise<EvaluationResult>;
  scoreRelevance(server: MCPServerRecord, project: Project): Promise<number>;
  suggestMissing(project: Project): Promise<MCPSuggestion[]>;
}

export type MCPCategory =
  | 'version-control' | 'ci-cd' | 'cloud' | 'database'
  | 'monitoring' | 'communication' | 'documentation'
  | 'security' | 'analytics' | 'testing' | 'design';
```

### MCP Discovery Algorithm

1. Analyze project tech stack from Blueprint
2. Query MCP marketplace registry for matching servers
3. Score each candidate (relevance x reliability x license compatibility)
4. Auto-install servers above threshold (score > 0.80)
5. Present manual review queue for 0.50-0.80 range
6. Register accepted servers into active registry

### Dependencies

- `@atlas/core`, `@atlas/config`, `@atlas/database`, `@atlas/vector`, `@atlas/ai`
- External: `@modelcontextprotocol/sdk`

---

## @atlas/research

### Purpose

The Research Engine. Performs deep, multi-source research on a project's domain, technology stack, competitive landscape, regulatory requirements, and best practices. Uses agent chains with web search, documentation retrieval, and knowledge synthesis to produce structured ResearchReport entities.

### Public API Surface

```typescript
export interface ResearchEngine {
  research(request: ResearchRequest): Promise<ResearchReport>;
  streamResearch(request: ResearchRequest): AsyncIterable<ResearchProgress>;
  quickScan(topic: string): Promise<ResearchSummary>;
  compareAlternatives(options: AlternativeComparison): Promise<ComparisonMatrix>;
  identifyRisks(context: ProjectContext): Promise<Risk[]>;
  findBestPractices(domain: string, stack: string[]): Promise<BestPractice[]>;
  assessTechDebt(codebase: CodebaseContext): Promise<TechDebtReport>;
}

export interface ResearchRequest {
  projectId: ProjectId;
  topics: ResearchTopic[];
  depth: 'quick' | 'standard' | 'deep';
  focus?: ResearchFocus[];
  excludeSources?: string[];
  maxSources?: number;
  asOf?: ISODateString;
}

export type ResearchTopic =
  | 'tech-stack-validation'
  | 'competitive-analysis'
  | 'security-considerations'
  | 'scalability-patterns'
  | 'regulatory-compliance'
  | 'industry-benchmarks'
  | 'open-source-alternatives'
  | 'migration-paths';
```

### Research Pipeline

```
Request --> Topic Decomposition --> Parallel Web Search (Tavily/Brave)
                                         |
                                  Source Ranking & Dedup
                                         |
                               Content Extraction & Chunking
                                         |
                                  Vector Similarity Scoring
                                         |
                            Agent Synthesis (Claude Sonnet)
                                         |
                               Structured Report Generation
                                         |
                          Memory Storage + Knowledge Graph Update
```

### Dependencies

- `@atlas/core`, `@atlas/agents`, `@atlas/memory`, `@atlas/graph`, `@atlas/vector`, `@atlas/ai`

---

## @atlas/blueprint

### Purpose

Blueprint generation, validation, and versioning. A Blueprint is the master technical specification of a project — the single source of truth that all subsequent Atlas work derives from. Generates comprehensive Blueprints from research reports and requirements through agentic synthesis.

### Public API Surface

```typescript
export interface BlueprintEngine {
  generate(input: BlueprintInput): Promise<Blueprint>;
  validate(blueprint: Blueprint): Promise<ValidationResult>;
  diff(v1: Blueprint, v2: Blueprint): Promise<BlueprintDiff>;
  evolve(blueprint: Blueprint, changes: ChangeRequest[]): Promise<Blueprint>;
  export(blueprint: Blueprint, format: ExportFormat): Promise<Buffer>;
  score(blueprint: Blueprint): Promise<BlueprintScore>;
}

export type ExportFormat = 'json' | 'markdown' | 'pdf' | 'yaml' | 'html';

export interface BlueprintScore {
  completeness: number;    // 0-100
  consistency: number;     // 0-100
  security: number;        // 0-100
  scalability: number;     // 0-100
  maintainability: number; // 0-100
  overall: number;         // weighted average
  issues: BlueprintIssue[];
}
```

### Standard Blueprint Sections

Every Atlas Blueprint contains exactly these sections:
1. Executive Summary
2. Problem Statement and Goals
3. System Architecture Overview
4. Technology Stack (with rationale for each choice)
5. Data Architecture
6. API Design Principles
7. Security Architecture
8. Infrastructure and Deployment
9. Scalability Strategy
10. Observability Plan
11. Risk Register
12. Open Questions
13. Appendices (diagrams, references)

### Dependencies

- `@atlas/core`, `@atlas/agents`, `@atlas/research`, `@atlas/memory`, `@atlas/graph`, `@atlas/database`

---

## @atlas/constitution

### Purpose

Constitution generation and enforcement. The Constitution is the project's binding set of principles, non-negotiable standards, architectural invariants, and quality gates. Every agent action is evaluated against the Constitution. Violations block progress until resolved or explicitly overridden by an authorized human.

### Public API Surface

```typescript
export interface ConstitutionEngine {
  generate(blueprint: Blueprint): Promise<Constitution>;
  evaluate(action: AgentAction, constitution: Constitution): Promise<EvaluationResult>;
  enforce(action: AgentAction, constitution: Constitution): Promise<EnforcementDecision>;
  update(id: string, amendment: Amendment): Promise<Constitution>;
  diff(v1: Constitution, v2: Constitution): Promise<ConstitutionDiff>;
  export(constitution: Constitution, format: ExportFormat): Promise<Buffer>;
}

export interface ConstitutionPrinciple {
  id: string;
  title: string;
  description: string;
  rationale: string;
  category: PrincipleCategory;
  severity: 'must' | 'should' | 'may';
  automatable: boolean;
  checkFn?: string;
}

export type PrincipleCategory =
  | 'architecture' | 'security' | 'performance' | 'quality'
  | 'reliability' | 'data' | 'api' | 'process' | 'ethics';

export interface EnforcementDecision {
  allowed: boolean;
  violations: ConstitutionViolation[];
  warnings: ConstitutionWarning[];
  recommendations: string[];
  overrideRequired: boolean;
}
```

### Dependencies

- `@atlas/core`, `@atlas/blueprint`, `@atlas/agents`, `@atlas/memory`, `@atlas/database`

---

## @atlas/planning

### Purpose

Planning Engine. Transforms Blueprints and Constitutions into actionable, prioritized project plans. Generates ADRs, Sprint 0 checklist, milestone roadmap, task breakdown, dependency graph, and effort estimates. Continuously re-plans as project context evolves.

### Public API Surface

```typescript
export interface PlanningEngine {
  createProjectPlan(input: PlanInput): Promise<ProjectPlan>;
  generateADRs(blueprint: Blueprint): Promise<ADR[]>;
  createSprint0(plan: ProjectPlan): Promise<Sprint>;
  estimateEffort(tasks: Task[]): Promise<EffortEstimate[]>;
  prioritize(tasks: Task[], criteria: PriorityCriteria): Promise<Task[]>;
  detectDependencyCycles(tasks: Task[]): Promise<CycleReport>;
  replan(plan: ProjectPlan, changes: PlanChange[]): Promise<ProjectPlan>;
  generateMilestones(plan: ProjectPlan): Promise<Milestone[]>;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'feature' | 'spike' | 'bug' | 'infra' | 'docs' | 'test';
  priority: 1 | 2 | 3 | 4 | 5;
  storyPoints?: number;
  dependsOn: string[];
  assignedAgent?: AgentId;
  tags: string[];
  acceptanceCriteria: string[];
  estimatedHours?: number;
}
```

### Dependencies

- `@atlas/core`, `@atlas/blueprint`, `@atlas/constitution`, `@atlas/agents`, `@atlas/graph`

---

## @atlas/audit

### Purpose

Technical Audit Engine. Evaluates a project's codebase, architecture, documentation, and operational practices against the Constitution, industry standards, and Atlas best practices. Produces scored audit reports and the Engineering Score — Atlas's composite metric of project health.

### Public API Surface

```typescript
export interface AuditEngine {
  runAudit(request: AuditRequest): Promise<AuditReport>;
  scheduleAudit(schedule: AuditSchedule): Promise<ScheduledAudit>;
  compareAudits(a: AuditReport, b: AuditReport): Promise<AuditDelta>;
  getEngineeringScore(projectId: ProjectId): Promise<EngineeringScore>;
  getScoreHistory(projectId: ProjectId, days: number): Promise<EngineeringScore[]>;
  generateRecommendations(report: AuditReport): Promise<Recommendation[]>;
}

export const AUDIT_DIMENSIONS = {
  architecture:  { weight: 0.20, description: 'System design quality' },
  security:      { weight: 0.20, description: 'Security posture' },
  code_quality:  { weight: 0.15, description: 'Code health and maintainability' },
  test_coverage: { weight: 0.15, description: 'Test breadth and depth' },
  documentation: { weight: 0.10, description: 'Documentation completeness' },
  performance:   { weight: 0.10, description: 'Performance characteristics' },
  reliability:   { weight: 0.10, description: 'Uptime, error handling, resilience' },
} as const;
```

### Dependencies

- `@atlas/core`, `@atlas/constitution`, `@atlas/agents`, `@atlas/graph`, `@atlas/database`

---

## @atlas/simulation

### Purpose

Simulation Engine. Creates and executes digital simulations of system architectures to predict behavior under load, failure scenarios, and edge cases — before a single line of production code is written. Outputs probabilistic performance, reliability, and cost projections.

### Public API Surface

```typescript
export interface SimulationEngine {
  createSimulation(input: SimulationInput): Promise<Simulation>;
  run(simulationId: string): Promise<SimulationResult>;
  runScenario(simulationId: string, scenario: Scenario): Promise<ScenarioResult>;
  compareScenarios(results: ScenarioResult[]): Promise<ScenarioComparison>;
  generateReport(simulationId: string): Promise<SimulationReport>;
  predictBottlenecks(blueprint: Blueprint): Promise<Bottleneck[]>;
  estimateCostAtScale(blueprint: Blueprint, scale: ScaleParams): Promise<CostProjection>;
}

export interface Scenario {
  name: string;
  description: string;
  type: 'load' | 'failure' | 'edge-case' | 'chaos' | 'growth';
  parameters: ScenarioParameters;
  durationMinutes: number;
  targetSLA?: SLADefinition;
}
```

### Dependencies

- `@atlas/core`, `@atlas/blueprint`, `@atlas/agents`, `@atlas/ai`

---

## @atlas/redteam

### Purpose

Red Team Engine. Subjects a project Blueprint, Constitution, and architecture to adversarial analysis. Simulates attackers, identifies vulnerabilities, challenges architectural assumptions, and generates CVSS-scored findings with concrete mitigations.

### Public API Surface

```typescript
export interface RedTeamEngine {
  runRedTeam(request: RedTeamRequest): Promise<RedTeamReport>;
  threatModel(blueprint: Blueprint): Promise<ThreatModel>;
  attackSurface(blueprint: Blueprint): Promise<AttackSurface>;
  adversarialReview(constitution: Constitution): Promise<AdversarialReview>;
  generateAttackTree(threat: Threat): Promise<AttackTree>;
  prioritizeVulnerabilities(vulns: Vulnerability[]): Promise<Vulnerability[]>;
  suggestMitigations(vuln: Vulnerability): Promise<Mitigation[]>;
}

export interface Vulnerability {
  id: string;
  title: string;
  description: string;
  cvssScore: number;         // 0.0-10.0
  cvssVector: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: VulnCategory;
  affectedComponents: string[];
  exploitability: number;    // 0.0-1.0
  impact: number;            // 0.0-1.0
  mitigations: Mitigation[];
  references: string[];
}
```

### Red Team Agent Team

| Agent | Role |
|-------|------|
| Attacker Agent | Generates attack scenarios and exploitation paths |
| Defender Agent | Reviews mitigations and defense-in-depth |
| Threat Intelligence Agent | Correlates with known CVEs and threat actors |
| Compliance Agent | Maps findings to OWASP Top 10, CWE, NIST |

### Dependencies

- `@atlas/core`, `@atlas/blueprint`, `@atlas/constitution`, `@atlas/agents`, `@atlas/ai`

---

## @atlas/telemetry

### Purpose

OpenTelemetry integration for distributed tracing, metrics, and structured logging. Every Atlas module instruments itself using this package. Provides Atlas-specific metric definitions, cost attribution spans, and pre-built dashboard definitions for Grafana.

### Public API Surface

```typescript
export function createTracer(name: string): Tracer;
export function startSpan(name: string, opts?: SpanOpts): Span;
export function withSpan<T>(name: string, fn: (span: Span) => Promise<T>): Promise<T>;

export const Metrics = {
  agentRunDuration:    createHistogram('atlas.agent.run.duration_ms'),
  agentRunErrors:      createCounter('atlas.agent.run.errors'),
  llmTokensConsumed:   createCounter('atlas.llm.tokens.consumed'),
  llmCostUSD:          createCounter('atlas.llm.cost.usd'),
  memoryOperations:    createCounter('atlas.memory.operations'),
  mcpToolCalls:        createCounter('atlas.mcp.tool_calls'),
  workflowDuration:    createHistogram('atlas.workflow.duration_ms'),
  engineeringScore:    createGauge('atlas.project.engineering_score'),
  vectorSearchLatency: createHistogram('atlas.vector.search.latency_ms'),
  graphQueryLatency:   createHistogram('atlas.graph.query.latency_ms'),
  apiRequestDuration:  createHistogram('atlas.api.request.duration_ms'),
  activeSessions:      createGauge('atlas.auth.active_sessions'),
};

export function createLogger(name: string): Logger;

export interface Logger {
  debug(msg: string, ctx?: LogContext): void;
  info(msg: string, ctx?: LogContext): void;
  warn(msg: string, ctx?: LogContext): void;
  error(msg: string, error?: Error, ctx?: LogContext): void;
  child(ctx: LogContext): Logger;
}
```

### Dependencies

- `@atlas/core`, `@atlas/config`
- External: `@opentelemetry/sdk-node`, `@opentelemetry/api`, `pino`

---

## @atlas/events

### Purpose

Kafka-based event streaming and event sourcing. Every significant Atlas action is published as an immutable event. Enables audit trails, replay, reactive workflows, analytics, and integration with external systems. CloudEvents 1.0 compatible.

### Public API Surface

```typescript
export interface EventProducer {
  publish<T extends AtlasEvent>(event: T): Promise<void>;
  publishBatch<T extends AtlasEvent>(events: T[]): Promise<void>;
  flush(): Promise<void>;
}

export interface EventConsumer {
  subscribe(topic: EventTopic, handler: EventHandler, opts?: ConsumeOpts): Subscription;
  unsubscribe(subscription: Subscription): Promise<void>;
  seek(topic: EventTopic, offset: number): Promise<void>;
  commit(offset: OffsetCommit): Promise<void>;
}

export interface AtlasEvent<T = unknown> {
  id: EventId;
  specversion: '1.0';
  type: EventType;
  source: string;
  subject?: string;
  time: ISODateString;
  datacontenttype: 'application/json';
  data: T;
  traceId?: string;
  correlationId?: string;
}

export const EVENT_TOPICS = {
  AGENT_RUNS:   'atlas.agent-runs'   as EventTopic,
  BLUEPRINTS:   'atlas.blueprints'   as EventTopic,
  MEMORY:       'atlas.memory'       as EventTopic,
  AUDITS:       'atlas.audits'       as EventTopic,
  WORKFLOWS:    'atlas.workflows'    as EventTopic,
  USER_ACTIONS: 'atlas.user-actions' as EventTopic,
  SYSTEM:       'atlas.system'       as EventTopic,
} as const;
```

### Dependencies

- `@atlas/core`, `@atlas/config`
- External: `kafkajs`

---

## @atlas/api

### Purpose

REST API server built on Fastify. Exposes all Atlas capabilities as a well-documented, versioned HTTP API. Implements OpenAPI 3.1 spec, request validation, rate limiting, authentication middleware, response caching, and graceful shutdown.

### Route Modules

| Module              | Prefix               | Description                        |
|--------------------|----------------------|------------------------------------|
| ProjectRoutes       | /api/v1/projects     | Project CRUD and management        |
| BlueprintRoutes     | /api/v1/blueprints   | Blueprint generation and retrieval |
| AgentRoutes         | /api/v1/agents       | Agent management and runs          |
| MemoryRoutes        | /api/v1/memory       | Memory read and write              |
| ResearchRoutes      | /api/v1/research     | Research Engine triggers           |
| AuditRoutes         | /api/v1/audits       | Audit runs and scores              |
| MCPRoutes           | /api/v1/mcp          | MCP server management              |
| ConstitutionRoutes  | /api/v1/constitutions| Constitution management            |
| UserRoutes          | /api/v1/users        | User management                    |
| OrgRoutes           | /api/v1/organizations| Organization management            |
| WebhookRoutes       | /api/v1/webhooks     | Webhook subscriptions              |
| HealthRoutes        | /health              | Health and readiness checks        |

### Rate Limits

| Tier       | Requests/min | Burst  |
|-----------|-------------|--------|
| Free       | 60          | 100    |
| Pro        | 600         | 1000   |
| Enterprise | 6000        | 10000  |
| Internal   | Unlimited   | -      |

### Dependencies

- All `@atlas/*` modules
- External: `fastify`, `@fastify/swagger`, `@fastify/rate-limit`, `@fastify/cors`, `zod`

---

## @atlas/graphql

### Purpose

GraphQL API server using GraphQL Yoga with DataLoader for N+1 prevention. Provides a federated schema that mirrors the full Atlas data model. Supports subscriptions (WebSocket) for real-time agent run streaming and event notifications.

### Schema Coverage

- **Types**: Project, Blueprint, Constitution, Agent, AgentRun, Memory, ResearchReport, AuditReport, EngineeringScore, ADR, KnowledgeNode, MCPServer, User, Organization
- **Queries**: Full filterable, paginated access to all entities
- **Mutations**: Create, update, delete, and trigger operations
- **Subscriptions**: agentRunUpdated, engineeringScoreUpdated, memoryAdded, workflowProgressed

### Dependencies

- `@atlas/core`, `@atlas/api` (shared route logic), all engine modules
- External: `graphql-yoga`, `dataloader`, `graphql`

---

## @atlas/grpc

### Purpose

gRPC server definitions and generated stubs for high-performance, language-agnostic communication. Used for internal service-to-service calls and SDK streaming operations. Protobuf schemas are the source of truth.

### Service Definitions (abbreviated)

```protobuf
service AgentService {
  rpc SpawnAgent(SpawnRequest)   returns (AgentRun);
  rpc StreamRun(StreamRequest)  returns (stream RunEvent);
  rpc TerminateRun(TermRequest) returns (TermResponse);
}

service MemoryService {
  rpc Remember(RememberRequest)       returns (MemoryRecord);
  rpc Recall(RecallRequest)           returns (RecallResponse);
  rpc BuildContext(ContextRequest)    returns (ContextResponse);
}

service BlueprintService {
  rpc Generate(GenerateRequest) returns (stream GenerateEvent);
  rpc Validate(ValidateRequest) returns (ValidationResult);
}
```

### Dependencies

- `@atlas/core`, all service modules
- External: `@grpc/grpc-js`, `@grpc/proto-loader`

---

## @atlas/cli

### Purpose

Command-line interface for developers. Provides `atlas` CLI with rich interactive prompts, project initialization, agent triggering, real-time output streaming, and local development helpers. Built with Ink (React for CLI) for rich terminal UI.

### Command Structure

```
atlas init [project-name]           Initialize new Atlas project
atlas blueprint generate            Generate project blueprint
atlas blueprint show                View current blueprint
atlas research [topic]              Run Research Engine
atlas agent spawn <agent-id>        Spawn a specific agent
atlas agent list                    List all agents and status
atlas audit run                     Run Technical Audit
atlas audit score                   Show Engineering Score
atlas memory recall <query>         Query project memory
atlas mcp discover                  Run MCP Discovery
atlas mcp list                      List registered MCP servers
atlas redteam run                   Run Red Team Engine
atlas simulate run                  Run Simulation Engine
atlas plan generate                 Generate project plan
atlas adr list                      List all ADRs
atlas adr create                    Create new ADR interactively
atlas workflow run <workflow-name>   Run named workflow
atlas config init                   Interactive config setup
atlas config validate               Validate current config
atlas login                         Authenticate with Atlas Cloud
atlas status                        System status overview
```

### Dependencies

- `@atlas/core`, `@atlas/config`, `@atlas/sdk`
- External: `ink`, `commander`, `inquirer`, `chalk`, `ora`, `boxen`

---

## @atlas/sdk

### Purpose

TypeScript/JavaScript SDK for programmatic access to Atlas. Designed for embedding Atlas capabilities into external applications, CI/CD pipelines, and custom tooling. Ships with a Python SDK counterpart generated from the OpenAPI spec.

### Public API Surface

```typescript
export class AtlasSDK {
  constructor(opts: SDKOptions);

  readonly projects:    ProjectsClient;
  readonly blueprints:  BlueprintsClient;
  readonly agents:      AgentsClient;
  readonly memory:      MemoryClient;
  readonly research:    ResearchClient;
  readonly audit:       AuditClient;
  readonly mcp:         MCPClient;
  readonly constitution: ConstitutionClient;
  readonly planning:    PlanningClient;
  readonly simulation:  SimulationClient;
  readonly redteam:     RedTeamClient;
  readonly events:      EventsClient;
}

export interface SDKOptions {
  apiUrl?: string;     // default: 'https://api.atlas.dev'
  apiKey?: string;
  token?: string;
  timeout?: number;    // default: 30_000
  retries?: number;    // default: 3
  onError?: (err: AtlasError) => void;
  logger?: Logger;
}
```

### Streaming Support

```typescript
// SSE streaming for long-running operations
const stream = sdk.blueprints.generateStream({ projectId, requirements });
for await (const chunk of stream) {
  console.log(chunk.type, chunk.data);
}
```

### Dependencies

- `@atlas/core` (types only)
- External: `zod`, `eventsource-parser`

---

## @atlas/marketplace

### Purpose

Plugin and MCP marketplace. Enables discovery, installation, rating, and publishing of Atlas plugins and MCP server integrations. Curated registry with security scanning, license validation, and compatibility checking. Supports public and private organization registries.

### Public API Surface

```typescript
export interface Marketplace {
  search(query: string, filters?: SearchFilters): Promise<SearchResults>;
  getPlugin(slug: string): Promise<PluginManifest>;
  getFeatured(): Promise<PluginManifest[]>;
  install(slug: string, version?: string): Promise<InstallResult>;
  uninstall(slug: string): Promise<void>;
  update(slug: string): Promise<UpdateResult>;
  listInstalled(): Promise<InstalledPlugin[]>;
  publish(manifest: PluginManifest, artifact: Buffer): Promise<PublishResult>;
  scanPlugin(artifact: Buffer): Promise<SecurityScanResult>;
  ratePlugin(slug: string, rating: Rating): Promise<void>;
  getReviews(slug: string): Promise<Review[]>;
}

export interface PluginManifest {
  slug: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  atlasVersion: string;
  category: PluginCategory;
  capabilities: string[];
  mcpServers?: MCPServerConfig[];
  permissions: Permission[];
  homepage?: string;
  repository?: string;
  verified: boolean;
  downloads: number;
  rating: number;
}
```

### Security Scanning Pipeline

1. Static analysis — detect secrets, malicious code patterns
2. License compatibility check (GPL/AGPL detection for commercial use)
3. Dependency vulnerability scan (SBOM generation)
4. Sandboxed execution test
5. AI-assisted code review for suspicious patterns
6. Manual review gate for verified publisher badge

### Dependencies

- `@atlas/core`, `@atlas/config`, `@atlas/database`, `@atlas/auth`, `@atlas/vector`, `@atlas/ai`

---

## Cross-Cutting Concerns

### Module Versioning

All modules follow SemVer. Modules within the same Atlas release ship at the same version. Breaking API changes within a minor release are forbidden.

### Health Check Contract

Every module that owns I/O resources implements:

```typescript
interface HealthCheckable {
  healthCheck(): Promise<HealthStatus>;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latencyMs: number;
  details?: Record<string, unknown>;
  checkedAt: ISODateString;
}
```

### Observability Contract

Every module must:
1. Create a named logger via `@atlas/telemetry`
2. Create a named tracer and wrap all I/O operations in spans
3. Record relevant metrics using the shared `Metrics` registry
4. Propagate `traceId` and `correlationId` through all async boundaries

### Dependency Injection Contract

All modules accept their dependencies as constructor parameters or factory function arguments — never as global singletons. This enables clean unit testing with mock implementations, multiple instances with different configurations, and clear dependency graph documentation.

### Testing Requirements

| Layer    | Unit | Integration | E2E |
|----------|------|------------|-----|
| core     | 100% | -          | -   |
| config   | 90%  | Required   | -   |
| database | 80%  | Required   | -   |
| agents   | 80%  | Required   | -   |
| engines  | 75%  | Required   | Required |
| api      | 70%  | Required   | Required |
| cli      | 60%  | Required   | Required |

---

*End of Atlas Module Specifications v1.0.0*
