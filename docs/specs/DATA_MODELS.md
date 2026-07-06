# Data Models Specification

> **Document Status:** Authoritative Reference  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-06  
> **Owner:** Atlas Data Platform Team  

---

## 1. Relational Database Schema (PostgreSQL)

PostgreSQL stores the core administrative, multi-tenant state, organization settings, user authentications, and historical execution records.

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  organizations  │ ──1:N─▶│      users      │ ──1:N─▶│    projects     │
└─────────────────┘       └─────────────────┘       └─────────────────┘
                                                             │
                                                             ▼ 1:N
                                                    ┌─────────────────┐
                                                    │   blueprints    │
                                                    └─────────────────┘
                                                             │
                                                             ▼ 1:N
                                                    ┌─────────────────┐
                                                    │   agent_runs    │
                                                    └─────────────────┘
```

### 1.1 Tables DDL

```sql
-- Core Tenants
CREATE TABLE organizations (
    id VARCHAR(64) PRIMARY KEY, -- Prefix: org_
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(128) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users under Tenants
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY, -- Prefix: usr_
    organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    role VARCHAR(64) NOT NULL DEFAULT 'developer', -- org_admin, developer, auditor
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects
CREATE TABLE projects (
    id VARCHAR(64) PRIMARY KEY, -- Prefix: proj_
    organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(128) NOT NULL,
    domain VARCHAR(64) NOT NULL,
    maturity VARCHAR(32) NOT NULL DEFAULT 'prototype',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_org_proj_slug UNIQUE (organization_id, slug)
);

-- Blueprints Log
CREATE TABLE blueprints (
    id VARCHAR(64) PRIMARY KEY, -- Prefix: bp_
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    version INT NOT NULL,
    raw_yaml TEXT NOT NULL,
    lock_yaml TEXT NOT NULL,
    created_by VARCHAR(64) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_proj_version UNIQUE (project_id, version)
);

-- Agent Job Runs
CREATE TABLE agent_runs (
    id VARCHAR(64) PRIMARY KEY, -- Prefix: agt_
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    blueprint_id VARCHAR(64) REFERENCES blueprints(id),
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
    task_description TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE
);
```

---

## 2. Graph Database Schema (Neo4j)

Neo4j holds the semantic structure of the software engineering topology. This graph links business intent (requirements) to architectural concepts (components), code implementations (files), verifications (tests), and decisions (ADRs).

```
  (Requirement) 
        │
        ▼ IMPLEMENTED_BY
   (Component) ─── DECLARED_IN ───▶ (Blueprint)
        │
        ▼ DEFINED_IN
     (File) ─── TESTED_BY ───▶ (Test)
        │
        ▼ DECIDED_BY
      (ADR)
```

### 2.1 Nodes & Labels

| Node Label | Core Properties | Description |
|------------|-----------------|-------------|
| **Requirement** | `id`, `title`, `description`, `priority`, `source` | User stories, non-functional requirements. |
| **Component** | `id`, `name`, `type` (service, library), `contract_schema` | Logical architectural modules. |
| **File** | `id`, `filepath`, `language`, `ast_hash` | Actual source code documents. |
| **Test** | `id`, `testname`, `test_type` (unit, integration), `status` | Validation suites. |
| **ADR** | `id`, `number`, `title`, `status` (accepted, superseded) | Architecture records. |
| **Blueprint** | `id`, `version`, `updated_at` | Living project architecture models. |

### 2.2 Relationships Types

- `(Requirement)-[:IMPLEMENTED_BY]->(Component)`
- `(Component)-[:DECLARED_IN]->(Blueprint)`
- `(Component)-[:DEFINED_IN]->(File)`
- `(File)-[:TESTED_BY]->(Test)`
- `(Component)-[:DECIDED_BY]->(ADR)`

### 2.3 Sample Cypher Creation Query

```cypher
CREATE (r:Requirement {id: "req_billing_stripe", title: "Stripe Webhook Integration", priority: "HIGH"})
CREATE (c:Component {id: "comp_billing_handler", name: "BillingHandler", type: "service"})
CREATE (f:File {id: "file_billing_ts", filepath: "packages/core/src/billing.ts", language: "typescript"})
CREATE (t:Test {id: "test_billing_unit", testname: "billing.spec.ts", test_type: "unit"})

CREATE (r)-[:IMPLEMENTED_BY]->(c)
CREATE (c)-[:DEFINED_IN]->(f)
CREATE (f)-[:TESTED_BY]->(t)
```

---

## 3. Vector Metadata Schema (Qdrant)

Vector databases map semantic dimensions. We store embeddings of code blocks, documentation, requirements, and conversation logs.

- **Vector Dimension:** `1536` (OpenAI `text-embedding-3-small`) or `768` (Google Vertex AI Embeddings).
- **Metric:** `Cosine`

### 3.1 Metadata Payload Schema

```json
{
  "project_id": "proj_billing_v2",
  "scope": "code", // code, documentation, requirement, memory
  "node_id": "file_billing_ts",
  "content": "export class BillingHandler implements IBilling...",
  "checksum": "d5f2a1b9e...",
  "attributes": {
    "filepath": "packages/core/src/billing.ts",
    "language": "typescript",
    "imports": ["stripe", "@atlas-os/sdk"],
    "lines": "1-45"
  }
}
```
