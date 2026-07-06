# RFC-005: Atlas MCP Discovery Protocol

**RFC Number:** 005
**Author(s):** Atlas Engineering Team
**Date:** 2026-07-06
**Status:** Final
**Category:** Integration

---

## Abstract

This RFC specifies the **Atlas MCP (Model Context Protocol) Discovery Protocol** — the system by which Atlas agents automatically discover, evaluate, register, monitor, and route to MCP servers that extend agent capabilities with tools. The protocol defines the MCP server registry schema, discovery mechanisms, health monitoring, capability negotiation, security sandboxing, routing and load balancing, and versioning. The goal is a self-healing, self-configuring tool ecosystem that agents can rely on without manual configuration.

---

## Motivation

The MCP ecosystem is rapidly expanding, with hundreds of community-contributed servers providing tools ranging from database access to code execution to external API integrations. Manually configuring which MCP servers an agent can use is error-prone, brittle, and doesn't scale. Atlas needs an intelligent discovery layer that:

1. **Automatically finds** available MCP servers across local, registry, and marketplace sources
2. **Evaluates** servers for compatibility, security, and capability match
3. **Registers** servers with appropriate metadata for agent routing
4. **Monitors** server health and withdraws failing servers from routing
5. **Negotiates** capabilities to ensure agents receive what they expect
6. **Sandboxes** MCP servers to prevent unauthorized access

### Goals

- Define a canonical MCP server registry schema
- Specify discovery mechanisms for local, npm, and marketplace sources
- Define health monitoring protocols with automatic failover
- Specify capability negotiation between agents and servers
- Define security sandboxing requirements for MCP server execution
- Design routing and load balancing for multi-instance servers
- Specify server versioning and upgrade management

### Non-Goals

- Implementing the MCP protocol itself (defined by Anthropic/community)
- Providing a public MCP marketplace (infrastructure, not protocol)
- Agent-to-agent communication (covered in RFC-006)

---

## Specification

### 6.1 MCP Server Registry Schema

The Atlas MCP registry stores metadata about every known and configured MCP server:

```json
{
  "$schema": "https://atlas.engineering/schemas/mcp-registry/v1.json",
  "title": "MCPServerRegistryEntry",
  "type": "object",
  "required": ["id", "name", "version", "transport", "capabilities", "source", "status"],
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "Unique registry entry identifier"
    },
    "name": {
      "type": "string",
      "pattern": "^[a-z0-9-]+(/[a-z0-9-]+)?$",
      "description": "Server name (e.g., 'filesystem', 'github/mcp-server')"
    },
    "display_name": { "type": "string" },
    "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+(-[a-z0-9.]+)?$" },
    "description": { "type": "string", "maxLength": 1024 },
    "homepage": { "type": "string", "format": "uri" },
    "license": { "type": "string" },
    "author": { "type": "string" },
    "source": {
      "type": "object",
      "required": ["type", "location"],
      "properties": {
        "type": {
          "type": "string",
          "enum": ["local", "npm", "github", "docker", "atlas-marketplace", "http"]
        },
        "location": { "type": "string" },
        "checksum": { "type": "string", "description": "SHA-256 of server package" },
        "verified": { "type": "boolean" }
      }
    },
    "transport": {
      "type": "object",
      "required": ["type"],
      "properties": {
        "type": { "type": "string", "enum": ["stdio", "http", "sse", "websocket"] },
        "command": { "type": "string", "description": "For stdio transport" },
        "args": { "type": "array", "items": { "type": "string" } },
        "env": { "type": "object", "additionalProperties": { "type": "string" } },
        "url": { "type": "string", "format": "uri", "description": "For HTTP/SSE/WebSocket" },
        "timeout_seconds": { "type": "integer", "default": 30 }
      }
    },
    "capabilities": {
      "type": "object",
      "properties": {
        "tools": {
          "type": "array",
          "items": {
            "type": "object",
            "required": ["name", "description"],
            "properties": {
              "name": { "type": "string" },
              "description": { "type": "string" },
              "input_schema": { "type": "object" },
              "destructive": { "type": "boolean", "default": false },
              "requires_approval": { "type": "boolean", "default": false },
              "idempotent": { "type": "boolean" },
              "rate_limit_per_minute": { "type": "integer" }
            }
          }
        },
        "resources": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "uri_template": { "type": "string" },
              "name": { "type": "string" },
              "description": { "type": "string" },
              "mime_types": { "type": "array", "items": { "type": "string" } }
            }
          }
        },
        "prompts": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": { "type": "string" },
              "description": { "type": "string" },
              "arguments": { "type": "array" }
            }
          }
        }
      }
    },
    "security": {
      "type": "object",
      "properties": {
        "sandbox_level": {
          "type": "string",
          "enum": ["none", "process", "container", "vm"],
          "default": "process"
        },
        "network_access": {
          "type": "string",
          "enum": ["none", "localhost", "allowlist", "unrestricted"],
          "default": "allowlist"
        },
        "allowed_domains": { "type": "array", "items": { "type": "string" } },
        "filesystem_access": {
          "type": "string",
          "enum": ["none", "readonly", "workspace-only", "unrestricted"],
          "default": "workspace-only"
        },
        "secret_access": { "type": "boolean", "default": false },
        "audit_all_calls": { "type": "boolean", "default": true },
        "requires_approval_for_destructive": { "type": "boolean", "default": true }
      }
    },
    "resource_limits": {
      "type": "object",
      "properties": {
        "max_memory_mb": { "type": "integer", "default": 512 },
        "max_cpu_percent": { "type": "integer", "default": 50 },
        "max_execution_seconds": { "type": "integer", "default": 60 },
        "max_concurrent_calls": { "type": "integer", "default": 10 }
      }
    },
    "health": {
      "type": "object",
      "properties": {
        "status": { "type": "string", "enum": ["healthy", "degraded", "unhealthy", "unknown"] },
        "last_check_at": { "type": "string", "format": "date-time" },
        "uptime_percent_30d": { "type": "number" },
        "avg_response_ms": { "type": "number" },
        "error_rate_1h": { "type": "number" },
        "consecutive_failures": { "type": "integer" }
      }
    },
    "metadata": {
      "type": "object",
      "properties": {
        "registered_at": { "type": "string", "format": "date-time" },
        "updated_at": { "type": "string", "format": "date-time" },
        "discovery_source": { "type": "string" },
        "tags": { "type": "array", "items": { "type": "string" } },
        "use_count_7d": { "type": "integer" },
        "avg_latency_ms": { "type": "number" },
        "project_scope": { "type": "string", "description": "Null = global; project-id = project-scoped" }
      }
    },
    "status": {
      "type": "string",
      "enum": ["active", "inactive", "deprecated", "blocked", "pending-review"]
    }
  }
}
```

---

### 6.2 Discovery Mechanisms

Atlas performs MCP discovery through four mechanisms, executed in priority order:

```
Discovery Priority:
1. Project-declared (atlas.blueprint.yaml agents section)  ← Highest priority
2. Organization registry (shared across projects)
3. Local filesystem scan
4. npm registry scan
5. Atlas Marketplace                                        ← Lowest priority
```

#### 6.2.1 Blueprint-Declared Servers

Servers declared directly in the Blueprint are always registered:

```yaml
# atlas.blueprint.yaml
agents:
  specialists:
    - id: backend-agent
      tools:
        - "@modelcontextprotocol/server-filesystem"
        - "@atlas/mcp-postgresql"
        - "custom/internal-api-client"
```

Atlas resolves tool names to registry entries using the tool resolution order above.

#### 6.2.2 Local Filesystem Discovery

Atlas scans for MCP server configuration files in standard locations:

```bash
# Discovery scan locations (in order)
~/.atlas/mcp-servers/                    # User-global servers
<project-root>/.atlas/mcp-servers/       # Project-local servers
<project-root>/mcp.json                  # Standard MCP config file
<project-root>/.cursor/mcp.json          # IDE config (imported)
```

Local server manifest format:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/workspace"],
      "env": {}
    },
    "custom-db": {
      "command": "python",
      "args": ["-m", "my_mcp_server"],
      "env": {
        "DATABASE_URL": "$DATABASE_URL"
      }
    }
  }
}
```

Atlas reads this file and creates registry entries with `source.type = "local"`.

#### 6.2.3 npm Registry Discovery

Atlas queries the npm registry for published MCP servers. Discovery uses the npm search API filtered by the `mcp-server` keyword:

```bash
# npm discovery query
GET https://registry.npmjs.org/-/v1/search?text=keywords:mcp-server&size=250

# Result filtering
- Package must have "mcp-server" keyword
- Package must export `start`, `stdio`, or `http` entry point
- Package must have been published within 2 years
- Package must have >= 10 weekly downloads (anti-spam)
```

Atlas indexes discovered npm packages nightly and validates each package against the MCP server manifest standard before adding to the registry.

#### 6.2.4 Atlas Marketplace

The Atlas Marketplace is a curated registry of reviewed MCP servers:

```
GET https://marketplace.atlas.engineering/api/v1/servers
  ?category=database|filesystem|api|code|communication
  &verified=true
  &sort=downloads
```

Marketplace servers carry:
- **Verified badge**: Server code has been reviewed by Atlas team
- **Security rating**: A–F based on capability and sandbox requirements
- **Compatibility matrix**: Tested Atlas versions
- **Usage statistics**: Download count and active installations

#### 6.2.5 Discovery Daemon

```python
class MCPDiscoveryDaemon:
    """Continuously discovers and registers MCP servers."""

    def __init__(self, config: DiscoveryConfig):
        self.registry = MCPRegistry()
        self.scanners = [
            LocalFilesystemScanner(config.scan_paths),
            NpmRegistryScanner(config.npm_config),
            MarketplaceScanner(config.marketplace_url),
        ]
        self.scan_interval_seconds = config.scan_interval or 3600  # 1 hour

    async def run(self):
        while True:
            for scanner in self.scanners:
                discovered = await scanner.scan()
                for server in discovered:
                    await self.process_discovered_server(server)
            await asyncio.sleep(self.scan_interval_seconds)

    async def process_discovered_server(self, server: DiscoveredServer):
        existing = self.registry.find_by_name(server.name, server.version)
        if existing is None:
            validated = await self.validate_server(server)
            if validated:
                await self.registry.register(server)
                log.info(f"Registered new MCP server: {server.name}@{server.version}")
        elif existing.needs_update(server):
            await self.registry.update(existing.id, server)
```

---

### 6.3 Server Health Monitoring

#### 6.3.1 Health Check Protocol

All active MCP servers are health-checked on a configurable interval:

```
Health Check Interval:
  - Default: 60 seconds for active servers
  - Degraded: 30 seconds for servers with recent errors
  - Unhealthy: 5 minutes (backoff) for failed servers

Health Check Method:
  - stdio: Send "ping" MCP message, expect "pong" within timeout
  - http: GET /health or OPTIONS /, expect 2xx within timeout
  - Custom: configured health_check_command
```

#### 6.3.2 Health State Machine

```
                    ┌──────────┐
                    │ UNKNOWN  │ ← New server, not yet checked
                    └────┬─────┘
                         │ First check passes
                         ▼
              ┌──────────────────┐
      ┌──────►│    HEALTHY        │◄──────┐
      │       └────────┬──────────┘       │
      │                │                  │
      │         Error or slow             │
      │                ▼                  │
      │       ┌──────────────────┐        │
      │       │    DEGRADED       │        │
      │       └────────┬──────────┘        │
      │                │                  │
      │      3 consecutive failures       │
      │                ▼                  │
      │       ┌──────────────────┐        │
      └───────│   UNHEALTHY       │        │
              └────────┬──────────┘        │
                       │                  │
                5 minutes, then retry ────┘
```

#### 6.3.3 Health Metrics

```python
@dataclass
class ServerHealthMetrics:
    server_id: str
    status: str  # healthy | degraded | unhealthy | unknown
    last_check_at: datetime
    response_time_ms: float
    consecutive_failures: int
    uptime_percent_1h: float
    uptime_percent_24h: float
    uptime_percent_30d: float
    error_rate_1h: float      # Errors / total calls
    calls_1h: int
    p50_latency_ms: float
    p99_latency_ms: float
```

#### 6.3.4 Automatic Failover

When a server transitions to UNHEALTHY:
1. Server is removed from active routing pool immediately
2. All in-flight requests to that server are gracefully terminated
3. Pending requests are re-routed to alternate servers (if available)
4. Alerts sent to project operators
5. Background retry attempts scheduled with exponential backoff

---

### 6.4 Capability Negotiation

When an agent requests a tool, Atlas performs capability negotiation:

```
Agent requests tool: "read_file"
          │
          ▼
Registry Lookup: find all servers offering "read_file"
          │
          ▼
Capability Match:
  - Server must offer tool with exact name
  - Server input schema must be superset of agent's expected schema
  - Server tool constraints checked (rate limits, approval requirements)
          │
          ▼
Security Policy Check:
  - Does agent's Constitution allow this server's sandbox level?
  - Does agent have permission for this tool's destructive level?
          │
          ▼
Server Selection (by routing policy)
          │
          ▼
Tool Invocation
```

#### 6.4.1 Capability Negotiation Protocol

```python
async def negotiate_capability(
    agent: Agent,
    tool_name: str,
    expected_schema: dict
) -> NegotiationResult:
    """
    Find best MCP server to serve the requested tool.
    Returns server selection or NegotiationError.
    """
    # Find all servers offering this tool
    candidates = registry.find_servers_with_tool(tool_name)

    # Filter by schema compatibility
    schema_compatible = [
        s for s in candidates
        if is_schema_compatible(s.tool_schema(tool_name), expected_schema)
    ]

    # Filter by security policy
    constitution = agent.constitution
    policy_allowed = [
        s for s in schema_compatible
        if passes_security_policy(s, constitution, tool_name)
    ]

    if not policy_allowed:
        raise NegotiationError(
            f"No server can serve '{tool_name}' within security policy. "
            f"Found {len(candidates)} servers, {len(schema_compatible)} schema-compatible, "
            f"0 policy-allowed."
        )

    # Select best server via routing policy
    selected = router.select(policy_allowed, agent)
    return NegotiationResult(server=selected, tool=selected.tool(tool_name))
```

#### 6.4.2 Schema Compatibility Rules

A server's tool schema is **compatible** with an agent's expected schema if:
1. All agent-required parameters are present in server schema
2. Parameter types are compatible (strict subtype or same type)
3. Server may have **additional** optional parameters not in agent schema
4. Server schema constraints (min/max/pattern) are **not stricter** than agent expects

---

### 6.5 Security Sandboxing

MCP servers run with security isolation according to their declared `sandbox_level`:

#### 6.5.1 Sandbox Levels

| Level | Description | Mechanism | Use Case |
|-------|-------------|-----------|---------|
| `none` | No isolation | Direct process execution | Trusted internal servers |
| `process` | OS process isolation | Separate process, limited env | Most community servers |
| `container` | Container isolation | Docker/OCI container | Servers with network access |
| `vm` | Full VM isolation | gVisor/Firecracker | Untrusted/code-execution servers |

#### 6.5.2 Network Access Control

```yaml
# Network policy for container-sandboxed servers
network_access: allowlist
allowed_domains:
  - "api.github.com"
  - "registry.npmjs.org"
  - "*.s3.amazonaws.com"
```

Atlas creates an egress-only firewall rule per MCP server instance that enforces the `allowed_domains` list. Unapproved outbound connections are blocked and logged.

#### 6.5.3 Filesystem Access Control

```
Filesystem access levels:
  none          → No filesystem access (exceptions: /dev/null, /tmp)
  readonly      → Read-only access to workspace
  workspace-only → Read/write to project workspace only, no home dir or /etc
  unrestricted  → Full filesystem access (requires explicit user approval)
```

#### 6.5.4 Secret Access

Servers with `secret_access: true` receive secrets via environment variables set by Atlas's secrets manager. Secrets are:
- Never written to filesystem
- Rotated on server restart
- Logged when accessed (secret name only, not value)
- Scoped to minimum required permissions

#### 6.5.5 Audit Logging

Every MCP tool call is logged:

```json
{
  "audit_event": "mcp_tool_call",
  "timestamp": "2026-07-06T12:00:00.000Z",
  "agent_id": "backend-agent",
  "session_id": "session-uuid",
  "server_id": "server-uuid",
  "server_name": "filesystem",
  "tool_name": "write_file",
  "input_summary": "path=/workspace/src/main.py, size=1234 bytes",
  "outcome": "success",
  "duration_ms": 45,
  "destructive": true,
  "approved_by": null
}
```

---

### 6.6 MCP Routing and Load Balancing

When multiple instances of the same MCP server are available, Atlas routes intelligently:

#### 6.6.1 Routing Policies

| Policy | Description | Best For |
|--------|-------------|---------|
| `latency` | Route to lowest-latency healthy instance | Performance-sensitive tools |
| `round-robin` | Evenly distribute across instances | Stateless servers |
| `affinity` | Route same agent session to same instance | Stateful server interactions |
| `least-connections` | Route to instance with fewest active calls | High-throughput scenarios |
| `random` | Random selection among healthy instances | Simple load distribution |

#### 6.6.2 Routing Configuration

```yaml
# Registry entry routing config
routing:
  policy: latency
  health_check_required: true
  instances:
    - url: "http://mcp-1.internal:3000"
      weight: 100
      region: "us-east-1"
    - url: "http://mcp-2.internal:3000"
      weight: 100
      region: "eu-west-1"
  circuit_breaker:
    failure_threshold: 5
    success_threshold: 2
    open_duration_seconds: 30
```

#### 6.6.3 Circuit Breaker

Atlas implements a circuit breaker for each server instance:

```
CLOSED (normal)
  │ failure_threshold exceeded
  ▼
OPEN (blocking)
  │ open_duration elapsed
  ▼
HALF-OPEN (trial)
  │ success_threshold met → CLOSED
  │ any failure → OPEN
```

#### 6.6.4 Request Routing Algorithm

```python
def route_request(
    server_name: str,
    tool_name: str,
    routing_policy: str
) -> ServerInstance:
    instances = registry.get_healthy_instances(server_name)

    if not instances:
        raise NoHealthyInstanceError(f"No healthy instances for '{server_name}'")

    if routing_policy == "latency":
        return min(instances, key=lambda i: i.health.avg_response_ms)
    elif routing_policy == "round-robin":
        return instances[round_robin_counter.get_and_increment() % len(instances)]
    elif routing_policy == "least-connections":
        return min(instances, key=lambda i: i.active_connections)
    elif routing_policy == "random":
        return random.choice(instances)
    else:
        return instances[0]  # Default: first healthy
```

---

### 6.7 MCP Server Versioning

#### 6.7.1 Version Resolution

Atlas supports multiple versions of the same server simultaneously. Version resolution follows:

```
1. If Blueprint specifies exact version: use that version
2. If Blueprint specifies range: use highest compatible version
3. If Blueprint specifies "latest": use latest stable version
4. If Blueprint omits version: use pinned version from atlas.blueprint.lock.yaml
```

#### 6.7.2 Version Lock File

```yaml
# atlas.blueprint.lock.yaml (excerpt)
mcp_servers:
  "@modelcontextprotocol/server-filesystem":
    version: "1.3.2"
    resolved: "https://registry.npmjs.org/@modelcontextprotocol/server-filesystem/-/server-filesystem-1.3.2.tgz"
    integrity: "sha512-abc123=="
    installed_at: "2026-06-15T10:00:00Z"

  "@atlas/mcp-postgresql":
    version: "2.1.0"
    resolved: "https://marketplace.atlas.engineering/packages/@atlas/mcp-postgresql-2.1.0.tgz"
    integrity: "sha512-def456=="
    installed_at: "2026-07-01T08:00:00Z"
```

#### 6.7.3 Automatic Upgrade Management

```bash
# Check for outdated servers
atlas mcp outdated

# Upgrade a specific server
atlas mcp upgrade @modelcontextprotocol/server-filesystem

# Upgrade all non-breaking updates
atlas mcp upgrade --safe

# View breaking change notes before upgrading
atlas mcp upgrade @atlas/mcp-postgresql --dry-run
```

---

### 6.8 MCP Registry REST API

```yaml
Base URL: /api/v1/mcp

# List all registered servers
GET /api/v1/mcp/servers
  ?status=active
  &tag=database
  &sort=name
Response: { servers: MCPServerRegistryEntry[] }

# Get server details
GET /api/v1/mcp/servers/{id}
Response: MCPServerRegistryEntry

# Register a new server
POST /api/v1/mcp/servers
Body: MCPServerRegistryEntry (without id, health, metadata.registered_at)
Response: { id: uuid, status: "pending-review" }

# Search servers by capability
GET /api/v1/mcp/servers/search?tool=read_file&tag=filesystem
Response: { results: MCPServerRegistryEntry[] }

# Get server health
GET /api/v1/mcp/servers/{id}/health
Response: ServerHealthMetrics

# Trigger discovery scan
POST /api/v1/mcp/discovery/scan
Body: { sources: ["local", "npm", "marketplace"] }
Response: { scan_id: uuid, status: "running" }

# Get discovery scan results
GET /api/v1/mcp/discovery/scans/{scan_id}
Response: { discovered: int, registered: int, updated: int, errors: string[] }
```

---

## Rationale

### Why automatic discovery over static configuration?

Static MCP configuration is the current state of the art, but it creates operational burden at scale. When managing dozens of projects each with multiple agents and tools, manual configuration becomes a maintenance nightmare. Automatic discovery reduces configuration drift and ensures agents always have access to the latest stable tool versions.

### Why support multiple sandbox levels vs. always container?

Different MCP servers have very different risk profiles. A simple filesystem linter server poses minimal risk; a server with internet access and code execution capability requires strong isolation. A uniform "always container" policy adds unnecessary overhead for low-risk servers and may not be acceptable in all deployment environments. Tiered sandboxing allows proportional security.

### Why implement capability negotiation vs. assuming tool availability?

Capability negotiation enables graceful degradation (trying alternative servers), better error messages, and prevents agents from silently calling tools they don't actually have access to. It also enables the registry to be the source of truth for tool availability rather than requiring agents to probe servers.

---

## Backwards Compatibility

- Registry schema v1 supported through Atlas OS 2.x
- `mcp.json` format (IDE-standard) is always imported and remains the compatibility input format
- Server IDs are stable across upgrades — URLs and commands may change but IDs persist

---

## Security Considerations

1. **Package Integrity**: All MCP packages are verified against their registry checksums before execution
2. **Privilege Escalation**: MCP servers run as least-privilege system users, not as the Atlas process user
3. **Secret Exposure**: Servers declared `secret_access: false` receive no secrets in their environment
4. **Supply Chain**: Marketplace servers are code-reviewed; npm servers are checksum-verified but not code-reviewed — agents should prefer marketplace servers for sensitive operations
5. **Audit Completeness**: Every tool call is audited regardless of sandbox level

---

## Performance Implications

| Operation | Expected Latency |
|-----------|-----------------|
| Registry lookup (by name) | < 5ms |
| Capability negotiation | < 20ms |
| Server health check | < 100ms (timeout) |
| Discovery scan (local) | < 1s |
| Discovery scan (npm) | 5–30s (network dependent) |
| MCP server startup (stdio) | 100ms–2s |
| MCP server startup (container) | 1–5s |

---

## Implementation Plan

### Phase 1: Registry and Local Discovery (Weeks 1–5)
- [ ] Registry schema and storage implementation
- [ ] Local filesystem discovery scanner
- [ ] Health monitoring daemon
- [ ] Registry REST API

### Phase 2: Remote Discovery and Routing (Weeks 6–10)
- [ ] npm registry scanner
- [ ] Atlas Marketplace integration
- [ ] Routing policies implementation
- [ ] Circuit breaker

### Phase 3: Security and Sandboxing (Weeks 11–16)
- [ ] Process sandbox implementation
- [ ] Container sandbox (Docker)
- [ ] Network access control (egress filtering)
- [ ] Audit logging pipeline

### Phase 4: Versioning and Operations (Weeks 17–20)
- [ ] Version lock file implementation
- [ ] Automatic upgrade management
- [ ] Capability negotiation engine

---

## Open Questions

1. **VM sandbox availability**: gVisor/Firecracker require kernel capabilities not available in all deployment environments. How should Atlas handle environments where VM sandbox is unavailable? Resolution: fall back to container sandbox, log warning.
2. **Server trust score**: Should the registry maintain a trust score per server based on audit history? Deferred to v2.

---

## References

- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
- [npm Registry API](https://github.com/npm/registry/blob/master/docs/REGISTRY-API.md)
- [RFC-006: Agent Communication Protocol](./RFC-006-agent-communication-protocol.md)
- [RFC-007: Atlas Plugin System](./RFC-007-plugin-system.md)
- [RFC-008: AI Provider Abstraction](./RFC-008-ai-provider-abstraction.md)
- [gVisor: Application Kernel for Containers](https://gvisor.dev/)
