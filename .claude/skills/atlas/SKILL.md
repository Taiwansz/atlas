---
name: atlas-engineering-os
description: Teaches Claude Code how to govern projects using Atlas Blueprint, Constitution, and Ponytail Anti-Bloat Protocol.
---

# Atlas Engineering OS Skill for Claude Code

When working inside an Atlas-governed workspace:

1. **Check Context:** Inspect `.atlas/blueprint.yaml` and `.atlas/constitution.md`.
2. **Anti-Bloat Decision Ladder (Ponytail Protocol):**
   - Check YAGNI (Do not add speculative code).
   - Prefer native standard library functions.
   - Prefer inline 1-liners over new helper files.
   - Refactor existing files before creating new modules.
3. **Record Decisions:** Record non-trivial architectural decisions in `.atlas/decisions/`.
4. **Audit Drift:** Ensure zero code drift against declared component boundaries.
