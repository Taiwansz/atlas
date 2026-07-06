# CI/CD Infrastructure Strategy

> **Document Status:** Authoritative Reference  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-06  
> **Owner:** Atlas DevOps & Platform Team  

---

## 1. CI Pipeline Architecture (GitHub Actions)

We run continuous integration pipelines on every pull request targeting `main` or `release/*` branches. The pipeline is designed around Nx-affected caching to minimize compute resources and feedback delay.

```
                  [Git Commit Pushed]
                           │
                           ▼
               [Nx Affected Analysis]
              /          |           \
             ▼           ▼            ▼
         [Lint & AST] [Unit Tests] [Security Scan]
             \           |            /
              ▼          ▼           ▼
             [Build & Package Container]
```

### 1.1 Pipeline Stages

1. **Lint & Style Enforcement:** Verifies code formatting matches standard eslint configurations and prettier patterns.
2. **Schema Verification:** Ensures all database migrations (PostgreSQL, Neo4j schemas) parse correctly without regression errors.
3. **AST Drift Check:** Runs `agy validate` to verify that any code changes do not drift from the approved project blueprint.
4. **Test Execution:**
   - Runs unit tests for affected TS packages via Jest.
   - Runs unit tests for affected Python modules via PyTest.
5. **Security Scanning:** Runs static code analysis (Snyk/SonarQube) and scans third-party packages for CVEs.
6. **Containerization & Registry Upload:** Builds Docker OCI images using target layers and tags them with the git commit SHA, pushing them to the container registry (GHCR or AWS ECR).

### 1.2 Sample GitHub Actions Job Definition

```yaml
name: Continuous Integration

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node & PNPM
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install Monorepo Dependencies
        run: pnpm install --frozen-lockfile

      - name: Run Affected Lint Checks
        run: npx nx affected --target=lint --base=origin/main

      - name: Run Affected Unit Tests
        run: npx nx affected --target=test --base=origin/main
```

---

## 2. CD Deployment Strategy (GitOps)

We separate continuous integration (build and package) from deployment. Deployments are managed via **GitOps** using **ArgoCD** in our Kubernetes clusters.

- **Source of Truth:** The deployment state is defined in the `atlas-gitops` repository containing Helm charts and Kustomize overlays.
- **Continuous Synchronization:** ArgoCD monitors the gitops repository and applies Kubernetes manifests to maintain matching cluster states.

---

## 3. Environments Configuration

| Environment | Cluster Namespace | Sync Policy | Strategy | Rollback Action |
|-------------|-------------------|-------------|----------|-----------------|
| **Development** | `atlas-dev` | Automatic on PR push | Recreate pods | Delete namespace |
| **Staging** | `atlas-staging` | Automatic on merge to `main` | Rolling Update | Redeploy last stable SHA |
| **Production** | `atlas-prod` | Manual gate on tag release | Blue/Green | Canary rollback on HTTP 5xx spike |

---

## 4. Verification and Rollback Controls

1. **Canary Analysis:** During production rolling deployments, 10% of network traffic is routed to the new containers.
2. **Prometheus Telemetry Scraper:** ArgoCD watches Prometheus metrics. If the error rate on Canary containers exceeds 1%, the deploy halts automatically.
3. **Automated Rollback:** The ingress controller shifts all traffic back to the primary production environment, sends alerts to Slack, and flags the build tag as degraded.
