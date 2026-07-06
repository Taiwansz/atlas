# Atlas Product & Technical Roadmap (2026 - 2027)

> **Document Status:** Authoritative Reference  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-06  
> **Owner:** Atlas Leadership Team  

---

## 1. Multi-Year Horizon Overview

This roadmap details the strategic development phases of the Atlas Engineering Operating System from foundation layout to enterprise-grade marketplace release.

```
       Phase 1               Phase 2               Phase 3               Phase 4
     FOUNDATION        ENGINES & MEMORY      AUDIT & ORCHESTRATE     SCALE & MARKETPLACE
    ┌──────────┐         ┌──────────┐           ┌──────────┐         ┌──────────┐
    │ Q1 2026  │ ──────▶ │ Q2-Q3 '26│ ────────▶ │ Q4 '26 - │ ──────▶ │ Q2-Q4 '27│
    │          │         │          │           │ Q1 2027  │         │          │
    └──────────┘         └──────────┘           └──────────┘         └──────────┘
```

---

## 2. Milestone Registry

### Milestone 1: Foundation & Core Protocols (Q1 2026)
- **Objective:** Establish the philosophical, structural, and contract-level base of the monorepo.
- **Key Deliverables:**
  - Complete foundation documents (Vision, Manifesto, Constitution, Principles, Values).
  - Define inter-service gRPC API contracts and Protobuf schemas.
  - Deliver the Rust-based `agy` CLI CLI structure with mock validation logic.
  - Complete the monorepo workspace configuration using Nx and PNPM.
- **Success Criteria:** CI pipeline executes green on empty builds; CLI compiles with zero external runtime dependencies.

### Milestone 2: Blueprint & Project Memory Engine (Q2 - Q3 2026)
- **Objective:** Build the core architecture state machine.
- **Key Deliverables:**
  - Launch the **Blueprint Engine** capable of parsing, validating, and locking `atlas.blueprint.yaml`.
  - Implement the **Memory Engine** using Neo4j to build semantic relationship graphs.
  - Deliver automated **ADR compilation** tracking changes between blueprint versions.
  - Launch the **Requirement Discovery Engine** containing the terminal-based Socratic interview interface.
- **Success Criteria:** Socratic intake outputs a requirement JSON that can be compiled into a validated blueprint lockfile.

### Milestone 3: Audit, Scoring, and Agent Orchestrator (Q4 2026 - Q1 2027)
- **Objective:** Enable continuous code generation and architectural enforcement.
- **Key Deliverables:**
  - Launch the **Technical Audit Engine** running AST checks to detect code drift.
  - Implement the **Engineering Score Engine** calculating numeric project ratings.
  - Build the **Agent Orchestrator** using LangGraph to run stateful multi-agent execution loops.
  - Equip code generation agents with secure tool boundaries.
- **Success Criteria:** Developer attempts to write undocumented code; the audit engine detects drift, fails the CI build, and prompts the user to update the blueprint.

### Milestone 4: Simulation, Red Teaming, and Marketplace (Q2 - Q4 2027)
- **Objective:** Deliver advanced operations, security sandboxing, and community ecosystem.
- **Key Deliverables:**
  - Deploy **gVisor sandboxing** for executing untrusted test code safely.
  - Launch the **Simulation Engine** modeled in Firecracker microVMs.
  - Implement the **Red Team Engine** simulating penetration attack runs.
  - Expose the **Web Dashboard** portal showing live scores and logs.
  - Launch the public **Plugin Marketplace** allowing third-party developers to publish extensions.
- **Success Criteria:** Platform handles multi-tenant organizations; security tests block open redirects automatically.

---

## 3. High-Priority Risk Mitigation Plan

1. **LLM Non-Determinism:** LLM completions can vary, making automated audits unstable.
   - *Mitigation:* We wrap model invocations with JSON schema enforcement and run deterministic AST comparisons instead of relying purely on natural language code checks.
2. **Neo4j Transaction Latency:** High graph traversal depth on large codebases could slow down CLI lookups.
   - *Mitigation:* Implement read-through caching in Redis and index key relation paths.
3. **Sandbox Escape Vulnerability:** Unsecure user-submitted code could escape container boundaries.
   - *Mitigation:* Dual-isolate execution using gVisor inside private Kubernetes namespaces with restricted node access privileges.
