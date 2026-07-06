# Atlas Engineering OS — REST API Specification

**Version:** 1.0.0  
**Base URL:** `https://api.atlas.engineering/v1`  
**Specification Format:** OpenAPI 3.1  
**Last Updated:** 2026-07-06  

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Common Conventions](#common-conventions)
4. [Rate Limiting](#rate-limiting)
5. [Pagination](#pagination)
6. [Error Handling](#error-handling)
7. [Endpoint Groups](#endpoint-groups)
   - [Projects](#1-projects)
   - [Blueprints](#2-blueprints)
   - [Agents](#3-agents)
   - [Memory](#4-memory)
   - [Knowledge Graph](#5-knowledge-graph)
   - [Research](#6-research)
   - [Score](#7-score)
   - [MCP Servers](#8-mcp-servers)
   - [Plugins](#9-plugins)
   - [ADRs](#10-adrs)
   - [Audits](#11-audits)
   - [Simulations](#12-simulations)
   - [Red Team](#13-red-team)
   - [Organizations](#14-organizations)
   - [Users](#15-users)
   - [Webhooks](#16-webhooks)

---

## Overview

The Atlas API is a RESTful HTTP API that provides programmatic access to all Atlas Engineering OS capabilities. All request and response bodies are JSON. The API follows REST semantics and uses standard HTTP verbs (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).

### Environments

| Environment | Base URL |
|-------------|----------|
| Production  | `https://api.atlas.engineering/v1` |
| Staging     | `https://api.staging.atlas.engineering/v1` |
| Local Dev   | `http://localhost:8080/v1` |

### Versioning

The API is versioned via the URL path (`/v1`, `/v2`, ...). The current stable version is `v1`. When breaking changes are introduced, a new version is released with a 12-month deprecation window for the previous version. The `Sunset` response header indicates when a version will be retired.

---

## Authentication

Atlas uses two authentication mechanisms depending on the use case.

### API Key Authentication (Server-to-Server)

Pass the API key in the `Authorization` header using the `Bearer` scheme:

```http
Authorization: Bearer atlas_sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

API keys are scoped to an organization and carry a permission set defined at creation time.

### OAuth 2.0 (User-delegated access)

Atlas supports the Authorization Code flow with PKCE for user-delegated access. Token endpoint:

```
POST https://auth.atlas.engineering/oauth/token
```

**Request body:**

```json
{
  "grant_type": "authorization_code",
  "code": "AUTH_CODE",
  "redirect_uri": "https://yourapp.com/callback",
  "client_id": "CLIENT_ID",
  "code_verifier": "PKCE_VERIFIER"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "atlas_rt_xxxxxxxxxxxxxxxx",
  "scope": "projects:read projects:write blueprints:read"
}
```

### Scopes

| Scope | Description |
|-------|-------------|
| `projects:read` | Read project data |
| `projects:write` | Create and modify projects |
| `blueprints:read` | Read blueprints |
| `blueprints:write` | Generate and modify blueprints |
| `agents:execute` | Trigger and manage agents |
| `memory:read` | Query memory store |
| `memory:write` | Add and delete memory entries |
| `score:read` | Read engineering scores |
| `audit:execute` | Trigger and read audits |
| `redteam:execute` | Run red team evaluations |
| `org:admin` | Full organizational administration |

---

## Common Conventions

### Request Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Authorization` | Yes | Bearer token or API key |
| `Content-Type` | Yes* | `application/json` (required for POST/PUT/PATCH) |
| `Accept` | No | `application/json` (default) |
| `X-Atlas-Org` | No | Override organization context (for multi-org users) |
| `Idempotency-Key` | No | UUID for idempotent POST requests |

### Response Headers

| Header | Description |
|--------|-------------|
| `X-Request-Id` | Unique identifier for this request |
| `X-RateLimit-Limit` | Maximum requests allowed in the window |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | UTC epoch when the window resets |
| `Sunset` | Deprecation date for this API version |

### Timestamps

All timestamps are ISO 8601 strings in UTC: `"2026-07-06T01:16:15Z"`.

### Resource IDs

All resource IDs are URL-safe base62 strings with a typed prefix:

| Resource | Prefix |
|----------|--------|
| Projects | `proj_` |
| Blueprints | `bp_` |
| Agent Runs | `agt_` |
| Memory Entries | `mem_` |
| ADRs | `adr_` |
| Audits | `aud_` |
| Simulations | `sim_` |
| Red Team Runs | `rt_` |
| Organizations | `org_` |
| Users | `usr_` |
| Webhooks | `wh_` |

---

## Rate Limiting

Rate limits are applied per API key, per endpoint group, per minute.

| Tier | Requests/min (per group) | Burst |
|------|--------------------------|-------|
| Free | 30 | 50 |
| Pro | 300 | 500 |
| Enterprise | 3000 | 5000 |

When a rate limit is exceeded, the API returns `429 Too Many Requests` with a `Retry-After` header indicating the number of seconds to wait.

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 42
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1751766000
```

Streaming endpoints (SSE) count as a single request for the duration of the stream, regardless of event count.

---

## Pagination

List endpoints use cursor-based pagination for consistency and performance.

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 20 | Number of items per page (max: 100) |
| `cursor` | string | null | Opaque cursor from previous response |
| `sort` | string | varies | Field to sort by |
| `order` | string | `desc` | `asc` or `desc` |

### Response Envelope

```json
{
  "data": [],
  "pagination": {
    "total": 142,
    "limit": 20,
    "has_more": true,
    "next_cursor": "cursor_eyJpZCI6InByb2pfM...",
    "prev_cursor": null
  }
}
```

---

## Error Handling

All errors follow a consistent schema:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request body is invalid.",
    "details": [
      {
        "field": "name",
        "issue": "required",
        "message": "Project name is required."
      }
    ],
    "request_id": "req_01HXYZ123ABC",
    "docs_url": "https://docs.atlas.engineering/errors/VALIDATION_ERROR"
  }
}
```

### HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Successful GET or synchronous operation |
| 201 | Resource successfully created |
| 202 | Async operation accepted |
| 204 | Successful DELETE (no content) |
| 400 | Bad Request — invalid parameters |
| 401 | Unauthorized — missing or invalid auth |
| 403 | Forbidden — insufficient permissions |
| 404 | Not Found — resource does not exist |
| 409 | Conflict — duplicate or state conflict |
| 422 | Unprocessable Entity — validation error |
| 429 | Too Many Requests — rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### Error Codes Reference

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request body failed schema validation |
| `AUTHENTICATION_REQUIRED` | No valid credentials provided |
| `PERMISSION_DENIED` | Authenticated user lacks required scope |
| `NOT_FOUND` | Resource ID does not exist or is inaccessible |
| `CONFLICT` | Operation conflicts with current resource state |
| `RATE_LIMITED` | Rate limit exceeded for this endpoint |
| `AGENT_BUSY` | Agent is already running; cannot trigger again |
| `BLUEPRINT_INVALID` | Blueprint failed structural validation |
| `SIMULATION_FAILED` | Simulation encountered a fatal error |
| `QUOTA_EXCEEDED` | Organization quota exceeded |
| `MAINTENANCE` | API is temporarily in maintenance mode |

---

## Endpoint Groups

---

## 1. Projects

Projects are the top-level organizing unit in Atlas. Every Blueprint, Agent run, Memory store, and ADR belongs to a project.

### OpenAPI Schema: Project

```yaml
components:
  schemas:
    Project:
      type: object
      required: [id, name, status, created_at, updated_at]
      properties:
        id:
          type: string
          example: "proj_01HXYZ123ABC"
        name:
          type: string
          maxLength: 128
          example: "Acme E-Commerce Platform"
        slug:
          type: string
          example: "acme-ecommerce"
        description:
          type: string
          maxLength: 2048
        status:
          type: string
          enum: [active, archived, draft]
        tags:
          type: array
          items:
            type: string
        org_id:
          type: string
        owner_id:
          type: string
        engineering_score:
          type: number
          format: float
          minimum: 0
          maximum: 100
        blueprint_count:
          type: integer
        adr_count:
          type: integer
        constitution_url:
          type: string
          format: uri
          nullable: true
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
        archived_at:
          type: string
          format: date-time
          nullable: true
```

### `GET /projects`

List all projects accessible to the authenticated user.

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter: `active`, `archived`, `draft` |
| `tag` | string | Filter by tag (repeatable) |
| `search` | string | Full-text search on name/description |
| `limit` | integer | Page size (default 20, max 100) |
| `cursor` | string | Pagination cursor |

**Example Response `200`:**

```json
{
  "data": [
    {
      "id": "proj_01HXYZ123ABC",
      "name": "Acme E-Commerce Platform",
      "slug": "acme-ecommerce",
      "description": "Next-generation e-commerce platform for Acme Corp.",
      "status": "active",
      "tags": ["ecommerce", "typescript", "microservices"],
      "org_id": "org_01HXYZ999ZZZ",
      "owner_id": "usr_01HXYZ888YYY",
      "engineering_score": 87.4,
      "blueprint_count": 3,
      "adr_count": 12,
      "constitution_url": "https://storage.atlas.engineering/constitutions/proj_01HXYZ123ABC/v2.md",
      "created_at": "2026-01-15T09:00:00Z",
      "updated_at": "2026-07-01T14:30:00Z",
      "archived_at": null
    }
  ],
  "pagination": {
    "total": 5,
    "limit": 20,
    "has_more": false,
    "next_cursor": null,
    "prev_cursor": null
  }
}
```

### `POST /projects`

Create a new project.

**Request Body:**

```json
{
  "name": "New Platform",
  "description": "Description of the new platform.",
  "tags": ["platform", "python"],
  "template_id": "tpl_01HXblank"
}
```

**Response `201`:** Returns the created `Project` object.

### `GET /projects/{project_id}`

Retrieve a single project by ID.

**Response `200`:** Returns a `Project` object.

**Response `404`:**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Project proj_nonexistent not found.",
    "request_id": "req_01HXYZ"
  }
}
```

### `PATCH /projects/{project_id}`

Partially update a project. Accepts any subset of mutable fields: `name`, `description`, `tags`, `status`.

**Request Body:**

```json
{
  "name": "Acme Platform v2",
  "tags": ["ecommerce", "typescript", "microservices", "k8s"]
}
```

**Response `200`:** Returns updated `Project` object.

### `DELETE /projects/{project_id}`

Soft-delete a project. The project can be recovered within 30 days via `POST /projects/{project_id}/restore`.

**Response `204`:** No content.

### `POST /projects/{project_id}/archive`

Archive a project. Archived projects are read-only but fully accessible for querying.

**Response `200`:** Returns updated `Project` object with `status: "archived"`.

### `POST /projects/{project_id}/restore`

Restore a project from archived or deleted state.

**Response `200`:** Returns updated `Project` object with `status: "active"`.

### `GET /projects/search`

Semantic search across all projects using embedding similarity.

**Query Parameters:** `q` (string, required), `limit` (integer, default 10).

**Response `200`:**

```json
{
  "results": [
    {
      "project": { "id": "proj_01HXYZ123ABC", "name": "Acme E-Commerce Platform" },
      "relevance_score": 0.94,
      "matched_fields": ["name", "description"]
    }
  ]
}
```

---

## 2. Blueprints

Blueprints are Atlas's structured, living architecture documents generated from discovery sessions.

### OpenAPI Schema: Blueprint

```yaml
Blueprint:
  type: object
  properties:
    id:
      type: string
    project_id:
      type: string
    version:
      type: integer
      description: Auto-incrementing version number within the project
    status:
      type: string
      enum: [draft, validated, approved, superseded]
    title:
      type: string
    sections:
      type: object
      properties:
        executive_summary:
          type: string
        functional_requirements:
          type: array
          items:
            $ref: '#/components/schemas/Requirement'
        non_functional_requirements:
          type: array
          items:
            $ref: '#/components/schemas/Requirement'
        architecture_overview:
          type: string
        tech_stack:
          $ref: '#/components/schemas/TechStack'
        data_model:
          type: object
        api_contracts:
          type: array
        milestones:
          type: array
          items:
            $ref: '#/components/schemas/Milestone'
    validation_report:
      $ref: '#/components/schemas/ValidationReport'
    generated_by_run_id:
      type: string
      nullable: true
    created_at:
      type: string
      format: date-time
    updated_at:
      type: string
      format: date-time
```

### `POST /projects/{project_id}/blueprints/generate`

Trigger async blueprint generation.

**Request Body:**

```json
{
  "source": "discovery_session",
  "discovery_session_id": "ds_01HXYZ",
  "options": {
    "depth": "detailed",
    "include_milestones": true,
    "include_adr_stubs": true,
    "tech_preferences": ["TypeScript", "PostgreSQL", "Kubernetes"]
  }
}
```

**Response `202`:**

```json
{
  "operation_id": "op_01HXYZ789GHI",
  "status": "queued",
  "estimated_duration_seconds": 45,
  "poll_url": "/v1/operations/op_01HXYZ789GHI"
}
```

### `GET /projects/{project_id}/blueprints`

List all blueprint versions for a project, newest first.

### `GET /projects/{project_id}/blueprints/{blueprint_id}`

Retrieve a specific blueprint by ID.

### `POST /projects/{project_id}/blueprints/{blueprint_id}/validate`

Run structural and semantic validation on a blueprint.

**Response `200`:**

```json
{
  "valid": false,
  "score": 72,
  "issues": [
    {
      "severity": "error",
      "field": "sections.milestones[0].acceptance_criteria",
      "message": "Milestone must include measurable acceptance criteria."
    },
    {
      "severity": "warning",
      "field": "sections.tech_stack.database",
      "message": "No database backup strategy specified."
    }
  ],
  "suggestions": [
    "Add acceptance criteria to all milestones.",
    "Specify data retention policy in NFRs."
  ]
}
```

### `GET /projects/{project_id}/blueprints/compare`

Compare two blueprint versions and return a structured diff.

**Query Parameters:** `base_id` (string, required), `head_id` (string, required).

**Response `200`:**

```json
{
  "base_version": 2,
  "head_version": 3,
  "changes": [
    {
      "type": "modified",
      "path": "sections.tech_stack.api_framework",
      "before": "Express.js",
      "after": "Fastify"
    },
    {
      "type": "added",
      "path": "sections.milestones[3]",
      "after": { "title": "Launch Phase 2", "deadline": "2026-12-01" }
    }
  ],
  "summary": "3 modifications, 1 addition, 0 deletions"
}
```

### `POST /projects/{project_id}/blueprints/{blueprint_id}/approve`

Mark a blueprint as approved. Requires project owner role.

**Response `200`:** Returns updated Blueprint with `status: "approved"`.

### `GET /projects/{project_id}/blueprints/{blueprint_id}/export`

Export blueprint as Markdown, PDF, or Confluence-compatible HTML.

**Query Parameters:** `format` — one of `markdown`, `pdf`, `confluence`.

**Response:** Appropriate content-type with file body (`text/markdown`, `application/pdf`, `text/html`).

---

## 3. Agents

Agents are the AI workers that power Atlas operations.

### OpenAPI Schema: AgentRun

```yaml
AgentRun:
  type: object
  properties:
    id:
      type: string
    agent_type:
      type: string
      enum: [discovery, blueprint, research, audit, redteam, simulation, memory_consolidator, graph_builder, score_calculator]
    project_id:
      type: string
    status:
      type: string
      enum: [queued, running, completed, failed, cancelled, paused]
    input:
      type: object
    output:
      type: object
      nullable: true
    progress:
      type: number
      format: float
      minimum: 0
      maximum: 100
    started_at:
      type: string
      format: date-time
      nullable: true
    completed_at:
      type: string
      format: date-time
      nullable: true
    duration_ms:
      type: integer
      nullable: true
    token_usage:
      type: object
      properties:
        prompt_tokens:
          type: integer
        completion_tokens:
          type: integer
        total_tokens:
          type: integer
    error:
      type: string
      nullable: true
    created_at:
      type: string
      format: date-time
```

### `GET /agents`

List all available agent types with their capabilities and current availability.

**Response `200`:**

```json
{
  "agents": [
    {
      "type": "discovery",
      "display_name": "Discovery Agent",
      "description": "Conducts interactive requirement discovery sessions.",
      "capabilities": ["requirement_elicitation", "user_story_generation", "gap_analysis"],
      "avg_duration_seconds": 300,
      "available": true
    },
    {
      "type": "blueprint",
      "display_name": "Blueprint Agent",
      "description": "Generates comprehensive architecture blueprints.",
      "capabilities": ["architecture_design", "tech_stack_selection", "milestone_planning"],
      "avg_duration_seconds": 45,
      "available": true
    }
  ]
}
```

### `POST /agents/run`

Trigger an agent run.

**Request Body:**

```json
{
  "agent_type": "research",
  "project_id": "proj_01HXYZ123ABC",
  "input": {
    "topic": "WebAssembly component model adoption in production",
    "depth": "comprehensive",
    "max_sources": 50
  },
  "callback_url": "https://yourapp.com/webhooks/atlas"
}
```

**Response `202`:**

```json
{
  "id": "agt_01HXYZ111JKL",
  "agent_type": "research",
  "project_id": "proj_01HXYZ123ABC",
  "status": "queued",
  "created_at": "2026-07-06T01:16:15Z"
}
```

### `GET /agents/runs`

List agent runs.

**Query Parameters:** `project_id`, `agent_type`, `status`, `from`, `to`.

### `GET /agents/runs/{run_id}`

Get detailed status of an agent run.

### `POST /agents/runs/{run_id}/cancel`

Cancel a running or queued agent run.

**Response `200`:** Returns updated AgentRun with `status: "cancelled"`.

### `GET /agents/runs/{run_id}/logs`

Stream agent execution logs via Server-Sent Events.

**Response:** `Content-Type: text/event-stream`

```
event: log
data: {"timestamp":"2026-07-06T01:16:20Z","level":"info","message":"Initializing research agent...","step":1}

event: log
data: {"timestamp":"2026-07-06T01:16:22Z","level":"info","message":"Searching sources on WebAssembly...","step":2}

event: progress
data: {"run_id":"agt_01HXYZ111JKL","progress":45.0}

event: complete
data: {"run_id":"agt_01HXYZ111JKL","status":"completed","duration_ms":38420}
```

### `GET /agents/runs/{run_id}/history`

Get paginated state transition history for a run.

---

## 4. Memory

Atlas maintains a multi-layered memory store (episodic, semantic, procedural) for each project.

### `POST /projects/{project_id}/memory/query`

Semantic search over the project memory store.

**Request Body:**

```json
{
  "query": "What are the main authentication challenges identified?",
  "layers": ["episodic", "semantic"],
  "limit": 10,
  "min_similarity": 0.75,
  "filters": {
    "source_type": ["discovery_session", "research_report"],
    "created_after": "2026-01-01T00:00:00Z"
  }
}
```

**Response `200`:**

```json
{
  "results": [
    {
      "id": "mem_01HXYZ222MNO",
      "content": "Team identified OAuth 2.0 token refresh race condition as critical auth issue during sprint 4 retrospective.",
      "layer": "episodic",
      "similarity": 0.93,
      "metadata": {
        "source_type": "discovery_session",
        "session_id": "ds_01HXYZ",
        "created_at": "2026-03-15T10:00:00Z"
      }
    }
  ],
  "total_searched": 2841,
  "duration_ms": 124
}
```

### `POST /projects/{project_id}/memory/entries`

Add a new memory entry.

**Request Body:**

```json
{
  "content": "Decision: migrate from REST to GraphQL for the mobile client API.",
  "layer": "semantic",
  "metadata": {
    "source_type": "manual",
    "author_id": "usr_01HXYZ888YYY",
    "tags": ["architecture", "graphql", "mobile"]
  }
}
```

**Response `201`:** Returns created memory entry with its ID and embedding status.

### `GET /projects/{project_id}/memory/entries/{entry_id}`

Retrieve a specific memory entry by ID.

### `DELETE /projects/{project_id}/memory/entries/{entry_id}`

Delete a memory entry. Requires `memory:write` scope.

**Response `204`:** No content.

### `POST /projects/{project_id}/memory/consolidate`

Trigger async memory consolidation: deduplication, summarization, and re-embedding of stale vectors.

**Response `202`:**

```json
{
  "operation_id": "op_01HXYZ_consolidate",
  "estimated_duration_seconds": 120
}
```

### `GET /projects/{project_id}/memory/stats`

Get statistics about the memory store.

**Response `200`:**

```json
{
  "total_entries": 2841,
  "by_layer": {
    "episodic": 1204,
    "semantic": 1389,
    "procedural": 248
  },
  "total_tokens_stored": 4820341,
  "last_consolidated_at": "2026-07-04T03:00:00Z",
  "storage_used_bytes": 38291024,
  "oldest_entry_at": "2025-11-01T09:00:00Z"
}
```

---

## 5. Knowledge Graph

The Knowledge Graph represents entities, components, and relationships discovered across a project's lifecycle.

### `POST /projects/{project_id}/graph/query`

Execute a graph query using Cypher-compatible syntax.

**Request Body:**

```json
{
  "query": "MATCH (c:Component)-[:DEPENDS_ON]->(d:Component) WHERE c.name = 'AuthService' RETURN d",
  "format": "cypher",
  "limit": 50
}
```

**Response `200`:**

```json
{
  "nodes": [
    { "id": "n_01", "label": "Component", "properties": { "name": "TokenStore", "type": "redis" } },
    { "id": "n_02", "label": "Component", "properties": { "name": "UserDB", "type": "postgresql" } }
  ],
  "edges": [],
  "execution_time_ms": 28
}
```

### `GET /projects/{project_id}/graph/visualize`

Get graph data in a visualization-ready format.

**Query Parameters:** `format` (`d3` | `cytoscape` | `graphml`), `depth` (integer 1–5, default 2), `root_node_id` (string, optional).

### `POST /projects/{project_id}/graph/nodes`

Add a node to the knowledge graph.

**Request Body:**

```json
{
  "label": "Service",
  "properties": {
    "name": "PaymentGateway",
    "technology": "Stripe",
    "owner_team": "Payments"
  }
}
```

**Response `201`:** Returns created node with `id`.

### `POST /projects/{project_id}/graph/edges`

Add an edge between two nodes.

**Request Body:**

```json
{
  "source_id": "n_01",
  "target_id": "n_02",
  "relationship": "CALLS",
  "properties": { "protocol": "gRPC", "sync": true }
}
```

### `DELETE /projects/{project_id}/graph/nodes/{node_id}`

Remove a node and all its incident edges.

**Response `204`:** No content.

### `POST /projects/{project_id}/graph/rebuild`

Trigger a full async knowledge graph rebuild from project memory and code analysis.

**Response `202`:** Returns operation ID.

---

## 6. Research

Atlas agents conduct deep technical research and synthesize findings into structured reports.

### `POST /projects/{project_id}/research/trigger`

Trigger a research session.

**Request Body:**

```json
{
  "topic": "State-of-the-art approaches to distributed tracing in 2026",
  "scope": ["academic_papers", "github_repos", "tech_blogs", "documentation"],
  "depth": "comprehensive",
  "max_sources": 100,
  "output_format": "structured_report",
  "notify_on_complete": true
}
```

**Response `202`:**

```json
{
  "research_id": "res_01HXYZ",
  "run_id": "agt_01HXYZ789"
}
```

### `GET /projects/{project_id}/research`

List research reports for a project, newest first.

### `GET /projects/{project_id}/research/{research_id}`

Get a complete research report.

**Response `200`:**

```json
{
  "id": "res_01HXYZ",
  "topic": "Distributed tracing approaches in 2026",
  "status": "completed",
  "executive_summary": "OpenTelemetry has become the de-facto standard...",
  "sections": [
    {
      "title": "Current Landscape",
      "content": "...",
      "key_findings": ["OpenTelemetry is vendor-neutral and widely adopted", "Sampling strategies critically impact cost"]
    }
  ],
  "sources": [
    {
      "title": "OpenTelemetry Specification v1.30",
      "url": "https://opentelemetry.io/docs/specs/",
      "type": "documentation",
      "relevance_score": 0.97
    }
  ],
  "recommendations": [
    "Adopt OpenTelemetry SDK across all services.",
    "Implement tail-based sampling to reduce trace volume by 80%."
  ],
  "created_at": "2026-07-06T01:16:15Z",
  "completed_at": "2026-07-06T01:22:44Z"
}
```

### `POST /projects/{project_id}/research/search`

Search across all research findings using semantic similarity.

**Request Body:** `{ "q": "sampling strategies", "limit": 20 }`

---

## 7. Score

The Engineering Score is Atlas's composite measure of project health across six dimensions.

### `GET /projects/{project_id}/score`

Get the current Engineering Score.

**Response `200`:**

```json
{
  "project_id": "proj_01HXYZ123ABC",
  "score": 87.4,
  "grade": "A",
  "computed_at": "2026-07-06T00:00:00Z",
  "dimensions": {
    "architecture":      { "score": 91.0, "weight": 0.25, "grade": "A+" },
    "security":         { "score": 84.5, "weight": 0.25, "grade": "B+" },
    "code_quality":     { "score": 88.0, "weight": 0.20, "grade": "A"  },
    "documentation":    { "score": 79.0, "weight": 0.15, "grade": "B+" },
    "testing":          { "score": 90.0, "weight": 0.10, "grade": "A"  },
    "process_maturity": { "score": 86.0, "weight": 0.05, "grade": "A-" }
  },
  "trend": "improving",
  "delta_7d": 2.3,
  "delta_30d": 5.1
}
```

### `GET /projects/{project_id}/score/history`

Get score history over time.

**Query Parameters:** `from`, `to`, `resolution` (`daily` | `weekly` | `monthly`).

**Response `200`:**

```json
{
  "resolution": "weekly",
  "data_points": [
    { "date": "2026-06-29", "score": 85.1, "grade": "A-" },
    { "date": "2026-07-06", "score": 87.4, "grade": "A" }
  ]
}
```

### `GET /projects/{project_id}/score/breakdown`

Get a detailed evidence-backed breakdown of each score dimension.

### `GET /projects/{project_id}/score/recommendations`

Get prioritized, actionable recommendations to improve the Engineering Score.

**Response `200`:**

```json
{
  "recommendations": [
    {
      "id": "rec_01",
      "dimension": "security",
      "impact": "high",
      "effort": "medium",
      "title": "Enable SAST scanning in CI pipeline",
      "description": "No SAST tool detected in the CI configuration. Adding Semgrep or Snyk will improve the security score by an estimated 4.2 points.",
      "estimated_score_improvement": 4.2,
      "related_adr_ids": []
    },
    {
      "id": "rec_02",
      "dimension": "documentation",
      "impact": "medium",
      "effort": "low",
      "title": "Add OpenAPI specification for all public endpoints",
      "description": "8 of 24 public endpoints lack OpenAPI documentation.",
      "estimated_score_improvement": 2.1,
      "related_adr_ids": ["adr_01HXYZ_api_design"]
    }
  ]
}
```

---

## 8. MCP Servers

Atlas maintains a registry of Model Context Protocol servers available for agent use.

### `GET /mcp/registry`

Browse the global public MCP server registry.

**Query Parameters:** `category`, `verified_only` (boolean), `search`, `limit`, `cursor`.

### `GET /projects/{project_id}/mcp`

List MCP servers attached to a project.

### `POST /projects/{project_id}/mcp`

Attach an MCP server to a project.

**Request Body:**

```json
{
  "server_id": "mcp_github_v2",
  "configuration": {
    "auth_token_secret": "vault:secret/github-token",
    "allowed_repos": ["org/repo1", "org/repo2"],
    "read_only": false
  }
}
```

### `DELETE /projects/{project_id}/mcp/{server_id}`

Detach an MCP server from a project.

**Response `204`:** No content.

### `GET /projects/{project_id}/mcp/{server_id}/health`

Check health and connectivity of an attached MCP server.

**Response `200`:**

```json
{
  "status": "healthy",
  "latency_ms": 42,
  "last_checked_at": "2026-07-06T01:15:00Z",
  "tools_available": ["search_code", "create_issue", "list_prs", "get_file"],
  "version": "2.3.1"
}
```

### `POST /mcp/discover`

Trigger auto-discovery of compatible MCP servers for the project's detected tech stack.

**Request Body:** `{ "project_id": "proj_01HXYZ123ABC" }`

**Response `200`:**

```json
{
  "discovered": [
    {
      "server_id": "mcp_github_v2",
      "name": "GitHub MCP Server",
      "reason": "GitHub detected as primary VCS in project metadata.",
      "relevance_score": 0.98
    }
  ]
}
```

---

## 9. Plugins

### `GET /marketplace/plugins`

Browse the Atlas Plugin Marketplace.

**Query Parameters:** `type`, `free_only` (boolean), `search`, `sort` (`downloads` | `rating` | `updated_at`), `limit`, `cursor`.

### `GET /marketplace/plugins/{plugin_id}`

Get full plugin listing including screenshots, changelog, and reviews.

### `POST /projects/{project_id}/plugins/install`

Install a plugin.

**Request Body:** `{ "plugin_id": "plg_01HXYZ", "version": "1.2.0" }`

**Response `202`:** Async installation; returns operation ID.

### `GET /projects/{project_id}/plugins`

List installed plugins and their versions.

### `DELETE /projects/{project_id}/plugins/{installation_id}`

Uninstall a plugin.

**Response `204`:** No content.

### `PATCH /projects/{project_id}/plugins/{installation_id}/configure`

Update plugin configuration.

---

## 10. ADRs

Architecture Decision Records track decisions with full context, alternatives, and consequences.

### OpenAPI Schema: ADR

```yaml
ADR:
  type: object
  properties:
    id:
      type: string
    number:
      type: integer
      description: "Sequential ADR number within project (e.g., 42 for ADR-0042)"
    title:
      type: string
    status:
      type: string
      enum: [proposed, accepted, deprecated, superseded, rejected]
    context:
      type: string
      description: Background and forces that led to this decision
    decision:
      type: string
      description: The decision that was made
    consequences:
      type: string
      description: Resulting context after applying the decision
    alternatives_considered:
      type: array
      items:
        type: object
        properties:
          option:
            type: string
          pros:
            type: array
            items:
              type: string
          cons:
            type: array
            items:
              type: string
    superseded_by:
      type: string
      nullable: true
    tags:
      type: array
      items:
        type: string
    author_id:
      type: string
    created_at:
      type: string
      format: date-time
    updated_at:
      type: string
      format: date-time
```

### `GET /projects/{project_id}/adrs`

List all ADRs. Query params: `status`, `tag`, `search`.

### `POST /projects/{project_id}/adrs`

Create a new ADR.

**Request Body:**

```json
{
  "title": "Use PostgreSQL as Primary Database",
  "status": "proposed",
  "context": "We need a relational database that supports ACID transactions, JSON columns, and full-text search.",
  "decision": "We will use PostgreSQL 16 as the primary database.",
  "consequences": "All teams must use the official ORM (Prisma). DBA approval required for schema changes.",
  "alternatives_considered": [
    {
      "option": "MySQL 8",
      "pros": ["Familiar to most backend engineers", "Slightly faster for simple read-heavy workloads"],
      "cons": ["Inferior JSON support", "No native full-text search without plugins"]
    }
  ],
  "tags": ["database", "infrastructure"]
}
```

**Response `201`:** Returns created ADR with auto-assigned `number`.

### `GET /projects/{project_id}/adrs/{adr_id}`

Retrieve a specific ADR.

### `PATCH /projects/{project_id}/adrs/{adr_id}`

Update ADR content or status.

### `POST /projects/{project_id}/adrs/{adr_id}/supersede`

Mark an ADR as superseded.

**Request Body:** `{ "superseded_by": "adr_01HXYZ_new" }`

### `GET /projects/{project_id}/adrs/search`

Semantic search over all ADR content.

---

## 11. Audits

### `POST /projects/{project_id}/audits`

Trigger a technical audit.

**Request Body:**

```json
{
  "type": "full",
  "dimensions": ["architecture", "security", "dependencies", "performance", "documentation"],
  "repo_url": "https://github.com/org/repo",
  "branch": "main",
  "options": {
    "include_sast": true,
    "include_dependency_scan": true,
    "include_license_check": true,
    "include_secret_scan": true
  }
}
```

**Response `202`:** `{ "audit_id": "aud_01HXYZ", "run_id": "agt_01HXYZ" }`

### `GET /projects/{project_id}/audits`

List all audits, newest first.

### `GET /projects/{project_id}/audits/{audit_id}`

Get a complete audit report.

**Response `200`:**

```json
{
  "id": "aud_01HXYZ",
  "project_id": "proj_01HXYZ123ABC",
  "type": "full",
  "status": "completed",
  "overall_score": 82.1,
  "findings": [
    {
      "id": "finding_01",
      "severity": "high",
      "dimension": "security",
      "title": "SQL injection vulnerability in user search endpoint",
      "description": "Unsanitized user input is directly interpolated into a SQL query string.",
      "file": "src/api/users.ts",
      "line": 142,
      "cwe": "CWE-89",
      "remediation": "Use parameterized queries via the ORM. Never concatenate user input into SQL strings."
    }
  ],
  "summary": { "critical": 0, "high": 1, "medium": 4, "low": 12, "info": 28 },
  "created_at": "2026-07-06T01:00:00Z",
  "completed_at": "2026-07-06T01:08:00Z"
}
```

### `GET /projects/{project_id}/audits/history`

Get audit history with score trends over time.

---

## 12. Simulations

Atlas runs scenario simulations to pre-validate architectural decisions.

### `POST /projects/{project_id}/simulations`

Define and run a simulation.

**Request Body:**

```json
{
  "name": "Database connection pool exhaustion under 10x load",
  "scenario": {
    "type": "load",
    "description": "Simulate 10x normal traffic to identify bottlenecks.",
    "parameters": {
      "base_rps": 1000,
      "multiplier": 10,
      "duration_seconds": 300,
      "ramp_up_seconds": 60
    }
  },
  "target_architecture": "current",
  "hypothesis": "Connection pool will exhaust at ~7x load, causing queue timeout errors."
}
```

**Response `202`:** `{ "simulation_id": "sim_01HXYZ", "run_id": "agt_01HXYZ" }`

### `GET /projects/{project_id}/simulations`

List all simulations.

### `GET /projects/{project_id}/simulations/{simulation_id}`

Get simulation results including outcome, metrics, and hypothesis evaluation.

### `POST /projects/{project_id}/simulations/compare`

Compare two simulation results side-by-side.

**Request Body:** `{ "sim_a_id": "sim_01HXYZ", "sim_b_id": "sim_01HXYZ2" }`

---

## 13. Red Team

### `POST /projects/{project_id}/redteam/schedule`

Schedule a red team evaluation.

**Request Body:**

```json
{
  "name": "Q3 Security Red Team",
  "scope": ["authentication", "authorization", "data_exfiltration", "prompt_injection"],
  "intensity": "aggressive",
  "target_components": ["AuthService", "PaymentAPI"],
  "scheduled_at": "2026-07-10T02:00:00Z",
  "notify_stakeholders": ["usr_01HXYZ888YYY"]
}
```

### `POST /projects/{project_id}/redteam/runs/{run_id}/execute`

Execute a scheduled red team run immediately.

### `GET /projects/{project_id}/redteam/reports`

List all red team reports.

### `GET /projects/{project_id}/redteam/reports/{report_id}`

Get a full red team report.

### `GET /projects/{project_id}/redteam/vulnerabilities`

List all discovered vulnerabilities.

**Query Parameters:** `severity` (`critical` | `high` | `medium` | `low`), `status` (`open` | `mitigated` | `accepted`), `component`.

---

## 14. Organizations

### `GET /organizations`

List organizations the user belongs to.

### `POST /organizations`

Create a new organization.

**Request Body:** `{ "name": "Acme Corp", "slug": "acme-corp", "plan": "pro" }`

### `GET /organizations/{org_id}`

Get organization details including usage and limits.

### `PATCH /organizations/{org_id}`

Update organization settings.

### `GET /organizations/{org_id}/members`

List members with their roles and project access.

### `POST /organizations/{org_id}/members/invite`

Invite a user by email.

**Request Body:**

```json
{
  "email": "engineer@example.com",
  "role": "member",
  "project_ids": ["proj_01HXYZ123ABC"]
}
```

### `PATCH /organizations/{org_id}/members/{user_id}`

Update a member's role (`owner` | `admin` | `member` | `viewer`).

### `DELETE /organizations/{org_id}/members/{user_id}`

Remove a member. Response `204`.

### `GET /organizations/{org_id}/billing`

Get billing plan, usage metrics, and invoice history.

### `POST /organizations/{org_id}/sso/configure`

Configure SSO. Supports SAML 2.0 and OIDC.

---

## 15. Users

### `GET /users/me`

Get the authenticated user's profile.

**Response `200`:**

```json
{
  "id": "usr_01HXYZ888YYY",
  "email": "engineer@example.com",
  "name": "Alex Engineer",
  "avatar_url": "https://avatars.atlas.engineering/usr_01HXYZ888YYY.png",
  "orgs": ["org_01HXYZ999ZZZ"],
  "preferences": {
    "theme": "dark",
    "default_project_id": "proj_01HXYZ123ABC",
    "notification_channels": ["email", "slack"]
  },
  "created_at": "2025-11-01T09:00:00Z"
}
```

### `PATCH /users/me`

Update name, avatar, or preferences.

### `GET /users/me/api-keys`

List all API keys (key values are never returned after creation).

### `POST /users/me/api-keys`

Create a new API key.

**Request Body:**

```json
{
  "name": "CI/CD Pipeline Key",
  "scopes": ["projects:read", "blueprints:read", "agents:execute"],
  "expires_at": "2027-07-06T00:00:00Z"
}
```

**Response `201`:**

```json
{
  "id": "key_01HXYZ",
  "name": "CI/CD Pipeline Key",
  "key": "atlas_sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "scopes": ["projects:read", "blueprints:read", "agents:execute"],
  "expires_at": "2027-07-06T00:00:00Z",
  "created_at": "2026-07-06T01:16:15Z"
}
```

> **Security Note:** The `key` field is only returned once at creation. Store it securely in a secrets manager.

### `DELETE /users/me/api-keys/{key_id}`

Revoke an API key immediately. Response `204`.

---

## 16. Webhooks

Webhooks deliver real-time event notifications via HTTP POST to your configured endpoints.

### OpenAPI Schema: Webhook

```yaml
Webhook:
  type: object
  properties:
    id:
      type: string
    url:
      type: string
      format: uri
    events:
      type: array
      items:
        type: string
    secret:
      type: string
      description: HMAC-SHA256 signing secret (only shown at creation)
    status:
      type: string
      enum: [active, disabled, failing]
    failure_count:
      type: integer
    last_triggered_at:
      type: string
      format: date-time
      nullable: true
    created_at:
      type: string
      format: date-time
```

### Available Events

| Event | Description |
|-------|-------------|
| `project.created` | New project created |
| `blueprint.generated` | Blueprint generation completed |
| `blueprint.approved` | Blueprint approved |
| `agent.started` | Agent run started |
| `agent.completed` | Agent run completed |
| `agent.failed` | Agent run failed |
| `audit.completed` | Technical audit completed |
| `score.changed` | Engineering score changed by ≥1 point |
| `redteam.completed` | Red team evaluation completed |
| `redteam.vulnerability` | Critical vulnerability discovered |
| `memory.consolidated` | Memory consolidation completed |
| `simulation.completed` | Simulation completed |
| `adr.created` | New ADR created |
| `adr.status_changed` | ADR status updated |

### `POST /organizations/{org_id}/webhooks`

Register a new webhook.

**Request Body:**

```json
{
  "url": "https://yourapp.com/webhooks/atlas",
  "events": ["blueprint.generated", "audit.completed", "score.changed"],
  "project_ids": ["proj_01HXYZ123ABC"]
}
```

**Response `201`:**

```json
{
  "id": "wh_01HXYZ",
  "url": "https://yourapp.com/webhooks/atlas",
  "secret": "whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "events": ["blueprint.generated", "audit.completed", "score.changed"],
  "status": "active",
  "created_at": "2026-07-06T01:16:15Z"
}
```

### `GET /organizations/{org_id}/webhooks`

List all webhooks.

### `GET /organizations/{org_id}/webhooks/{webhook_id}`

Get webhook details and recent delivery statistics.

### `PATCH /organizations/{org_id}/webhooks/{webhook_id}`

Update webhook URL, events list, or status.

### `DELETE /organizations/{org_id}/webhooks/{webhook_id}`

Delete a webhook. Response `204`.

### `POST /organizations/{org_id}/webhooks/{webhook_id}/test`

Send a test event payload to the webhook URL.

**Request Body:** `{ "event": "blueprint.generated" }`

**Response `200`:**

```json
{
  "delivered": true,
  "response_status": 200,
  "response_body": "ok",
  "latency_ms": 183,
  "sent_at": "2026-07-06T01:16:15Z"
}
```

### `GET /organizations/{org_id}/webhooks/{webhook_id}/logs`

Get delivery logs including request/response details and retry history.

### Webhook Payload Verification

Atlas signs every webhook request with HMAC-SHA256. Verify the `X-Atlas-Signature-256` header:

```typescript
import crypto from 'crypto';

function verifyWebhook(secret: string, payload: string, signature: string): boolean {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
```

---

## Async Operations

Long-running endpoints return an `operation_id`. Poll for status:

### `GET /operations/{operation_id}`

**Response `200`:**

```json
{
  "id": "op_01HXYZ789GHI",
  "type": "blueprint_generation",
  "status": "completed",
  "progress": 100,
  "result": {
    "blueprint_id": "bp_01HXYZ456DEF"
  },
  "created_at": "2026-07-06T01:16:15Z",
  "completed_at": "2026-07-06T01:17:02Z"
}
```

Status progression: `queued` → `running` → `completed` | `failed` | `cancelled`.

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-07-06 | Initial release of Atlas REST API v1 |
