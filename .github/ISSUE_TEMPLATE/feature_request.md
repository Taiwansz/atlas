---
name: ✨ Feature Request
about: Propose a new capability, engine, integration, or enhancement for Atlas
title: "[FEAT] <concise description of the proposed feature>"
labels: ["enhancement", "triage-needed"]
assignees: []
---

<!--
  ╔══════════════════════════════════════════════════════════════════════╗
  ║                  ATLAS FEATURE REQUEST TEMPLATE                     ║
  ║   Atlas evolves through deliberate, Blueprint-aligned proposals.    ║
  ╚══════════════════════════════════════════════════════════════════════╝

  BEFORE SUBMITTING:
  ✓ Search existing issues and discussions for similar proposals
  ✓ Read the Atlas Vision document: docs/foundation/VISION.md
  ✓ Consider whether this belongs in an ADR instead (for architectural changes)
  ✓ Think about which Atlas engine(s) this affects
-->

## ✨ Feature Request

### One-Line Description
<!--
  Complete this sentence: "As a [role], I want [capability] so that [outcome]."
  Example: "As a Tech Lead, I want Blueprint-to-Jira sync so that my team's
  sprint planning automatically reflects the current Blueprint scope."
-->
As a _____________, I want _____________ so that _____________.

---

## 🔴 Problem Statement

### The Problem
<!--
  Describe the problem this feature solves.
  Focus on the PROBLEM, not the solution.
  - What is currently impossible or painful?
  - What is the user trying to achieve?
  - What does failure look like today?
-->

### Who Is Affected
<!--
  Who experiences this problem?
  Be specific about roles, team sizes, or workflow contexts.
-->

| Persona | How Affected | Frequency |
|---------|-------------|-----------|
| <!-- e.g., Tech Lead --> | <!-- e.g., Must manually sync Blueprint and tickets --> | <!-- e.g., Every sprint --> |
| | | |

### Current Workaround
<!--
  How do people currently work around this limitation?
  Why is the workaround insufficient?
-->

### Impact if Not Addressed
<!--
  What happens if Atlas does NOT implement this?
  - Lost productivity?
  - Users switch to a competitor?
  - Technical debt accumulates?
-->

---

## 💡 Proposed Solution

### Solution Overview
<!--
  Describe your proposed solution at a conceptual level.
  Focus on WHAT it does, not necessarily HOW to implement it.
  Implementation details should go in an ADR or Blueprint.
-->

### User Experience Flow
<!--
  Walk through the ideal user experience with this feature.
  Use a numbered list or a simple flow diagram.
-->

**Happy path:**
1. User does _______________
2. Atlas responds with _______________
3. User sees/gets _______________

**Example interaction:**
```bash
# Example CLI command (if applicable)
atlas <command> <args>

# Example output
```

```typescript
// Example API usage (if applicable)
```

### Interface / API Design (if applicable)
<!--
  Sketch the interface: CLI flags, API endpoints, config options, UI screens.
  This is a proposal — exact design will be refined during Blueprint phase.
-->

<details>
<summary>Proposed interface sketch</summary>

```
<!-- CLI, API, config, or UI sketch -->
```
</details>

### Configuration (if applicable)
```yaml
# Proposed atlas.config.ts additions (if any)
# Example:
features:
  newFeature:
    enabled: true
    option: value
```

---

## 🌐 Atlas Vision Alignment

<!--
  Atlas is an Engineering Operating System for the AI era.
  Core pillars: Intelligent Discovery, Multi-Agent Orchestration, Persistent Memory,
  Living Documentation, Blueprint First, Constitution Governance, Engineering Score,
  MCP Ecosystem, and Continuous Evolution.
-->

### Which Atlas Pillars Does This Advance?
- [ ] Intelligent Requirement Discovery
- [ ] Multi-Agent Orchestration
- [ ] Persistent Project Memory
- [ ] Living Documentation
- [ ] Blueprint First Methodology
- [ ] Constitution & Governance
- [ ] Engineering Score & Metrics
- [ ] MCP Ecosystem & Tool Integration
- [ ] Continuous Evolution & Learning
- [ ] Developer Experience (DX)
- [ ] Security & Compliance
- [ ] Performance & Scalability

### Vision Statement Alignment
<!--
  Quote the relevant section of the Atlas Vision that this feature supports,
  or explain how it extends the vision.
-->

> _"Atlas transforms ideas into world-class software through..."_

This feature advances the vision by: _______________

### Strategic Priority
<!--
  In your judgment, how strategically important is this feature?
-->
- [ ] 🔴 Critical — Core to Atlas differentiation; must have
- [ ] 🟠 High — Significantly advances the Atlas mission
- [ ] 🟡 Medium — Useful addition; improves existing workflows
- [ ] 🟢 Low — Nice to have; does not block Atlas's core mission

---

## ⚙️ Affected Engines & Agents

<!--
  Atlas is composed of specialized engines and agents.
  Which ones would this feature touch?
-->

### Primary Engine(s)
- [ ] Discovery Engine — requirement elicitation and analysis
- [ ] Blueprint Engine — specification generation and validation
- [ ] Constitution Engine — governance rules and constraints
- [ ] Memory Engine — knowledge graph and vector store
- [ ] Orchestration Engine — multi-agent coordination
- [ ] MCP Gateway — tool registry and MCP protocol
- [ ] Audit Engine — technical analysis and scoring
- [ ] Simulation Engine — architecture simulation
- [ ] Red Team Engine — adversarial evaluation
- [ ] Report Engine — documentation and report generation
- [ ] CLI — command-line interface
- [ ] API Server — REST/GraphQL API
- [ ] Dashboard — web interface
- [ ] New Engine Required: _______________

### New Agents Required
<!--
  Would this feature require new specialized agents?
-->
- [ ] No new agents required
- [ ] New agent(s) proposed:

| Agent Name | Role | Tools Required |
|------------|------|----------------|
| | | |

### MCP Tools Required
<!--
  Would this feature require new MCP tool definitions?
-->
- [ ] No new MCP tools required
- [ ] New MCP tools proposed:

| Tool Name | Description | External Service |
|-----------|-------------|-----------------|
| | | |

---

## 🗺️ Blueprint Considerations

<!--
  Blueprint First: Every significant feature should eventually be captured in a Blueprint.
  Help the Atlas team plan the Blueprint work.
-->

### Blueprint Scope Estimate
- [ ] Small — fits within an existing Blueprint amendment
- [ ] Medium — requires a new Feature Blueprint (1-5 days of Blueprint work)
- [ ] Large — requires a new System Blueprint (1-2 weeks of Blueprint work)
- [ ] Epic — requires a new Domain Blueprint with multiple sub-Blueprints

### Key Design Decisions to Resolve
<!--
  What are the hard design questions that need to be answered during Blueprint phase?
  This helps the architecture team prepare for Blueprint deep-dives.
-->
1. _______________
2. _______________
3. _______________

### Known Constraints
<!--
  Are there known technical, legal, business, or resource constraints
  that must be respected in any solution?
-->
- Constraint: _______________
- Constraint: _______________

### Integration Points
<!--
  What external systems, APIs, or standards does this feature need to integrate with?
-->

| Integration | Type | Notes |
|-------------|------|-------|
| | | |

---

## 📊 Success Metrics

<!--
  How will we know this feature is working well?
  Define measurable outcomes.
-->

| Metric | Baseline (Today) | Target (After Feature) | Measurement Method |
|--------|-----------------|----------------------|-------------------|
| | | | |
| | | | |

**Engineering Score impact:**
- Expected score improvement: _____ points (dimension: _______)

---

## 🔍 Alternatives Considered

<!--
  What alternative solutions did you consider and why did you prefer your proposal?
  Include: doing nothing, third-party solutions, different approaches.
-->

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|-------------|
| Do nothing | Low effort | Problem persists | Unacceptable outcome |
| | | | |
| | | | |

---

## 🔗 References & Research

<!--
  Link to any prior art, competitive implementations, relevant papers,
  or existing discussions that inform this request.
-->

| Resource | URL | Relevance |
|----------|-----|-----------|
| | | |
| | | |

**Related Issues/Discussions:**
- Related to: #
- Builds on: #

---

## ✅ Submitter Checklist

- [ ] I searched existing issues and this is a new proposal
- [ ] I read the Atlas Vision and confirmed alignment
- [ ] I identified the affected engines
- [ ] I described the problem (not just the solution)
- [ ] I am available to participate in Blueprint planning for this feature

---
<!-- Atlas Engineering OS · Feature Request Template v2.0 · 2026-07 -->
