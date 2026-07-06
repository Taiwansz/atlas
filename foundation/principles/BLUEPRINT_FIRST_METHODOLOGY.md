# Blueprint-First Methodology

> **Document Status:** Authoritative Reference  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-06  
> **Owner:** Atlas Architecture Team  

---

## 1. Introduction & Philosophy

The **Blueprint-First Methodology** is the core operational paradigm of the Atlas Engineering Operating System. It asserts a fundamental rule: **No implementation may begin before its architectural blueprint is formally defined, validated, and approved.**

In traditional software development, projects frequently suffer from architectural drift, institutional amnesia, and ad-hoc decision-making. Developers often begin coding based on vague requirements, leading to poor structural integrity, high technical debt, and lost context. AI acceleration has compounded this problem—generating code at machine speed without architectural awareness produces faster technical debt, not better software.

Blueprint-First shifts the focus from writing code to **orchestrating intelligence** and **generating understanding**. The blueprint serves as the executable contract between human intent, architectural constraints, and multi-agent implementation.

---

## 2. The Core Lifecycle Phases

An Atlas project progresses through six distinct, governed phases:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  1. Intake &    │ ──▶ │  2. Blueprint   │ ──▶ │  3. Validation  │
│  Discovery      │     │  Specification  │     │  & Simulation   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  6. Continuous  │ ◀── │   5. Technical  │ ◀── │  4. Code Gen &  │
│    Evolution    │     │      Audit      │     │  Implementation │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Phase 1: Intake & Discovery
- **Action:** The Requirement Discovery Engine engages in structured Socratic dialogue with stakeholders.
- **Goal:** Surface functional requirements, non-functional requirements, technical constraints, business risks, and the "why" behind every feature.
- **Output:** A structured, validated requirements schema (`requirements.json`) that acts as input for the blueprinting phase.

### Phase 2: Blueprint Specification
- **Action:** The Blueprint Engine translates requirements into a formal, versioned architectural blueprint (`atlas.blueprint.yaml`).
- **Goal:** Map the system topology, define component contracts, select the technology stack, assign agent roles, and write ADRs for significant decisions.
- **Output:** A complete, syntax-validated blueprint document and its associated lockfile.

### Phase 3: Validation & Simulation
- **Action:** The Simulation Engine runs the blueprint through formal verification and behavioral modeling.
- **Goal:** Stress-test the design under simulated load, latency, and node failure scenarios. Identify race conditions, bottlenecks, and constitutional violations prior to writing code.
- **Output:** Simulation report and formal verification validation token.

### Phase 4: Code Gen & Implementation
- **Action:** The Agent Orchestrator coordinates specialized coding agents to implement the blueprint.
- **Goal:** Write modular, typed, clean code that strictly adheres to the component contracts, schemas, and API definitions specified in the blueprint.
- **Output:** Working codebase with complete tests, fully aligned with the blueprint.

### Phase 5: Technical Audit
- **Action:** The Technical Audit Engine audits the codebase and deployment state.
- **Goal:** Compare the actual implementation against the blueprint and the project's Constitution. Detect drift, verify security posture, and run Red Team simulations.
- **Output:** Engineering Score report and security assessment.

### Phase 6: Continuous Evolution
- **Action:** As requirements change, the Evolution Engine guides the system through updates.
- **Goal:** Ensure all modifications begin at Phase 1. The blueprint is updated first, validated, and then the Agent Orchestrator migrates the codebase.
- **Output:** Evolving blueprint version and controlled system refactoring.

---

## 3. The "No Un-Blueprint Code" Rule

The most critical invariant of the Blueprint-First methodology is the **No Un-Blueprint Code** rule:

1. **Inviolable Contracts:** No source code file, database schema, or infrastructure script may be created or modified if it is not explicitly defined in or permitted by the approved Blueprint.
2. **Deterministic Validation:** The CI/CD pipeline runs a verification check (`agy validate --drift-check`) that compares the AST (Abstract Syntax Tree) of the codebase with the Blueprint. Any component, function, or route found in the codebase that is not declared in the Blueprint fails the build.
3. **Emergency Override:** In production-down scenarios where an ad-hoc patch must be applied, the engineer must use the `agy emergency-patch` command. This creates a temporary, isolated variance, registers a high-priority work-item to update the Blueprint within 24 hours, and degrades the project's Engineering Score until resolved.

---

## 4. The Role of ADRs & RFCs

Blueprints are supported by two primary forms of decision capture:

### Architectural Decision Records (ADRs)
- Capture **why** a decision was made.
- Must follow the Michael Nygard format (Context, Decision, Status, Consequences).
- Are linked directly to components and systems in the blueprint.
- Live in `/docs/adr/` and are immutable. If a decision changes, a new ADR must supersede the old one.

### Request for Comments (RFCs)
- Capture **how** complex protocols, interfaces, or cross-cutting systems are standardized.
- Provide detailed technical specifications for engines, API platforms, and communication patterns.
- Live in `/docs/rfc/` and are subject to formal team review before being marked as `Final`.

---

## 5. Step-by-Step Developer Guidelines

To execute a feature or project using the Blueprint-First methodology:

### Step 1: Initialize the Change
Run the discovery command to start requirement intake:
```bash
agy discover --feature "Feature Name"
```
Answer the Socratic prompts to define goals, constraints, and dependencies.

### Step 2: Propose Blueprint Modification
Generate a draft blueprint diff:
```bash
agy blueprint propose --feature "Feature Name"
```
This generates a new blueprint draft at `.atlas/blueprints/drafts/`. Edit this file to define:
- Component contracts (input/output JSON schemas)
- Storage updates (migrations, new tables)
- Communication flows (event topics, gRPC endpoints)

### Step 3: Run Architectural Simulation
Verify the proposed changes:
```bash
agy simulate --draft .atlas/blueprints/drafts/feature-blueprint.yaml
```
Review the performance, scalability, and threat modeling reports generated by the Simulation Engine.

### Step 4: Submit for Review & Approval
Apply the changes to the project's lockfile:
```bash
agy blueprint approve --draft .atlas/blueprints/drafts/feature-blueprint.yaml
```
This updates `atlas.blueprint.yaml`, increments the `blueprint_version` in the header, and automatically generates required ADR templates.

### Step 5: Trigger Agent Execution
Instruct the orchestrator to implement the approved blueprint changes:
```bash
agy orchestrate --apply
```
The Agent Orchestrator reads the blueprint delta and assigns subagents to generate/modify the code, update tests, and rebuild schemas.

### Step 6: Post-Build Audit
Run a technical audit to ensure compliance:
```bash
agy audit
```
Confirm that the Engineering Score remains above the acceptable threshold (typically >= 90/100) and that no drift is detected.
