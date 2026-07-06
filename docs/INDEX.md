# Atlas Documentation Index

> **The definitive knowledge base for the Atlas Engineering Operating System**

This index provides navigation for all Atlas documentation. Every document is a living artifact, versioned alongside the codebase.

---

## 🏛️ Foundation

| Document | Description | Status |
|----------|-------------|--------|
| [Vision](../foundation/vision/VISION.md) | Product vision through 2030 | ✅ Complete |
| [Manifesto](../foundation/manifesto/MANIFESTO.md) | Engineering Manifesto | ✅ Complete |
| [Constitution](../foundation/constitution/CONSTITUTION.md) | System Constitution | ✅ Complete |
| [Values](../foundation/values/VALUES.md) | Core Values | ✅ Complete |
| [Engineering Principles](../foundation/principles/ENGINEERING_PRINCIPLES.md) | 20+ Engineering Principles | ✅ Complete |
| [Blueprint First Methodology](../foundation/principles/BLUEPRINT_FIRST_METHODOLOGY.md) | Our development methodology | ✅ Complete |

---

## 🏗️ Architecture

| Document | Description | Status |
|----------|-------------|--------|
| [System Architecture](../architecture/overview/ARCHITECTURE_V2.0.md) | Complete system architecture V2.0 | ✅ Complete |
| [Technology Stack](../architecture/overview/TECHNOLOGY_STACK.md) | Technology decisions | ✅ Complete |
| [Monorepo Structure](../architecture/overview/MONOREPO_STRUCTURE.md) | Repository organization | ✅ Complete |
| [Engines Overview](../architecture/engines/ENGINES_OVERVIEW.md) | All 15 Atlas engines | ✅ Complete |
| [Agents Specification](../architecture/agents/AGENTS_SPECIFICATION.md) | All 18 agents | ✅ Complete |
| [Core Flows](../architecture/flows/CORE_FLOWS.md) | System flows | ✅ Complete |
| [API Contracts](../architecture/contracts/API_CONTRACTS.md) | Service contracts | ✅ Complete |

---

## 📋 Architecture Decision Records (ADRs)

ADRs document why architectural decisions were made. **Never delete an ADR** — mark it superseded instead.

| ADR | Title | Status |
|-----|-------|--------|
| [ADR-001](adr/ADR-001-monorepo-tool-selection.md) | Monorepo Tool: Nx | ✅ Accepted |
| [ADR-002](adr/ADR-002-primary-language-backend.md) | Backend Language: TypeScript | ✅ Accepted |
| [ADR-003](adr/ADR-003-agent-orchestration-framework.md) | Agent Orchestration: LangGraph | ✅ Accepted |
| [ADR-004](adr/ADR-004-knowledge-graph-database.md) | Knowledge Graph: Neo4j | ✅ Accepted |
| [ADR-005](adr/ADR-005-vector-database-strategy.md) | Vector DB: pgvector + Qdrant | ✅ Accepted |
| [ADR-006](adr/ADR-006-primary-relational-database.md) | Primary DB: PostgreSQL | ✅ Accepted |
| [ADR-007](adr/ADR-007-api-design-strategy.md) | API Strategy: REST+GraphQL+gRPC | ✅ Accepted |
| [ADR-008](adr/ADR-008-authentication-authorization.md) | Auth: OAuth2/OIDC + Keycloak | ✅ Accepted |
| [ADR-009](adr/ADR-009-frontend-framework.md) | Frontend: Next.js 15 | ✅ Accepted |
| [ADR-010](adr/ADR-010-observability-stack.md) | Observability: OTel + Prometheus | ✅ Accepted |
| [ADR-011](adr/ADR-011-message-queue-event-streaming.md) | Messaging: Apache Kafka | ✅ Accepted |
| [ADR-012](adr/ADR-012-container-orchestration.md) | Orchestration: Kubernetes | ✅ Accepted |

---

## 📜 Request for Comments (RFCs)

RFCs specify Atlas protocols, formats, and systems in detail.

| RFC | Title | Status |
|-----|-------|--------|
| [RFC-001](rfc/RFC-001-blueprint-specification.md) | Blueprint Format Specification | ✅ Final |
| [RFC-002](rfc/RFC-002-constitution-format.md) | Constitution Format Specification | ✅ Final |
| [RFC-003](rfc/RFC-003-memory-architecture.md) | Memory System Architecture | ✅ Final |
| [RFC-004](rfc/RFC-004-engineering-score.md) | Engineering Score System | ✅ Final |
| [RFC-005](rfc/RFC-005-mcp-discovery-protocol.md) | MCP Discovery Protocol | ✅ Final |
| [RFC-006](rfc/RFC-006-agent-communication-protocol.md) | Agent Communication Protocol | ✅ Final |
| [RFC-007](rfc/RFC-007-plugin-system.md) | Plugin System Specification | ✅ Final |
| [RFC-008](rfc/RFC-008-ai-provider-abstraction.md) | AI Provider Abstraction | ✅ Final |

---

## 📐 Technical Specifications

| Document | Description |
|----------|-------------|
| [REST API](specs/REST_API_SPECIFICATION.md) | Complete REST API endpoints |
| [CLI Spec](specs/CLI_SPECIFICATION.md) | CLI commands and usage |
| [SDK Spec](specs/SDK_SPECIFICATION.md) | TypeScript and Python SDKs |
| [Data Models](specs/DATA_MODELS.md) | All entity schemas |

---

## 🎨 Design

| Document | Description |
|----------|-------------|
| [Personas](../design/personas/PERSONAS.md) | 7 User Personas |
| [User Journeys](../design/ux/USER_JOURNEYS.md) | 8 Core User Journeys |
| [Brand Identity](../design/branding/BRAND_IDENTITY.md) | Brand Guidelines |
| [Design System](../design/system/DESIGN_SYSTEM.md) | UI Component System |

---

## 🏭 Infrastructure

| Document | Description |
|----------|-------------|
| [Security Architecture](../infrastructure/security/SECURITY_ARCHITECTURE.md) | Security strategy and threat model |
| [Observability Strategy](../infrastructure/observability/OBSERVABILITY_STRATEGY.md) | Metrics, logs, traces |
| [CI/CD Strategy](../infrastructure/ci-cd/CICD_STRATEGY.md) | Pipeline and deployment |
| [Cloud Architecture](../infrastructure/cloud/CLOUD_ARCHITECTURE.md) | Cloud infrastructure design |

---

## 📦 Modules

| Document | Description |
|----------|-------------|
| [Modules Specification](../modules/MODULES_SPECIFICATION.md) | All 26 Atlas modules |
| [Marketplace Spec](../modules/marketplace/MARKETPLACE_SPECIFICATION.md) | Plugin marketplace |

---

## 🔭 Research

| Document | Description |
|----------|-------------|
| [Competitive Analysis](../research/state-of-art/COMPETITIVE_ANALYSIS.md) | Competitor analysis |
| [AI Landscape 2026](../research/state-of-art/AI_LANDSCAPE_2026.md) | AI ecosystem analysis |
| [Architectural Audit](research/ARCHITECTURAL_AUDIT.md) | Comprehensive foundation audit |

---

## 🗺️ Product

| Document | Description |
|----------|-------------|
| [Roadmap](ROADMAP.md) | Multi-year product roadmap |
| [Contributing](guides/CONTRIBUTING.md) | How to contribute |

---

## Documentation Standards

### Adding New Documentation
1. Place in the appropriate domain directory
2. Add entry to this index
3. Use ADR format for architectural decisions
4. Use RFC format for protocol/format specifications
5. Link related documents
6. Include a status badge

### Status Badges
- ✅ **Complete** — Document is finalized
- 🔄 **In Progress** — Being actively written
- 📝 **Draft** — Early draft, not finalized
- 🔁 **Review** — Awaiting review
- ⚠️ **Outdated** — Needs update
- ❌ **Deprecated** — No longer valid (do not delete)

### Writing Style
- Write for a 10-year horizon
- Assume the reader is a senior engineer unfamiliar with this project
- Include rationale, not just decisions
- Use diagrams liberally (ASCII art, Mermaid)
- Cross-reference related documents

---

*This index is automatically validated as part of the CI pipeline to ensure all linked documents exist.*
