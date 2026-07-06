# ADR-006: PostgreSQL as Primary Relational Database

**Date:** 2026-07-06
**Status:** Accepted
**Deciders:** Atlas Architecture Council
**Technical Area:** Data Architecture / Persistence

---

## Context and Problem Statement

Atlas requires a reliable, feature-rich relational database to serve as the operational data store for all structured, transactional data. This includes: user accounts, organization structures, project metadata, billing records, agent job execution history, configuration data, authentication tokens, audit logs, session state, and the relational metadata that complements the graph (Neo4j) and vector (pgvector/Qdrant) data stores.

The relational database is the system of record for Atlas's operational data. Its characteristics determine ACID guarantees, backup and recovery capabilities, query expressiveness for complex reporting, ability to handle concurrent writes from distributed services, schema evolution flexibility, and integration with Atlas's broader technology stack.

Several critical factors distinguish Atlas's relational data requirements from a generic CRUD application:

1. **Multi-tenancy**: Atlas is a SaaS platform where multiple customer organizations share infrastructure. Row-level security, schema isolation, or database-per-tenant models must be supportable.
2. **pgvector integration**: The vector storage strategy (ADR-005) includes pgvector as Tier 1 vector storage. This mandates PostgreSQL compatibility.
3. **JSONB for schema flexibility**: Agent job payloads, Blueprint content, Constitution clauses, ADR metadata, and Engineering Score details are semi-structured. JSONB storage with GIN indexing provides the flexibility of a document store within a relational transaction.
4. **Audit log requirements**: Enterprise customers require immutable audit trails of all agent actions, user decisions, and system state changes.
5. **Geographic distribution**: Atlas's enterprise tier requires data residency options and read replica support for globally distributed teams.
6. **Full-text search**: Requirement text, documentation content, and code annotations require efficient full-text search capabilities.

---

## Decision Drivers

- **ACID compliance**: Full ACID transactions required for agent job state management, billing, and user account operations
- **pgvector compatibility**: Vector storage strategy (ADR-005) mandates PostgreSQL for Tier 1 vector queries
- **JSONB and GIN indexing**: Semi-structured agent payloads and dynamic schema requirements need document-like flexibility within transactions
- **Row-level security (RLS)**: Multi-tenant data isolation via PostgreSQL RLS eliminates application-layer filtering bugs
- **Extension ecosystem**: PostGIS, pg_trgm, pg_stat_statements, TimescaleDB — rich extension ecosystem for Atlas's diverse data needs
- **Operational maturity**: Battle-tested backup, replication, and failover strategies with mature tooling
- **ORM support**: Prisma and Drizzle ORM full support for TypeScript type-safe database access
- **Kubernetes deployment**: Self-hostable with established Helm charts (CloudNativePG, Zalando Postgres Operator)
- **Connection pooling**: PgBouncer or PgCat for connection pool management in a microservices environment
- **Cost**: Open-source core with no per-row or per-query licensing fees

---

## Considered Options

### Option 1: PostgreSQL

**Overview:** PostgreSQL is the world's most advanced open-source relational database. It supports SQL standards compliance, ACID transactions, advanced indexing (B-tree, GIN, GiST, BRIN, HNSW via pgvector), row-level security, table inheritance, procedural languages (PL/pgSQL, PL/Python), foreign data wrappers, logical replication, and a rich extension ecosystem.

**Strengths:**
- **pgvector native**: pgvector runs as a PostgreSQL extension — the Tier 1 vector storage layer in ADR-005 is literally part of PostgreSQL. One database handles both relational and vector workloads for smaller datasets.
- **JSONB with GIN indexing**: `JSONB` columns with `GIN` indexes support document-style flexible schemas with near-document-database performance for common access patterns. Atlas agent job payloads, Blueprint content, and dynamic requirement attributes store in JSONB without schema migrations.
  ```sql
  -- Store flexible agent job metadata without schema constraints
  SELECT * FROM agent_jobs
  WHERE payload @> '{"agent_type": "blueprint_generator"}'
    AND payload->>'status' = 'completed'
    AND created_at > NOW() - INTERVAL '7 days';
  ```
- **Row-level security**: PostgreSQL RLS policies enforce multi-tenant data isolation at the database level — impossible to accidentally query another tenant's data regardless of application bugs.
  ```sql
  CREATE POLICY tenant_isolation ON projects
    USING (organization_id = current_setting('app.org_id')::uuid);
  ```
- **Full-text search**: `tsvector`, `tsquery`, and GIN/GiST full-text indexes provide built-in full-text search for requirement text and documentation — without Elasticsearch for basic use cases.
- **PostGIS**: If Atlas adds geospatial team mapping or data center selection features, PostGIS transforms PostgreSQL into a full GIS database.
- **pg_trgm**: Trigram indexes enable fuzzy string matching — useful for requirement deduplication ("find requirements similar in wording to this one") as a fast pre-filter before semantic search.
- **Logical replication**: Built-in logical replication supports read replicas, cross-region replication, and CDC (Change Data Capture) pipelines for feeding Kafka (ADR-011).
- **SQL standards compliance**: PostgreSQL supports CTEs, window functions, LATERAL joins, `RETURNING`, `ON CONFLICT`, and `GENERATED ALWAYS AS` — the full SQL:2011 feature set.
- **Ecosystem**: Prisma, Drizzle ORM, TypeORM, SQLAlchemy — every major ORM has first-class PostgreSQL support. pgAdmin, DBeaver, TablePlus — every database GUI tool supports PostgreSQL.
- **CloudNativePG operator**: The CNCF-accepted CloudNativePG Kubernetes operator provides production-grade StatefulSet deployment, automated failover, Point-in-Time Recovery (PITR), and connection pooling.
- **Mature operational tooling**: `pg_dump`, `pg_restore`, `pg_upgrade`, `repmgr`, `Patroni` — decades of operational tooling for backup, migration, HA, and failover.
- **Licensing**: BSD license — no commercial restrictions, no per-core fees, no per-row charges.

**Weaknesses:**
- **Write scalability ceiling**: PostgreSQL is a single-primary database. While read replicas handle read scaling, write throughput is limited by the primary's single-node capacity. For Atlas's write patterns (agent jobs, streaming event logs), this requires careful write optimization.
- **Connection overhead**: PostgreSQL uses process-per-connection model. Without a connection pool (PgBouncer/PgCat), opening 1000 concurrent connections creates 1000 OS processes — requiring mandatory connection pooling in microservices architectures.
- **Operational complexity at HA**: While CloudNativePG handles much of the HA complexity, operators must understand PostgreSQL replication internals for troubleshooting failover scenarios.
- **Schema migrations**: Schema changes on large tables (adding columns with defaults, adding indexes) can lock tables for extended periods. Requires `pg_repack` or online DDL strategies for zero-downtime migrations.

**Verdict:** Optimal choice. pgvector requirement alone makes PostgreSQL mandatory; all other requirements are fulfilled excellently.

---

### Option 2: MySQL / MariaDB

**Overview:** MySQL is a widely-deployed RDBMS. MariaDB is its community fork with additional engines and features.

**Strengths:**
- **Widespread deployment**: MySQL is extremely well-understood. Many engineers have MySQL experience.
- **Replication simplicity**: MySQL's binlog-based replication is simple to configure and operate.
- **Performance**: InnoDB engine performance is competitive for OLTP workloads.
- **Managed offerings**: RDS MySQL, PlanetScale (Vitess-based), and TiDB are mature managed options.

**Weaknesses:**
- **No pgvector**: MySQL has no vector database extension. The Tier 1 vector strategy (ADR-005) requires PostgreSQL. This is immediately disqualifying.
- **Limited JSONB**: MySQL 8.0 has JSON support, but it lacks the GIN indexing that makes PostgreSQL JSONB performant for complex queries.
- **No LATERAL joins**: MySQL's SQL feature set is incomplete vs. PostgreSQL. Complex analytics queries require workarounds.
- **Row-level security**: MySQL lacks native RLS. Multi-tenant isolation requires application-layer WHERE clauses — a security liability.
- **Extension ecosystem**: MySQL's extension ecosystem is significantly narrower than PostgreSQL's. No equivalent to APOC for graphs, no PostGIS, no pg_trgm.
- **Weaker ACID**: Historically, MySQL's ACID guarantees have been weaker than PostgreSQL's (particularly for edge cases with replication and crash recovery). PostgreSQL's implementation is considered more correct.
- **ORM support quirks**: Several Prisma features (RETURNING, arrays, native enums) have PostgreSQL-only implementations.

**Verdict:** Eliminated immediately due to pgvector incompatibility.

---

### Option 3: CockroachDB

**Overview:** CockroachDB is a distributed SQL database compatible with PostgreSQL's wire protocol. It provides horizontal write scaling, automatic replication, and geo-distributed deployments.

**Strengths:**
- **Horizontal write scaling**: CockroachDB distributes writes across multiple nodes without a single-primary bottleneck. This directly addresses PostgreSQL's write scalability limitation.
- **PostgreSQL compatibility**: The PostgreSQL wire protocol compatibility means Prisma, psql, and PostgreSQL drivers work with CockroachDB with minor adjustments.
- **Geo-distribution**: Native multi-region support enables data pinning by geography — critical for data residency compliance.
- **Automatic failover**: No Patroni/CloudNativePG required — CockroachDB handles failover automatically within the cluster.
- **Serializable isolation**: CockroachDB uses serializable isolation by default — the strongest ACID guarantee.

**Weaknesses:**
- **pgvector incompatibility**: CockroachDB does not support PostgreSQL extensions. pgvector cannot run on CockroachDB — the Tier 1 vector strategy is eliminated.
- **SQL compatibility gaps**: Despite PostgreSQL wire protocol compatibility, CockroachDB has known SQL compatibility gaps (certain JSONB operations, stored procedures, some window functions). Prisma compatibility requires careful testing.
- **Operational complexity**: CockroachDB clusters are more complex to operate than PostgreSQL. Troubleshooting requires CockroachDB-specific knowledge.
- **Cost**: CockroachDB's commercial license for enterprise features (multi-region, advanced security) is significant. The free tier is limited.
- **Performance regression for simple OLTP**: For single-region OLTP workloads (the majority of Atlas's operations), CockroachDB's distributed transaction overhead introduces latency compared to PostgreSQL. Distributed consensus (Raft) adds 1-5ms to every write.
- **Extension ecosystem**: No PostGIS, no pg_trgm, no TimescaleDB. Limited to CockroachDB's built-in feature set.

**Verdict:** Eliminated due to pgvector incompatibility and unnecessary distributed complexity for Atlas's current scale.

---

### Option 4: PlanetScale (Vitess-based MySQL)

**Overview:** PlanetScale is a managed database platform built on Vitess (MySQL sharding system originally developed at YouTube/Google). It offers horizontal scalability, schema change management, and a developer-friendly branching workflow.

**Strengths:**
- **Horizontal scalability**: Vitess provides horizontal MySQL sharding — effectively unlimited write scaling.
- **Schema branching**: PlanetScale's "branching" feature (deploy requests) makes schema migrations safer, with online DDL and revert capabilities.
- **Managed**: No database infrastructure to operate.
- **Developer experience**: PlanetScale's developer UX is exceptional — schema diff visualization, deploy request workflow, connection string management.

**Weaknesses:**
- **No pgvector**: MySQL-based, therefore no pgvector. Tier 1 vector strategy eliminated. This is immediately disqualifying.
- **No foreign keys**: PlanetScale disables foreign key constraints by default (Vitess limitation). Referential integrity must be enforced entirely at the application layer — a significant correctness risk for Atlas's financial and operational data.
- **Vendor lock-in**: PlanetScale is a managed SaaS product. Migrating away requires exporting data and reconfiguring all connection strings.
- **Cost**: PlanetScale's pricing is based on row reads and writes. Atlas's agent workflows generate millions of log rows — costs could scale non-linearly with usage.
- **No self-hosting**: No on-premise deployment option for regulated industry customers.

**Verdict:** Eliminated due to pgvector incompatibility and foreign key constraint removal.

---

## Decision Outcome

**Chosen option: PostgreSQL**

PostgreSQL is selected as Atlas's primary relational database. The decision is unambiguous: the pgvector integration requirement (ADR-005) mandates PostgreSQL as the only option that satisfies all constraints simultaneously. Beyond this hard requirement, PostgreSQL's feature set (JSONB, RLS, full-text search, rich extension ecosystem, ACID guarantees) is the strongest of any evaluated option for Atlas's use cases.

**Deployment model:**
- **Kubernetes**: CloudNativePG operator with a 3-node cluster (1 primary, 2 synchronous read replicas)
- **Connection pooling**: PgBouncer in transaction mode, managed by CloudNativePG
- **Backup**: Continuous WAL archiving to S3 with Point-in-Time Recovery (PITR) up to 30 days
- **Managed cloud option**: For SaaS-tier customers: Supabase (PostgreSQL + RLS + pgvector) or Neon (serverless PostgreSQL) as alternatives to self-hosted

---

## Consequences

### Positive
- pgvector Tier 1 vector storage runs within PostgreSQL — no additional service for relational-adjacent vector queries
- RLS policies provide database-level multi-tenant isolation — application bugs cannot expose cross-tenant data
- JSONB enables schema-flexible agent payload storage without proliferating narrow columns
- CloudNativePG provides zero-downtime failover with PITR — RPO < 5 minutes, RTO < 30 seconds
- Prisma ORM provides type-safe TypeScript access with automatic migration generation (`prisma migrate dev`)
- Full-text search via tsvector/tsquery handles basic documentation search without Elasticsearch for sub-million document scales

### Negative
- Connection pooling is mandatory — PgBouncer or PgCat must be deployed as a sidecar or standalone service alongside PostgreSQL
- Large table schema migrations require online DDL strategies — `pg_repack` must be evaluated for any ALTER TABLE on tables > 10M rows
- PostgreSQL write throughput limits will be reached at extreme scale (>50K writes/second) — sharding via Citus or migration to CockroachDB (with separate pgvector infrastructure) is the scaling escape valve
- Engineers must understand PostgreSQL-specific query optimization (EXPLAIN ANALYZE, index types, statistics) — generic SQL knowledge insufficient for performance tuning

### Neutral
- The Prisma schema file (`schema.prisma`) becomes the authoritative source of truth for the relational data model — changes must go through code review like application code
- TimescaleDB extension can be added to the same PostgreSQL instance for time-series data (Engineering Score history, agent execution metrics) without a separate time-series database

---

## Implementation Notes

### CloudNativePG Cluster Configuration
```yaml
apiVersion: postgresql.cnpg.io/v1
kind: Cluster
metadata:
  name: atlas-postgres
  namespace: atlas-data
spec:
  instances: 3
  postgresql:
    parameters:
      max_connections: "500"
      shared_buffers: "4GB"
      effective_cache_size: "12GB"
      maintenance_work_mem: "1GB"
      checkpoint_completion_target: "0.9"
      wal_buffers: "64MB"
      default_statistics_target: "100"
  storage:
    size: 500Gi
    storageClass: fast-ssd
  backup:
    retentionPolicy: "30d"
    barmanObjectStore:
      destinationPath: s3://atlas-pg-backups/
      s3Credentials:
        accessKeyId:
          name: pg-s3-creds
          key: ACCESS_KEY_ID
        secretAccessKey:
          name: pg-s3-creds
          key: ACCESS_SECRET_KEY
  monitoring:
    enablePodMonitor: true  # Prometheus integration
```

### Prisma Schema (Core Entities)
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Organization {
  id          String    @id @default(uuid()) @db.Uuid
  name        String
  slug        String    @unique
  plan        Plan      @default(STARTER)
  createdAt   DateTime  @default(now())
  projects    Project[]
  members     Member[]

  @@map("organizations")
}

model Project {
  id              String    @id @default(uuid()) @db.Uuid
  organizationId  String    @db.Uuid
  name            String
  status          ProjectStatus @default(ACTIVE)
  engineeringScore Float?
  metadata        Json      @default("{}")   // JSONB for flexible attributes
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  organization    Organization @relation(fields: [organizationId], references: [id])
  agentJobs       AgentJob[]
  requirements    Requirement[]

  @@index([organizationId])
  @@map("projects")
}

model AgentJob {
  id          String      @id @default(uuid()) @db.Uuid
  projectId   String      @db.Uuid
  agentType   String
  status      JobStatus   @default(PENDING)
  payload     Json        // JSONB: flexible agent-specific data
  result      Json?       // JSONB: agent output
  startedAt   DateTime?
  completedAt DateTime?
  error       String?
  createdAt   DateTime    @default(now())

  project     Project     @relation(fields: [projectId], references: [id])

  @@index([projectId, status])
  @@index([agentType, createdAt])
  @@map("agent_jobs")
}
```

### Row-Level Security Setup
```sql
-- Enable RLS on all tenant-scoped tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_jobs ENABLE ROW LEVEL SECURITY;

-- Policy: applications can only see their organization's data
CREATE POLICY org_isolation ON projects
  USING (organization_id = current_setting('app.current_org_id', true)::uuid);

-- Application must set org context before any query
-- In NestJS: SET LOCAL app.current_org_id = '...';
```

### PgBouncer Configuration (PgCat preferred for newer deployments)
```ini
[databases]
atlas = host=atlas-postgres-rw port=5432 dbname=atlas

[pgbouncer]
pool_mode = transaction
max_client_conn = 5000
default_pool_size = 100
min_pool_size = 10
server_idle_timeout = 600
client_idle_timeout = 0
```

---

## Compliance Verification

- [ ] CloudNativePG cluster deployed with 3 instances — verified via `kubectl get cluster`
- [ ] WAL archiving to S3 active — verified by checking last successful backup time in CloudNativePG status
- [ ] PITR tested quarterly: restore to a specific timestamp and verify data integrity
- [ ] RLS policies active on all tenant-scoped tables — verified by CI test that confirms cross-tenant data isolation
- [ ] Prisma migrations applied via CI pipeline — no manual `psql` schema changes in production
- [ ] PgBouncer in transaction mode — verified by confirming `pool_mode = transaction` in config
- [ ] `pg_stat_statements` extension enabled — for query performance analysis
- [ ] pgvector extension enabled and validated — `SELECT * FROM pg_extension WHERE extname = 'vector'`
- [ ] Database connection strings in Kubernetes Secrets (not ConfigMaps) — verified by security audit

---

## Related Decisions

- [ADR-005](./ADR-005-vector-database-strategy.md) — pgvector runs as a PostgreSQL extension, making PostgreSQL mandatory for Tier 1 vector storage
- [ADR-003](./ADR-003-agent-orchestration-framework.md) — LangGraph uses PostgreSQL as the checkpoint store (PostgresSaver)
- [ADR-008](./ADR-008-authentication-authorization.md) — Keycloak user data partially mirrored to PostgreSQL for RLS context
- [ADR-011](./ADR-011-message-queue-event-streaming.md) — PostgreSQL logical replication used for CDC event streaming to Kafka
- [ADR-012](./ADR-012-container-orchestration.md) — CloudNativePG runs on Kubernetes; requires appropriate StorageClass configuration

---

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [CloudNativePG Kubernetes Operator](https://cloudnative-pg.io/)
- [Prisma PostgreSQL Connector](https://www.prisma.io/docs/orm/overview/databases/postgresql)
- [pgvector Extension](https://github.com/pgvector/pgvector)
- [PgBouncer Documentation](https://www.pgbouncer.org/)
- [PostgreSQL Row-Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [CockroachDB vs PostgreSQL](https://www.cockroachlabs.com/docs/stable/cockroachdb-in-comparison.html)
- [PlanetScale Documentation](https://planetscale.com/docs)
- [Neon Serverless PostgreSQL](https://neon.tech/docs/introduction)
- [Supabase Documentation](https://supabase.com/docs)
