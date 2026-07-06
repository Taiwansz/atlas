# ADR-011: Event Broker and Messaging Infrastructure Selection (Apache Kafka)

**Date:** 2026-07-06  
**Status:** Accepted  
**Deciders:** Atlas Architecture Council  
**Technical Area:** Messaging / Asynchronous Architecture  

---

## Context and Problem Statement

Atlas relies on loose coupling between its 15 core engines. When a user runs a requirement discovery dialogue, this process emits data that the Blueprint Engine, the Memory Engine, and the Audit Engine must process. If these interactions were synchronous, a single slow service or network hiccup would crash the workflow. We require an asynchronous messaging system that supports:

1. **High-Throughput Streaming:** Processing hundreds of events per second during large multi-agent builds.
2. **Message Durability & Replayability:** The Project Memory Engine reconstructs project historical state by replaying past events. The broker must act as a persistent commit log.
3. **Guaranteed Delivery Semantics:** At-least-once delivery is required to ensure no critical architectural decisions or test results are dropped.
4. **Consumer Groups & Scaling:** Scaling worker instances dynamically to process heavy workloads (e.g., executing several parallel simulations).

---

## Decision Drivers

- **Event Sourcing Suitability:** Broker must persist messages on disk with configurable retention times.
- **Scalability:** Horizontal scaling via partition models.
- **Protocol Maturity:** High-quality clients for Node.js (TypeScript) and Python.
- **Operational Complexity:** Setup, cluster management, and monitoring overhead.

---

## Considered Options

### Option 1: RabbitMQ (AMQP Protocol)
- *Description:* Traditional message broker routing messages through exchanges to queues.
- *Pros:* Extremely low latency, rich routing capabilities, easy setup.
- *Cons:* Messages are removed from the queue after consumption (no native replay/event sourcing support without plugins), scaling queues horizontally under high load is challenging.

### Option 2: Redis Pub/Sub
- *Description:* In-memory message routing system.
- *Pros:* Incredibly fast, zero extra infrastructure (Redis is already used for caching).
- *Cons:* Lack of durability. If a subscriber is offline, they miss the event. Not suitable for event-sourcing or mission-critical workflows.

### Option 3: Apache Kafka (or Redpanda)
- *Description:* Distributed, partitioned commit-log event streaming platform.
- *Pros:* High throughput, native event log persistence (durability), consumer groups with independent offsets, perfect for event sourcing.
- *Cons:* Heavy resource footprint (JVM, ZooKeeper or KRaft metadata management), steep learning curve.

---

## Decision Outcome

**Option 3 (Apache Kafka)** was selected.

### Implementation Protocol:
- **Broker Infrastructure:** Kubernetes deployment using Strimzi Kafka Operator (using KRaft mode to eliminate ZooKeeper dependencies).
- **Serialization:** Protobuf schemas enforce type safety across publishers and consumers.
- **Consumer Strategy:** Engines subscribe using consumer groups. If an engine container crashes, Kubernetes scales a new pod, which resumes consumption from the last committed offset.
