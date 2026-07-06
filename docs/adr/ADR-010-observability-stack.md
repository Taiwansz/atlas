# ADR-010: Observability Stack (OpenTelemetry, Prometheus, Jaeger, and Grafana)

**Date:** 2026-07-06  
**Status:** Accepted  
**Deciders:** Atlas Architecture Council  
**Technical Area:** Observability / Operations  

---

## Context and Problem Statement

Atlas is a distributed Engineering OS with asynchronous, multi-agent pipelines. When an agent fails or an engine takes 10 seconds to generate a response, engineers need tools to pinpoint exactly where the delay or error occurred. We must:

1. **Correlate Telemetry:** Link CLI calls, GraphQL requests, Kafka events, internal gRPC calls, and LLM completions together using a single request context ID.
2. **Collect Multi-Dimensional Metrics:** Gather performance stats (system CPU/memory, Kafka queue sizes, Neo4j transaction delays, and LLM token usage).
3. **Trace Agent State Cycles:** Trace when agents go to sleep, wake up, branch execution, or call tools.
4. **Avoid Vendor Lock-in:** Ensure the system telemetry can target Datadog, Honeycomb, or self-hosted stacks without code updates.

---

## Decision Drivers

- **Telemetry Completeness:** Support for traces, logs, and metrics (the three pillars of observability).
- **Standards-Driven:** Vendor neutrality is essential for enterprise on-premises flexibility.
- **Low Performance Overhead:** Telemetry gathering must not impact engine performance.
- **Context Propagation:** Automatic context propagation across HTTP, gRPC, and Kafka event boundaries.

---

## Considered Options

### Option 1: Proprietary APM SDKs (Datadog / New Relic)
- *Description:* Install closed-source agents and SDKs directly in our monorepo apps.
- *Pros:* Zero-configuration dashboards, rich auto-instrumentation, excellent tracing.
- *Cons:* Severe vendor lock-in, high commercial licensing cost, incompatible with open-source self-hosting configurations.

### Option 2: OpenTelemetry (OTel) + Open-Source Storage Backend
- *Description:* Instrument services with OTel libraries. Route data through the OTel Collector to Prometheus (metrics) and Jaeger/Tempo (traces), with Grafana as the dashboard portal.
- *Pros:* Fully open source, vendor neutral, standard industry integration, self-hostable in K8s, customizable tracing contexts.
- *Cons:* Requires infrastructure administration, dashboard setups, and storage retention configuration.

---

## Decision Outcome

**Option 2 (OpenTelemetry & Open-Source Stack)** was selected.

### Architecture Specifications:
1. **OTel Instrumentations:** Node.js and Python engines include OTel auto-instrumentation packages.
2. **Distributed Trace Propagation:** Trace IDs are injected into gRPC metadata (`MetadataCarrier`) and Kafka event header bags.
3. **OTel Collector:** A collector agent runs inside the K8s cluster, receiving traces and metrics over OLTP (OpenTelemetry Protocol) and writing them to storage (Jaeger for traces, Prometheus for metrics).
4. **Visualizations:** Unified Grafana dashboards monitor engine memory usage, Kafka offsets, database health, and API latency.
