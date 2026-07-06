# SDK Specification — TypeScript & Python SDKs

> **Document Status:** Authoritative Reference  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-06  
> **Owner:** Atlas SDK Engineering Team  

---

## 1. Executive Summary

The Atlas SDK enables custom programmatic extensions of the Engineering Operating System. Offered in **TypeScript (NPM: `@atlas-os/sdk`)** and **Python (PyPI: `atlas-sdk`)**, the SDKs share consistent design paradigms, authorization workflows, error models, and semantic methods. The SDKs wrap underlying gRPC microservices and REST gateways into standard language-specific code interfaces.

---

## 2. Design Principles

- **Semantic Coherence:** Method signatures are mirror copies across both languages, adapted to native idiomatic conventions (camelCase in TS, snake_case in Python).
- **Strong Typing:** Fully generated TypeScript types and Python typed classes (via Pydantic) matching central Protobuf schemas.
- **Fail-Fast & Observability:** All SDK operations propagate the host span trace context and throw descriptive typed exceptions.

---

## 3. TypeScript SDK Specification (`@atlas-os/sdk`)

### 3.1 Initializing the Client

```typescript
import { AtlasClient } from "@atlas-os/sdk";

const client = new AtlasClient({
  apiKey: process.env.ATLAS_API_KEY,
  endpoint: "https://api.atlas.engineering",
  organizationId: "org_dev_01"
});
```

### 3.2 Querying Project Memory

```typescript
// Semantic memory search
const memoryNodes = await client.memory.search({
  projectId: "proj_billing_v2",
  query: "How did we implement refund state transition locks?",
  limit: 5,
  minSimilarity: 0.82
});

for (const result of memoryNodes) {
  console.log(`[Score: ${result.score}] Match: ${result.node.content}`);
}
```

### 3.3 Orchestrating a Custom Agent Task

```typescript
const agentRun = await client.agents.execute({
  projectId: "proj_billing_v2",
  agentId: "coder_agent",
  task: "Implement the idempotent stripe payout handler.",
  watch: true // Subscribes to Server-Sent Events (SSE) log stream
});

agentRun.on("thought", (thought) => {
  console.log(`[Agent Thinking]: ${thought.content}`);
});

agentRun.on("complete", (status) => {
  console.log(`[Job Finalized]: Build status is ${status.success ? "Success" : "Failed"}`);
});
```

---

## 4. Python SDK Specification (`atlas-sdk`)

### 4.1 Initializing the Client

```python
import os
from atlas_sdk import AtlasClient

client = AtlasClient(
    api_key=os.environ.get("ATLAS_API_KEY"),
    endpoint="https://api.atlas.engineering",
    organization_id="org_dev_01"
)
```

### 4.2 Creating a Custom Tool for Atlas Agents

Python developers can define tools that agents can run within constitutional boundary checks.

```python
from typing import Dict, Any
from pydantic import BaseModel, Field
from atlas_sdk.agents import tool

class S3BucketSpec(BaseModel):
    bucket_name: str = Field(description="Globally unique bucket name")
    enable_encryption: bool = Field(default=True, description="Enforces KMS envelope encryption")

@tool(
    name="create_s3_bucket",
    description="Creates a cloud storage bucket mapped under security guidelines.",
    args_schema=S3BucketSpec
)
async def create_s3_bucket(spec: S3BucketSpec, context: Dict[str, Any]) -> Dict[str, Any]:
    # SDK injects current project context and security attributes
    project_id = context.get("project_id")
    
    # Audit logic against the project's Constitution
    if not spec.enable_encryption:
        raise ValueError("Encryption is mandatory according to Constitution Invariant II.4")
        
    # Execution logic...
    return {"status": "created", "bucket_arn": f"arn:aws:s3:::{spec.bucket_name}"}
```

### 4.3 Writing to the Knowledge Graph

```python
# Create a dependency link between a requirement and a source code component
await client.graph.create_relationship(
    project_id="proj_billing_v2",
    source_node={"id": "req_stripe_webhook_v1", "label": "Requirement"},
    target_node={"id": "comp_gateway_router", "label": "Component"},
    relationship_type="IMPLEMENTED_BY",
    properties={"confidence": 0.98, "created_by": "agent_discovery_v1"}
)
```
