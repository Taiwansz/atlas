# RFC-001: Atlas Blueprint Specification

**RFC Number:** 001
**Author(s):** Atlas Engineering Team
**Date:** 2026-07-06
**Status:** Final
**Category:** Core

---

## Abstract

This RFC defines the complete specification for the **Atlas Blueprint** — the canonical, machine-readable project description format that serves as the single source of truth for every Atlas-managed software project. A Blueprint encodes the full intent of a software system: its architecture, technology choices, agent assignments, data flows, test strategies, CI/CD pipelines, and documentation requirements. The Blueprint format enables Atlas agents to understand, generate, validate, and evolve software systems with deterministic reproducibility.

---

## Motivation

Software projects historically suffer from a "documentation-reality gap" — where the intended design drifts from actual implementation over time. Atlas addresses this by introducing the Blueprint as a living artifact: a structured, versionable, machine-processable file that is continuously updated as the project evolves.

### Problem Statement

1. **Intent Loss**: Requirements captured in prose are ambiguous and difficult to validate programmatically.
2. **Architecture Drift**: Architecture diagrams become outdated as code evolves.
3. **Agent Coordination**: Multi-agent systems need a shared context model to avoid conflicting work.
4. **Reproducibility**: Projects must be reproducible from their description without tribal knowledge.
5. **Tooling Integration**: IDEs, CI systems, and deployment tools need a unified project descriptor.

### Goals

- Define a canonical Blueprint schema that is complete, unambiguous, and versioned.
- Enable full project reconstruction from a Blueprint alone.
- Support incremental Blueprint evolution without breaking existing deployments.
- Provide a machine-readable format optimized for agent consumption.
- Maintain human readability for engineering review.

### Non-Goals

- Replacing infrastructure-as-code tools (Terraform, Pulumi) — Blueprint references them.
- Encoding runtime configuration (environment variables, secrets) — those live in separate stores.
- Replacing API specification formats (OpenAPI, AsyncAPI) — Blueprint references them.

---

## Specification

### 2.1 Blueprint File Format

Blueprints are encoded in **YAML 1.2** with optional JSON representation for programmatic consumption. The canonical file name is `atlas.blueprint.yaml` located at the project root. A JSON Schema representation (`atlas.blueprint.schema.json`) is the authoritative type definition.

**File Location Convention:**
```
<project-root>/
  atlas.blueprint.yaml          # Primary Blueprint
  atlas.blueprint.lock.yaml     # Locked/resolved Blueprint (generated)
  .atlas/
    blueprints/
      history/
        atlas.blueprint.v1.yaml
        atlas.blueprint.v2.yaml
```

### 2.2 Complete Blueprint JSON Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://atlas.engineering/schemas/blueprint/v1.json",
  "title": "AtlasBlueprint",
  "description": "Atlas Engineering OS Project Blueprint — canonical project descriptor",
  "type": "object",
  "required": [
    "atlas_version",
    "blueprint_version",
    "project",
    "vision",
    "architecture",
    "stack",
    "agents",
    "flows",
    "tests",
    "ci",
    "docs"
  ],
  "additionalProperties": false,
  "properties": {
    "atlas_version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "Atlas OS version this Blueprint targets",
      "examples": ["2.0.0"]
    },
    "blueprint_version": {
      "type": "integer",
      "minimum": 1,
      "description": "Monotonically increasing Blueprint revision number"
    },
    "blueprint_id": {
      "type": "string",
      "format": "uuid",
      "description": "Globally unique Blueprint identifier (auto-assigned)"
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time"
    },
    "project": { "$ref": "#/$defs/ProjectMeta" },
    "vision": { "$ref": "#/$defs/VisionSection" },
    "architecture": { "$ref": "#/$defs/ArchitectureSection" },
    "stack": { "$ref": "#/$defs/StackSection" },
    "agents": { "$ref": "#/$defs/AgentsSection" },
    "flows": { "$ref": "#/$defs/FlowsSection" },
    "tests": { "$ref": "#/$defs/TestsSection" },
    "ci": { "$ref": "#/$defs/CISection" },
    "docs": { "$ref": "#/$defs/DocsSection" },
    "extensions": {
      "type": "object",
      "description": "Namespace-prefixed custom extensions",
      "additionalProperties": true
    }
  },
  "$defs": {
    "ProjectMeta": {
      "type": "object",
      "required": ["id", "name", "slug", "description", "domain", "maturity"],
      "properties": {
        "id": { "type": "string", "format": "uuid" },
        "name": { "type": "string", "minLength": 1, "maxLength": 128 },
        "slug": { "type": "string", "pattern": "^[a-z0-9-]+$" },
        "description": { "type": "string", "maxLength": 2048 },
        "domain": {
          "type": "string",
          "enum": ["fintech", "healthtech", "ecommerce", "developer-tools", "saas", "marketplace", "infrastructure", "ai-ml", "gaming", "other"]
        },
        "maturity": {
          "type": "string",
          "enum": ["prototype", "alpha", "beta", "production", "sunset"]
        },
        "team": {
          "type": "object",
          "properties": {
            "size": { "type": "integer", "minimum": 1 },
            "timezone_primary": { "type": "string" },
            "on_call_rotation": { "type": "boolean" }
          }
        },
        "repository": {
          "type": "object",
          "properties": {
            "url": { "type": "string", "format": "uri" },
            "default_branch": { "type": "string", "default": "main" },
            "monorepo": { "type": "boolean", "default": false },
            "packages": {
              "type": "array",
              "items": { "type": "string" }
            }
          }
        },
        "compliance": {
          "type": "array",
          "items": {
            "type": "string",
            "enum": ["SOC2", "GDPR", "HIPAA", "PCI-DSS", "ISO27001", "FedRAMP"]
          }
        }
      }
    },
    "VisionSection": {
      "type": "object",
      "required": ["problem_statement", "target_users", "value_proposition", "success_metrics"],
      "properties": {
        "problem_statement": { "type": "string", "maxLength": 4096 },
        "target_users": {
          "type": "array",
          "minItems": 1,
          "items": {
            "type": "object",
            "required": ["persona", "pain_points", "jobs_to_be_done"],
            "properties": {
              "persona": { "type": "string" },
              "pain_points": { "type": "array", "items": { "type": "string" } },
              "jobs_to_be_done": { "type": "array", "items": { "type": "string" } },
              "technical_sophistication": {
                "type": "string",
                "enum": ["non-technical", "semi-technical", "technical", "expert"]
              }
            }
          }
        },
        "value_proposition": { "type": "string", "maxLength": 1024 },
        "success_metrics": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["metric", "target", "measurement_method"],
            "properties": {
              "metric": { "type": "string" },
              "baseline": { "type": "string" },
              "target": { "type": "string" },
              "measurement_method": { "type": "string" },
              "time_horizon_days": { "type": "integer" }
            }
          }
        },
        "non_functional_requirements": {
          "type": "object",
          "properties": {
            "availability_sla": { "type": "string", "examples": ["99.9%"] },
            "rpo_minutes": { "type": "integer" },
            "rto_minutes": { "type": "integer" },
            "max_latency_p99_ms": { "type": "integer" },
            "throughput_rps": { "type": "integer" },
            "data_residency_regions": { "type": "array", "items": { "type": "string" } }
          }
        }
      }
    },
    "ArchitectureSection": {
      "type": "object",
      "required": ["style", "components", "boundaries"],
      "properties": {
        "style": {
          "type": "string",
          "enum": [
            "monolith", "modular-monolith", "microservices", "event-driven",
            "serverless", "cqrs-es", "hexagonal", "layered", "pipe-and-filter", "space-based"
          ]
        },
        "diagram_url": { "type": "string", "format": "uri" },
        "adr_references": {
          "type": "array",
          "items": { "type": "string", "pattern": "^ADR-\\d{3}$" }
        },
        "components": {
          "type": "array",
          "minItems": 1,
          "items": {
            "type": "object",
            "required": ["id", "name", "type", "responsibility"],
            "properties": {
              "id": { "type": "string", "pattern": "^[a-z0-9-]+$" },
              "name": { "type": "string" },
              "type": {
                "type": "string",
                "enum": ["service", "library", "database", "cache", "queue", "gateway", "cdn", "worker", "scheduler", "ui"]
              },
              "responsibility": { "type": "string" },
              "technology": { "type": "string" },
              "scaling_strategy": {
                "type": "string",
                "enum": ["vertical", "horizontal", "auto", "none"]
              },
              "owned_by_team": { "type": "string" },
              "sla": {
                "type": "object",
                "properties": {
                  "availability": { "type": "string" },
                  "latency_p95_ms": { "type": "integer" }
                }
              }
            }
          }
        },
        "boundaries": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["from", "to", "protocol", "direction"],
            "properties": {
              "from": { "type": "string" },
              "to": { "type": "string" },
              "protocol": {
                "type": "string",
                "enum": ["http", "grpc", "graphql", "websocket", "amqp", "kafka", "tcp", "udp", "internal"]
              },
              "direction": { "type": "string", "enum": ["sync", "async", "bidirectional"] },
              "auth_required": { "type": "boolean" },
              "encryption": { "type": "string", "enum": ["tls", "mtls", "none"] },
              "contract_ref": { "type": "string", "format": "uri" }
            }
          }
        },
        "deployment_topology": {
          "type": "object",
          "properties": {
            "cloud_provider": {
              "type": "string",
              "enum": ["aws", "gcp", "azure", "multi-cloud", "on-premise", "hybrid"]
            },
            "regions": { "type": "array", "items": { "type": "string" } },
            "multi_az": { "type": "boolean" },
            "container_orchestration": { "type": "string", "enum": ["kubernetes", "ecs", "cloud-run", "nomad", "none"] },
            "service_mesh": { "type": "string", "enum": ["istio", "linkerd", "consul-connect", "none"] }
          }
        }
      }
    },
    "StackSection": {
      "type": "object",
      "required": ["primary_language", "frameworks", "data_stores", "infrastructure"],
      "properties": {
        "primary_language": {
          "type": "object",
          "required": ["name", "version"],
          "properties": {
            "name": { "type": "string" },
            "version": { "type": "string" },
            "runtime": { "type": "string" }
          }
        },
        "secondary_languages": {
          "type": "array",
          "items": { "type": "object", "properties": { "name": { "type": "string" }, "usage": { "type": "string" } } }
        },
        "frameworks": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["name", "version", "purpose"],
            "properties": {
              "name": { "type": "string" },
              "version": { "type": "string" },
              "purpose": { "type": "string" },
              "component_scope": { "type": "array", "items": { "type": "string" } }
            }
          }
        },
        "data_stores": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["name", "type", "purpose"],
            "properties": {
              "name": { "type": "string" },
              "type": { "type": "string", "enum": ["relational", "document", "key-value", "time-series", "graph", "vector", "search", "columnar", "blob"] },
              "purpose": { "type": "string" },
              "version": { "type": "string" },
              "replication_factor": { "type": "integer" },
              "backup_retention_days": { "type": "integer" },
              "encryption_at_rest": { "type": "boolean" }
            }
          }
        },
        "infrastructure": {
          "type": "object",
          "properties": {
            "iac_tool": { "type": "string", "enum": ["terraform", "pulumi", "cdk", "bicep", "ansible", "none"] },
            "container_registry": { "type": "string" },
            "secrets_manager": { "type": "string" },
            "observability": {
              "type": "object",
              "properties": {
                "metrics": { "type": "string" },
                "logs": { "type": "string" },
                "traces": { "type": "string" },
                "alerting": { "type": "string" }
              }
            }
          }
        }
      }
    },
    "AgentsSection": {
      "type": "object",
      "required": ["orchestrator", "specialists"],
      "properties": {
        "orchestrator": {
          "type": "object",
          "required": ["model", "constitution_ref"],
          "properties": {
            "model": { "type": "string" },
            "constitution_ref": { "type": "string" },
            "max_parallel_agents": { "type": "integer", "minimum": 1 },
            "timeout_seconds": { "type": "integer" }
          }
        },
        "specialists": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "role", "model", "capabilities"],
            "properties": {
              "id": { "type": "string" },
              "role": { "type": "string", "enum": ["architect", "backend", "frontend", "qa", "security", "devops", "data", "docs", "reviewer", "custom"] },
              "model": { "type": "string" },
              "capabilities": { "type": "array", "items": { "type": "string" } },
              "tools": { "type": "array", "items": { "type": "string" } },
              "memory_namespaces": { "type": "array", "items": { "type": "string" } },
              "max_context_tokens": { "type": "integer" }
            }
          }
        }
      }
    },
    "FlowsSection": {
      "type": "object",
      "required": ["user_flows", "system_flows"],
      "properties": {
        "user_flows": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "name", "actor", "steps"],
            "properties": {
              "id": { "type": "string" },
              "name": { "type": "string" },
              "actor": { "type": "string" },
              "trigger": { "type": "string" },
              "steps": {
                "type": "array",
                "items": {
                  "type": "object",
                  "properties": {
                    "step": { "type": "integer" },
                    "action": { "type": "string" },
                    "component": { "type": "string" },
                    "expected_outcome": { "type": "string" },
                    "error_paths": { "type": "array", "items": { "type": "string" } }
                  }
                }
              },
              "acceptance_criteria": { "type": "array", "items": { "type": "string" } }
            }
          }
        },
        "system_flows": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "name", "trigger", "steps"],
            "properties": {
              "id": { "type": "string" },
              "name": { "type": "string" },
              "trigger": { "type": "string", "enum": ["event", "schedule", "webhook", "api-call", "queue-message"] },
              "steps": { "type": "array" },
              "idempotency_key": { "type": "string" },
              "retry_policy": {
                "type": "object",
                "properties": {
                  "max_attempts": { "type": "integer" },
                  "backoff": { "type": "string", "enum": ["linear", "exponential", "fixed"] },
                  "initial_delay_ms": { "type": "integer" }
                }
              }
            }
          }
        }
      }
    },
    "TestsSection": {
      "type": "object",
      "required": ["strategy", "coverage_targets"],
      "properties": {
        "strategy": {
          "type": "object",
          "properties": {
            "unit": { "type": "boolean", "default": true },
            "integration": { "type": "boolean", "default": true },
            "e2e": { "type": "boolean", "default": true },
            "contract": { "type": "boolean" },
            "performance": { "type": "boolean" },
            "chaos": { "type": "boolean" },
            "security": { "type": "boolean" }
          }
        },
        "frameworks": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": { "type": "string" },
              "level": { "type": "string", "enum": ["unit", "integration", "e2e", "contract", "performance"] },
              "component_scope": { "type": "array", "items": { "type": "string" } }
            }
          }
        },
        "coverage_targets": {
          "type": "object",
          "properties": {
            "lines": { "type": "integer", "minimum": 0, "maximum": 100 },
            "branches": { "type": "integer", "minimum": 0, "maximum": 100 },
            "functions": { "type": "integer", "minimum": 0, "maximum": 100 },
            "statements": { "type": "integer", "minimum": 0, "maximum": 100 }
          }
        },
        "mutation_testing": { "type": "boolean" },
        "test_data_strategy": {
          "type": "string",
          "enum": ["fixtures", "factories", "fakers", "snapshots", "recorded-responses"]
        }
      }
    },
    "CISection": {
      "type": "object",
      "required": ["platform", "pipelines"],
      "properties": {
        "platform": {
          "type": "string",
          "enum": ["github-actions", "gitlab-ci", "jenkins", "circleci", "buildkite", "tekton", "atlas-ci"]
        },
        "pipelines": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["name", "trigger", "stages"],
            "properties": {
              "name": { "type": "string" },
              "trigger": {
                "type": "object",
                "properties": {
                  "on_push": { "type": "boolean" },
                  "on_pr": { "type": "boolean" },
                  "on_merge": { "type": "boolean" },
                  "on_schedule": { "type": "string" },
                  "branches": { "type": "array", "items": { "type": "string" } }
                }
              },
              "stages": {
                "type": "array",
                "items": {
                  "type": "object",
                  "required": ["name", "jobs"],
                  "properties": {
                    "name": { "type": "string" },
                    "jobs": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "name": { "type": "string" },
                          "runner": { "type": "string" },
                          "timeout_minutes": { "type": "integer" },
                          "steps": { "type": "array", "items": { "type": "string" } },
                          "environment": { "type": "string" },
                          "artifacts": { "type": "array", "items": { "type": "string" } }
                        }
                      }
                    },
                    "needs": { "type": "array", "items": { "type": "string" } },
                    "condition": { "type": "string" }
                  }
                }
              },
              "notifications": {
                "type": "object",
                "properties": {
                  "on_failure": { "type": "array", "items": { "type": "string", "enum": ["slack", "email", "pagerduty"] } },
                  "on_success": { "type": "array", "items": { "type": "string" } }
                }
              }
            }
          }
        },
        "environments": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["name", "type"],
            "properties": {
              "name": { "type": "string" },
              "type": { "type": "string", "enum": ["development", "staging", "production", "preview"] },
              "auto_deploy": { "type": "boolean" },
              "approval_required": { "type": "boolean" },
              "protection_rules": { "type": "array", "items": { "type": "string" } }
            }
          }
        }
      }
    },
    "DocsSection": {
      "type": "object",
      "required": ["site", "required_documents"],
      "properties": {
        "site": {
          "type": "object",
          "properties": {
            "generator": { "type": "string", "enum": ["mintlify", "docusaurus", "mkdocs", "nextra", "atlas-docs", "custom"] },
            "base_url": { "type": "string", "format": "uri" },
            "auto_update": { "type": "boolean", "default": true }
          }
        },
        "required_documents": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["id", "title", "path", "owner_agent"],
            "properties": {
              "id": { "type": "string" },
              "title": { "type": "string" },
              "path": { "type": "string" },
              "owner_agent": { "type": "string" },
              "update_triggers": { "type": "array", "items": { "type": "string" } },
              "review_required": { "type": "boolean" }
            }
          }
        },
        "api_docs": {
          "type": "object",
          "properties": {
            "openapi_path": { "type": "string" },
            "asyncapi_path": { "type": "string" },
            "graphql_schema_path": { "type": "string" },
            "auto_generate": { "type": "boolean" }
          }
        },
        "changelog": {
          "type": "object",
          "properties": {
            "format": { "type": "string", "enum": ["keepachangelog", "conventional", "auto"] },
            "auto_generate": { "type": "boolean" }
          }
        }
      }
    }
  }
}
```

### 2.3 Blueprint Sections — Detailed Descriptions

#### 2.3.1 Vision Section

The Vision section captures the *why* of the project. It is required at Blueprint creation and must be updated whenever product direction changes. Atlas agents use Vision data to:

- Generate user story acceptance criteria aligned with personas
- Evaluate feature requests for product-market fit consistency
- Measure success metric progress via telemetry integrations

**Validation rules:**
- `problem_statement` must be at least 100 characters
- `success_metrics` must include at least one metric with `target` and `measurement_method`
- `target_users` must define at least one persona with at least two `pain_points`

#### 2.3.2 Architecture Section

The Architecture section is the structural backbone of the Blueprint. Atlas uses this section to:

- Generate service scaffolding with correct inter-service contracts
- Validate that code changes don't violate declared architectural boundaries
- Produce C4 diagrams and ADRs automatically
- Configure service mesh routing rules

**Component ID uniqueness**: All component `id` values within the `components` array must be unique within a Blueprint. IDs follow `kebab-case` naming.

**Boundary validation**: Every `from` and `to` reference in `boundaries` must correspond to a declared `component.id`.

#### 2.3.3 Stack Section

The Stack section declares all technology choices. Atlas uses it to:

- Bootstrap project scaffolding with correct dependency files
- Select appropriate specialist agents (e.g., `backend-python` vs `backend-go`)
- Configure linters, formatters, and static analysis tools
- Generate dependency security scan configurations

#### 2.3.4 Agents Section

Defines the multi-agent workforce assigned to this project. Each specialist agent has:

| Field | Description |
|-------|-------------|
| `id` | Unique identifier within project scope |
| `role` | Functional role (maps to agent capability profile) |
| `model` | AI model identifier (`provider/model-name`) |
| `capabilities` | Explicit capability declarations |
| `tools` | MCP tool names available to this agent |
| `memory_namespaces` | Memory partitions this agent can read/write |

#### 2.3.5 Flows Section

User flows and system flows define the behavioral specification of the system. They serve as:

- Source material for E2E test generation
- Input to the chaos engineering agent
- Validation criteria during code review
- Business logic documentation

#### 2.3.6 Tests Section

The Tests section defines the testing philosophy and coverage requirements. Atlas enforces:

- No merge without meeting `coverage_targets`
- Automatic test generation for new components that lack tests
- Mutation testing runs triggered on coverage regressions

#### 2.3.7 CI Section

Declarative pipeline definitions. Atlas translates the `ci` section into native pipeline files for the target platform (e.g., `.github/workflows/*.yaml` for GitHub Actions).

#### 2.3.8 Docs Section

Specifies documentation expectations. Atlas documentation agents monitor `update_triggers` — events that should prompt document updates — and proactively raise pull requests.

---

### 2.4 Blueprint Versioning

#### 2.4.1 Versioning Scheme

Blueprint versioning is **monotonically incrementing integer-based**. The `blueprint_version` field increments by 1 on each accepted change to the Blueprint.

```
blueprint_version: 1  # Initial creation
blueprint_version: 2  # First modification (e.g., stack change)
blueprint_version: 3  # Architecture component added
```

This is distinct from `atlas_version` (the Atlas OS runtime version) and project `semver` (the application version).

#### 2.4.2 Blueprint History

Every Blueprint version is archived in `.atlas/blueprints/history/`. The history format:

```yaml
# .atlas/blueprints/history/atlas.blueprint.v3.yaml
_history_meta:
  archived_at: "2026-07-06T12:00:00Z"
  archived_by: "atlas-orchestrator"
  change_summary: "Added search-service component to architecture"
  diff_ref: ".atlas/blueprints/diffs/v2-to-v3.patch"
```

#### 2.4.3 Atlas Schema Versioning

The Blueprint schema itself is versioned independently. When the Atlas OS releases a new schema version, a migration guide is published:

| Atlas OS Version | Blueprint Schema Version | Migration Required |
|------------------|--------------------------|-------------------|
| 1.x              | blueprint/v1             | —                 |
| 2.0              | blueprint/v2             | Yes (automated)   |
| 2.x              | blueprint/v2             | No                |

---

### 2.5 Blueprint Validation Rules

Validation runs at multiple points in the Atlas lifecycle:

| Event | Validator | Blocking |
|-------|-----------|---------|
| `atlas blueprint edit` | Schema validator | Yes |
| Pull Request opened | Blueprint consistency check | Yes |
| Agent task execution | Context completeness check | Warn |
| Pre-deploy | Production readiness check | Yes (production env) |
| Weekly sweep | Drift detection | Report only |

#### 2.5.1 Schema Validation

All required fields must be present and type-correct per the JSON Schema. The validator is available as:

```bash
atlas blueprint validate [--strict] [--env production]
```

#### 2.5.2 Semantic Validation Rules

Beyond schema correctness, semantic rules enforce logical consistency:

1. **Boundary Referential Integrity**: All `boundary.from` and `boundary.to` values must reference valid `component.id` entries.
2. **Agent Tool Availability**: All tools listed in `agents.specialists[*].tools` must be discoverable via Atlas MCP registry.
3. **Flow Component References**: All `component` references in flows must match declared `architecture.components[*].id`.
4. **CI Environment Reference**: Every environment referenced in CI pipeline `stages[*].jobs[*].environment` must be declared in `ci.environments`.
5. **Coverage Realism**: Coverage targets cannot exceed 100 or be negative.
6. **SLA Hierarchy**: Component SLAs cannot be stronger than the declared `vision.non_functional_requirements.availability_sla`.

#### 2.5.3 Production Readiness Checklist

For `environment.type == "production"` deployments:

- [ ] `vision.non_functional_requirements` fully specified
- [ ] All components have `sla` defined
- [ ] All boundaries have `encryption` set (not `none`)
- [ ] `tests.coverage_targets.lines >= 80`
- [ ] At least one `security` test type enabled
- [ ] `ci.environments` has an entry with `approval_required: true`
- [ ] `docs.required_documents` includes `README`, `RUNBOOK`, `ARCHITECTURE`
- [ ] `project.compliance` declared if handling PII

---

### 2.6 Blueprint Generation Pipeline

When Atlas generates a new Blueprint from a conversation or document, the pipeline executes as follows:

```
                  User Input (prose/document/existing-code)
                           │
                           ▼
               ┌──────────────────────┐
               │  Intent Extraction   │  ← Orchestrator agent
               │  (NLU + slot-fill)   │
               └──────────┬───────────┘
                           │
                           ▼
               ┌──────────────────────┐
               │  Blueprint Draft     │  ← Architect agent
               │  Generation          │  ← Template library
               └──────────┬───────────┘
                           │
                           ▼
               ┌──────────────────────┐
               │  Schema Validation   │  ← atlas-validator
               └──────────┬───────────┘
                           │
               ┌───────────┴───────────┐
               │ Validation Errors?    │
               └───────┬───────┬───────┘
                      YES      NO
                       │        │
                       ▼        ▼
               ┌───────────┐  ┌────────────────────┐
               │ Auto-fix  │  │ Semantic Validation │
               │ + re-try  │  └──────────┬──────────┘
               └───────────┘             │
                                         ▼
                              ┌──────────────────────┐
                              │ Human Review Gate     │
                              │ (if --interactive)    │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │ Blueprint Committed   │
                              │ + Version Incremented │
                              └──────────┬───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │ Downstream Triggers   │
                              │ (scaffold, CI, docs)  │
                              └──────────────────────┘
```

#### 2.6.1 Generation Commands

```bash
# Generate from conversation
atlas blueprint generate --from-conversation

# Generate from existing codebase
atlas blueprint generate --from-code ./

# Generate from PRD document
atlas blueprint generate --from-doc ./requirements.md

# Update Blueprint from code changes
atlas blueprint sync --from-code ./
```

---

### 2.7 Blueprint-to-Code Mapping

The Blueprint drives code generation through a mapping layer that translates Blueprint declarations into concrete artifacts:

| Blueprint Section | Generated Artifacts |
|-------------------|-------------------|
| `architecture.components` | Service scaffolding (dirs, main files, Dockerfiles) |
| `stack.frameworks` | Package manifests (package.json, pyproject.toml, go.mod) |
| `stack.data_stores` | ORM models, migration stubs, connection pooling |
| `agents.specialists` | Agent config files, system prompt templates |
| `flows.user_flows` | E2E test skeletons, API endpoint stubs |
| `flows.system_flows` | Worker/consumer skeletons, event handler stubs |
| `tests` | Test config files, coverage config, CI test stages |
| `ci.pipelines` | CI platform native YAML files |
| `ci.environments` | IaC environment modules |
| `docs.required_documents` | Document stubs with ownership metadata |

#### 2.7.1 Code Generation Guarantees

1. **Idempotency**: Running blueprint-to-code generation twice produces identical output given identical input.
2. **Non-destructive**: Generation never overwrites files containing user-written code unless `--force` is passed.
3. **Annotation**: All generated files are annotated with `# @atlas-generated blueprint_version=N` to enable drift detection.
4. **Reversibility**: Any generated artifact can be traced back to its Blueprint section.

---

## Rationale

### Why YAML over JSON as the primary format?

YAML provides inline comments (critical for explaining architectural decisions inline), multiline string support for prose fields like `problem_statement`, and greater human readability for large documents. JSON Schema remains the validation authority, and JSON representation is auto-generated for programmatic consumers.

### Why integer versioning over semver for Blueprint versions?

Blueprint revisions represent cumulative changes to a single project artifact, not a publishable API with compatibility guarantees. Integer monotonic versioning is simpler, unambiguous, and maps cleanly to a change log without implying semantics about breaking vs. non-breaking changes that don't apply to project-level artifacts.

### Why embed CI pipeline definitions in the Blueprint?

Co-locating CI declarations with the rest of the project specification enables Atlas to validate cross-cutting concerns (e.g., ensuring test coverage gates are present in CI pipelines, ensuring all environments are tested before production). Separate CI files remain as generated outputs — not as source of truth.

---

## Backwards Compatibility

- Blueprint `v1` schemas are supported in Atlas OS 1.x and 2.x.
- Atlas 2.0 introduces automated migration from `v1` to `v2` schema on `atlas upgrade`.
- Deprecated fields are retained for two major Atlas OS versions before removal.
- The `extensions` field provides a namespace-prefixed escape hatch for organization-specific additions without requiring schema changes.

---

## Security Considerations

1. **No Secrets in Blueprints**: The Blueprint schema explicitly forbids secret values. Secret references must use a placeholder format (`$SECRET_NAME`) resolved at runtime from a secrets manager.
2. **Blueprint Signing**: Production Blueprints must be GPG-signed. Atlas verifies signatures before executing production deployments.
3. **Access Control**: Blueprint modification requires `blueprint:write` permission. Blueprint reads require `blueprint:read`. Production Blueprint reads require `blueprint:read-production`.
4. **Audit Logging**: All Blueprint modifications are logged to the Atlas audit trail with actor identity, timestamp, and change diff.
5. **Injection Prevention**: Blueprint fields used in code generation are sanitized to prevent template injection attacks.

---

## Performance Implications

| Operation | Expected Latency | Notes |
|-----------|-----------------|-------|
| Blueprint schema validation | < 50ms | In-process, local schema |
| Blueprint semantic validation | < 500ms | Requires MCP registry lookup |
| Blueprint generation from prose | 5–30s | LLM-dependent |
| Blueprint-to-code generation | 10–120s | Scales with component count |
| Blueprint diff computation | < 100ms | Structural diff algorithm |
| Blueprint history archival | < 200ms | File I/O + compression |

---

## Implementation Plan

### Phase 1: Schema and Validation (Weeks 1–4)
- [ ] Publish JSON Schema to `atlas.engineering/schemas/blueprint/v1.json`
- [ ] Implement `atlas-validator` library with schema + semantic validation
- [ ] CLI commands: `blueprint validate`, `blueprint lint`
- [ ] Unit tests for all validation rules (>95% coverage)

### Phase 2: Generation Pipeline (Weeks 5–10)
- [ ] Implement Intent Extraction agent
- [ ] Implement Blueprint Draft Generation with template library
- [ ] Implement `atlas blueprint generate` command variants
- [ ] Integration tests for end-to-end generation

### Phase 3: Code Mapping (Weeks 11–16)
- [ ] Blueprint-to-code mapper for all declared `Stack` types
- [ ] CI file generator for GitHub Actions, GitLab CI, Jenkins
- [ ] Documentation stub generator
- [ ] Drift detection daemon

### Phase 4: Versioning and History (Weeks 17–18)
- [ ] History archival implementation
- [ ] Blueprint diff computation
- [ ] v1→v2 migration tooling

---

## Open Questions

1. **Blueprint inheritance**: Should Blueprint support a `extends` field for organization-level Blueprint templates? Current answer: deferred to v2.
2. **Multi-Blueprint projects**: How should large multi-team projects reference sub-Blueprints? Resolution: use `project.repository.packages` with per-package Blueprint files.
3. **Blueprint as IaC**: Should Blueprint replace IaC tools or reference them? Resolution: reference only — IaC tools remain authoritative for infrastructure state.

---

## References

- [JSON Schema 2020-12 Specification](https://json-schema.org/specification)
- [C4 Model for Software Architecture](https://c4model.com)
- [RFC-002: Atlas Constitution Format](./RFC-002-constitution-format.md)
- [RFC-003: Atlas Memory Architecture](./RFC-003-memory-architecture.md)
- [RFC-006: Agent Communication Protocol](./RFC-006-agent-communication-protocol.md)
- [ADR-001: Blueprint Format Selection](../adr/ADR-001-blueprint-format.md)
- [YAML 1.2 Specification](https://yaml.org/spec/1.2.2/)
