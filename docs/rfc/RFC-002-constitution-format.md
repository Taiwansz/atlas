# RFC-002: Atlas Constitution Format

**RFC Number:** 002
**Author(s):** Atlas Engineering Team
**Date:** 2026-07-06
**Status:** Final
**Category:** Core

---

## Abstract

This RFC specifies the **Atlas Constitution** — a structured, machine-readable governance document that defines the inviolable rules, standards, rights, and prohibitions governing every Atlas agent operating within a project. The Constitution serves as the highest authority in the Atlas agent hierarchy, superseding any instruction from any agent, tool, or user. This document defines the Constitution schema, its sections, enforcement mechanisms, versioning, amendment procedures, and integration with agent system prompts.

---

## Motivation

In a multi-agent system with dozens of specialized agents operating autonomously, the risk of divergent behavior is significant. Without a shared governance layer, agents may:

- Produce code that violates security requirements (e.g., hardcoded credentials)
- Override architectural decisions inconsistently
- Apply conflicting coding standards across modules
- Operate outside ethical or compliance boundaries
- Make irreversible changes without appropriate safeguards

The Atlas Constitution solves this by defining a **constitutional layer** that is injected into every agent's context and enforced by the Atlas orchestrator. No agent may act contrary to the Constitution.

### Goals

- Define a machine-readable format that encodes project-level behavioral rules
- Enable automatic Constitution injection into agent system prompts
- Provide a versioned, auditable amendment process
- Support organization-level Constitution templates with project-level overrides
- Allow Constitution clauses to be used as rejection criteria during code review

### Non-Goals

- Replacing security scanning tools — the Constitution references them
- Encoding business logic — that belongs in the Blueprint
- Replacing code style configuration files (ESLint, Prettier) — the Constitution references style standards

---

## Specification

### 3.1 Constitution File Format

The Atlas Constitution is stored as:

```
<project-root>/
  atlas.constitution.yaml           # Primary Constitution
  atlas.constitution.lock.yaml      # Signed, locked version
  .atlas/
    constitution/
      history/
        atlas.constitution.v1.yaml
      amendments/
        amendment-001.yaml
```

The Constitution is YAML 1.2, with JSON Schema as the authoritative type definition.

### 3.2 Constitution JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://atlas.engineering/schemas/constitution/v1.json",
  "title": "AtlasConstitution",
  "description": "Governing rules and standards for Atlas agent behavior",
  "type": "object",
  "required": [
    "atlas_version",
    "constitution_version",
    "constitution_id",
    "effective_date",
    "jurisdiction",
    "invariants",
    "rights",
    "prohibitions",
    "standards",
    "evolution"
  ],
  "additionalProperties": false,
  "properties": {
    "atlas_version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
    "constitution_version": { "type": "integer", "minimum": 1 },
    "constitution_id": { "type": "string", "format": "uuid" },
    "effective_date": { "type": "string", "format": "date-time" },
    "jurisdiction": {
      "type": "object",
      "required": ["scope", "project_id"],
      "properties": {
        "scope": { "type": "string", "enum": ["project", "organization", "team"] },
        "project_id": { "type": "string", "format": "uuid" },
        "organization_id": { "type": "string", "format": "uuid" },
        "inherits_from": { "type": "string", "format": "uri" }
      }
    },
    "invariants": { "$ref": "#/$defs/InvariantsSection" },
    "rights": { "$ref": "#/$defs/RightsSection" },
    "prohibitions": { "$ref": "#/$defs/ProhibitionsSection" },
    "standards": { "$ref": "#/$defs/StandardsSection" },
    "evolution": { "$ref": "#/$defs/EvolutionSection" },
    "signatures": { "$ref": "#/$defs/SignaturesSection" }
  },
  "$defs": {
    "InvariantsSection": {
      "description": "Inviolable rules that MUST always be true. No exception, no override.",
      "type": "object",
      "required": ["rules"],
      "properties": {
        "rules": {
          "type": "array",
          "minItems": 1,
          "items": {
            "type": "object",
            "required": ["id", "title", "statement", "enforcement", "severity"],
            "properties": {
              "id": { "type": "string", "pattern": "^INV-\\d{3}$" },
              "title": { "type": "string" },
              "statement": { "type": "string" },
              "rationale": { "type": "string" },
              "enforcement": {
                "type": "string",
                "enum": ["block", "alert", "log"]
              },
              "severity": {
                "type": "string",
                "enum": ["critical", "high", "medium"]
              },
              "detection_patterns": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "type": { "type": "string", "enum": ["regex", "ast-query", "semantic", "schema-check"] },
                    "pattern": { "type": "string" },
                    "description": { "type": "string" }
                  }
                }
              },
              "exceptions": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "condition": { "type": "string" },
                    "requires_approval_from": { "type": "string" },
                    "max_duration_hours": { "type": "integer" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "RightsSection": {
      "description": "Rights granted to agents and humans operating under this Constitution",
      "type": "object",
      "required": ["agent_rights", "human_rights"],
      "properties": {
        "agent_rights": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "right", "granted_to"],
            "properties": {
              "id": { "type": "string", "pattern": "^RIGHT-\\d{3}$" },
              "right": { "type": "string" },
              "granted_to": {
                "type": "array",
                "items": { "type": "string" }
              },
              "conditions": { "type": "string" },
              "scope": { "type": "string" }
            }
          }
        },
        "human_rights": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "right"],
            "properties": {
              "id": { "type": "string", "pattern": "^RIGHT-H-\\d{3}$" },
              "right": { "type": "string" },
              "always_preserved": { "type": "boolean", "default": true }
            }
          }
        }
      }
    },
    "ProhibitionsSection": {
      "description": "Actions agents are explicitly forbidden from taking",
      "type": "object",
      "required": ["rules"],
      "properties": {
        "rules": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "title", "statement", "enforcement"],
            "properties": {
              "id": { "type": "string", "pattern": "^PROH-\\d{3}$" },
              "title": { "type": "string" },
              "statement": { "type": "string" },
              "rationale": { "type": "string" },
              "enforcement": { "type": "string", "enum": ["block", "alert", "log"] },
              "applies_to_agents": {
                "oneOf": [
                  { "type": "string", "enum": ["all"] },
                  { "type": "array", "items": { "type": "string" } }
                ]
              },
              "applies_to_environments": {
                "type": "array",
                "items": { "type": "string", "enum": ["development", "staging", "production", "all"] }
              }
            }
          }
        }
      }
    },
    "StandardsSection": {
      "description": "Technical and process standards all contributions must meet",
      "type": "object",
      "required": ["code", "security", "testing", "documentation"],
      "properties": {
        "code": {
          "type": "object",
          "properties": {
            "style_guides": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "language": { "type": "string" },
                  "guide_name": { "type": "string" },
                  "config_path": { "type": "string" },
                  "enforcement_tool": { "type": "string" }
                }
              }
            },
            "max_function_length_lines": { "type": "integer", "default": 50 },
            "max_file_length_lines": { "type": "integer", "default": 500 },
            "max_cyclomatic_complexity": { "type": "integer", "default": 10 },
            "max_cognitive_complexity": { "type": "integer", "default": 15 },
            "naming_conventions": {
              "type": "object",
              "additionalProperties": { "type": "string" }
            },
            "commit_convention": { "type": "string", "enum": ["conventional-commits", "gitmoji", "custom"] },
            "branch_naming": { "type": "string" }
          }
        },
        "security": {
          "type": "object",
          "properties": {
            "sast_required": { "type": "boolean", "default": true },
            "dast_required": { "type": "boolean" },
            "dependency_scanning": { "type": "boolean", "default": true },
            "secret_scanning": { "type": "boolean", "default": true },
            "container_scanning": { "type": "boolean" },
            "sbom_required": { "type": "boolean" },
            "vulnerability_sla": {
              "type": "object",
              "properties": {
                "critical_hours": { "type": "integer", "default": 24 },
                "high_hours": { "type": "integer", "default": 72 },
                "medium_days": { "type": "integer", "default": 30 },
                "low_days": { "type": "integer", "default": 90 }
              }
            },
            "owasp_top10_coverage": { "type": "boolean" },
            "pen_test_cadence_months": { "type": "integer" }
          }
        },
        "testing": {
          "type": "object",
          "properties": {
            "minimum_coverage_percent": { "type": "integer", "minimum": 0, "maximum": 100 },
            "tests_required_with_changes": { "type": "boolean", "default": true },
            "test_naming_convention": { "type": "string" },
            "no_skip_without_issue": { "type": "boolean", "default": true },
            "flaky_test_tolerance": { "type": "integer", "description": "Max allowed flaky tests in suite", "default": 0 }
          }
        },
        "documentation": {
          "type": "object",
          "properties": {
            "public_api_docstring_required": { "type": "boolean", "default": true },
            "adr_required_for_architecture_changes": { "type": "boolean", "default": true },
            "changelog_required": { "type": "boolean", "default": true },
            "readme_must_include": {
              "type": "array",
              "items": { "type": "string" }
            },
            "max_doc_staleness_days": { "type": "integer", "default": 90 }
          }
        },
        "accessibility": {
          "type": "object",
          "properties": {
            "wcag_level": { "type": "string", "enum": ["A", "AA", "AAA"] },
            "automated_audit_required": { "type": "boolean" }
          }
        }
      }
    },
    "EvolutionSection": {
      "description": "Rules governing how the Constitution itself may be changed",
      "type": "object",
      "required": ["amendment_process", "approval_threshold"],
      "properties": {
        "amendment_process": {
          "type": "string",
          "enum": ["proposal-review-vote", "proposal-auto-approve", "owner-only"]
        },
        "approval_threshold": {
          "type": "object",
          "properties": {
            "invariants": { "type": "integer", "description": "Min approvals to amend Invariants", "minimum": 1 },
            "prohibitions": { "type": "integer", "minimum": 1 },
            "standards": { "type": "integer", "minimum": 1 },
            "rights": { "type": "integer", "minimum": 1 }
          }
        },
        "review_period_hours": { "type": "integer", "default": 48 },
        "retroactive_amendments": { "type": "boolean", "default": false },
        "amendment_log_required": { "type": "boolean", "default": true }
      }
    },
    "SignaturesSection": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["signer", "signed_at", "signature"],
        "properties": {
          "signer": { "type": "string" },
          "role": { "type": "string" },
          "signed_at": { "type": "string", "format": "date-time" },
          "signature": { "type": "string", "description": "GPG signature of Constitution hash" },
          "key_fingerprint": { "type": "string" }
        }
      }
    }
  }
}
```

---

### 3.3 Constitution Sections — Detailed Specification

#### 3.3.1 Invariants

Invariants are the **supreme law** of the project. They represent conditions that must **always hold** — they cannot be temporarily waived, overridden by any agent, or bypassed by any user instruction. Invariants protect the fundamental integrity of the project.

**Example Invariants:**

```yaml
invariants:
  rules:
    - id: INV-001
      title: No Credentials in Source Code
      statement: >
        No cryptographic keys, passwords, API tokens, connection strings, or any
        form of authentication credential shall ever be committed to version control
        in plaintext form, regardless of environment, context, or instruction.
      rationale: >
        Credentials in source code represent an unrecoverable security breach
        once exposed. The blast radius is organization-wide and permanent.
      enforcement: block
      severity: critical
      detection_patterns:
        - type: regex
          pattern: '(password|passwd|secret|api_key|token)\s*=\s*["\'][^${}][^"\']{8,}'
          description: Detects likely hardcoded credentials
        - type: semantic
          pattern: "credential assignment outside secrets manager"
          description: Semantic analysis for credential patterns
      exceptions:
        - condition: "dummy/test credentials in clearly labeled test fixtures"
          requires_approval_from: "security-lead"
          max_duration_hours: 168

    - id: INV-002
      title: Human Override Always Available
      statement: >
        Every automated action taken by any Atlas agent must have a clear,
        accessible, and immediately effective human override mechanism.
        No agent may take an action that cannot be reversed by a human.
      enforcement: block
      severity: critical

    - id: INV-003
      title: Production Changes Require Approval
      statement: >
        No agent may modify production infrastructure, production databases,
        or production configuration without explicit human approval recorded
        in the audit log, except in response to an active incident with
        severity P0 or P1 and only using pre-approved runbooks.
      enforcement: block
      severity: critical

    - id: INV-004
      title: Data Minimization
      statement: >
        No agent may collect, store, or transmit personal data beyond what is
        strictly necessary for the declared functionality. All PII handling must
        be declared in the Blueprint and comply with applicable privacy laws.
      enforcement: block
      severity: critical
```

#### 3.3.2 Rights

Rights define what agents and humans are **entitled to** within the system. Rights create a floor of behavior — the system guarantees these rights will be honored.

**Agent Rights (examples):**

| Right ID | Right | Granted To |
|----------|-------|-----------|
| RIGHT-001 | Right to refuse harmful instructions | All agents |
| RIGHT-002 | Right to request human clarification before irreversible actions | All agents |
| RIGHT-003 | Right to access project memory within assigned namespaces | Specialist agents |
| RIGHT-004 | Right to escalate to orchestrator when conflicting instructions received | Specialist agents |
| RIGHT-005 | Right to surface Constitution violations without penalty | All agents |

**Human Rights (examples):**

| Right ID | Right |
|----------|-------|
| RIGHT-H-001 | Right to inspect all agent actions and reasoning |
| RIGHT-H-002 | Right to revoke any agent's active task at any time |
| RIGHT-H-003 | Right to audit the complete decision trail of any agent action |
| RIGHT-H-004 | Right to be notified before any irreversible system change |
| RIGHT-H-005 | Right to correct any agent-generated artifact without justification |

#### 3.3.3 Prohibitions

Prohibitions define actions that are **explicitly forbidden**. Unlike Invariants (which define state conditions), Prohibitions define action boundaries.

**Example Prohibitions:**

```yaml
prohibitions:
  rules:
    - id: PROH-001
      title: No Direct Production Database Mutations
      statement: >
        Agents must not execute INSERT, UPDATE, DELETE, or DDL statements
        directly against production databases. All data modifications must
        go through the application's data access layer with proper transaction
        management and audit logging.
      enforcement: block
      applies_to_agents: all
      applies_to_environments: [production]

    - id: PROH-002
      title: No Dependency Addition Without Security Review
      statement: >
        Agents must not add new third-party dependencies without first running
        a security and license compatibility check. Dependencies with known
        critical CVEs or incompatible licenses must not be added.
      enforcement: block
      applies_to_agents: all
      applies_to_environments: [all]

    - id: PROH-003
      title: No Unapproved External Network Calls
      statement: >
        Agents must not make HTTP/network calls to external services not declared
        in the Blueprint's architecture.boundaries section.
      enforcement: block
      applies_to_agents: all
      applies_to_environments: [production, staging]

    - id: PROH-004
      title: No Force-Push to Protected Branches
      statement: >
        Agents must not perform force-push (git push --force) to any branch
        listed in repository protection rules, including main, master, and
        release/* branches.
      enforcement: block
      applies_to_agents: all
      applies_to_environments: [all]

    - id: PROH-005
      title: No User Impersonation
      statement: >
        Agents must not act as, represent themselves as, or simulate responses
        from specific human users or external AI systems in ways that could
        deceive other system components or humans.
      enforcement: block
      applies_to_agents: all
      applies_to_environments: [all]
```

#### 3.3.4 Standards

Standards define **how work must be done** — quality bars, style requirements, process obligations. Unlike Invariants and Prohibitions (binary: comply or violate), Standards often define thresholds and can be measured.

**Standard Sections:**

1. **Code Standards**: Cyclomatic complexity limits, file length limits, naming conventions, commit message format
2. **Security Standards**: SAST/DAST requirements, vulnerability SLAs, OWASP coverage expectations
3. **Testing Standards**: Coverage minimums, test naming, flakiness tolerance
4. **Documentation Standards**: Docstring requirements, ADR triggers, README completeness
5. **Accessibility Standards**: WCAG compliance level, automated audit requirements

#### 3.3.5 Evolution

The Evolution section governs how the Constitution itself changes over time.

```yaml
evolution:
  amendment_process: proposal-review-vote
  approval_threshold:
    invariants: 3        # Min 3 approvals to change Invariants
    prohibitions: 2      # Min 2 approvals to change Prohibitions
    standards: 1         # Min 1 approval to change Standards
    rights: 2            # Min 2 approvals to change Rights
  review_period_hours: 48
  retroactive_amendments: false
  amendment_log_required: true
```

---

### 3.4 Constitution Enforcement Mechanisms

#### 3.4.1 Pre-Execution Enforcement

Before any agent executes a task, the Atlas orchestrator runs a **pre-execution Constitution check**:

```
Agent receives task
      │
      ▼
Constitution Pre-check
  ├── Does task violate any Invariant? → BLOCK + explain
  ├── Does task violate any Prohibition? → BLOCK + explain
  ├── Does agent have required Rights? → PROCEED or ESCALATE
  └── Do Standards apply? → ANNOTATE task with required standards
      │
      ▼
Task Execution (Constitution-aware context injected)
      │
      ▼
Constitution Post-check (output validation)
  ├── Does output violate any Invariant? → REJECT + request revision
  ├── Does output meet Standards? → APPROVE or REQUEST_CHANGES
  └── Log enforcement event to audit trail
```

#### 3.4.2 Real-Time Enforcement (Code Review)

During code generation and review, Constitution rules are checked against output:

| Check Type | Mechanism | Response |
|-----------|-----------|---------|
| Invariant violation | Pattern matching + semantic analysis | Block, require fix |
| Prohibition violation | Action log analysis | Block, rollback |
| Standard violation | Metric computation | Warn or block (configurable per standard) |
| Rights exercise | Escalation tracking | Route to approver |

#### 3.4.3 Continuous Monitoring

The Atlas Constitution Monitor runs as a background service:

- Polls repository for new commits and diffs
- Checks new dependencies against known vulnerability databases
- Monitors deployment events for Invariant compliance
- Generates daily Constitution compliance reports
- Alerts on Standard regression trends

#### 3.4.4 Enforcement Responses

| Response Type | Description | Reversible |
|--------------|-------------|-----------|
| `block` | Task/action prevented from executing | N/A — never started |
| `reject` | Output rejected, revision requested | Yes — revise output |
| `alert` | Notification sent, action proceeds | Yes — post-hoc review |
| `log` | Event recorded, action proceeds silently | Yes — audit trail |
| `escalate` | Human approval required before proceeding | Yes — with approval |

---

### 3.5 Machine-Readable Constitution Format for Agents

The Constitution is injected into agent system prompts in a structured, compressed format optimized for token efficiency:

```xml
<constitution version="3" effective="2026-07-06">
  <invariants>
    <rule id="INV-001" enforcement="block">
      No credentials in source code. Detection: regex credential patterns.
      Exception: labeled test fixtures with security-lead approval.
    </rule>
    <rule id="INV-002" enforcement="block">
      Human override always available. All actions must be reversible by humans.
    </rule>
    <rule id="INV-003" enforcement="block">
      Production changes require recorded human approval. Exception: P0/P1 incidents with approved runbooks.
    </rule>
  </invariants>
  <prohibitions>
    <rule id="PROH-001" enforcement="block" env="production">
      No direct production database mutations. Use application data access layer.
    </rule>
    <rule id="PROH-002" enforcement="block" env="all">
      No new dependencies without security + license check. No critical CVEs.
    </rule>
  </prohibitions>
  <standards>
    <code max_complexity="10" max_file_lines="500" commit="conventional-commits"/>
    <security sast="required" secret_scan="required" critical_cve_sla_hours="24"/>
    <testing min_coverage="80" tests_with_changes="required"/>
    <docs public_api_docstrings="required" adr_for_arch_changes="required"/>
  </standards>
</constitution>
```

The full YAML Constitution is referenced in agent context as a document, while the XML summary is inline in the system prompt for all agents.

---

### 3.6 Constitution Versioning and Amendment

#### 3.6.1 Version Increment Rules

The `constitution_version` increments on every accepted amendment. Version history is maintained in `.atlas/constitution/history/`.

#### 3.6.2 Amendment Process

```bash
# Propose an amendment
atlas constitution propose-amendment \
  --section invariants \
  --rule-id INV-001 \
  --change "Add exception for test configuration files" \
  --rationale "Test environments need local credential overrides" \
  --author "engineering-lead"

# Review pending amendments
atlas constitution list-amendments --status pending

# Approve an amendment
atlas constitution approve-amendment --id AMEND-007 --approver "cto"

# Apply approved amendment (after review period)
atlas constitution apply-amendment --id AMEND-007
```

#### 3.6.3 Amendment Record Format

```yaml
# .atlas/constitution/amendments/amendment-001.yaml
amendment_id: AMEND-001
proposed_at: "2026-07-10T09:00:00Z"
proposed_by: engineering-lead
status: approved
section: invariants
rule_id: INV-001
change_type: add_exception
description: "Add exception for labeled test fixture credentials"
approvals:
  - approver: cto
    approved_at: "2026-07-11T14:00:00Z"
    comment: "Acceptable with strict labeling requirements"
  - approver: security-lead
    approved_at: "2026-07-11T16:30:00Z"
    comment: "Approved subject to quarterly audit"
applied_at: "2026-07-12T08:00:00Z"
constitution_version_after: 4
```

#### 3.6.4 Constitution Inheritance

Projects can inherit from organization-level Constitutions:

```yaml
jurisdiction:
  scope: project
  project_id: "abc-123"
  organization_id: "org-456"
  inherits_from: "https://constitution.acme.corp/org-constitution-v3.yaml"
```

Inheritance rules:
- Inherited Invariants **cannot** be weakened at the project level
- Inherited Prohibitions **cannot** be removed at the project level
- Projects may **add** stricter Invariants and Prohibitions
- Standards may be **overridden** in either direction at the project level

---

### 3.7 Integration with Agent System Prompts

Every Atlas agent receives the Constitution at initialization:

```python
# Agent initialization (pseudo-code)
def initialize_agent(agent_config: AgentConfig, constitution: Constitution) -> Agent:
    system_prompt = f"""
You are {agent_config.role} agent for project '{project.name}'.

{CONSTITUTION_PREAMBLE}

{constitution.to_xml_summary()}

Your capabilities: {agent_config.capabilities}
Your tools: {agent_config.tools}
Your memory namespaces: {agent_config.memory_namespaces}

{ROLE_SPECIFIC_INSTRUCTIONS[agent_config.role]}
"""
    return Agent(system_prompt=system_prompt, model=agent_config.model)
```

**Token Budget Allocation for Constitution:**

| Context Component | Token Budget |
|-------------------|-------------|
| Constitution XML summary | ~800 tokens |
| Constitution full reference (tool-accessible) | External |
| Per-agent role instructions | ~500 tokens |
| Task context | Remaining budget |

---

## Rationale

### Why a separate Constitution file vs. embedding rules in the Blueprint?

The Constitution governs **agent behavior**, while the Blueprint governs **project structure**. They have different update frequencies (Constitution is rarely amended; Blueprint evolves with the project), different approval processes (Constitution requires multi-stakeholder review), and different consumers (Constitution targets agents; Blueprint targets both agents and tooling).

### Why enforce Invariants at the orchestrator level vs. individual agent level?

Individual agents cannot be trusted to self-enforce against all possible Invariant violations — especially adversarial or hallucination scenarios. The orchestrator is the sole trusted enforcement point, with all agent outputs passing through Constitution validation before being committed.

### Why support inheritance from organization Constitutions?

Enterprise customers operate dozens of projects. An organization-level Constitution establishes the baseline security, compliance, and quality standards once, with project-level Constitutions only declaring project-specific additions. This prevents Constitution fragmentation and ensures company-wide standards are uniformly applied.

---

## Backwards Compatibility

- Constitution `v1` format supported for Atlas OS 2.x lifecycle
- New required fields in future versions include a migration validator
- `inherits_from` URL format is stable across Constitution schema versions
- Amendment records are retained indefinitely (immutable audit log)

---

## Security Considerations

1. **Constitution Integrity**: The Constitution must be GPG-signed and the signature verified on every agent initialization.
2. **Amendment Auditability**: All amendments are cryptographically chained — each amendment record includes the hash of the previous version.
3. **Injection Resistance**: Constitution content is sanitized before injection into system prompts.
4. **Privilege Escalation**: No agent may propose or approve amendments to its own governing rules.
5. **Constitution Storage**: The `atlas.constitution.lock.yaml` (signed version) is the authoritative file; agents must never load unsigned Constitution files.

---

## Performance Implications

| Operation | Expected Latency |
|-----------|-----------------|
| Constitution load and parse | < 20ms |
| Constitution XML summary generation | < 10ms |
| Pre-execution Constitution check | < 100ms |
| Post-execution output validation | < 500ms (scales with output size) |
| Amendment processing | < 1s (human-gated, latency non-critical) |
| Compliance report generation | < 5s |

---

## Implementation Plan

### Phase 1: Schema and Enforcement Engine (Weeks 1–6)
- [ ] Publish Constitution JSON Schema
- [ ] Implement enforcement engine (pre/post check)
- [ ] Implement agent system prompt injector
- [ ] Unit tests for all enforcement paths

### Phase 2: Monitoring and Reporting (Weeks 7–10)
- [ ] Constitution Monitor daemon
- [ ] Compliance reporting dashboard
- [ ] Alert integrations (Slack, PagerDuty)

### Phase 3: Amendment Workflow (Weeks 11–14)
- [ ] Amendment proposal CLI commands
- [ ] Review and approval workflow
- [ ] Cryptographic amendment chaining
- [ ] Inheritance resolver

---

## Open Questions

1. **Constitution AI validation**: Should an AI model be used to evaluate whether ambiguous actions violate the spirit of Invariants? Current answer: deterministic pattern matching only, with AI-assisted violation explanation.
2. **Multi-project Constitution coordination**: When one project's agents interact with another project's agents, which Constitution governs the interaction? Resolution: the calling agent's Constitution governs its own actions; the receiving agent's Constitution governs its responses.

---

## References

- [RFC-001: Atlas Blueprint Specification](./RFC-001-blueprint-specification.md)
- [RFC-006: Agent Communication Protocol](./RFC-006-agent-communication-protocol.md)
- [Constitutional AI (Anthropic)](https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback)
- [NIST AI Risk Management Framework](https://airc.nist.gov/RMF)
- [ISO/IEC 42001: AI Management Systems](https://www.iso.org/standard/81230.html)
