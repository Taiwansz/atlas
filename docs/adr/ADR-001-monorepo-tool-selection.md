# ADR-001: Nx as Primary Monorepo Management Tool

**Date:** 2026-07-06
**Status:** Accepted
**Deciders:** Atlas Architecture Council
**Technical Area:** Developer Tooling / Build Infrastructure

---

## Context and Problem Statement

Atlas is an Engineering Operating System composed of dozens of interconnected packages, services, and applications spanning multiple languages and runtimes: TypeScript/Node.js services, Python ML engines, React/Next.js frontends, Go CLI utilities, Rust WASM modules, Kubernetes Helm charts, and shared configuration packages. As the codebase scales to 50+ packages and a team exceeding 30 engineers, the monorepo tooling choice becomes a foundational infrastructure decision that affects every developer's daily workflow, CI/CD pipeline efficiency, release coordination, and long-term architectural governance.

The core problem is multi-dimensional:
1. **Build performance**: Naïve monorepo setups build everything on every commit. At scale, this becomes untenable — a single PR touching a shared utility could trigger full rebuilds of 40+ downstream packages.
2. **Developer experience**: Engineers need instant feedback loops. Cold builds exceeding 5 minutes destroy flow state and create bottlenecks.
3. **Task orchestration**: Interdependent build, lint, test, and deploy tasks must execute in correct topological order with maximum parallelism.
4. **Polyglot support**: Atlas isn't a pure TypeScript monorepo. Python ML engines, Go CLI tools, and Rust WASM modules must participate in the same dependency graph and caching system.
5. **Governance at scale**: As the team grows, enforcing module boundaries, ownership rules, and dependency constraints requires tooling-level enforcement, not just convention.
6. **Remote caching**: Distributed teams and ephemeral CI runners waste enormous compute re-running tasks that have identical inputs. Remote cache infrastructure is not optional at scale.

Two primary candidates emerged from the evaluation: **Nx** and **Turborepo**. Both are production-grade monorepo tools with active ecosystems, but their design philosophies differ significantly.

---

## Decision Drivers

- **Build performance at scale**: Sub-minute CI for incremental changes; affected-only computation must be surgical
- **Polyglot support**: Must manage TypeScript, Python, Go, and Rust packages in a unified dependency graph
- **Plugin ecosystem maturity**: Ready-made executors for Next.js, Nest.js, Vite, Jest, ESLint, Docker, Helm — not custom scripts
- **Module boundary enforcement**: Architectural constraint enforcement (e.g., "frontend cannot import from agent-core directly") must be tooling-level
- **Governance and ownership**: Tag-based team ownership, project constraints, and dependency rules for a 30+ engineer org
- **Remote caching infrastructure**: First-class remote cache support with self-hostable options (not vendor lock-in)
- **IDE integration**: VS Code and JetBrains plugins for graph visualization and task execution
- **Migration path**: Must be adoptable incrementally without rewriting existing package structures
- **Community and longevity**: Backed by a company (not just OSS volunteers) with demonstrated enterprise adoption
- **Generator/scaffolding system**: Code generation for new packages, modules, and services to enforce consistency

---

## Considered Options

### Option 1: Nx (by Nrwl)

**Overview:** Nx is a full-featured smart build system with first-class support for monorepos. It provides a computation cache, affected task computation, dependency graph visualization, plugin ecosystem, code generators, and module boundary enforcement via ESLint rules. Nx Cloud provides remote caching and distributed task execution. Nx supports custom executors for any language or toolchain.

**Strengths:**
- **Affected computation**: `nx affected` computes the minimal set of projects impacted by a change using the project dependency graph — not just file-level diffs. This is graph-aware, not string-matching.
- **Plugin ecosystem**: First-party plugins for Next.js (`@nx/next`), NestJS (`@nx/nest`), Vite (`@nx/vite`), React (`@nx/react`), Node (`@nx/node`), Python (`@nx/python` via community, `@nxlv/python` is production-grade), Docker, and more. Reduces boilerplate configuration to near zero.
- **Module boundary enforcement**: `@nx/eslint-plugin` with `enforce-module-boundaries` rule allows declarative tagging of projects (e.g., `scope:frontend`, `scope:agent`, `type:util`) and enforcing which tags can import from which. This is the most robust boundary enforcement available in any monorepo tool.
- **Generators and scaffolding**: `nx generate` creates new libraries, applications, and components with enforced naming conventions and correct placement in the dependency graph. Ensures every new package is immediately wired into the build system.
- **Project graph visualization**: `nx graph` renders an interactive, browser-based DAG of the entire project dependency graph. Critical for understanding impact and architectural drift.
- **Workspace configuration**: `project.json` per-project files (or `package.json` inference) allow fine-grained target configuration without cluttering root config.
- **Distributed Task Execution (DTE)**: Nx Cloud can distribute task execution across multiple CI agents, achieving near-linear speedup with agent count — transforming 20-minute CI into 3-minute CI with 8 agents.
- **Self-hostable remote cache**: Nx Cloud has a self-hosted option (Nx Enterprise), or the community `nx-remotecache-*` plugins allow S3, GCS, Azure Blob, MinIO backends.
- **Polyglot via custom executors**: Any language can participate via custom executors. The `@nxlv/python` community plugin handles `poetry`-based Python packages with proper dependency tracking.
- **Enterprise governance**: Workspace rules, conformance checks, and project tags create an enforceable governance layer.
- **Incremental adoption**: Nx can be added to an existing npm/yarn/pnpm workspace with `nx init` without restructuring.

**Weaknesses:**
- **Configuration complexity**: Nx's power comes with configuration surface area. `nx.json`, `project.json` files, executor options, and generator defaults require investment to understand.
- **JavaScript-centric defaults**: While polyglot is possible, the experience is more polished for JS/TS projects. Python and Go integration requires community plugins or custom executors.
- **Nx Cloud cost**: The managed Nx Cloud has free tiers but enterprise features (SSO, audit logs, DTE at scale) require paid plans. Self-hosted Nx Enterprise licensing is significant.
- **Learning curve**: New engineers from non-monorepo backgrounds face a steeper onboarding curve with Nx's concepts (targets, executors, generators, tags, implicit dependencies).

**Verdict:** Strongly suited for Atlas. The module boundary enforcement alone justifies adoption for a multi-team codebase. DTE can transform CI performance non-linearly.

---

### Option 2: Turborepo (by Vercel)

**Overview:** Turborepo is a high-performance build system for JavaScript/TypeScript monorepos. It focuses on a minimal configuration footprint and fast incremental builds via a content-addressable cache. Vercel provides hosted remote caching (Vercel Remote Cache). Turborepo is designed for simplicity — it works by declaring task pipelines in `turbo.json`.

**Strengths:**
- **Minimal configuration**: `turbo.json` pipeline definition is intuitive and minimal. Onboarding a new developer takes 30 minutes vs. 2 hours for Nx.
- **Performance**: Turborepo's Rust-based task runner is extremely fast. Cache artifact hashing is efficient. For pure TypeScript monorepos, performance is comparable to Nx.
- **Vercel integration**: First-class integration with Vercel deployments. For Next.js-heavy projects hosted on Vercel, this reduces deployment pipeline complexity significantly.
- **Package-level granularity**: Turborepo works at the package level (workspace packages), making it easy to reason about at small-to-medium scale.
- **Low maintenance overhead**: Fewer concepts means fewer things to break, misconfigure, or require updates.
- **Remote Cache**: Vercel Remote Cache is free for Vercel users; self-hostable via `@nx/remote-cache` compatible backends or community tools.

**Weaknesses:**
- **No module boundary enforcement**: Turborepo has no equivalent to Nx's `enforce-module-boundaries`. Architectural constraints must be enforced via code review convention, not tooling. At 30+ engineers, this is a governance liability.
- **No generators/scaffolding**: Turborepo does not provide code generators. New packages are created manually or via custom scripts, leading to inconsistency over time.
- **Limited polyglot support**: Turborepo assumes npm workspaces. Python, Go, and Rust packages are fundamentally outside its model — they can be included as script-based tasks but don't participate in the dependency graph.
- **No affected computation (graph-aware)**: Turborepo's "affected" equivalent is file-based. It doesn't have a project graph — it operates purely on package boundaries. A change to a transitive shared util triggers full downstream rebuild without graph-level pruning.
- **No project graph visualization**: No built-in dependency graph explorer. Third-party tools or manual documentation needed.
- **Plugin ecosystem absent**: No executor plugins. All build logic lives in npm scripts, meaning every project maintains its own script conventions.
- **Vercel dependency risk**: Remote cache is tightly coupled to Vercel's platform. Self-hosted options exist but are community-maintained and less robust.
- **Governance features lacking**: No concept of project ownership, tags, or workspace-level conformance checks.

**Verdict:** Excellent for small-to-medium pure TypeScript projects deploying to Vercel. Insufficient for Atlas's polyglot, multi-team, governance-heavy requirements.

---

### Option 3: Bazel (by Google)

**Overview:** Bazel is Google's open-source build system, designed for massive polyglot monorepos (Google's internal monorepo has billions of lines of code). It provides hermetic builds, remote execution, and a powerful query language for dependency analysis.

**Strengths:**
- **True polyglot support**: First-class rules for every language. `rules_python`, `rules_go`, `rules_rust`, `rules_nodejs` all integrate into a single dependency graph.
- **Hermetic builds**: Every build action is sandboxed. Reproducible builds across machines, eliminating "works on my machine" issues.
- **Remote execution**: Bazel supports distributed build execution across a cluster, not just caching.
- **Extreme scale**: Designed for monorepos with millions of files. No practical upper limit.
- **Incremental builds**: Extremely fine-grained incrementality — Bazel caches at the action level, far more granular than Nx (project level) or Turborepo (package level).

**Weaknesses:**
- **Extreme complexity**: `BUILD` file syntax (Starlark), toolchain configuration, and platform constraints have an enormous learning curve. Onboarding engineers to Bazel typically takes weeks.
- **Ecosystem friction**: The JavaScript/TypeScript tooling (esbuild, Vite, Next.js) does not integrate naturally with Bazel's model. Rules must be written or adopted from community sources that often lag behind the ecosystem.
- **Maintenance burden**: Maintaining Bazel rules for a rapidly evolving tech stack (Next.js App Router, new LangGraph versions, etc.) requires dedicated build engineering effort.
- **Developer experience**: The local development loop with Bazel (no hot module replacement, complex watch mode) is inferior to native npm/cargo/poetry tooling.
- **Overkill for current scale**: Atlas starts with 10-50 packages. Bazel's benefits become clear at 500+ packages. The cost-benefit ratio is poor for Atlas's current horizon.

**Verdict:** Not appropriate for Atlas at current scale. Revisit if Atlas monorepo exceeds 200 packages or requires multi-language hermetic builds as a hard requirement.

---

### Option 4: Custom Makefile + Scripts (No Monorepo Tool)

**Overview:** Using GNU Make, shell scripts, and npm workspaces natively, without dedicated monorepo tooling. Each team manages their own build scripts.

**Strengths:**
- **Zero dependency**: No tool to learn, update, or break.
- **Maximum flexibility**: Every project can use exactly the tooling it wants.
- **Familiar to all engineers**: Make is universally understood.

**Weaknesses:**
- **No caching**: Every invocation rebuilds from scratch unless engineers implement caching manually.
- **No affected computation**: CI builds everything on every commit.
- **No dependency graph**: Task ordering is manual and error-prone.
- **No governance**: Module boundaries enforced only via convention.
- **Scales to disaster**: At 20+ packages, Makefile monorepos devolve into unmaintainable script soup.

**Verdict:** Rejected. Not viable beyond proof-of-concept scale.

---

## Decision Outcome

**Chosen option: Nx**

Nx is selected as the primary monorepo management tool for Atlas. The decision is driven primarily by:

1. **Module boundary enforcement** is non-negotiable for a multi-team codebase. Turborepo's absence of this feature is disqualifying.
2. **Polyglot support** via custom executors and the `@nxlv/python` plugin enables Python ML engines to participate in the same build graph as TypeScript services.
3. **Distributed Task Execution** provides a clear scaling path for CI performance as the number of packages grows.
4. **Code generators** ensure every new package, service, and library is created consistently, reducing architectural drift.
5. **Project graph visualization** is operationally critical for impact analysis during incidents and architecture reviews.

Turborepo will be monitored as it matures. If Vercel adds boundary enforcement and polyglot support, a re-evaluation will be triggered. As of 2026-07, Nx remains the clear choice for Atlas's requirements.

---

## Consequences

### Positive
- Incremental CI/CD: `nx affected` ensures only impacted packages are tested/built, reducing CI time by an estimated 60-80% at scale.
- Architectural governance: `enforce-module-boundaries` provides a tooling-level enforcement of the Atlas layered architecture (agents cannot import frontend code, shared utilities are truly shared, etc.).
- Consistent scaffolding: `nx generate` ensures every new microservice, library, and agent module follows the same directory structure, naming convention, and configuration template.
- Remote caching: With Nx Cloud or a self-hosted S3 backend, engineers never re-run a task with identical inputs — build artifacts are fetched from cache.
- Distributed execution: CI pipelines can distribute tasks across N agents, achieving near-linear speedup.
- Graph insight: The interactive project graph makes architectural drift visible and enables impact analysis before merging changes.

### Negative
- **Learning curve**: Engineers new to Nx require 4-8 hours of onboarding. An internal "Nx guide" must be maintained.
- **Configuration complexity**: As plugins and executors accumulate, `nx.json` and `project.json` files can become dense. Discipline in configuration hygiene is required.
- **Plugin lag**: When major versions of Next.js, NestJS, or Vite release, the corresponding `@nx/*` plugin may lag by days-to-weeks before full compatibility.
- **Nx Cloud cost**: At enterprise scale, Nx Cloud licensing is non-trivial. Budget for self-hosted remote cache infrastructure (MinIO on Kubernetes) as an alternative.

### Neutral
- The Nx project graph becomes the authoritative source of truth for package relationships. Documentation must reference it.
- Turborepo's simpler model may be preferred for isolated sub-projects or client-facing repos that don't require Atlas's full governance model.
- Nx version upgrades are managed via `nx migrate`, which automates breaking change migration — this must be part of the quarterly dependency maintenance cycle.

---

## Implementation Notes

### Initial Setup
```bash
# Initialize Nx in existing repo
npx nx@latest init

# Or create fresh workspace
npx create-nx-workspace@latest atlas --preset=ts --pm=pnpm
```

### Project Tagging Convention
All projects must declare tags in `project.json`:
```json
{
  "tags": ["scope:agent", "type:lib", "team:platform"]
}
```

Defined scopes:
| Tag | Description |
|-----|-------------|
| `scope:agent` | Agent orchestration, LLM logic |
| `scope:frontend` | Next.js apps, React components |
| `scope:api` | Backend API services |
| `scope:shared` | Shared utilities, types, constants |
| `scope:infra` | Infrastructure, IaC, Helm charts |
| `scope:ml` | Python ML engines |

### Module Boundary Rules (`nx.json`)
```json
{
  "pluginsConfig": {
    "@nx/eslint-plugin": {
      "enforce-module-boundaries": [
        {
          "allow": [],
          "depConstraints": [
            { "sourceTag": "scope:frontend", "onlyDependOnLibsWithTags": ["scope:shared", "type:ui"] },
            { "sourceTag": "scope:agent", "onlyDependOnLibsWithTags": ["scope:shared", "scope:agent"] },
            { "sourceTag": "scope:api", "onlyDependOnLibsWithTags": ["scope:shared", "scope:agent"] }
          ]
        }
      ]
    }
  }
}
```

### Remote Cache (Self-Hosted)
```yaml
# nx.json remote cache via S3-compatible backend
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "nx-remotecache-s3",
      "options": {
        "endpoint": "http://minio.atlas-infra.svc:9000",
        "bucket": "nx-cache",
        "region": "us-east-1"
      }
    }
  }
}
```

### CI Configuration (GitHub Actions)
```yaml
- name: Set up Nx affected base/head
  uses: nrwl/nx-set-shas@v4

- name: Run affected tasks
  run: |
    pnpm nx affected -t lint,test,build --parallel=4
```

---

## Compliance Verification

- [ ] All new packages created via `nx generate` — verified by CI check that rejects `project.json` files without required tags
- [ ] `enforce-module-boundaries` ESLint rule enabled in root `.eslintrc.json` — CI lint step must pass
- [ ] Remote cache hit rate monitored: target >70% cache hit rate in CI (measured via Nx Cloud dashboard or custom metrics)
- [ ] Quarterly: run `nx graph` and screenshot for architecture review
- [ ] Nx version: kept within 1 major version of latest release; `nx migrate` executed quarterly

---

## Related Decisions

- [ADR-002](./ADR-002-primary-language-backend.md) — TypeScript as primary language influences the choice of Nx (TypeScript-first tool)
- [ADR-012](./ADR-012-container-orchestration.md) — Kubernetes workloads are built via Nx Docker executors
- [ADR-010](./ADR-010-observability-stack.md) — Build metrics and cache hit rates are surfaced via the observability stack

---

## References

- [Nx Documentation](https://nx.dev/getting-started/intro)
- [Nx vs Turborepo Comparison](https://nx.dev/concepts/turbo-and-nx)
- [enforce-module-boundaries Rule](https://nx.dev/nx-api/eslint-plugin/documents/enforce-module-boundaries)
- [Nx Cloud Distributed Task Execution](https://nx.dev/ci/features/distribute-task-execution)
- [nxlv/python Plugin](https://github.com/lucasvieirasilva/nx-plugins/tree/main/packages/nx-python)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Bazel Build System](https://bazel.build/)
- [Monorepo Tools Comparison — Monorepo.tools](https://monorepo.tools/)
