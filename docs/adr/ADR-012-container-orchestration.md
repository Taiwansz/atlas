# ADR-012: Container Orchestration & Infrastructure Strategy (Kubernetes)

**Date:** 2026-07-06  
**Status:** Accepted  
**Deciders:** Atlas Architecture Council  
**Technical Area:** Cloud Infrastructure / Deployment  

---

## Context and Problem Statement

Atlas is composed of 15 core engines, a web dashboard, an identity provider, relational databases, graph databases, vector indices, and message brokers. Deploying and managing these components manually would lead to inconsistent configurations, service downtime, and poor resource utilization. We need an infrastructure platform that:

1. **Guarantees Scalability:** Automatically scales engines based on request queue sizes (Kafka consumer lag, HTTP request counts).
2. **Handles Orchestration Lifecycle:** Self-healing containers, rolling deployments, and service discovery out-of-the-box.
3. **Supports Cloud-Neutrality:** Runs consistently on AWS (EKS), GCP (GKE), Azure (AKS), or bare-metal servers for enterprise environments.
4. **Isolate Running Agents:** Ephemeral containers must spin up and tear down cleanly to run simulations and code generation jobs safely.

---

## Decision Drivers

- **Deployment Reliability:** High availability (HA) configurations, readiness/liveness checks, and self-healing systems.
- **Operational Consistency:** Declarative Infrastructure-as-Code (IaC) configuration format.
- **Security Isolation:** Support for secure execution boundaries (NetworkPolicies, Pod Security Standards).
- **Ecosystem Maturity:** Access to stable operators for Kafka (Strimzi), Neo4j, and PostgreSQL (CloudNativePG).

---

## Considered Options

### Option 1: Virtual Machines (AWS EC2 / GCP Compute Engine)
- *Description:* Deploy services directly to virtual machines using Ansible or Puppet.
- *Pros:* Simple networking, direct access to system hardware.
- *Cons:* Poor resource density, slow deployments (minutes vs. seconds), high maintenance overhead for system updates, manual self-healing script requirements.

### Option 2: Serverless Container Engines (AWS Fargate / GCP Cloud Run)
- *Description:* Run container workloads without managing underlying VM nodes.
- *Pros:* Zero VM scaling maintenance, pay-per-request pricing.
- *Cons:* Vendor lock-in (AWS/GCP APIs), lacks support for complex stateful clustering (Neo4j, Kafka clusters), networking limitations between services.

### Option 3: Kubernetes (K8s)
- *Description:* Open-source container orchestration platform for automating deployment, scaling, and management.
- *Pros:* Declarative state, industry standard, runs on any cloud or bare-metal, native clustering support for databases/Kafka, auto-scaling horizontal pod autoscaler (HPA).
- *Cons:* High initial setup complexity, requires container operations knowledge.

---

## Decision Outcome

**Option 3 (Kubernetes)** was selected.

### Deployment Architecture:
- **Helm Charts:** Unified configuration maps for installing Atlas modules.
- **DB Operators:** Database services run statefulsets managed by Kubernetes operators (e.g., Strimzi Kafka, Neo4j Helm, CloudNativePG for Postgres).
- **Ingress Controller:** NGINX or Traefik handles external routing, routing SSL requests to the Next.js frontend or GraphQL gateways.
- **Local Dev:** Developers run a lightweight Docker Compose file containing the core database dependencies and engines, replicating the Kubernetes architecture without JVM resource overhead on local laptops.
