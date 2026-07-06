# Atlas Engineering OS — API Contracts & Protobuf Specification

> **Document Status:** Authoritative Reference  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-06  
> **Owner:** Atlas Architecture Team  

---

## 1. Protocol Architecture & Standards

Atlas interfaces interact via three primary communication formats, each optimized for specific data access patterns:

- **gRPC (Protocol Buffers v3):** Primary inter-engine synchronous communication. Exposes low-overhead streaming APIs for agent trace flows, code file generation, and knowledge graph queries.
- **REST APIs:** Gateway commands, health checking, webhooks, and third-party API calls.
- **Kafka Event Streaming:** Asynchronous, event-driven state updates, audit logging, and change detection telemetry.

---

## 2. Core Service Protobuf Contracts

These Protobuf schemas define the type-safe contracts implemented by the Atlas microservices.

### 2.1 Project Memory Service (`memory_service.proto`)

Used by agents and engines to write, query, and search the persistent memory graph of an Atlas project.

```protobuf
syntax = "proto3";

package atlas.memory.v1;

option go_package = "github.com/atlas-os/atlas/packages/core/proto/memoryv1";
option java_package = "engineering.atlas.core.proto.memory.v1";

service MemoryService {
  rpc StoreMemory (StoreMemoryRequest) returns (StoreMemoryResponse);
  rpc QueryMemory (QueryMemoryRequest) returns (QueryMemoryResponse);
  rpc SearchSemantic (SearchSemanticRequest) returns (SearchSemanticResponse);
}

enum MemoryScope {
  MEMORY_SCOPE_UNSPECIFIED = 0;
  MEMORY_SCOPE_REQUIREMENT = 1;
  MEMORY_SCOPE_ARCHITECTURE = 2;
  MEMORY_SCOPE_CODE = 3;
  MEMORY_SCOPE_AUDIT = 4;
}

message MemoryNode {
  string id = 1;
  string project_id = 2;
  MemoryScope scope = 3;
  string key = 4;
  string content = 5;
  map<string, string> metadata = 6;
  int64 timestamp = 7;
}

message StoreMemoryRequest {
  string project_id = 1;
  MemoryScope scope = 2;
  string key = 3;
  string content = 4;
  map<string, string> metadata = 5;
}

message StoreMemoryResponse {
  string memory_id = 1;
  bool success = 2;
}

message QueryMemoryRequest {
  string project_id = 1;
  string key_pattern = 2;
  MemoryScope scope = 3;
}

message QueryMemoryResponse {
  repeated MemoryNode nodes = 1;
}

message SearchSemanticRequest {
  string project_id = 1;
  string query = 2;
  int32 limit = 3;
  float min_similarity = 4;
}

message SearchSemanticResponse {
  message SearchResult {
    MemoryNode node = 1;
    float score = 2;
  }
  repeated SearchResult results = 1;
}
```

### 2.2 Blueprint Service (`blueprint_service.proto`)

Interfaces with the Blueprint Engine to compile, validate, and query architecture configurations.

```protobuf
syntax = "proto3";

package atlas.blueprint.v1;

service BlueprintService {
  rpc ValidateBlueprint (ValidateBlueprintRequest) returns (ValidateBlueprintResponse);
  rpc CompileBlueprint (CompileBlueprintRequest) returns (CompileBlueprintResponse);
}

message ValidateBlueprintRequest {
  string project_id = 1;
  string blueprint_yaml = 2;
}

message ValidateBlueprintResponse {
  bool is_valid = 1;
  repeated ValidationError errors = 2;
}

message ValidationError {
  string field = 1;
  string message = 2;
  string severity = 3; // "ERROR" or "WARNING"
  int32 line_number = 4;
}

message CompileBlueprintRequest {
  string project_id = 1;
  string blueprint_yaml = 2;
}

message CompileBlueprintResponse {
  string compiled_blueprint_json = 1;
  string lockfile_yaml = 2;
}
```

---

## 3. Asynchronous Event Bus Schemas (Kafka)

Atlas utilizes Apache Kafka to broadcast critical system events asynchronously. All event payloads are wrapped in a standard `AtlasEventEnvelope` container.

### 3.1 Common Event Envelope

```protobuf
syntax = "proto3";

package atlas.events.v1;

import "google/protobuf/any.proto";

message AtlasEventEnvelope {
  string event_id = 1;
  string event_type = 2; // e.g., "atlas.blueprint.approved"
  string project_id = 3;
  string actor_id = 4; // human user ID or agent ID
  int64 timestamp = 5;
  int32 schema_version = 6;
  google.protobuf.Any payload = 7;
}
```

### 3.2 Key System Domain Events

#### Event: `RequirementDiscovered` (Topic: `atlas.requirements`)
Published when the Intake Engine successfully closes a Socratic dialogue and saves new project specifications.

```protobuf
message RequirementDiscoveredEvent {
  string requirement_id = 1;
  string title = 2;
  string description = 3;
  repeated string tags = 4;
  string raw_dialogue_ref = 5;
}
```

#### Event: `BlueprintApproved` (Topic: `atlas.blueprints`)
Published when a blueprint change is finalized, unlocking agent code generation.

```protobuf
message BlueprintApprovedEvent {
  string blueprint_id = 1;
  uint32 version = 2;
  string diff_summary = 3;
  repeated string affected_components = 4;
}
```

#### Event: `AuditCompleted` (Topic: `atlas.audits`)
Published by the Technical Audit Engine upon scanning a codebase branch or container build.

```protobuf
message AuditCompletedEvent {
  string audit_id = 1;
  string commit_hash = 2;
  float engineering_score = 3;
  int32 issue_count = 4;
  repeated string compliance_violations = 5;
  bool is_constitutional_compliant = 6;
}
```
