# Atlas Engineering OS — Monorepo Structure

> **Document Status:** Authoritative Reference  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-06  
> **Owner:** Atlas Architecture Team  

---

## 1. Monorepo Overview

Atlas is structured as a multi-language monorepo using **Nx** and **pnpm** workspaces. This structure allows us to manage both Node.js/TypeScript modules (APIs, CLI, Frontend dashboard) and Python packages (AI agents, ML processing, Socratic NLP pipelines) in a single repository while preserving dependency tracking, incremental builds, and unified CI/CD pipelines.

---

## 2. Directory Structure

```
atlas/
├── README.md                          # North star developer documentation
├── nx.json                            # Nx workspace dependency layout and cache configuration
├── package.json                       # Global packages and monorepo script runner
├── pnpm-workspace.yaml                # pnpm workspace mappings
├── tsconfig.base.json                 # Shared base compiler configuration for TypeScript
│
├── apps/                              # Executable end-user interfaces
│   ├── web-dashboard/                 # Next.js 15 administration & dashboard interface
│   └── agy-cli/                       # CLI executable wrapper (Rust/Node)
│
├── engines/                           # Core Atlas computation engines (individual services)
│   ├── requirement-discovery/         # Python service: requirement extraction & NLP
│   ├── blueprint/                     # TS service: schema validator and ADR compiler
│   ├── constitution/                  # TS/Python service: policy checking middleware
│   ├── orchestrator/                  # Python service: LangGraph agent execution core
│   ├── memory/                        # TS service: semantic search & context indexer
│   └── score/                         # TS service: technical score & audit aggregation
│
├── packages/                          # Shared internal libraries (npm & pip packages)
│   ├── core/                          # TS: shared schemas, BaseEngine, config utilities
│   ├── logger/                        # TS/Python: standard telemetry & OTel middleware
│   ├── database/                      # TS/Python: Neo4j and pg client abstraction layers
│   └── agent-sdk/                     # Python: agent base classes, memory connectors
│
├── integrations/                      # Third-party adapters and connectors
│   ├── github/                        # GitHub action triggers & API integrations
│   ├── slack/                         # Slack notification adapters and app connectors
│   └── mcp/                           # Model Context Protocol host bindings
│
├── infra/                             # Cloud-native infrastructure & deployment
│   ├── k8s/                           # Kubernetes manifests (Helm charts, configurations)
│   ├── docker/                        # Production and local development Dockerfiles
│   └── terraform/                     # IaC for provisioning cloud databases and Kafka
│
└── docs/                              # Global documentation (ADRs, RFCs, specifications)
```

---

## 3. Workspaces & Dependency Mapping

### 3.1 `pnpm-workspace.yaml`
Specifies package paths for Node modules:
```yaml
packages:
  - "apps/*"
  - "engines/*"
  - "packages/*"
  - "integrations/*"
```

### 3.2 `nx.json`
Configures build caching and defines dependencies between projects:
```json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "lint", "test", "docker-build"]
      }
    }
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["{projectRoot}/dist"]
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
```

---

## 4. Multi-Language Boundary Management

TypeScript and Python boundaries are managed using the following rules:

1. **Shared Schemas:** Protocol Buffers (Protobuf) under `packages/core/proto` serve as the contract source. Codegen pipelines compile Protobufs into TypeScript types (`packages/core/src/types`) and Python models (`packages/agent-sdk/atlas_sdk/types`).
2. **Virtual Environments:** Each Python service under `engines/` maintains its own `pyproject.toml` and virtual environment managed by `poetry` or `pipenv`, but coordinates through Nx execution commands (`nx run engine:test`).
3. **CI/CD Execution Isolation:** Continuous Integration runs builds and tests incrementally by checking the git diff using the command:
   ```bash
   nx affected --target=test --base=origin/main
   ```
   This prevents running Python tests when only TypeScript frontend code has changed.
