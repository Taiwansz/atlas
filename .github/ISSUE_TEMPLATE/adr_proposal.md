---
name: 🏛️ ADR Proposal
about: Propose an Architectural Decision Record for a significant technical decision in Atlas
title: "[ADR] <decision title — use noun phrase, e.g., 'Use of Event Sourcing for Agent State'>"
labels: ["adr", "architecture", "needs-review"]
assignees: []
---

<!--
  ╔══════════════════════════════════════════════════════════════════════╗
  ║               ATLAS ARCHITECTURAL DECISION RECORD                   ║
  ║  ADRs capture the WHY behind significant decisions. Write for the   ║
  ║  engineer who inherits this system in 5 years.                      ║
  ╚══════════════════════════════════════════════════════════════════════╝

  WHAT QUALIFIES FOR AN ADR?
  ✓ Technology selection (database, framework, protocol, cloud service)
  ✓ Architectural pattern adoption (event sourcing, CQRS, hexagonal, etc.)
  ✓ API contract decisions (REST vs GraphQL, versioning strategy)
  ✓ Security architecture decisions (auth patterns, key management)
  ✓ Data modeling decisions (schema design, storage strategy)
  ✓ Agent coordination patterns (orchestration vs. choreography)
  ✓ Inter-service communication patterns
  ✓ Any decision that is HARD TO REVERSE

  WHAT DOES NOT QUALIFY?
  ✗ Implementation details easily changed via refactoring
  ✗ Minor library version upgrades
  ✗ Coding style or formatting rules (those go in the Style Guide)
  ✗ Process decisions (those go in CONTRIBUTING.md)

  AFTER MERGING THIS ISSUE:
  Create the formal ADR file at: docs/adrs/ADR-XXX-<kebab-title>.md
  Use the ADR template at: docs/adrs/_TEMPLATE.md
-->

## 🏛️ ADR Proposal

**ADR Number:** `ADR-XXX` _(assigned by maintainer)_
**Status:** `Proposed`
**Deciders:** <!-- GitHub handles of engineers who must approve: @alice, @bob -->
**Date:** <!-- YYYY-MM-DD -->

---

## 📋 Decision Context

### Background
<!--
  Describe the situation that requires this decision.
  - What is the current state?
  - What is changing that forces a decision now?
  - What system, engine, or component does this affect?
  - What are the key constraints (performance, cost, team skills, timeline)?

  Write enough context that someone unfamiliar with this area can understand
  WHY a decision was needed.
-->

### The Core Problem
<!--
  In one or two sentences: what SPECIFIC technical problem must this decision solve?
  Be precise. Avoid describing the solution here.
-->

### Decision Drivers
<!--
  List the criteria that will guide the decision.
  Order them by importance. These become your evaluation rubric.
-->

| Priority | Driver | Description |
|----------|--------|-------------|
| 1 | | <!-- Most important criterion --> |
| 2 | | |
| 3 | | |
| 4 | | |
| 5 | | |

### Constraints & Non-Negotiables
<!--
  Hard constraints that cannot be violated regardless of option chosen.
  Examples: "Must work without internet (air-gapped)" or "Must be OSS-licensed"
-->
- Constraint: _______________
- Constraint: _______________
- Constraint: _______________

---

## 🎯 Proposed Decision

### Decision Statement
<!--
  Complete: "We will [VERB] [WHAT] for [PURPOSE]."
  Example: "We will use Apache Kafka as the event bus for agent-to-agent
  communication to achieve reliable, ordered, and replayable message delivery."
-->

> We will **[VERB]** [WHAT] for [PURPOSE].

### Rationale Summary
<!--
  In 3-5 sentences, why is this the right choice?
  This is the executive summary — the detail lives in Consequences below.
-->

---

## 🔬 Options Considered

<!--
  List ALL serious options evaluated, including the status quo.
  For each option, provide a balanced assessment.
  The chosen option will be marked. Empty/incomplete options analysis
  weakens the ADR and makes it harder to review.
-->

### Option 1: [Name] _(Proposed Choice)_

**Description:**
<!--
  Describe the option in enough detail that a senior engineer unfamiliar
  with it can evaluate it.
-->

**Pros:**
- ✅
- ✅
- ✅

**Cons:**
- ❌
- ❌
- ❌

**Evaluation against Decision Drivers:**

| Driver | Score (1-5) | Notes |
|--------|------------|-------|
| Driver 1 | | |
| Driver 2 | | |
| Driver 3 | | |

**References:**
- <!-- Official docs, benchmarks, case studies -->

---

### Option 2: [Name]

**Description:**

**Pros:**
- ✅
- ✅

**Cons:**
- ❌
- ❌

**Evaluation against Decision Drivers:**

| Driver | Score (1-5) | Notes |
|--------|------------|-------|
| Driver 1 | | |
| Driver 2 | | |
| Driver 3 | | |

**References:**
- <!-- Official docs, benchmarks, case studies -->

---

### Option 3: [Name] _(if applicable)_

**Description:**

**Pros:**
- ✅

**Cons:**
- ❌

---

### Option 4: Status Quo / Do Nothing

**Description:**
Continue with the current approach: _______________

**Pros:**
- ✅ No migration cost
- ✅ No new risk

**Cons:**
- ❌ <!-- Why the status quo is unacceptable -->
- ❌

---

## 📊 Option Comparison Matrix

<!--
  Summarize the scoring across all options.
  Score each criterion 1 (poor) to 5 (excellent) for each option.
-->

| Decision Driver | Option 1 | Option 2 | Option 3 | Status Quo |
|-----------------|----------|----------|----------|------------|
| Driver 1 | | | | |
| Driver 2 | | | | |
| Driver 3 | | | | |
| Driver 4 | | | | |
| Driver 5 | | | | |
| **Total** | **/25** | **/25** | **/25** | **/25** |

---

## 📈 Consequences

<!--
  What happens AFTER this decision is made and implemented?
  This is the most important section — be honest about trade-offs.
-->

### Positive Consequences
<!--
  Benefits we expect from this decision.
  Be specific and measurable where possible.
-->
- ✅ <!-- e.g., "Reduces agent-to-agent latency by ~40% based on benchmarks" -->
- ✅
- ✅

### Negative Consequences
<!--
  Trade-offs and costs we accept by making this decision.
  Honest assessment — not weaknesses of the approach, but accepted costs.
-->
- ⚠️ <!-- e.g., "Requires migration of 3 existing services (estimated 2-week effort)" -->
- ⚠️
- ⚠️

### Neutral Consequences
- ℹ️ <!-- Changes that are neither positive nor negative -->
- ℹ️

---

## ⚠️ Risks

<!--
  What could go wrong? How severe and likely is each risk?
  Include mitigation strategies.
-->

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| <!-- e.g., Vendor lock-in if vendor pivots --> | Low/Med/High | Low/Med/High | <!-- Mitigation strategy --> |
| | | | |
| | | | |

**Risk acceptance statement:**
<!--
  After reviewing risks, declare the risk posture:
  "We accept these risks because [reason]. If [trigger event] occurs,
  we will [response plan]."
-->

---

## 🗓️ Implementation Plan

### Phases
<!--
  How will this decision be implemented?
  Break into phases to reduce risk.
-->

| Phase | Description | Effort | Dependencies |
|-------|-------------|--------|-------------|
| 1 | <!-- Proof of concept / spike --> | | |
| 2 | <!-- Core implementation --> | | |
| 3 | <!-- Migration of existing systems --> | | |
| 4 | <!-- Cleanup and deprecation --> | | |

### Affected Systems
<!--
  Which Atlas packages, engines, APIs, or external integrations need to change?
-->
- `@atlas/<!-- package -->` — <!-- what changes -->
- `@atlas/<!-- package -->` — <!-- what changes -->

### Migration Path
<!--
  If this replaces an existing solution, how do we migrate?
  Must be backward compatible unless a breaking change is declared.
-->

### Definition of Done
- [ ] <!-- Verifiable completion criterion 1 -->
- [ ] <!-- Verifiable completion criterion 2 -->
- [ ] <!-- ADR updated to status "Accepted" -->
- [ ] <!-- Implementation PR merged -->
- [ ] <!-- Docs updated -->

---

## 🔗 Related ADRs & References

### Related ADRs
| ADR | Relationship |
|-----|-------------|
| ADR-XXX: <!-- title --> | <!-- e.g., "Supersedes" / "Builds on" / "Related to" --> |

### External References
| Reference | URL |
|-----------|-----|
| Official Documentation | |
| Benchmark / Study | |
| Industry Case Study | |

### Prior Discussion
- Slack thread: <!-- link -->
- Design doc: <!-- link -->
- RFC: <!-- link -->

---

## 👥 Review Requirements

<!--
  Who must review and approve this ADR before it can be accepted?
-->

| Reviewer | Role | Required | Notes |
|----------|------|----------|-------|
| @_____ | Principal Architect | ✅ Required | |
| @_____ | Security Lead | ✅ Required | _(if security implications)_ |
| @_____ | Engine Owner | ✅ Required | |
| @_____ | <!-- role --> | ☐ Optional | |

**Minimum approvals required:** 2 (including at least 1 Principal Architect)
**Review deadline:** <!-- YYYY-MM-DD -->

---

## ✅ Proposer Checklist

- [ ] I have read the Atlas ADR Guide (`docs/adrs/ADR-GUIDE.md`)
- [ ] This decision qualifies as an ADR (hard to reverse, significant scope)
- [ ] I evaluated at least 3 options including the status quo
- [ ] I documented honest cons for my proposed option
- [ ] I identified the required reviewers
- [ ] I am available to answer questions during the review period

---
<!-- Atlas Engineering OS · ADR Proposal Template v2.0 · 2026-07 -->
