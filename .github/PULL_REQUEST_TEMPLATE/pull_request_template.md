<!--
  ╔══════════════════════════════════════════════════════════════════════╗
  ║           ATLAS ENGINEERING OS — PULL REQUEST TEMPLATE              ║
  ║  Every PR is a governed event. Fill every section. Ship with pride. ║
  ╚══════════════════════════════════════════════════════════════════════╝

  BEFORE SUBMITTING:
  • Ensure your branch name follows: <type>/<ticket-id>-<short-description>
  • Squash WIP commits; every commit must follow Conventional Commits spec
  • Run `nx affected --target=lint,test,build` locally before pushing
  • If this PR introduces a new architectural decision, an ADR is REQUIRED
-->

## 📋 PR Summary

> **One-sentence description of what this PR does and why.**

_Example: "Implements the Blueprint validation engine that enforces schema compliance before Execution Stage transitions."_

**Linked Issue / Ticket:** Closes #<!-- issue number -->
**Atlas Blueprint Reference:** `docs/blueprints/<!-- blueprint-id -->.md` _(if applicable)_
**ADR Reference:** `docs/adrs/ADR-<!-- number -->-<!-- title -->.md` _(if applicable)_

---

## 🏷️ Type of Change

_Check all that apply. Multiple types require justification in the summary._

| Type | Description | Selected |
|------|-------------|----------|
| `feat` | New feature or capability | ☐ |
| `fix` | Bug fix (non-breaking) | ☐ |
| `fix!` | Bug fix (breaking) | ☐ |
| `refactor` | Code restructuring without behavior change | ☐ |
| `perf` | Performance improvement | ☐ |
| `security` | Security fix or hardening | ☐ |
| `docs` | Documentation only | ☐ |
| `test` | Test additions or corrections | ☐ |
| `chore` | Build, CI, dependencies, tooling | ☐ |
| `revert` | Reverts a previous commit | ☐ |

---

## 🗺️ Blueprint Compliance

_Every feature change must trace back to a Blueprint. Hotfixes and chores may mark N/A with justification._

- [ ] This change is covered by an existing Blueprint specification
- [ ] This change required a Blueprint amendment (attach Amendment PR link: __________)
- [ ] This change is out-of-Blueprint scope — **justification required below**
- [ ] N/A — This is a non-feature change (fix, chore, docs, test)

**Blueprint compliance notes:**
```
<!-- Describe how this PR implements or deviates from the Blueprint -->
```

**Affected Blueprint sections:**
- Section: _____ (Page/Chapter _____)
- Section: _____ (Page/Chapter _____)

---

## 🎯 Motivation & Context

### Problem Being Solved
<!--
  Describe the problem, pain point, or requirement.
  WHY does this change need to exist?
  What breaks or is missing without it?
-->

### Solution Approach
<!--
  Describe the approach taken.
  Why this approach over alternatives?
  What trade-offs were made?
-->

### Alternatives Considered
<!--
  List alternatives you evaluated and why they were rejected.
  This prevents re-litigating decisions in review.
-->

| Alternative | Why Rejected |
|-------------|--------------|
| | |
| | |

---

## 🔧 Engineering Checklist

### Code Quality
- [ ] Code follows the Atlas Style Guide and project conventions
- [ ] No hardcoded secrets, API keys, or credentials
- [ ] No `console.log` / debug statements left in production paths
- [ ] Dead code removed; no commented-out code blocks
- [ ] All public APIs have JSDoc / TSDoc documentation
- [ ] Complex logic has inline comments explaining **why**, not **what**
- [ ] Error handling is explicit; no silent failures or swallowed exceptions
- [ ] No `any` TypeScript types without `// atlas-ignore: reason` annotation

### Testing
- [ ] Unit tests written for all new public functions/methods
- [ ] Unit tests written for all bug fixes (regression tests)
- [ ] Integration tests updated or added for cross-module interactions
- [ ] E2E tests updated if user-facing behavior changed
- [ ] All tests pass locally: `nx affected --target=test`
- [ ] Code coverage maintained at ≥ 80% for affected packages
- [ ] Edge cases and error paths are tested
- [ ] Test descriptions follow the **Given/When/Then** pattern

### Documentation
- [ ] `README.md` updated if package API or setup changed
- [ ] Inline TSDoc/JSDoc updated for all modified public APIs
- [ ] Architecture diagrams updated if system topology changed
- [ ] `CHANGELOG.md` entry added (if not auto-generated)
- [ ] Living documentation updated in `docs/` if applicable
- [ ] ADR created for significant architectural decisions (see below)

### Architecture Decision Record (ADR)
- [ ] No new architectural decision required
- [ ] ADR created: `docs/adrs/ADR-XXX-<title>.md`
- [ ] ADR is in **Proposed** status and linked above
- [ ] ADR covers: Context, Decision, Alternatives, Consequences, Risks

### Dependencies
- [ ] No new direct dependencies added
- [ ] New dependencies justified: `<!-- reason -->` in `package.json` comment
- [ ] New dependencies are actively maintained (last commit < 6 months)
- [ ] New dependencies have acceptable license (MIT, Apache-2.0, BSD)
- [ ] `nx graph` verified — no circular dependencies introduced
- [ ] Dependency version pinned in `pnpm-lock.yaml` (no floating versions)

---

## 🔒 Security Checklist

_All items must be checked or explicitly marked N/A with justification._

### Input & Data Handling
- [ ] All user inputs validated and sanitized before use
- [ ] No SQL/NoSQL injection vectors (parameterized queries used)
- [ ] No command injection vectors (no `exec(userInput)` patterns)
- [ ] File paths validated and sandboxed (no path traversal)
- [ ] XML/JSON parsing uses safe parsers (XXE prevented)

### Authentication & Authorization
- [ ] New endpoints/operations require proper authentication
- [ ] Authorization checks occur server-side (not just client-side)
- [ ] Principle of least privilege applied to new permissions
- [ ] No elevation of privilege possible through this change
- [ ] Session/token handling follows secure patterns

### Data Privacy
- [ ] No PII logged to application logs
- [ ] No sensitive data in error messages returned to clients
- [ ] Data retention policy considered for new stored data
- [ ] GDPR/privacy implications assessed

### Cryptography
- [ ] No custom cryptography implemented (use established libraries)
- [ ] Secrets stored in vault/environment; never in code or config files
- [ ] TLS enforced for all external communication
- [ ] Cryptographic algorithms are current standard (no MD5, SHA1, DES)

### Dependency Security
- [ ] `npm audit` / `pnpm audit` run — no high/critical vulnerabilities
- [ ] Snyk scan reviewed (if applicable)
- [ ] Container base image updated to latest patched version (if applicable)

**Security notes:**
```
<!-- Any security considerations or mitigations specific to this PR -->
```

---

## ⚡ Performance Checklist

_Complete only if this PR touches performance-sensitive paths (API handlers, database queries, rendering, agents)._

- [ ] N/A — No performance-sensitive code modified

### Algorithms & Complexity
- [ ] No O(n²) or worse algorithms introduced without justification
- [ ] Database queries use appropriate indexes
- [ ] No N+1 query patterns introduced
- [ ] Pagination implemented for unbounded list operations

### Memory & Resources
- [ ] No memory leaks (event listeners cleaned up, subscriptions disposed)
- [ ] Large data sets streamed rather than buffered in memory
- [ ] Resource pools (DB connections, HTTP clients) reused appropriately
- [ ] Caching strategy considered for expensive computations

### Benchmarks
- [ ] Performance benchmark run before and after change
- [ ] No p99 latency regression > 10% on affected endpoints
- [ ] Bundle size impact assessed (`nx affected --target=analyze`)

**Performance benchmark results:**
```
Before: <!-- p50, p95, p99 latencies or throughput -->
After:  <!-- p50, p95, p99 latencies or throughput -->
Delta:  <!-- % change -->
```

---

## 🤖 AI / Agent Considerations

_Complete if this PR modifies or introduces agent behavior, prompts, LLM calls, MCP tools, or knowledge graph interactions._

- [ ] N/A — No AI/Agent code modified

### Prompt Engineering
- [ ] Prompts are stored as versioned templates (not hardcoded strings)
- [ ] Prompt changes include before/after comparison and rationale
- [ ] Prompt injection risks assessed and mitigated
- [ ] Token budget verified for target model context limits
- [ ] Prompts tested against adversarial inputs

### Agent Behavior
- [ ] Agent tool definitions follow MCP schema standards
- [ ] New agent capabilities documented in agent manifest
- [ ] Agent error handling gracefully degrades (no silent LLM failures)
- [ ] Retry logic implemented with exponential backoff
- [ ] Agent actions are idempotent where possible
- [ ] Sensitive data not passed to external LLM APIs without masking

### Knowledge & Memory
- [ ] Vector store schema migrations backward compatible
- [ ] Knowledge graph entity types validated against ontology
- [ ] Embedding model version consistent across affected operations
- [ ] Memory TTL / eviction policy considered

### Evaluation
- [ ] LLM output evaluated against baseline dataset (if applicable)
- [ ] Agent success rate measured (task completion %)
- [ ] Hallucination risk assessed for new information retrieval paths

**Agent behavior notes:**
```
<!-- Describe any non-obvious agent behavior changes -->
```

---

## 💥 Breaking Changes

- [ ] **No breaking changes** — fully backward compatible

If breaking changes exist, complete the following:

### Breaking Change Declaration

**What breaks:**
```
<!-- Describe exactly what breaks for consumers of this change -->
```

**Migration path:**
```
<!-- Step-by-step instructions for consumers to migrate -->
```

**Deprecation timeline:**
- Deprecated API removed in: `v<!-- X.Y.Z -->`
- Migration guide: `docs/migrations/<!-- migration-name -->.md`

**Consumer notification:**
- [ ] Existing consumers identified and notified
- [ ] Migration guide written and linked
- [ ] Deprecation warning added in previous release (if applicable)

---

## 🚀 Deployment Notes

### Environment Impact
- [ ] No environment changes required
- [ ] New environment variables required (listed below)
- [ ] Infrastructure changes required (IaC PR linked: #____)
- [ ] Database migrations required (migration files included)
- [ ] External service configuration changed

**New environment variables:**
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| | | | |

**Migration commands (if applicable):**
```bash
# Run in deployment order:
# 1.
# 2.
```

### Rollback Plan
```
<!-- How to roll back this change if it causes production issues -->
<!-- Include specific commands, feature flags, or database rollback steps -->
```

### Feature Flags
- [ ] This feature is behind a feature flag: `<!-- flag name -->`
- [ ] Flag default: `enabled` / `disabled`
- [ ] Flag can be toggled without redeployment

### Deployment Order
- [ ] No specific deployment order required
- [ ] Deploy in this order: `<!-- service-a before service-b -->`

---

## 🖼️ Screenshots / Recordings

_Required for UI changes. Optional but encouraged for CLI output or behavioral changes._

<!-- Drag and drop images/GIFs here or use GitHub's upload feature -->

| Before | After |
|--------|-------|
| | |

---

## 🔗 Related Resources

| Resource | Link |
|----------|------|
| Linked Issue | #<!-- number --> |
| Blueprint | `docs/blueprints/` |
| ADR | `docs/adrs/` |
| Design Doc | |
| Slack Thread | |
| External Reference | |

---

## 🧑‍🔬 Reviewer Guidance

_Help your reviewers focus on the right things._

**Focus areas for review:**
1. <!-- Most important thing to review -->
2. <!-- Second most important -->
3. <!-- Third most important -->

**Explicitly out of scope for this PR:**
- <!-- What you deliberately left for a follow-up -->

**Known issues / follow-up tickets:**
- [ ] #<!-- follow-up issue number -->: _____ (will be addressed in next sprint)

---

## ✅ Submitter Declaration

By submitting this PR, I confirm that:
- [ ] I have read and followed the [Atlas Contributing Guide](../../CONTRIBUTING.md)
- [ ] I have self-reviewed this PR with fresh eyes
- [ ] This PR is ready for review (not a draft)
- [ ] All CI checks are expected to pass
- [ ] I am available to respond to reviewer feedback within 48 hours

---
<!-- Atlas Engineering OS · PR Template v2.0 · Last updated: 2026-07 -->
