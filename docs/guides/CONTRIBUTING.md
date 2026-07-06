# Contributing Guidelines

> **Document Status:** Authoritative Reference  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-06  
> **Owner:** Atlas Developer Experience Team  

---

## 1. Introduction

We welcome contributions to the Atlas Engineering Operating System! Because Atlas governs mission-critical software systems, we maintain high standards for code quality, architectural consistency, and documentation completeness.

Every contribution must align with:
- The [Atlas Constitution](../../foundation/constitution/CONSTITUTION.md) — our core invariants.
- The [Engineering Principles](../../foundation/principles/ENGINEERING_PRINCIPLES.md) — our technical standards.
- The [Blueprint-First Methodology](../../foundation/principles/BLUEPRINT_FIRST_METHODOLOGY.md) — our development process.

---

## 2. Commit Message & Coding Standards

### 2.1 Conventional Commits
All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

- **Types:**
  - `feat`: Net-new system features or capabilities.
  - `fix`: Code bug fixes.
  - `docs`: Documentation updates only.
  - `style`: Changes that do not affect code logic (formatting, spacing).
  - `refactor`: Code restructurings that neither fix bugs nor add features.
  - `test`: Adding or correcting tests.
  - `chore`: Modifying build tasks, package configurations, or CI templates.
- **Example:**
  ```
  feat(blueprint): enforce input validation on contract schemas
  ```

### 2.2 TypeScript & Python Styling
- **TypeScript:** Enforces strict type compilation (`strict: true` in `tsconfig.base.json`), semicolons, and 2-space indentation.
- **Python:** Strictly conforms to PEP 8 standards, formatted via `black`, linted using `ruff`.

---

## 3. The Blueprint-First Contribution Flow

When contributing a feature or system modification, you must follow the **Blueprint-First** flow:

```
1. File Issue ──▶ 2. Socratic intake (discover) ──▶ 3. Edit Blueprint Draft
                                                          │
                                                          ▼
4. Run Audit ◀── 5. Run agent generation (apply) ◀── 3. Approve Blueprint
```

1. **Requirements discovery:** Before writing code, run `agy discover --feature "Feature Name"` to gather and document constraints.
2. **Blueprint Delta:** Modify `atlas.blueprint.yaml` to declare the changes to component interfaces, database schemas, or event pipelines.
3. **Write ADRs:** If the change represents a significant design choice, generate and commit a new Architectural Decision Record in `/docs/adr/`.
4. **Approve Blueprint:** Run `agy blueprint approve` to update the project lockfile.
5. **Implementation & Verification:** Write source code satisfying the contracts, run local test suites, and execute `agy audit` to verify zero code drift.

---

## 4. Pull Request Requirements

Before submitting a Pull Request (PR), ensure:
- The CI pipeline executes successfully with zero errors.
- Unit and integration tests cover at least 90% of the modified code blocks.
- There is no undetected code drift (`agy validate --drift-check` returns exit code `0`).
- The PR description highlights:
  - The problem solved.
  - The architectural changes made.
  - References to modified blueprint sections or new ADRs.
- All code comments and documentation are written in **English**.
