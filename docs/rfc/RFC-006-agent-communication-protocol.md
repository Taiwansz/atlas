# RFC-006: Atlas Agent Communication Protocol

**RFC Number:** 006
**Author(s):** Atlas Engineering Team
**Date:** 2026-07-06
**Status:** Final
**Category:** Core

---

## Abstract

This RFC defines the **Atlas Agent Communication Protocol (AACP)** — the specification governing how Atlas agents discover each other, exchange messages, coordinate work, propagate errors, and maintain distributed traces across sessions. AACP provides a consistent, reliable, and observable communication layer that decouples agent implementations from transport details while guaranteeing message delivery semantics, ordering, and traceability.

---

## Motivation

A multi-agent system without a well-defined communication protocol devolves into chaos: agents lose messages, duplicate work, cannot coordinate on shared resources, and produce opaque failure modes that are impossible to debug. Atlas's multi-agent architecture requires:

1. **Reliable message delivery** with at-least-once or exactly-once semantics per use case
2. **Structured message envelopes** that carry identity, context, and routing information
3. **Asynchronous patterns** that don't block agents waiting for slow peers
4. **Event bus** for decoupled pub/sub coordination
5. **Error propagation** that preserves failure context across agent boundaries
6. **State serialization** enabling agent task resumption after restarts
7. **Distributed tracing** across the full multi-agent call graph

### Goals

- Define a canonical message envelope format for all inter-agent communication
- Specify an agent addressing scheme
- Define synchronous (request/response) and asynchronous (fire-and-forget, event) patterns
- Specify the event bus topic structure and subscription model
- Define error propagation semantics across agent boundaries
- Specify agent state serialization for persistence and resumption
- Define distributed tracing integration (OpenTelemetry)

### Non-Goals

- Defining how agents communicate with human users (separate UI protocol)
- Defining MCP tool call protocol (covered in RFC-005)
- Specifying agent scheduling or resource allocation

---

## Specification

### 7.1 Message Envelope Format

Every message exchanged between Atlas agents is wrapped in a standard envelope:

```json
{
  "$schema": "https://atlas.engineering/schemas/message-envelope/v1.json",
  "type": "object",
  "required": [
    "message_id", "version", "type", "sender", "recipient",
    "timestamp", "trace_context", "payload"
  ],
  "properties": {
    "message_id": {
      "type": "string",
      "format": "uuid",
      "description": "Globally unique message identifier (UUIDv7 recommended for sortability)"
    },
    "correlation_id": {
      "type": "string",
      "format": "uuid",
      "description": "Groups related messages (e.g., request/response pair)"
    },
    "causation_id": {
      "type": "string",
      "format": "uuid",
      "description": "message_id that caused this message (causal chain)"
    },
    "version": {
      "type": "string",
      "enum": ["1.0"],
      "description": "Envelope format version"
    },
    "type": {
      "type": "string",
      "enum": [
        "task.request",
        "task.response",
        "task.error",
        "task.progress",
        "task.cancel",
        "event.published",
        "event.ack",
        "agent.register",
        "agent.heartbeat",
        "agent.deregister",
        "memory.write",
        "memory.query",
        "memory.response",
        "orchestration.delegate",
        "orchestration.result",
        "system.ping",
        "system.pong"
      ]
    },
    "sender": { "$ref": "#/$defs/AgentAddress" },
    "recipient": { "$ref": "#/$defs/AgentAddress" },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "UTC timestamp when message was created (ISO 8601)"
    },
    "expires_at": {
      "type": "string",
      "format": "date-time",
      "description": "Message TTL — discard after this time"
    },
    "priority": {
      "type": "string",
      "enum": ["critical", "high", "normal", "low"],
      "default": "normal"
    },
    "trace_context": { "$ref": "#/$defs/TraceContext" },
    "delivery": { "$ref": "#/$defs/DeliveryOptions" },
    "payload": {
      "type": "object",
      "description": "Message-type-specific payload"
    },
    "headers": {
      "type": "object",
      "additionalProperties": { "type": "string" },
      "description": "Extensible key-value headers for custom metadata"
    },
    "signature": {
      "type": "string",
      "description": "HMAC-SHA256 of canonical message (message_id + sender + payload hash)"
    }
  },
  "$defs": {
    "AgentAddress": {
      "type": "object",
      "required": ["agent_id", "project_id"],
      "properties": {
        "agent_id": {
          "type": "string",
          "description": "Unique agent identifier within project scope"
        },
        "project_id": {
          "type": "string",
          "format": "uuid"
        },
        "instance_id": {
          "type": "string",
          "description": "Specific agent instance (for multi-instance agents)"
        },
        "session_id": {
          "type": "string",
          "format": "uuid",
          "description": "Active session identifier"
        },
        "role": {
          "type": "string",
          "description": "Agent role for routing by role (e.g., 'security-agent')"
        }
      }
    },
    "TraceContext": {
      "type": "object",
      "required": ["trace_id", "span_id"],
      "properties": {
        "trace_id": {
          "type": "string",
          "pattern": "^[0-9a-f]{32}$",
          "description": "OpenTelemetry W3C trace ID (128-bit hex)"
        },
        "span_id": {
          "type": "string",
          "pattern": "^[0-9a-f]{16}$",
          "description": "OpenTelemetry W3C span ID (64-bit hex)"
        },
        "parent_span_id": {
          "type": "string",
          "pattern": "^[0-9a-f]{16}$"
        },
        "flags": {
          "type": "integer",
          "description": "W3C trace flags (1=sampled)"
        },
        "baggage": {
          "type": "object",
          "additionalProperties": { "type": "string" },
          "description": "W3C baggage key-value pairs propagated across agents"
        }
      }
    },
    "DeliveryOptions": {
      "type": "object",
      "properties": {
        "semantics": {
          "type": "string",
          "enum": ["at-most-once", "at-least-once", "exactly-once"],
          "default": "at-least-once"
        },
        "max_retries": { "type": "integer", "default": 3 },
        "retry_backoff": {
          "type": "string",
          "enum": ["none", "linear", "exponential"],
          "default": "exponential"
        },
        "require_ack": { "type": "boolean", "default": false },
        "routing_key": { "type": "string", "description": "For topic-based routing" }
      }
    }
  }
}
```

---

### 7.2 Agent Addressing Scheme

#### 7.2.1 Agent URI Format

Every Atlas agent is addressable via a URI:

```
atlas-agent://{project_id}/{agent_id}[/{instance_id}]

Examples:
  atlas-agent://project-abc123/orchestrator
  atlas-agent://project-abc123/backend-agent
  atlas-agent://project-abc123/security-agent/instance-002
```

#### 7.2.2 Addressing Modes

| Mode | Format | Semantics |
|------|--------|-----------|
| Direct | `agent_id` | Route to specific agent by ID |
| Role-based | `role:backend` | Route to any agent with role "backend" |
| Broadcast | `*` | Send to all agents in project |
| Topic | `topic:code.changed` | Event bus topic subscription |
| Orchestrator | `orchestrator` | Special reserved address |

#### 7.2.3 Agent Registry

Agents register on startup and deregister on shutdown:

```python
# Agent registration message
{
  "type": "agent.register",
  "sender": { "agent_id": "backend-agent", "project_id": "proj-123" },
  "recipient": { "agent_id": "orchestrator", "project_id": "proj-123" },
  "payload": {
    "role": "backend",
    "capabilities": ["code-generation", "code-review", "dependency-analysis"],
    "model": "anthropic/claude-opus-4-5",
    "tools": ["filesystem", "git", "postgresql"],
    "memory_namespaces": ["proj-123/backend/*"],
    "max_concurrent_tasks": 3,
    "status": "available",
    "endpoint": "atlas-agent://proj-123/backend-agent",
    "session_id": "session-uuid"
  }
}
```

The orchestrator maintains an **Agent Directory** — an in-memory registry of all active agents with their capabilities and status.

---

### 7.3 Synchronous vs. Asynchronous Communication

#### 7.3.1 Synchronous Request/Response

Used when the caller needs a result before proceeding:

```
Sender                           Recipient
  │                                  │
  │──── task.request (sync) ────────►│
  │                                  │ (execute task)
  │◄─── task.response ───────────────│
  │                                  │
```

**Timeout handling:**
- Default request timeout: 60 seconds
- Task-specific timeouts configurable via `expires_at`
- On timeout: sender receives `task.error` with `code: TIMEOUT`

```python
# Synchronous request example
response = await agent_client.request(
    recipient="security-agent",
    task="scan_for_vulnerabilities",
    payload={"files": ["src/auth.py", "src/api/users.py"]},
    timeout_seconds=120
)
```

#### 7.3.2 Asynchronous Fire-and-Forget

Used for tasks where the sender does not need to wait:

```
Sender                           Recipient
  │                                  │
  │──── task.request (async) ───────►│
  │                                  │ (execute asynchronously)
  │                                  │
  │◄─── task.progress ───────────────│ (optional progress updates)
  │◄─── task.response ───────────────│ (eventual completion)
```

```python
# Asynchronous request
task_id = await agent_client.submit(
    recipient="docs-agent",
    task="update_api_documentation",
    payload={"changed_endpoints": ["/api/v1/users", "/api/v1/auth"]},
    on_progress=handle_progress,  # Optional callback
    on_complete=handle_complete    # Optional callback
)
```

#### 7.3.3 Task Progress Updates

Long-running tasks emit progress updates:

```json
{
  "type": "task.progress",
  "correlation_id": "original-request-id",
  "payload": {
    "progress_percent": 45,
    "current_step": "Analyzing authentication flows",
    "steps_completed": 9,
    "steps_total": 20,
    "eta_seconds": 120,
    "partial_results": {}
  }
}
```

#### 7.3.4 Task Cancellation

Callers can cancel in-flight tasks:

```json
{
  "type": "task.cancel",
  "correlation_id": "task-request-id",
  "payload": {
    "reason": "Superseded by higher-priority task",
    "grace_period_seconds": 5
  }
}
```

Recipients must honor cancellation within `grace_period_seconds` or provide a `task.error` explaining why cancellation is not possible.

---

### 7.4 Event Bus Specification

The Atlas Event Bus is a pub/sub backbone for decoupled agent coordination.

#### 7.4.1 Topic Taxonomy

Topics follow a hierarchical namespace:

```
{project_id}.{domain}.{entity}.{action}

Examples:
  proj-abc.code.file.changed
  proj-abc.code.pr.opened
  proj-abc.code.pr.merged
  proj-abc.blueprint.updated
  proj-abc.constitution.amended
  proj-abc.memory.consolidated
  proj-abc.score.computed
  proj-abc.agent.task.completed
  proj-abc.agent.error.critical
  proj-abc.deployment.started
  proj-abc.deployment.completed
  proj-abc.deployment.failed
  proj-abc.incident.created
  proj-abc.incident.resolved
```

#### 7.4.2 Standard System Events

| Topic | Published By | Consumed By | Description |
|-------|-------------|-------------|-------------|
| `*.code.file.changed` | Git webhook | All agents | File in project changed |
| `*.code.pr.opened` | Git webhook | reviewer-agent, qa-agent | PR opened |
| `*.code.pr.merged` | Git webhook | All agents | PR merged to main |
| `*.blueprint.updated` | Orchestrator | All agents | Blueprint changed |
| `*.memory.consolidated` | Memory system | Orchestrator | Memory consolidation complete |
| `*.score.computed` | Score engine | Orchestrator, all agents | New Engineering Score available |
| `*.agent.error.critical` | Any agent | Orchestrator, monitoring | Critical error occurred |

#### 7.4.3 Event Envelope

Events published to the bus use the standard message envelope with `type: "event.published"`:

```json
{
  "type": "event.published",
  "sender": { "agent_id": "orchestrator", "project_id": "proj-abc" },
  "recipient": { "agent_id": "topic:proj-abc.code.pr.merged" },
  "payload": {
    "topic": "proj-abc.code.pr.merged",
    "data": {
      "pr_number": 142,
      "branch": "feature/auth-refresh",
      "author": "backend-agent",
      "files_changed": 23,
      "additions": 456,
      "deletions": 89,
      "merged_at": "2026-07-06T12:00:00Z"
    },
    "schema_version": "1"
  }
}
```

#### 7.4.4 Subscription Management

```python
# Agent subscribes to events
await event_bus.subscribe(
    agent_id="security-agent",
    topics=[
        "proj-abc.code.pr.opened",
        "proj-abc.code.file.changed"
    ],
    handler=handle_code_change_event,
    filter=EventFilter(
        files_match="*.py|*.js|*.ts",  # Only trigger for these file types
        author_not="security-agent"     # Don't process own changes
    )
)

# Agent publishes an event
await event_bus.publish(
    topic="proj-abc.score.computed",
    data={"composite": 782, "grade": "B", "delta": +12}
)
```

#### 7.4.5 Event Ordering and Delivery Guarantees

| Scenario | Ordering | Delivery |
|---------|---------|---------|
| Single topic, single consumer | FIFO | At-least-once |
| Single topic, multiple consumers | Per-consumer FIFO | At-least-once |
| Multiple topics | No cross-topic ordering guarantee | At-least-once |
| Critical events | FIFO preserved | Exactly-once (idempotency key) |

---

### 7.5 Error Propagation Between Agents

#### 7.5.1 Error Envelope

Errors are propagated using `task.error` messages:

```json
{
  "type": "task.error",
  "correlation_id": "original-request-id",
  "payload": {
    "error": {
      "code": "CONSTITUTION_VIOLATION",
      "message": "Task rejected: attempted to write to production database without approval",
      "category": "security",
      "severity": "critical",
      "detail": {
        "violated_rule": "PROH-001",
        "attempted_action": "INSERT INTO users ...",
        "environment": "production"
      },
      "stack": [],
      "agent_id": "backend-agent",
      "timestamp": "2026-07-06T12:00:00Z"
    },
    "partial_results": null,
    "recoverable": false,
    "retry_after_seconds": null,
    "remediation": {
      "steps": [
        "Request human approval for production database write",
        "Use staging environment for testing",
        "Submit task to orchestrator with production-approval flag"
      ],
      "documentation": "https://atlas.engineering/docs/production-access"
    }
  }
}
```

#### 7.5.2 Error Categories

| Category | Code Prefix | Description | Recovery |
|----------|-------------|-------------|---------|
| `auth` | AUTH_* | Authentication/authorization failure | Re-authenticate |
| `security` | SEC_* | Constitution or security policy violation | Human review |
| `validation` | VAL_* | Input schema or semantic validation failure | Fix input |
| `capacity` | CAP_* | Resource limit exceeded | Wait or scale |
| `timeout` | TIMEOUT_* | Operation exceeded time limit | Retry with longer timeout |
| `dependency` | DEP_* | External dependency failure | Retry or fallback |
| `conflict` | CONF_* | Conflicting concurrent operations | Resolve conflict |
| `internal` | INT_* | Agent internal error | Retry or escalate |

#### 7.5.3 Error Propagation Chain

When an error occurs, it propagates up the delegation chain:

```
Orchestrator
   └─ delegates to Backend Agent
          └─ delegates to Security Scanner
                 └─ ERROR: CVE database unreachable (DEP_001)
                           ↑ propagated to Backend Agent
                           ↑ propagated to Orchestrator
                           └─ Orchestrator: retry with fallback scanner
```

Error messages include `causation_id` to reconstruct the propagation chain.

#### 7.5.4 Error Handling Strategies

```python
class AgentErrorHandler:
    async def handle(self, error: AgentError, context: TaskContext) -> ErrorAction:
        if error.code.startswith("TIMEOUT"):
            if context.retry_count < 3:
                return ErrorAction.RETRY(delay_seconds=2 ** context.retry_count)
            return ErrorAction.ESCALATE_TO_ORCHESTRATOR

        elif error.code.startswith("SEC"):
            # Security violations are never retried — always escalate
            return ErrorAction.ESCALATE_IMMEDIATELY(notify_human=True)

        elif error.code.startswith("DEP"):
            fallback = self.find_fallback(error.context.service)
            if fallback:
                return ErrorAction.RETRY_WITH_FALLBACK(fallback)
            return ErrorAction.ESCALATE_TO_ORCHESTRATOR

        elif error.code.startswith("VAL"):
            corrected = await self.attempt_auto_correction(error)
            if corrected:
                return ErrorAction.RETRY_WITH_CORRECTION(corrected)
            return ErrorAction.FAIL_TASK(error)

        return ErrorAction.ESCALATE_TO_ORCHESTRATOR
```

---

### 7.6 Agent State Serialization

#### 7.6.1 State Snapshot Format

Agents persist state snapshots to enable task resumption after restarts:

```json
{
  "snapshot_id": "snap-uuid",
  "agent_id": "backend-agent",
  "project_id": "proj-abc",
  "session_id": "session-uuid",
  "created_at": "2026-07-06T12:00:00Z",
  "checkpoint_reason": "task_pause",
  "task_context": {
    "task_id": "task-uuid",
    "task_type": "code-generation",
    "task_input": {
      "component": "user-service",
      "feature": "password-reset"
    },
    "status": "in_progress",
    "progress_percent": 60,
    "current_step": "Generating email service integration",
    "steps_completed": [
      "user_service_router",
      "token_generation",
      "database_schema"
    ],
    "steps_remaining": [
      "email_integration",
      "rate_limiting",
      "tests"
    ]
  },
  "conversation_state": {
    "messages": [],
    "total_tokens_used": 45231,
    "context_window_used_percent": 62
  },
  "artifacts_produced": [
    {
      "path": "src/user-service/routes/password_reset.py",
      "status": "committed",
      "commit_sha": "abc123"
    },
    {
      "path": "src/user-service/services/token.py",
      "status": "staged"
    }
  ],
  "memory_writes": [
    "mem-uuid-1",
    "mem-uuid-2"
  ],
  "pending_tool_calls": [],
  "error_history": []
}
```

#### 7.6.2 Snapshot Triggers

| Event | Snapshot Type | Retention |
|-------|-------------|---------|
| Task pause (human intervention) | Full snapshot | Until task completes |
| Periodic (every 5 minutes for long tasks) | Incremental | 24 hours |
| Context window approaching limit (90%) | Full snapshot | 24 hours |
| Agent graceful shutdown | Full snapshot | 48 hours |
| Error before recovery attempt | Error snapshot | 7 days |

#### 7.6.3 Task Resumption

```python
async def resume_task(snapshot_id: str, agent: Agent) -> TaskResult:
    snapshot = await snapshot_store.load(snapshot_id)

    # Validate snapshot is still valid
    if snapshot.is_expired():
        raise SnapshotExpiredError(f"Snapshot {snapshot_id} has expired")

    # Reconstruct conversation state
    agent.restore_conversation(snapshot.conversation_state)

    # Re-verify artifacts
    for artifact in snapshot.artifacts_produced:
        if artifact.status == "staged" and not Path(artifact.path).exists():
            await agent.regenerate_artifact(artifact, snapshot.task_context)

    # Resume from checkpoint
    return await agent.continue_task(
        task_context=snapshot.task_context,
        starting_step=snapshot.task_context.steps_remaining[0]
    )
```

---

### 7.7 Distributed Tracing Across Agents

Atlas implements OpenTelemetry-compatible distributed tracing for the full multi-agent call graph.

#### 7.7.1 Trace Propagation

Every message carries W3C TraceContext (`trace_id`, `span_id`) in the `trace_context` field. When an agent receives a message and creates child spans, it uses the received `span_id` as `parent_span_id`:

```
Orchestrator (trace_id: abc, span_id: 0001)
   │ delegates task
   ├─► Backend Agent (trace_id: abc, span_id: 0002, parent: 0001)
   │     │ requests memory query
   │     ├─► Memory System (trace_id: abc, span_id: 0003, parent: 0002)
   │     │     └─ memory.response (span_id: 0004, parent: 0003)
   │     │ calls MCP tool
   │     └─► Filesystem MCP (trace_id: abc, span_id: 0005, parent: 0002)
   └─► Security Agent (trace_id: abc, span_id: 0006, parent: 0001)
```

All spans share the same `trace_id`, enabling reconstruction of the full execution tree.

#### 7.7.2 Span Attributes

Atlas enriches spans with agent-specific attributes:

```python
# Standard span attributes
span.set_attributes({
    # Standard OTel
    "service.name": "atlas-agent",
    "service.version": atlas_version,

    # Atlas-specific
    "atlas.agent.id": agent.id,
    "atlas.agent.role": agent.role,
    "atlas.agent.model": agent.model,
    "atlas.project.id": project.id,
    "atlas.task.id": task.id,
    "atlas.task.type": task.type,
    "atlas.session.id": session.id,
    "atlas.message.id": message.id,
    "atlas.tokens.input": tokens_input,
    "atlas.tokens.output": tokens_output,
    "atlas.constitution.checked": constitution_checked,
    "atlas.memory.reads": memory_read_count,
    "atlas.mcp.tools_called": mcp_calls
})
```

#### 7.7.3 Trace Export

Traces are exported to:
- **Jaeger** (self-hosted, default for development)
- **Tempo** (Grafana stack)
- **Datadog APM** (enterprise)
- **Google Cloud Trace** (GCP deployments)

```yaml
# Atlas telemetry configuration
telemetry:
  traces:
    exporter: jaeger
    endpoint: "http://jaeger:4317"
    sampling_rate: 1.0    # 100% for development; 10% for production
  metrics:
    exporter: prometheus
    endpoint: "http://prometheus:9090/api/v1/write"
  logs:
    exporter: loki
    endpoint: "http://loki:3100/loki/api/v1/push"
```

#### 7.7.4 Baggage Propagation

Critical context is propagated via W3C baggage across the full trace:

```python
# Baggage set by orchestrator, visible to all downstream agents
baggage = {
    "atlas.project.id": project.id,
    "atlas.blueprint.version": str(blueprint.version),
    "atlas.constitution.version": str(constitution.version),
    "atlas.user.id": user.id,  # Human who initiated the work
    "atlas.task.priority": task.priority
}
```

---

### 7.8 Transport Layer

#### 7.8.1 Supported Transports

| Transport | Use Case | Protocol |
|-----------|---------|---------|
| In-process | Same-process agent communication | Direct function call |
| NATS JetStream | Multi-process, single-host | NATS Core |
| NATS JetStream + KV | Multi-host, distributed | NATS Cluster |
| Apache Kafka | High-throughput event streaming | Kafka Protocol |
| Redis Streams | Lightweight, single-host | Redis RESP |
| HTTP/2 + gRPC | Synchronous cross-network | gRPC |

Atlas abstracts over transports via the `MessageBroker` interface:

```python
class MessageBroker(Protocol):
    async def publish(self, message: MessageEnvelope) -> None: ...
    async def subscribe(self, topic: str, handler: MessageHandler) -> Subscription: ...
    async def request(self, message: MessageEnvelope, timeout: float) -> MessageEnvelope: ...
    async def acknowledge(self, message_id: str) -> None: ...
```

#### 7.8.2 Message Size Limits

| Transport | Max Message Size | Recommendation |
|-----------|-----------------|---------------|
| NATS | 8 MB (default) | Use reference pointers for payloads > 1 MB |
| Kafka | 1 MB (default) | Large artifacts stored in object store, referenced |
| Redis | 512 MB | Practical limit: 1 MB |
| gRPC | 4 MB (default) | Streaming for larger responses |

Large payloads (> 256KB) should be stored in the Atlas artifact store with a reference pointer in the message:

```json
{
  "payload": {
    "artifact_ref": "atlas://artifacts/proj-abc/gen-code-uuid",
    "artifact_type": "generated_code",
    "artifact_size_bytes": 524288,
    "artifact_checksum": "sha256:abc123..."
  }
}
```

---

### 7.9 Agent Heartbeat and Presence

Active agents send heartbeats every 30 seconds:

```json
{
  "type": "agent.heartbeat",
  "sender": { "agent_id": "backend-agent", "project_id": "proj-abc" },
  "recipient": { "agent_id": "orchestrator", "project_id": "proj-abc" },
  "payload": {
    "status": "busy",
    "current_task_id": "task-uuid",
    "current_task_progress": 45,
    "tokens_used_this_session": 123456,
    "memory_reads_this_session": 89,
    "mcp_calls_this_session": 23,
    "uptime_seconds": 3600,
    "load": {
      "active_tasks": 1,
      "queued_tasks": 2,
      "max_concurrent_tasks": 3
    }
  }
}
```

Agents missing two consecutive heartbeats (> 60s) are marked `degraded`; missing five consecutive (> 150s) triggers `deregister` and task reassignment.

---

## Rationale

### Why use UUIDv7 for message IDs?

UUIDv7 is time-ordered, meaning messages can be sorted by ID without a separate timestamp field. This simplifies database indexing and enables efficient range queries for message history. UUIDv4 requires secondary timestamp indexes for time-ordered access.

### Why NATS JetStream as default transport?

NATS JetStream provides at-least-once delivery, consumer groups, message replay, and key-value store in a single, lightweight server. It's significantly simpler to operate than Kafka for small-to-medium Atlas deployments while supporting larger deployments via NATS cluster mode.

### Why embed W3C TraceContext in the envelope vs. HTTP headers?

MCP tool calls, NATS messages, and direct function calls don't have HTTP headers. Embedding trace context in the message envelope ensures trace propagation works uniformly across all transport types.

---

## Backwards Compatibility

- Envelope format versioned — agents should accept messages with `version` fields they don't recognize (forward compatibility)
- Agent addressing URIs are stable
- Topic taxonomy changes follow a deprecation period of two Atlas OS major versions

---

## Security Considerations

1. **Message Authentication**: All messages are HMAC-signed with agent-specific keys; recipients validate signatures
2. **Replay Protection**: `message_id` (UUIDv7) + `expires_at` prevent replay attacks
3. **Encryption in Transit**: All inter-agent messages are TLS-encrypted at the transport layer
4. **Agent Identity**: Agents authenticate to the broker using mTLS client certificates
5. **Payload Sanitization**: Payloads received by agents are validated against schemas before processing

---

## Performance Implications

| Operation | Expected Latency |
|-----------|-----------------|
| In-process message dispatch | < 1ms |
| NATS publish | < 5ms |
| NATS request/response (local) | < 10ms |
| gRPC synchronous call | < 20ms |
| Distributed trace export | < 5ms (async, non-blocking) |
| Agent heartbeat | < 10ms |
| State snapshot write | < 50ms |

**Throughput targets:**
- 10,000 messages/second per project (NATS transport)
- 100,000 events/second per project (Kafka transport)

---

## Implementation Plan

### Phase 1: Core Protocol (Weeks 1–6)
- [ ] Message envelope schema + validator
- [ ] NATS JetStream transport implementation
- [ ] Agent registry (registration/heartbeat/deregistration)
- [ ] Synchronous request/response

### Phase 2: Event Bus and Async (Weeks 7–12)
- [ ] Event bus topic implementation
- [ ] Async task submission with progress
- [ ] Task cancellation
- [ ] Error propagation engine

### Phase 3: Tracing and State (Weeks 13–18)
- [ ] OpenTelemetry integration
- [ ] Span attribute enrichment
- [ ] State snapshot implementation
- [ ] Task resumption engine

### Phase 4: Advanced Transport (Weeks 19–22)
- [ ] Kafka transport adapter
- [ ] gRPC transport adapter
- [ ] Large payload artifact store integration

---

## Open Questions

1. **Message ordering across topics**: Should Atlas guarantee cross-topic event ordering for related events (e.g., `pr.opened` always before `pr.merged`)? Current: no cross-topic ordering, use `causation_id` for dependency.
2. **Agent federation**: Should agents from different Atlas projects communicate? Deferred to v3.

---

## References

- [RFC-001: Atlas Blueprint Specification](./RFC-001-blueprint-specification.md)
- [RFC-005: MCP Discovery Protocol](./RFC-005-mcp-discovery-protocol.md)
- [W3C Trace Context Specification](https://www.w3.org/TR/trace-context/)
- [OpenTelemetry Specification](https://opentelemetry.io/docs/specs/otel/)
- [NATS JetStream Documentation](https://docs.nats.io/nats-concepts/jetstream)
- [CloudEvents Specification v1.0](https://cloudevents.io/)
- [UUIDv7 Draft Specification](https://www.ietf.org/archive/id/draft-peabody-dispatch-new-uuid-format-04.txt)
