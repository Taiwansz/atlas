---
name: 🐛 Bug Report
about: Report a defect, regression, or unexpected behavior in Atlas
title: "[BUG] <concise description of the issue>"
labels: ["bug", "triage-needed"]
assignees: []
---

<!--
  ╔══════════════════════════════════════════════════════════════════════╗
  ║                    ATLAS BUG REPORT TEMPLATE                        ║
  ║  A high-quality bug report is the fastest path to a verified fix.  ║
  ╚══════════════════════════════════════════════════════════════════════╝

  BEFORE SUBMITTING:
  ✓ Search existing issues: https://github.com/your-org/atlas/issues
  ✓ Confirm you're on the latest version: `atlas --version`
  ✓ Reproduce the issue with a minimal reproduction case
  ✓ Remove any sensitive data (tokens, keys, PII) from logs
-->

## 🐛 Bug Description

### Summary
<!--
  One or two sentences: what is wrong and how does it manifest?
  Be specific. Avoid vague language like "it doesn't work" or "it's broken".
-->

### Severity Assessment

| Dimension | Assessment |
|-----------|------------|
| **Severity** | ☐ Critical (data loss / security) ☐ High (blocking) ☐ Medium (degraded) ☐ Low (cosmetic) |
| **Frequency** | ☐ Always ☐ Often (>50%) ☐ Sometimes (<50%) ☐ Rare (<10%) |
| **Scope** | ☐ All users ☐ Some users ☐ Specific config ☐ Only me |
| **Regression** | ☐ Yes — worked in `v______` ☐ No — never worked ☐ Unknown |

---

## 🌍 Environment

### Atlas Version
```
# Output of: atlas --version
Atlas Engineering OS: v_____
CLI: v_____
Core Engine: v_____
```

### System Information
```
OS:           <!-- e.g., Ubuntu 24.04 LTS / macOS 15.1 / Windows 11 -->
Architecture: <!-- e.g., x86_64 / arm64 -->
Node.js:      <!-- node --version -->
PNPM:         <!-- pnpm --version -->
Docker:       <!-- docker --version (if applicable) -->
Kubernetes:   <!-- kubectl version (if applicable) -->
```

### Atlas Configuration
```yaml
# Relevant sections of your atlas.config.ts (REMOVE ALL SECRETS)
# Example:
engines:
  llm:
    provider: <!-- openai / anthropic / google / local -->
    model: <!-- e.g., gpt-4o / claude-3-5-sonnet -->
  vectorStore:
    type: <!-- pgvector / qdrant / pinecone -->
  orchestrator:
    maxAgents: ___
```

### Affected Packages / Engines
<!--
  Which Atlas engines, packages, or modules exhibit this behavior?
  Check all that apply.
-->
- [ ] `@atlas/core` — Core orchestration engine
- [ ] `@atlas/cli` — Command-line interface
- [ ] `@atlas/blueprint-engine` — Blueprint generation and validation
- [ ] `@atlas/constitution-engine` — Constitution and governance
- [ ] `@atlas/discovery-engine` — Requirement discovery
- [ ] `@atlas/memory-engine` — Persistent memory and knowledge graph
- [ ] `@atlas/mcp-gateway` — MCP server and tool registry
- [ ] `@atlas/audit-engine` — Technical audit and scoring
- [ ] `@atlas/simulation-engine` — Architecture simulation
- [ ] `@atlas/red-team-engine` — Red team evaluation
- [ ] `@atlas/dashboard` — Web dashboard
- [ ] `@atlas/api-server` — REST/GraphQL API
- [ ] Other: _______________

---

## 🔍 Expected vs. Actual Behavior

### Expected Behavior
<!--
  What should happen according to the documentation, Blueprint, or your understanding?
  Be precise. Reference docs or API contracts if possible.
-->

**Expected:**
```
<!-- Describe or paste expected output/behavior -->
```

### Actual Behavior
<!--
  What actually happens?
  Include exact error messages, unexpected outputs, or behavioral descriptions.
-->

**Actual:**
```
<!-- Describe or paste actual output/behavior -->
```

### Visual Evidence
<!--
  Screenshots, screen recordings, or terminal output captures.
  Drag and drop images here, or use GitHub's upload feature.
-->

---

## 🔄 Steps to Reproduce

<!--
  Provide the MINIMAL, EXACT steps required to reproduce this issue.
  Include every step — reviewers must be able to reproduce without guessing.
  "Minimal" means: the fewest files/configs/steps that still trigger the bug.
-->

**Pre-conditions:**
<!-- What must be true before starting? (e.g., "Atlas project initialized with PostgreSQL backend") -->

**Reproduction Steps:**

1. <!-- First step -->
2. <!-- Second step -->
3. <!-- Third step -->
4. <!-- Continue as needed -->

**Minimal Reproduction Repository:**
<!--
  Link to a minimal GitHub repository that reproduces the issue.
  This dramatically speeds up diagnosis. Strongly recommended.
-->
Repo: <!-- https://github.com/your-username/atlas-repro -->

**Atlas Project Files (if relevant):**
<details>
<summary>atlas.config.ts (minimal, no secrets)</summary>

```typescript
// Paste minimal atlas.config.ts here
```
</details>

<details>
<summary>Blueprint or other relevant files</summary>

```
// Paste relevant Blueprint sections or other config files
```
</details>

---

## 📋 Logs & Traces

<!--
  IMPORTANT: Remove all sensitive data before pasting logs:
  - API keys, tokens, passwords → replace with [REDACTED]
  - Email addresses → replace with [EMAIL]
  - Internal hostnames → replace with [HOSTNAME]
  - PII → replace with [PII]
-->

### Error Output
<details>
<summary>Full error output / stack trace</summary>

```
<!-- Paste full error message and stack trace here -->
```
</details>

### Atlas Debug Logs
<!--
  Enable debug logging: ATLAS_LOG_LEVEL=debug atlas <command>
  Or set in atlas.config.ts: logging: { level: 'debug' }
-->
<details>
<summary>Debug logs (ATLAS_LOG_LEVEL=debug)</summary>

```
<!-- Paste debug log output here -->
```
</details>

### Agent Execution Trace
<!--
  If this involves agent execution, include the agent trace:
  atlas agents trace --run-id <run-id>
-->
<details>
<summary>Agent execution trace</summary>

```json
{
  "runId": "",
  "trace": []
}
```
</details>

### Network Requests (if applicable)
<details>
<summary>Relevant HTTP requests / responses</summary>

```
<!-- Paste request/response details (REMOVE AUTH HEADERS) -->
```
</details>

---

## 📊 Engineering Score Impact

<!--
  Atlas tracks project health via the Engineering Score (0-100).
  Does this bug affect the score or its calculation?
-->

- [ ] This bug causes incorrect Engineering Score calculation
- [ ] This bug affects score dimensions: ☐ Architecture ☐ Security ☐ Test Coverage ☐ Documentation ☐ Performance ☐ Maintainability
- [ ] This bug does not affect Engineering Score
- [ ] Unknown / not sure

**Current Engineering Score:** _____ / 100 _(run `atlas score` to check)_
**Expected Score (if bug fixed):** _____ / 100

---

## 🔧 Workaround

<!--
  Is there a temporary workaround to unblock users while the fix is developed?
  Documenting workarounds helps the community even before the fix ships.
-->

- [ ] No workaround known
- [ ] Workaround exists:

```
<!-- Describe the workaround step by step -->
```

---

## 🔗 Additional Context

### Related Issues
<!--
  Link to related bugs, PRs, or discussions:
-->
- Related to: #
- Duplicate of: # _(if suspected)_
- Blocked by: #

### Additional Notes
<!--
  Any other context that might help:
  - When did this start happening?
  - Did anything change in your environment before this appeared?
  - Are there any patterns (time of day, specific inputs, load levels)?
-->

---

## ✅ Submitter Checklist

- [ ] I searched existing issues and this is not a duplicate
- [ ] I am using a supported version of Atlas
- [ ] I have removed all sensitive data from this report
- [ ] I have included minimal reproduction steps
- [ ] I am available to provide additional information if requested

---
<!-- Atlas Engineering OS · Bug Report Template v2.0 · 2026-07 -->
