# CLI Specification — twn CLI

> **Document Status:** Authoritative Reference  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-06  
> **Owner:** Atlas Developer Experience Team  

---

## 1. Executive Summary

The `twn` CLI is the main gateway for developers interacting with the Atlas Engineering Operating System. Written in Rust for maximum startup speed, low resource consumption, and zero external dependency runtimes, `twn` runs locally on the engineer's system. It interfaces with local project files, parses configurations, runs local validation pipelines, and sends authorized commands to the Atlas cloud/on-premises gateway.

---

## 2. Command Architecture & Global Options

### 2.1 Exit Codes

All `twn` execution cycles conform to standard POSIX exit status conventions:
- `0`: Success.
- `1`: General Error (invalid commands, network timeout).
- `2`: Syntax or schema validation error.
- `3`: Constitutional policy violation (build blocked by guardrails).
- `4`: Engineering score check failed (threshold unmet).

### 2.2 Global Flags

These flags can be appended to any command:
- `--json`: Format all CLI console outputs as raw JSON strings.
- `--verbose`: Enable debug logs.
- `--project-path <path>`: Override the working directory context (defaults to current path).
- `--org <org_id>`: Target a specific organization workspace.

---

## 3. Command Registry & Usage

### 3.1 Project Lifecycle & Scaffolding

#### Command: `twn init`
Initializes a new Atlas workspace in the current directory.

```bash
twn init [project-name] [options]
```

- **Options:**
  - `--domain <domain>`: Define industry sector (e.g., `developer-tools`, `fintech`, `saas`).
  - `--template <name>`: Scaffolds a pre-approved repository template.
- **Workflow:**
  1. Creates `.atlas/` folder.
  2. Generates initial `atlas.blueprint.yaml`.
  3. Prompts the user to generate a base `atlas.constitution.yaml` matching corporate compliance (e.g., GDPR, SOC2).

#### Command: `twn login`
Authenticates the CLI against the Atlas Identity Provider (Keycloak) using OAuth Device Authorization flow.

```bash
twn login
```

---

### 3.2 Requirements Intake & Discovery

#### Command: `twn discover`
Launches the interactive, terminal-based Socratic dialogue intake session.

```bash
twn discover --feature [name]
```

- **Options:**
  - `--interactive`: Standard terminal conversation UI (default).
  - `--import <file>`: Seed the discovery process with a PDF requirement outline, user story sheet, or PRD draft.
- **Visual Terminal Intake Interface:**
```
$ twn discover --feature "API Gateway"
[?] Describe the primary users of the API Gateway (Default: internal-developers):
 > external-integrations
[?] What is the maximum latency requirement for authorization checks?
 > 5ms
[?] What compliance regulations must we enforce on request bodies?
 (Use arrow keys to select, space to select multiple)
   [x] GDPR (Data Anonymization)
   [ ] HIPAA
   [x] SOC2 (Audit logs)
[✓] Requirements saved to .atlas/requirements/api-gateway.json
```

---

### 3.3 Architecture & Blueprint Management

#### Command: `twn blueprint`
Validates, compiles, or proposes changes to the project blueprint.

```bash
twn blueprint [subcommand]
```

- **Subcommands:**
  - `validate`: Parses the current local `atlas.blueprint.yaml` and checks it against the json schema.
  - `propose --draft <path>`: Generates an architecture change proposal and compares the delta.
  - `lock`: Compiles the blueprint and generates `atlas.blueprint.lock.yaml`.

---

### 3.4 Multi-Agent Orchestration

#### Command: `twn orchestrate`
Coordinates the Agent Orchestrator to execute implementation changes described in the approved blueprint.

```bash
twn orchestrate --apply
```

- **Options:**
  - `--dry-run`: Output the step-by-step agent build plan without writing files.
  - `--agent <agent-name>`: Scope execution to a specific agent (e.g., `code-refactorer`).
  - `--watch`: Start a stream session displaying real-time agent thoughts, planning trees, and tool calls.

---

### 3.5 Auditing & Quality Metrics

#### Command: `twn audit`
Runs the Technical Audit Engine on the local codebase.

```bash
twn audit [options]
```

- **Options:**
  - `--drift-only`: Check if files or database schemas have deviated from blueprint declarations.
  - `--security`: Run dependency vulnerability analysis and look for credential leakage.

#### Command: `twn score`
Prints the current Engineering Score breakdown in the console.

```bash
twn score
```

```
=========================================
      ATLAS ENGINEERING SCORE: 92/100
=========================================
[✓] Architecture Quality  : 95/100
[✓] Security Posture      : 90/100
[✓] Documentation Health  : 98/100
[!] Technical Debt        : 85/100  (Stale migration found in module 'billing')
[✓] Constitutional Match  : 100/100

Project is compliant. Build approved.
```

---

### 3.6 MCP & Extension Management

#### Command: `twn mcp`
Manages Model Context Protocol servers.

```bash
twn mcp discover
```
- **Description:** Scans local environment paths for compatible MCP servers.
- **Workflow:** Evaluates capabilities and links them to the agent config in `.atlas/mcp-config.json`.

#### Command: `twn plugin`
Installs or manages plugins.

```bash
twn plugin install <plugin-id>
```
