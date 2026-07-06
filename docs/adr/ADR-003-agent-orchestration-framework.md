# ADR-003: LangGraph as Primary Agent Orchestration Framework

**Date:** 2026-07-06
**Status:** Accepted
**Deciders:** Atlas Architecture Council
**Technical Area:** AI/Agent Systems / Orchestration

---

## Context and Problem Statement

Atlas's core intelligence is delivered through a network of collaborating AI agents: the Requirement Discovery Agent, Blueprint Generator Agent, Constitution Author Agent, Red Team Evaluator Agent, ADR Synthesizer Agent, MCP Discovery Agent, and the Engineering Score Auditor Agent. These agents do not operate as isolated LLM calls — they maintain state across multi-turn interactions, branch on intermediate results, loop until quality thresholds are met, collaborate via shared memory, call external tools (knowledge graph queries, code analysis, web search), and may run sub-agents as parallel workloads.

The agent orchestration framework is the backbone that makes this multi-agent architecture operational. Its selection has profound implications:

1. **State management**: Agents must maintain conversation context, intermediate work products, user preferences, and project memory across sessions that may span hours or days.
2. **Execution model**: Some agent workflows are sequential pipelines; others are dynamic graphs where the next step depends on the output of the current step. The framework must support both.
3. **Checkpointing and resumability**: A user's requirement discovery session might span multiple browser sessions. Agent state must be persisted and resumed without loss.
4. **Observability**: Understanding why an agent made a decision, what tools it called, and how long each step took is essential for debugging and quality improvement.
5. **Human-in-the-loop (HITL)**: Atlas agents frequently need to pause, present intermediate results to users, collect approval or feedback, and resume. This must be first-class, not bolted on.
6. **Multi-agent coordination**: Agents must spawn sub-agents, share context graphs, and coordinate results without manual orchestration code.
7. **Production reliability**: Agent workflows must be restartable, retryable, and observable. They cannot be ephemeral in-memory processes.

Four primary candidates were evaluated: **LangGraph**, **CrewAI**, **AutoGen (Microsoft)**, and **custom implementation**.

---

## Decision Drivers

- **State machine expressiveness**: Must support complex branching, looping, conditional routing, and parallel execution as first-class graph constructs — not workarounds
- **Checkpointing / persistence**: Agent state must be serializable and storable in PostgreSQL or Redis for cross-session resumability
- **Human-in-the-loop**: Built-in interrupt/resume mechanisms for approval workflows (user approves Blueprint before proceeding to Constitution)
- **Production readiness**: Battle-tested in production workloads, not just research demos
- **Observability and tracing**: Native integration with LangSmith or OpenTelemetry for step-level tracing of agent decisions
- **Tool calling**: First-class support for structured tool definitions, multi-tool parallel calls, and tool result handling
- **Streaming**: Support for streaming intermediate agent outputs to the frontend in real-time
- **Language alignment**: Must align with the Python ML runtime established in ADR-002 (Python-first for agent engines, TypeScript for coordination)
- **Multi-agent patterns**: Support for supervisor agents, hierarchical agents, and peer agent collaboration
- **Vendor neutrality**: Must support multiple LLM providers (OpenAI, Anthropic, Google, local models via Ollama) without framework lock-in

---

## Considered Options

### Option 1: LangGraph (by LangChain, Inc.)

**Overview:** LangGraph is a library for building stateful, multi-actor applications with LLMs. It models agent workflows as directed graphs (or cyclic graphs, enabling loops) where nodes are processing functions and edges are transitions between states. The framework provides built-in checkpointing, human-in-the-loop interrupts, streaming, and native LangSmith integration. It exists in both Python (`langgraph`) and TypeScript (`@langchain/langgraph`) implementations.

**Architecture model:**
```
StateGraph → Nodes (agent steps) → Edges (routing logic) → Checkpointer (persistence)
```

**Strengths:**
- **Graph-native execution model**: LangGraph's `StateGraph` directly maps to Atlas's multi-step agent workflows. Requirement Discovery → Blueprint → Review → Revision loops are expressed as graph edges, not imperative code.
- **Typed state**: The `StateGraph` takes a typed state definition. Every node receives and returns a typed state object, making agent logic inspectable and testable.
- **Checkpointing**: Built-in `PostgresSaver` and `RedisSaver` checkpointers persist full graph state at every step. If an agent job crashes mid-execution, it resumes from the last checkpoint rather than restarting from scratch.
- **Human-in-the-loop (HITL)**: `interrupt()` is a first-class primitive. Agents pause at designated nodes, emit the current state to the frontend, wait for user input, and resume — all within the same graph execution.
- **Streaming**: `graph.stream()` yields intermediate steps as they execute. Users see real-time agent progress in the Atlas dashboard.
- **Multi-agent support**: LangGraph has first-class patterns for supervisor agents (routing sub-tasks to specialist agents), collaborative agents (agents sharing a graph), and hierarchical agent networks.
- **LangSmith observability**: Every graph execution is automatically traced in LangSmith — step inputs/outputs, LLM calls, tool invocations, latencies, and token usage are visible in the LangSmith UI.
- **Active development**: LangGraph is under extremely active development (LangChain, Inc. is well-funded). New features land frequently.
- **Community and examples**: Extensive documentation, cookbook examples for common agent patterns, and a large community for troubleshooting.
- **Provider agnosticism**: Works with any LangChain-compatible LLM (OpenAI, Anthropic, Google Gemini, AWS Bedrock, local Ollama models) via the `ChatModel` interface.

**Weaknesses:**
- **LangChain coupling**: LangGraph is built on LangChain abstractions (ChatModel, BaseTool, etc.). While these abstractions are well-designed, they add a layer of indirection between the developer and the raw LLM API.
- **Complexity for simple cases**: For straightforward single-agent flows, LangGraph's graph model is over-engineered. However, Atlas's agents are never truly simple.
- **Python-primary**: The Python implementation is significantly more mature and feature-complete than LangGraph.js. Given ADR-002's Python ML runtime decision, this is acceptable — Python LangGraph runs in the ML engine, TypeScript coordination layer manages job lifecycle.
- **LangSmith observability cost**: LangSmith's managed service has usage-based pricing. At Atlas's scale, this could become significant — self-hosted LangSmith or OpenTelemetry export must be configured.
- **API stability**: LangGraph has evolved rapidly, with breaking changes between minor versions. Pinning versions and controlled upgrades are mandatory.

**Verdict:** Most aligned with Atlas's requirements. The combination of graph-native execution, first-class HITL, PostgreSQL checkpointing, and active development makes it the clear leader.

---

### Option 2: CrewAI

**Overview:** CrewAI is a framework for orchestrating role-playing, autonomous AI agents. Agents are defined with roles, goals, and backstories. Tasks are assigned to agents, and a Crew executes them with configurable processes (sequential, hierarchical).

**Strengths:**
- **Role-based mental model**: Defining agents by role (Requirement Analyst, Architect, Red Teamer) maps naturally to Atlas's agent design.
- **Simple API**: CrewAI is remarkably easy to get started with. Defining a crew, agents, and tasks requires minimal code.
- **Built-in memory**: CrewAI has short-term (per-crew-run) and long-term (entity memory via vector stores) memory built in.
- **Tool integration**: Standard tool definitions (similar to OpenAI function calling) work across agents.
- **Delegation**: Agents can delegate tasks to other agents, enabling hierarchical workflows.

**Weaknesses:**
- **Limited graph expressiveness**: CrewAI's processes are sequential or hierarchical — there is no first-class concept of conditional branching, loops, or arbitrary graph edges. Complex workflows require workarounds.
- **No native checkpointing**: CrewAI does not have built-in cross-session state persistence. A crew run is ephemeral — if interrupted, it must restart from scratch. This is disqualifying for Atlas's multi-session workflows.
- **Limited HITL support**: Pausing a crew for human approval and resuming is not a first-class feature. Community workarounds exist but are fragile.
- **Observability gap**: While CrewAI integrates with Agentops, the tracing granularity is coarser than LangSmith/LangGraph's step-level tracing.
- **Less production battle-testing**: CrewAI is newer and less proven in complex production environments compared to LangGraph.
- **Concurrency limitations**: CrewAI's parallel execution model is less mature than LangGraph's parallel node execution.
- **Vendor lock-in risk**: CrewAI is a smaller company. Long-term support and development velocity are uncertain compared to LangChain, Inc.

**Verdict:** Insufficient for Atlas. The absence of native checkpointing and limited HITL support are disqualifying for Atlas's requirements.

---

### Option 3: AutoGen (Microsoft)

**Overview:** AutoGen is Microsoft's multi-agent conversation framework. Agents communicate via structured message passing, and multi-agent conversations are modeled as chat sessions between agents. AutoGen v0.4 (agentic) introduced a fully redesigned async, actor-based model.

**Strengths:**
- **Conversational multi-agent**: AutoGen's native model (agents communicating via messages) maps well to Atlas's agent collaboration patterns (e.g., Red Team agent critiquing Blueprint agent's output).
- **Microsoft backing**: Long-term support and research investment from a major company.
- **CodeExecutionAgent**: Built-in sandboxed code execution agents — relevant for Atlas's simulation and audit engines.
- **Group Chat**: AutoGen's `GroupChat` enables multi-agent round-table discussions, useful for Constitution review cycles.
- **AutoGen Studio**: A low-code UI for designing and testing agent networks.
- **Strong research pedigree**: AutoGen emerged from Microsoft Research with strong academic validation.

**Weaknesses:**
- **API instability**: AutoGen has undergone two major rewrites (v0.2 → v0.4). The v0.4 "agentic" API is a near-complete break from v0.2. Upgrading requires significant migration effort.
- **Checkpointing**: AutoGen's state persistence story is less mature than LangGraph's. Cross-session resumability requires custom implementation.
- **Graph expressiveness**: While AutoGen v0.4's actor model is flexible, expressing complex conditional branching workflows requires more boilerplate than LangGraph's graph DSL.
- **HITL complexity**: Human-in-the-loop patterns require custom `HumanProxyAgent` configurations — workable but not as clean as LangGraph's `interrupt()`.
- **Observability**: AutoGen has OpenTelemetry integration but less polished than LangSmith's visual tracing for debugging complex multi-agent interactions.
- **Python-only**: AutoGen has no TypeScript implementation, confirming that Python must be the agent runtime.
- **Community fragmentation**: The v0.2 → v0.4 split has fragmented the community. Documentation quality is inconsistent across versions.

**Verdict:** Strong research tool but less production-hardened than LangGraph for Atlas's specific requirements. Checkpointing and HITL maturity are below the threshold. Revisit if AutoGen v0.4 stabilizes and adds native persistent checkpointing.

---

### Option 4: Custom Implementation (Event-Driven State Machine)

**Overview:** Build a custom agent orchestration layer using XState (TypeScript state machines), BullMQ (job queues), Redis (state store), and direct LLM SDK calls. No framework dependency.

**Strengths:**
- **Zero framework dependency**: No risk of upstream breaking changes or framework abandonment.
- **Full control**: Exact behavior, performance characteristics, and extension points are under Atlas's control.
- **TypeScript native**: The entire orchestration layer runs in TypeScript, eliminating the cross-language boundary.
- **Optimized for Atlas patterns**: Can be designed precisely around Atlas's agent interaction patterns without framework generality overhead.

**Weaknesses:**
- **Massive engineering investment**: Implementing state graph execution, persistence, HITL, streaming, multi-agent coordination, and observability from scratch requires 6-12 months of senior engineering time.
- **Reinventing solved problems**: Checkpointing, graph topological sort, parallel node execution, and streaming are well-solved problems in LangGraph. Reimplementing them introduces bugs.
- **No community**: No community to consult for patterns, no cookbook examples, no Stack Overflow answers.
- **Maintenance burden**: Every new feature (new agent pattern, new tool type) must be implemented internally.
- **Opportunity cost**: Engineering time spent building orchestration infrastructure is time not spent on Atlas's unique value proposition.

**Verdict:** Rejected. The opportunity cost of building a custom framework is unjustifiable when LangGraph meets all requirements. Re-evaluate if LangGraph is deprecated or fundamentally fails Atlas's needs.

---

## Decision Outcome

**Chosen option: LangGraph (Python, with LangGraph.js for TypeScript coordination layer)**

LangGraph is selected as Atlas's primary agent orchestration framework. The Python implementation (`langgraph`) is the primary runtime for all agent engine subsystems (ML engine services, as established in ADR-002). LangGraph.js (`@langchain/langgraph`) is used for the TypeScript orchestration coordinator layer that manages job lifecycle, triggers Python engine workflows, and handles frontend communication.

The decision is driven by:
1. **PostgreSQL checkpointing** (`PostgresSaver`) provides the cross-session state persistence Atlas requires for long-running agent workflows
2. **`interrupt()` HITL primitive** is the cleanest implementation of human-in-the-loop in any evaluated framework
3. **Graph-native model** (cyclic directed graphs) is the correct abstraction for Atlas's conditional, looping, multi-step agent workflows
4. **LangSmith tracing** provides the observability depth needed for agent quality debugging without custom instrumentation

---

## Consequences

### Positive
- Agent workflows are expressed as first-class directed graphs — readable, testable, and visualizable. A new engineer can understand an agent's logic by viewing its graph definition.
- PostgreSQL checkpointing (same database as ADR-006) means no additional infrastructure for agent state persistence.
- HITL interrupts enable approval-gate workflows: users review and approve Blueprint before Constitution generation proceeds, with full state preservation across the approval wait.
- LangSmith integration provides step-level tracing from day one, enabling rapid debugging of agent regressions.
- Multi-agent supervisor patterns allow the Atlas Orchestrator to dynamically route sub-tasks to specialist agents based on intermediate results.

### Negative
- LangGraph's rapid development pace requires quarterly version pin reviews and migration testing. A dedicated engineer must own framework upgrades.
- Python runtime for agent engines (confirmed by ADR-002) means the primary LangGraph implementation is in Python, requiring the TypeScript coordination layer to communicate via gRPC — adding a cross-language boundary in the critical agent execution path.
- LangSmith managed service cost must be budgeted. At 1M+ LLM calls/month, LangSmith fees are non-trivial. Self-hosted LangSmith (requires Docker + PostgreSQL) is the cost-control fallback.
- Engineers must learn LangGraph's graph model (state typing, node/edge patterns, channel reducers) — budget 8-16 hours of onboarding per engineer.

### Neutral
- LangGraph.js will be used for the TypeScript coordination layer. Feature parity with Python LangGraph will be monitored; if gaps become critical, the coordination layer migrates to Python.
- Agent workflows must be version-controlled as graph definitions — changes to a graph that alter node signatures require migration of existing checkpointed state (similar to database migrations).

---

## Implementation Notes

### Standard Agent Graph Structure
```python
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.postgres import PostgresSaver
from langgraph.types import interrupt
from typing import TypedDict, Annotated
import operator

class RequirementState(TypedDict):
    messages: Annotated[list, operator.add]
    project_id: str
    requirements: list[dict]
    blueprint_draft: str | None
    user_approval: bool | None
    iteration_count: int

def discovery_agent(state: RequirementState) -> RequirementState:
    """Elicit requirements via conversational AI."""
    # ... LLM call with tools
    return {"requirements": extracted_requirements}

def blueprint_generator(state: RequirementState) -> RequirementState:
    """Generate Blueprint from requirements."""
    # ... LLM call
    return {"blueprint_draft": blueprint_content}

def human_review(state: RequirementState) -> RequirementState:
    """Pause for human approval of Blueprint."""
    approval = interrupt({
        "type": "blueprint_review",
        "blueprint": state["blueprint_draft"],
        "project_id": state["project_id"],
    })
    return {"user_approval": approval["approved"]}

def route_after_review(state: RequirementState) -> str:
    if state["user_approval"]:
        return "constitution_generator"
    return "blueprint_generator"  # Revision loop

# Graph construction
graph = StateGraph(RequirementState)
graph.add_node("discovery", discovery_agent)
graph.add_node("blueprint", blueprint_generator)
graph.add_node("review", human_review)
graph.add_node("constitution", constitution_generator)

graph.add_edge(START, "discovery")
graph.add_edge("discovery", "blueprint")
graph.add_edge("blueprint", "review")
graph.add_conditional_edges("review", route_after_review)
graph.add_edge("constitution", END)

# Compile with PostgreSQL checkpointer
with PostgresSaver.from_conn_string(DATABASE_URL) as checkpointer:
    app = graph.compile(checkpointer=checkpointer, interrupt_before=["review"])
```

### TypeScript Coordination Layer (LangGraph.js)
```typescript
// packages/agent-coordinator/src/orchestrator.ts
import { StateGraph } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

// Lightweight coordination graph in TypeScript
// Heavy agent work delegated to Python gRPC services
const coordinatorGraph = new StateGraph({ ... })
  .addNode("trigger_python_engine", triggerMLEngine)
  .addNode("stream_to_frontend", streamResults)
  .compile({ checkpointer: new PostgresSaver(pool) });
```

### Versioning Policy
- LangGraph version: pinned in `pyproject.toml` with exact version
- Upgrades: quarterly review, tested in staging environment first
- Breaking changes: assessed via `MIGRATION.md` maintained by platform team

---

## Compliance Verification

- [ ] All agent workflows implemented as `StateGraph` instances — no ad-hoc sequential LLM call chains
- [ ] All agent states fully typed via `TypedDict` — no untyped state dictionaries
- [ ] PostgreSQL checkpointing configured for all production agent graphs — verify via integration test that interrupted runs resume correctly
- [ ] LangSmith tracing enabled in all environments (dev, staging, prod) — LANGCHAIN_TRACING_V2=true verified in Kubernetes secrets
- [ ] HITL interrupt tests included in agent test suite — automated tests that simulate user approval/rejection flows
- [ ] Graph visualizations exported and stored in `docs/agents/` for each major agent workflow

---

## Related Decisions

- [ADR-002](./ADR-002-primary-language-backend.md) — Python as ML runtime is the prerequisite for Python LangGraph adoption
- [ADR-004](./ADR-004-knowledge-graph-database.md) — Agent tools query the Neo4j knowledge graph; tool definitions live in LangGraph nodes
- [ADR-006](./ADR-006-primary-relational-database.md) — PostgreSQL used as the LangGraph checkpoint store
- [ADR-010](./ADR-010-observability-stack.md) — LangSmith traces supplemented by OpenTelemetry spans for cross-service correlation
- [ADR-011](./ADR-011-message-queue-event-streaming.md) — Agent job triggers flow through Kafka before entering LangGraph execution

---

## References

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [LangGraph Checkpointing Guide](https://langchain-ai.github.io/langgraph/concepts/persistence/)
- [LangGraph Human-in-the-Loop](https://langchain-ai.github.io/langgraph/concepts/human_in_the_loop/)
- [LangGraph Multi-Agent Architectures](https://langchain-ai.github.io/langgraph/concepts/multi_agent/)
- [LangSmith Documentation](https://docs.smith.langchain.com/)
- [CrewAI Documentation](https://docs.crewai.com/)
- [AutoGen v0.4 Documentation](https://microsoft.github.io/autogen/)
- [XState Documentation](https://stately.ai/docs/xstate)
- [Cognitive Architectures for Language Agents (CoALA Paper)](https://arxiv.org/abs/2309.02427)
