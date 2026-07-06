# RFC-007: Atlas Plugin System Specification

**RFC Number:** 007  
**Author(s):** Atlas Architecture Team  
**Date:** 2026-07-06  
**Status:** Final  
**Category:** Extension System  

---

## 1. Abstract

This RFC specifies the architecture, interface contracts, manifest structure, and runtime security model of the **Atlas Plugin System**. Plugins enable third-party developers to extend Atlas's core capabilities by registering custom CLI commands, dashboard UI modules, agent tools, code audit rules, and external integrations.

---

## 2. Motivation

No developer platform can support every programming language, deployment target, or regulatory compliance framework natively. A robust plugin system allows Atlas to remain lightweight while fostering a community-driven marketplace for domain-specific tooling.

Our design goals are:
- **Isolation & Security:** Malicious or poorly written plugins must not be able to compromise host credentials or steal project source code.
- **De-coupled Extensibility:** Plugins must be able to hook into specific execution cycles (e.g., pre-blueprint commit, post-code generation) without modifying core engine logic.
- **Unified Interface:** A single plugin package must be able to bundle CLI extensions, backend logic, and frontend components.

---

## 3. Specification

### 3.1 The Plugin Manifest (`atlas.plugin.json`)

Every plugin must contain a root manifest file named `atlas.plugin.json`. This JSON schema defines the plugin name, version, required permissions, and registered extensions.

```json
{
  "$schema": "https://atlas.engineering/schemas/plugin/v1.json",
  "id": "atlas-plugin-aws-terraform",
  "name": "AWS Terraform Adapter",
  "version": "1.2.0",
  "description": "Auto-generates AWS Terraform manifests from Blueprint specifications.",
  "author": "Atlas Core Core Team",
  "license": "MIT",
  "permissions": [
    "fs:read",
    "fs:write",
    "network:outbound"
  ],
  "entrypoints": {
    "backend": "dist/backend.js",
    "cli": "dist/cli.js"
  },
  "extensions": {
    "cli_commands": [
      {
        "name": "tf-plan",
        "description": "Runs Terraform plan on the generated infrastructure",
        "handler": "handleTfPlan"
      }
    ],
    "blueprint_hooks": [
      {
        "hook": "post_compile",
        "handler": "onBlueprintCompiled"
      }
    ],
    "agent_tools": [
      {
        "name": "provision_s3_bucket",
        "description": "Generates Terraform config for a secure S3 bucket",
        "handler": "provisionS3"
      }
    ]
  }
}
```

### 3.2 Security and Sandboxing Runtime

To enforce security and resource isolation, plugins execute in restricted sandboxes depending on the context:

1. **CLI / Local execution:** Executed inside a lightweight Node.js virtual machine context (`vm2` or `isolated-vm`) with disabled native imports. Access to the filesystem is restricted to the specific sub-folder where the command is executed.
2. **Cloud / Production execution:** Backend plugin modules execute inside ephemeral, stateless WebAssembly (Wasm) runtimes or isolated, unprivileged Docker containers (using gVisor sandbox runtimes).
3. **Network Permissions:** Plugins cannot access the network unless explicitly declared in the `permissions` section of the manifest and approved by the user during installation.

### 3.3 Interface Contracts

Plugins communicate with Atlas engines using standard TypeScript interfaces.

```typescript
export interface IAtlasPlugin {
  initialize(context: IPluginContext): Promise<void>;
  terminate(): Promise<void>;
}

export interface IPluginContext {
  projectId: string;
  config: Record<string, any>;
  logger: IPluginLogger;
  
  // Expose register APIs
  registerTool(tool: IAgentTool): void;
  registerHook(event: string, callback: (payload: any) => Promise<void>): void;
}

export interface IAgentTool {
  name: string;
  description: string;
  inputSchema: object;
  execute(args: any): Promise<any>;
}
```

### 3.4 Installation and Lifecycle Flow

```
[User runs 'agy plugin install'] ──▶ [Verify Signature & Manifest]
                                                  │
                                                  ▼
[Scan Permissions] ──▶ [User Approves Permissions] ──▶ [Load Plugin into Sandbox]
```
1. **Fetch:** Atlas downloads the zipped plugin from the official Marketplace registry.
2. **Verify:** Atlas verifies the package signature and validates the `atlas.plugin.json` schema.
3. **Approve:** The CLI prints a summary of the requested permissions. The user must explicitly approve access.
4. **Register:** Atlas extracts the package to `.atlas/plugins/` and registers the CLI and backend hooks into the engine configuration.
