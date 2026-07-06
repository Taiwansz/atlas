# Infrastructure Observability Strategy

> **Document Status:** Authoritative Reference  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-06  
> **Owner:** Atlas Infrastructure Ops  

---

## 1. Structured Logging Standard

All Atlas application logs must be emitted in structured **JSON format** directly to `stdout` / `stderr`. This ensures they are parsed efficiently by cluster logging agents (FluentBit, Vector) and routed to central data stores (Loki, Elasticsearch).

### 1.1 JSON Schema Fields

Every log output must contain these standard keys:
- `timestamp`: ISO 8601 UTC representation (`"2026-07-06T01:31:00Z"`).
- `level`: Log level (`"DEBUG"`, `"INFO"`, `"WARN"`, `"ERROR"`, `"FATAL"`).
- `service`: Name of the source service/engine (e.g., `"blueprint-engine"`).
- `trace_id`: The OpenTelemetry trace ID linking the log to a larger trace context.
- `span_id`: The current execution block span.
- `message`: Human-readable text description.
- `context`: Structured key-value object containing domain data (e.g., `"project_id"`, `"user_id"`, `"action"`).

### 1.2 Log Output Example

```json
{
  "timestamp": "2026-07-06T01:31:00.123Z",
  "level": "INFO",
  "service": "blueprint-engine",
  "trace_id": "4bf92f3577b34da6a3ce929d0e0e4736",
  "span_id": "00f067aa0ba902b7",
  "message": "Validated blueprint compilation draft",
  "context": {
    "project_id": "proj_billing_v2",
    "version": 4,
    "duration_ms": 42
  }
}
```

---

## 2. Metrics Architecture (Prometheus)

We collect multi-dimensional metrics across three layers: System infrastructure, Middleware databases, and LLM application domains.

### 2.1 Prometheus Scraping Spec

Microservices expose a `/metrics` HTTP endpoint scraping data in standard Prometheus text format.

### 2.2 Key Metric Definitions

| Metric Name | Type | Description | Alert Threshold |
|-------------|------|-------------|-----------------|
| `atlas_engine_http_requests_total` | Counter | Total HTTP requests processed by engine. | N/A |
| `atlas_engine_http_request_duration_seconds` | Histogram | Request latency bucket. | `p99 > 5.0s` |
| `atlas_kafka_consumer_lag_records` | Gauge | Unconsumed events in Kafka topic partition. | `lag > 500` for > 3min |
| `atlas_neo4j_transaction_duration_ms` | Histogram | Knowledge graph query latency. | `p95 > 200ms` |
| `atlas_llm_request_tokens_total` | Counter | Total prompt & completion tokens consumed. | N/A |
| `atlas_llm_request_cost_usd` | Counter | Running dollar cost of API completions. | Daily budget warning |

---

## 3. Distributed Tracing Architecture (Jaeger)

Trace IDs are passed along all network boundaries (Context Propagation) to enable complete request journey reconstruction.

```
[agy CLI Request] ──(Trace: 4bf92f...)──▶ [API Gateway] ──▶ [Orchestrator]
                                                                │
                                            ┌───────────────────┴───────────────────┐
                                            ▼ (gRPC)                                ▼ (Kafka Event)
                                   [Blueprint Engine]                      [Memory Engine]
```

### 3.1 Propagation Headers
- **HTTP / REST / GraphQL:** W3C Trace Context headers (`traceparent`, `tracestate`).
- **gRPC:** Metadata key-value mappings containing binary trace contexts.
- **Kafka Messages:** Event header attributes containing key-value strings.

---

## 4. Alerting Rules (Prometheus Alertmanager)

Alerting rules are evaluated in Prometheus and routed to Slack and PagerDuty:

```yaml
groups:
  - name: atlas-engine-alerts
    rules:
      # Alert on high 5xx error rates
      - alert: EngineHighErrorRate
        expr: sum(rate(atlas_engine_http_requests_total{status=~"5.."}[5m])) / sum(rate(atlas_engine_http_requests_total[5m])) * 100 > 5
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Engine {{ $labels.service }} has a 5xx rate above 5%"

      # Alert on Kafka processing bottlenecks
      - alert: AsynchronousEventLag
        expr: sum(atlas_kafka_consumer_lag_records) by (topic, consumergroup) > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Consumer group {{ $labels.consumergroup }} is lagging on topic {{ $labels.topic }}"
```
