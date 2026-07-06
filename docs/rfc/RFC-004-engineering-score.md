# RFC-004: Atlas Engineering Score

**RFC Number:** 004
**Author(s):** Atlas Engineering Team
**Date:** 2026-07-06
**Status:** Final
**Category:** Core

---

## Abstract

This RFC defines the **Atlas Engineering Score (AES)** — a comprehensive, multi-dimensional assessment system that quantifies the quality, health, and maturity of a software project. The AES provides a single composite score (0–1000) alongside eight dimension scores that give engineering leaders, agents, and stakeholders a clear, actionable understanding of where a project excels and where improvement is needed. This document specifies scoring dimensions, algorithms, aggregate calculation, history tracking, benchmarking, recommendation generation, and agent integration.

---

## Motivation

Evaluating software project quality is notoriously subjective. Teams argue about what "good code" means, technical debt accumulates invisibly, and engineering leadership lacks objective signals to prioritize investment. The Atlas Engineering Score provides:

1. **Objectivity**: Measurable, auditable criteria replace subjective opinions
2. **Completeness**: Eight dimensions cover the full engineering health surface
3. **Actionability**: Scores are accompanied by specific, prioritized recommendations
4. **Trending**: Historical tracking reveals whether the project is improving or degrading
5. **Benchmarking**: Industry-comparable scores contextualize project performance
6. **Agent Guidance**: Agents use scores to prioritize improvement work automatically

### Goals

- Define eight engineering quality dimensions with precise measurement criteria
- Specify scoring algorithms that produce scores comparable across projects
- Define an aggregate score calculation that appropriately weights dimensions
- Implement score history with trend analysis
- Establish industry benchmarks for score interpretation
- Generate actionable, prioritized improvement recommendations
- Integrate score computation and response into the Atlas agent workflow

### Non-Goals

- Replacing code review judgment with scores
- Scoring individual developer performance (AES measures the codebase, not people)
- Providing legal or compliance certifications

---

## Specification

### 5.1 Score Dimensions Overview

The Engineering Score is composed of eight dimensions, each scored 0–125 points (125 × 8 = 1000 total):

| # | Dimension | Weight | Key Concern |
|---|-----------|--------|-------------|
| 1 | Architecture Quality | 125 | Structural soundness and design adherence |
| 2 | Code Quality | 125 | Readability, maintainability, and correctness |
| 3 | Security | 125 | Vulnerability posture and secure coding practices |
| 4 | Performance | 125 | Efficiency, scalability, and resource utilization |
| 5 | Documentation | 125 | Completeness, accuracy, and currency of docs |
| 6 | Testing | 125 | Test coverage, quality, and reliability |
| 7 | Maintainability | 125 | Ease of long-term evolution and operation |
| 8 | AI Integration Quality | 125 | Effectiveness of AI/agent utilization |

**Composite Score Bands:**

| Score Range | Grade | Interpretation |
|-------------|-------|----------------|
| 900–1000 | A+ | Exceptional — industry-leading engineering |
| 800–899 | A | Excellent — strong practices across all dimensions |
| 700–799 | B | Good — solid foundation with specific improvement areas |
| 600–699 | C | Fair — functional but significant technical debt |
| 500–599 | D | Concerning — multiple dimensions at risk |
| < 500 | F | Critical — requires immediate remediation |

---

### 5.2 Dimension 1: Architecture Quality (0–125)

**Measures**: How well the codebase reflects the declared architecture; structural soundness; coupling and cohesion; adherence to chosen architectural patterns.

#### 5.2.1 Sub-Metrics

| Sub-Metric | Max Points | Measurement |
|-----------|-----------|-------------|
| Blueprint alignment | 30 | % of components matching Blueprint declarations |
| Coupling (afferent/efferent) | 25 | Instability metric: I = Ce / (Ca + Ce) |
| Cohesion | 25 | LCOM4 (Lack of Cohesion of Methods) per module |
| Architectural layer violations | 25 | Count of layer boundary violations (0 violations = full score) |
| Circular dependency absence | 20 | 0 cycles = full score; score degrades per cycle found |

#### 5.2.2 Algorithm

```python
def score_architecture_quality(project: Project) -> float:
    """Returns score 0–125"""
    # Blueprint alignment: how many declared components exist in code
    blueprint_components = set(c.id for c in project.blueprint.architecture.components)
    code_components = detect_components(project.codebase)
    alignment = len(blueprint_components & code_components) / max(len(blueprint_components), 1)
    blueprint_score = alignment * 30

    # Instability: coupling score
    instability_scores = []
    for module in project.modules:
        ca = count_afferent_couplings(module)  # Who depends on me
        ce = count_efferent_couplings(module)  # Who I depend on
        i = ce / (ca + ce) if (ca + ce) > 0 else 0
        instability_scores.append(i)
    avg_instability = sum(instability_scores) / max(len(instability_scores), 1)
    coupling_score = (1 - avg_instability) * 25

    # Cohesion: LCOM4
    lcom4_scores = [compute_lcom4(m) for m in project.modules]
    avg_lcom4 = sum(lcom4_scores) / max(len(lcom4_scores), 1)
    cohesion_score = max(0, 25 - (avg_lcom4 * 5))  # Penalty per LCOM4 unit above 1

    # Layer violations
    violations = detect_layer_violations(project)
    layer_score = max(0, 25 - (violations * 3))  # -3 points per violation

    # Circular dependencies
    cycles = detect_circular_dependencies(project)
    circular_score = max(0, 20 - (cycles * 4))  # -4 points per cycle

    return min(125, blueprint_score + coupling_score + cohesion_score + layer_score + circular_score)
```

---

### 5.3 Dimension 2: Code Quality (0–125)

**Measures**: Code readability, complexity, duplication, naming quality, and adherence to coding standards.

#### 5.3.1 Sub-Metrics

| Sub-Metric | Max Points | Measurement |
|-----------|-----------|-------------|
| Cyclomatic complexity | 25 | Average per function; target ≤ 5 |
| Code duplication | 25 | % duplicated code blocks (target < 5%) |
| Naming quality | 20 | Automated naming quality analysis |
| Style compliance | 20 | % lint-clean files |
| Dead code ratio | 15 | % unreachable code detected |
| Comment quality | 20 | Ratio of meaningful comments to code |

#### 5.3.2 Algorithm

```python
def score_code_quality(project: Project) -> float:
    """Returns score 0–125"""
    # Cyclomatic complexity: target ≤ 5, hard cap at 20
    complexities = [compute_cyclomatic_complexity(f) for f in project.all_functions()]
    avg_complexity = sum(complexities) / max(len(complexities), 1)
    complexity_score = max(0, 25 * (1 - max(0, avg_complexity - 5) / 15))

    # Code duplication: 0% = full score, 20%+ = 0
    duplication_pct = compute_duplication_percentage(project)
    duplication_score = max(0, 25 * (1 - duplication_pct / 0.20))

    # Naming quality: via ML-based naming model
    naming_quality = evaluate_naming_quality(project)  # 0.0–1.0
    naming_score = naming_quality * 20

    # Style compliance
    lint_pass_rate = run_linters(project)
    style_score = lint_pass_rate * 20

    # Dead code
    dead_code_pct = detect_dead_code(project)
    dead_code_score = max(0, 15 * (1 - dead_code_pct / 0.10))

    # Comment quality
    comment_quality = evaluate_comment_quality(project)  # 0.0–1.0
    comment_score = comment_quality * 20

    return min(125, complexity_score + duplication_score + naming_score +
               style_score + dead_code_score + comment_score)
```

---

### 5.4 Dimension 3: Security (0–125)

**Measures**: Vulnerability posture, secure coding adherence, dependency security, and security tooling coverage.

#### 5.4.1 Sub-Metrics

| Sub-Metric | Max Points | Measurement |
|-----------|-----------|-------------|
| Known vulnerability count | 40 | CVEs by severity (Critical -10, High -5, Medium -2, Low -0.5) |
| SAST findings | 25 | Static analysis security findings |
| Dependency outdatedness | 20 | % dependencies at current or latest-1 version |
| Secret exposure risk | 20 | Secret scanning findings |
| Security headers / config | 20 | OWASP security checklist compliance |

#### 5.4.2 Algorithm

```python
def score_security(project: Project) -> float:
    """Returns score 0–125"""
    # Vulnerability score: start at 40, deduct per CVE
    vuln_score = 40.0
    cves = fetch_cves(project.dependencies)
    for cve in cves:
        if cve.severity == "critical": vuln_score -= 10
        elif cve.severity == "high": vuln_score -= 5
        elif cve.severity == "medium": vuln_score -= 2
        elif cve.severity == "low": vuln_score -= 0.5
    vuln_score = max(0, vuln_score)

    # SAST findings
    sast_findings = run_sast(project)
    critical = sum(1 for f in sast_findings if f.severity == "critical")
    high = sum(1 for f in sast_findings if f.severity == "high")
    sast_score = max(0, 25 - (critical * 5) - (high * 2))

    # Dependency freshness: what % are within 2 minor versions of latest
    fresh_pct = compute_dependency_freshness(project)
    dependency_score = fresh_pct * 20

    # Secret scanning: any findings = major deduction
    secret_findings = run_secret_scan(project)
    secret_score = 20 if len(secret_findings) == 0 else max(0, 20 - len(secret_findings) * 10)

    # Security configuration checklist
    checklist_pass_rate = evaluate_security_checklist(project)
    config_score = checklist_pass_rate * 20

    return min(125, vuln_score + sast_score + dependency_score + secret_score + config_score)
```

---

### 5.5 Dimension 4: Performance (0–125)

**Measures**: Code efficiency, database query quality, caching effectiveness, and resource utilization.

#### 5.5.1 Sub-Metrics

| Sub-Metric | Max Points | Measurement |
|-----------|-----------|-------------|
| API latency vs. SLA | 35 | % of endpoints meeting Blueprint p95 latency SLA |
| Database query quality | 30 | N+1 query detection, missing indexes |
| Memory efficiency | 25 | Memory leak indicators, excessive allocations |
| Caching effectiveness | 20 | Cache hit rate vs. target |
| Bundle / build size | 15 | Frontend: JS bundle size vs. budget |

#### 5.5.2 Algorithm

```python
def score_performance(project: Project) -> float:
    """Returns score 0–125"""
    # Latency SLA compliance
    sla_target = project.blueprint.vision.non_functional_requirements.max_latency_p99_ms
    actual_p95 = fetch_latency_metrics(project, percentile=95)
    latency_compliance = sum(1 for l in actual_p95 if l <= sla_target) / max(len(actual_p95), 1)
    latency_score = latency_compliance * 35

    # Database query quality
    n_plus_one = detect_n_plus_one_queries(project)
    missing_indexes = detect_missing_indexes(project)
    db_score = max(0, 30 - (n_plus_one * 5) - (missing_indexes * 3))

    # Memory efficiency
    memory_issues = detect_memory_issues(project)
    memory_score = max(0, 25 - (memory_issues * 5))

    # Cache hit rate
    cache_hit_rate = fetch_cache_metrics(project)
    target_hit_rate = project.config.get("target_cache_hit_rate", 0.8)
    cache_score = min(20, 20 * (cache_hit_rate / target_hit_rate))

    # Bundle size
    if project.has_frontend:
        bundle_budget_kb = project.config.get("js_bundle_budget_kb", 250)
        actual_bundle_kb = measure_bundle_size(project)
        bundle_score = max(0, 15 * (1 - max(0, actual_bundle_kb - bundle_budget_kb) / bundle_budget_kb))
    else:
        bundle_score = 15  # Full score if no frontend

    return min(125, latency_score + db_score + memory_score + cache_score + bundle_score)
```

---

### 5.6 Dimension 5: Documentation (0–125)

**Measures**: Completeness, accuracy, currency, and accessibility of project documentation.

#### 5.6.1 Sub-Metrics

| Sub-Metric | Max Points | Measurement |
|-----------|-----------|-------------|
| Required documents presence | 30 | % of Blueprint-declared required docs present |
| API documentation coverage | 25 | % of public API endpoints documented |
| Code docstring coverage | 25 | % of public functions/classes with docstrings |
| Documentation freshness | 25 | % of docs updated within staleness threshold |
| Accuracy score | 20 | Doc-code consistency (automated cross-reference check) |

#### 5.6.2 Algorithm

```python
def score_documentation(project: Project) -> float:
    """Returns score 0–125"""
    # Required documents
    required = project.blueprint.docs.required_documents
    present = [d for d in required if Path(d.path).exists()]
    doc_presence_score = (len(present) / max(len(required), 1)) * 30

    # API documentation
    api_endpoints = discover_api_endpoints(project)
    documented = sum(1 for e in api_endpoints if e.is_documented)
    api_score = (documented / max(len(api_endpoints), 1)) * 25

    # Docstring coverage
    public_symbols = get_public_symbols(project)
    with_docstrings = sum(1 for s in public_symbols if s.has_docstring)
    docstring_score = (with_docstrings / max(len(public_symbols), 1)) * 25

    # Freshness
    max_staleness_days = project.blueprint.docs.required_documents  # from constitution
    fresh = evaluate_doc_freshness(project, max_staleness_days=90)
    freshness_score = fresh * 25

    # Accuracy: cross-reference docs with code
    accuracy = compute_doc_code_consistency(project)
    accuracy_score = accuracy * 20

    return min(125, doc_presence_score + api_score + docstring_score + freshness_score + accuracy_score)
```

---

### 5.7 Dimension 6: Testing (0–125)

**Measures**: Test coverage, test quality, reliability, and comprehensive testing strategy.

#### 5.7.1 Sub-Metrics

| Sub-Metric | Max Points | Measurement |
|-----------|-----------|-------------|
| Line coverage | 30 | % line coverage vs. target |
| Branch coverage | 25 | % branch coverage |
| Test flakiness | 20 | % flaky tests (target: 0%) |
| Test type diversity | 25 | Presence of unit, integration, E2E, contract tests |
| Mutation score | 25 | Mutation test survival rate (lower = better tests) |

#### 5.7.2 Algorithm

```python
def score_testing(project: Project) -> float:
    """Returns score 0–125"""
    coverage = run_coverage_analysis(project)
    target_line = project.blueprint.tests.coverage_targets.lines / 100

    # Line coverage vs. target
    line_coverage = coverage.lines / 100
    line_score = min(30, 30 * (line_coverage / max(target_line, 0.01)))

    # Branch coverage
    branch_coverage = coverage.branches / 100
    branch_score = min(25, 25 * (branch_coverage / max(target_line * 0.9, 0.01)))

    # Flakiness (0 flaky = full score, 5+ flaky = 0)
    flaky_count = count_flaky_tests(project)
    flakiness_score = max(0, 20 - (flaky_count * 4))

    # Test type diversity
    has_unit = project.has_test_type("unit")
    has_integration = project.has_test_type("integration")
    has_e2e = project.has_test_type("e2e")
    has_contract = project.has_test_type("contract")
    diversity_score = (has_unit * 8) + (has_integration * 7) + (has_e2e * 6) + (has_contract * 4)

    # Mutation score (if enabled)
    if project.blueprint.tests.mutation_testing:
        mutation = run_mutation_tests(project)
        # survival_rate = mutations killed / total mutations (higher is better)
        mutation_score = mutation.survival_rate * 25
    else:
        mutation_score = 12  # Partial credit for having coverage without mutation testing

    return min(125, line_score + branch_score + flakiness_score + diversity_score + mutation_score)
```

---

### 5.8 Dimension 7: Maintainability (0–125)

**Measures**: How easy the codebase is to understand, modify, and operate over the long term.

#### 5.8.1 Sub-Metrics

| Sub-Metric | Max Points | Measurement |
|-----------|-----------|-------------|
| Technical debt ratio | 30 | Estimated remediation effort / development effort |
| Dependency health | 25 | Age, maintenance status of dependencies |
| Observability coverage | 25 | % components with metrics, logs, traces |
| CI/CD health | 25 | Pipeline success rate, deployment frequency |
| Onboarding score | 20 | Time-to-first-commit for new contributor (estimated) |

#### 5.8.2 Algorithm

```python
def score_maintainability(project: Project) -> float:
    """Returns score 0–125"""
    # Technical debt: SonarQube-style ratio
    debt_ratio = compute_tech_debt_ratio(project)
    debt_score = max(0, 30 * (1 - min(debt_ratio / 0.10, 1)))  # 10% ratio = 0 points

    # Dependency health: % of deps with active maintenance
    deps = project.all_dependencies()
    healthy_deps = sum(1 for d in deps if is_actively_maintained(d) and not is_deprecated(d))
    dep_score = (healthy_deps / max(len(deps), 1)) * 25

    # Observability coverage
    components = project.blueprint.architecture.components
    instrumented = sum(1 for c in components if has_observability(c, project))
    observability_score = (instrumented / max(len(components), 1)) * 25

    # CI/CD health
    pipeline_data = fetch_ci_metrics(project, days=30)
    success_rate = pipeline_data.success_rate
    deploy_freq = pipeline_data.deploys_per_week
    ci_score = (success_rate * 15) + min(10, deploy_freq * 2)

    # Onboarding: README quality + dev environment setup complexity
    onboarding = estimate_onboarding_score(project)
    onboarding_score = onboarding * 20

    return min(125, debt_score + dep_score + observability_score + ci_score + onboarding_score)
```

---

### 5.9 Dimension 8: AI Integration Quality (0–125)

**Measures**: How effectively the project leverages AI capabilities, including agent utilization, prompt quality, and AI output validation.

#### 5.9.1 Sub-Metrics

| Sub-Metric | Max Points | Measurement |
|-----------|-----------|-------------|
| Agent task coverage | 30 | % of automatable tasks handled by agents |
| Prompt engineering quality | 25 | Prompt evaluation score (clarity, specificity, safety) |
| AI output validation | 25 | % of AI outputs with validation/human review |
| Memory utilization | 25 | Memory system utilization vs. capacity |
| Constitution compliance | 20 | Constitution violation rate (lower = better) |

#### 5.9.2 Algorithm

```python
def score_ai_integration_quality(project: Project) -> float:
    """Returns score 0–125"""
    # Agent task coverage: what % of routine tasks are automated
    automatable = identify_automatable_tasks(project)
    automated = sum(1 for t in automatable if t.is_agent_handled)
    coverage_score = (automated / max(len(automatable), 1)) * 30

    # Prompt quality: evaluate agent system prompts
    agents = project.blueprint.agents.specialists
    prompt_scores = [evaluate_prompt_quality(a.system_prompt) for a in agents]
    prompt_score = (sum(prompt_scores) / max(len(prompt_scores), 1)) * 25

    # AI output validation: % of AI outputs with validation pipeline
    ai_outputs = catalog_ai_outputs(project)
    validated = sum(1 for o in ai_outputs if o.has_validation)
    validation_score = (validated / max(len(ai_outputs), 1)) * 25

    # Memory utilization
    memory_stats = fetch_memory_stats(project)
    utilization = memory_stats.active_records / max(memory_stats.capacity, 1)
    # Optimal utilization: 40–80%
    memory_score = 25 * (1 - abs(utilization - 0.6) / 0.6)
    memory_score = max(0, memory_score)

    # Constitution compliance
    violations = fetch_constitution_violations(project, days=30)
    compliance_score = max(0, 20 - (violations * 2))

    return min(125, coverage_score + prompt_score + validation_score + memory_score + compliance_score)
```

---

### 5.10 Aggregate Score Calculation

```python
def compute_engineering_score(project: Project) -> EngineeringScore:
    """Compute the composite Atlas Engineering Score."""
    dimensions = {
        "architecture_quality": score_architecture_quality(project),
        "code_quality": score_code_quality(project),
        "security": score_security(project),
        "performance": score_performance(project),
        "documentation": score_documentation(project),
        "testing": score_testing(project),
        "maintainability": score_maintainability(project),
        "ai_integration_quality": score_ai_integration_quality(project),
    }

    composite = sum(dimensions.values())  # max = 1000

    return EngineeringScore(
        composite=round(composite),
        dimensions=dimensions,
        grade=compute_grade(composite),
        computed_at=datetime.utcnow(),
        project_id=project.id,
        blueprint_version=project.blueprint.blueprint_version
    )
```

---

### 5.11 Score History and Trending

Each score computation is persisted to the score history store:

```yaml
# Score record
score_id: "score-uuid"
project_id: "project-uuid"
computed_at: "2026-07-06T00:00:00Z"
blueprint_version: 12
composite: 734
grade: "B"
dimensions:
  architecture_quality: 98
  code_quality: 87
  security: 112
  performance: 76
  documentation: 91
  testing: 103
  maintainability: 82
  ai_integration_quality: 85
trigger: "scheduled"  # scheduled | pr-merge | manual | deployment
```

**Trend Analysis:**

```python
def compute_trend(project_id: str, window_days: int = 30) -> Trend:
    history = fetch_score_history(project_id, days=window_days)
    if len(history) < 2:
        return Trend(direction="insufficient-data", change=0)

    # Linear regression over composite scores
    scores = [(h.computed_at.timestamp(), h.composite) for h in history]
    slope = linear_regression_slope(scores)

    return Trend(
        direction="improving" if slope > 0.5 else "degrading" if slope < -0.5 else "stable",
        change_per_week=slope * 7,
        momentum=compute_momentum(history),
        velocity=compute_velocity(history)  # Points/week
    )
```

---

### 5.12 Benchmark Comparisons

Atlas maintains benchmark data from anonymized project aggregates:

| Percentile | Composite Score | Description |
|-----------|----------------|-------------|
| p10 | < 450 | Bottom decile — significant issues |
| p25 | 550–599 | Below average |
| p50 | 650–699 | Median project quality |
| p75 | 750–799 | Above average |
| p90 | 850–899 | Top decile — strong engineering |
| p95+ | 900+ | Elite engineering organizations |

**Domain-specific benchmarks** are available for: `fintech`, `healthtech`, `developer-tools`, `saas`, `ecommerce`.

```bash
# View how project compares to benchmarks
atlas score benchmark --domain fintech
```

---

### 5.13 Score Improvement Recommendations

Every score computation produces prioritized recommendations:

```python
def generate_recommendations(score: EngineeringScore) -> list[Recommendation]:
    recommendations = []

    # Identify worst-performing dimensions
    sorted_dims = sorted(score.dimensions.items(), key=lambda x: x[1])

    for dim_name, dim_score in sorted_dims[:3]:  # Bottom 3 dimensions
        gap = 125 - dim_score
        recs = generate_dimension_recommendations(dim_name, dim_score)
        for rec in recs:
            rec.priority = compute_priority(gap, rec.effort_estimate, rec.impact)
            recommendations.append(rec)

    return sorted(recommendations, key=lambda r: r.priority, reverse=True)[:10]
```

**Recommendation Format:**

```yaml
recommendation:
  id: "REC-2026-07-001"
  dimension: security
  title: "Upgrade 3 critical CVE dependencies"
  description: |
    Three dependencies have critical CVEs: requests@2.28.0 (CVE-2023-32681),
    pillow@9.4.0 (CVE-2023-44271), and cryptography@40.0.0 (CVE-2023-49083).
    Upgrading these will recover approximately 30 security score points.
  effort: low           # low | medium | high | very-high
  impact_points: 30
  auto_fixable: true    # Atlas can apply this fix automatically
  fix_command: "atlas fix --recommendation REC-2026-07-001"
  affected_files:
    - requirements.txt
  documentation_ref: "https://atlas.engineering/fixes/dependency-upgrade"
```

---

### 5.14 Integration with Agents

Atlas agents consume Engineering Score data to prioritize their work:

```python
# Atlas orchestrator uses score to direct agent work
def assign_agent_tasks(project: Project) -> list[AgentTask]:
    score = compute_engineering_score(project)
    tasks = []

    # Security agent: any score < 80 → trigger security remediation
    if score.dimensions["security"] < 80:
        tasks.append(AgentTask(
            agent="security-agent",
            task="remediate-critical-vulnerabilities",
            priority="critical",
            context={"security_score": score.dimensions["security"]}
        ))

    # Docs agent: any score < 70 → trigger doc updates
    if score.dimensions["documentation"] < 70:
        tasks.append(AgentTask(
            agent="docs-agent",
            task="update-stale-documentation",
            priority="high"
        ))

    # QA agent: testing score < 90 → improve coverage
    if score.dimensions["testing"] < 90:
        tasks.append(AgentTask(
            agent="qa-agent",
            task="improve-test-coverage",
            priority="medium"
        ))

    return tasks
```

---

### 5.15 Score Computation Schedule

| Trigger | Frequency | Scope |
|---------|-----------|-------|
| PR merge to main | On event | Changed components |
| Full score run | Daily at 03:00 UTC | Full project |
| Pre-deployment | On deploy event | All dimensions |
| Manual | On demand | Full project |
| Blueprint change | On event | Affected dimensions |

---

## Rationale

### Why equal weighting across dimensions?

Unequal weighting invites gaming (over-invest in high-weight dimensions, neglect low-weight ones). Equal weighting ensures all dimensions receive investment. Organizations that need different weighting can use `atlas score configure --weights` to set project-specific weights.

### Why 0–1000 scale instead of 0–100?

The 0–1000 scale provides more granularity to detect and represent small improvements across eight dimensions without fractional points. A single-point improvement in a dimension is meaningful and visible.

### Why include AI Integration Quality as a dimension?

As Atlas becomes a core part of engineering practice, the quality of AI integration directly impacts project health. Projects that poorly integrate Atlas agents, write ambiguous prompts, or fail to validate AI outputs have measurable quality risks. Including this dimension incentivizes good AI engineering hygiene.

---

## Backwards Compatibility

- Score history is maintained indefinitely with the blueprint_version reference
- Dimension algorithms may be updated — version numbers track algorithm versions
- When algorithms change, a re-score is triggered and delta is noted in history
- Historical scores remain with their original algorithm version tag

---

## Security Considerations

1. **Score Integrity**: Score records are signed to prevent tampering (especially important for compliance reporting)
2. **Benchmark Anonymization**: Project data contributing to benchmarks is fully anonymized
3. **Score Access Control**: Score data is accessible to `blueprint:read` holders; detailed dimension data requires `score:read-detailed`

---

## Performance Implications

| Operation | Expected Duration |
|-----------|-----------------|
| Full project score computation | 2–10 minutes |
| Incremental (PR-triggered) score | 30–90 seconds |
| Score history query (30 days) | < 100ms |
| Recommendation generation | < 5 seconds |
| Benchmark comparison | < 500ms |

---

## Implementation Plan

### Phase 1: Core Scoring Engine (Weeks 1–8)
- [ ] Implement all 8 dimension scoring functions
- [ ] Aggregate score computation
- [ ] Score persistence and history
- [ ] CLI: `atlas score compute`, `atlas score show`

### Phase 2: Recommendations and Trending (Weeks 9–14)
- [ ] Recommendation generation engine
- [ ] Trend analysis algorithms
- [ ] Auto-fix integration for automatable recommendations

### Phase 3: Benchmarks and Agent Integration (Weeks 15–18)
- [ ] Anonymized benchmark data collection pipeline
- [ ] Benchmark comparison API
- [ ] Agent task assignment based on scores

---

## Open Questions

1. **Score for monorepos**: How should the score aggregate across multiple packages in a monorepo? Resolution: per-package scores plus aggregate.
2. **Score for non-code artifacts**: Should Blueprints, Constitutions, and ADRs factor into the score? Deferred to v2.

---

## References

- [RFC-001: Atlas Blueprint Specification](./RFC-001-blueprint-specification.md)
- [SonarQube Technical Debt Metrics](https://docs.sonarqube.org/latest/user-guide/metric-definitions/)
- [DORA Metrics (Accelerate, Forsgren et al.)](https://dora.dev/)
- [OWASP Application Security Verification Standard](https://owasp.org/ASVS/)
- [IEEE 14764: Software Maintenance Standard](https://standards.ieee.org/ieee/14764/3204/)
