# Marketplace Specification — Plugin Marketplace

> **Document Status:** Authoritative Reference  
> **Version:** 1.0.0  
> **Last Updated:** 2026-07-06  
> **Owner:** Atlas Ecosystem Team  

---

## 1. Executive Summary

The **Atlas Marketplace** is the central distribution platform for extensions, custom agents, audit policies, and integration adapters. It allows developers to search for, install, publish, and review plugins that extend the core capabilities of the Atlas Engineering Operating System. 

The marketplace registry behaves similarly to NPM or Cargo, enforcing cryptographically signed packages, semantic versioning, manifest validation, and automated security scans on upload.

---

## 2. Registry Architecture & API Integration

The registry operates as a secure REST API exposed through the main gateway.

### 2.1 API Endpoints

- `GET /v1/marketplace/plugins`: List available plugins with search and filtering tags.
- `GET /v1/marketplace/plugins/{id}`: Fetch detailed plugin metadata, readme contents, and version history.
- `POST /v1/marketplace/publish`: Upload a compiled plugin tarball and manifest. Requires developer credentials.
- `DELETE /v1/marketplace/plugins/{id}/versions/{version}`: Deprecate or retract a specific version (only permitted within a 72-hour window unless a security vulnerability is identified).

### 2.2 Upload Manifest Validation
When a developer runs `agy plugin publish`, the registry validates the upload against the following checklist:
1. **Manifest Parsing:** Validates `atlas.plugin.json` matches the schemas described in [RFC-007](../../docs/rfc/RFC-007-plugin-system.md).
2. **Signature Verification:** Validates the package signature against the developer's registered public key.
3. **No Dependency Collisions:** Checks that any imported external packages do not conflict with runtime container versions.

---

## 3. Automated Quality Gate & Security Scanning

To prevent malicious software or poorly optimized extensions from compromising developer machines, all uploaded plugins must pass an automated vetting pipeline:

```
[Plugin Tarball Uploaded] ──▶ [Static Analysis & AST Scan]
                                          │
                                          ▼
[Vulnerability Scan (CVE check)] ──▶ [Sandbox Runtime Test]
                                          │
                                          ▼
[Manual Audit (if high privilege)] ──▶ [Publish to Marketplace]
```

1. **Static Analysis AST Scan:** Validates that the Javascript/Wasm payload does not contain calls to prohibited runtime packages (e.g., direct child process spawning, raw disk access outside paths, or raw network calls without manifest permission).
2. **Vulnerability Analysis:** Scans the dependencies inside the package lockfile for known CVEs.
3. **Dynamic Sandbox Test:** Installs the plugin into a sandboxed development workspace and verifies it boots, executes core commands, and terminates without crashing or exceeding standard memory budgets.
4. **Manual Vetting Gate:** Any plugin requesting high-level access permissions (e.g., raw filesystem write, access to host Git credentials, or database connection modifications) is routed to the Atlas Security Team for manual code audit.

---

## 4. Monetization & Licensing Models

- **MIT/Apache 2.0 Open Source:** Free plugins available globally.
- **Enterprise Proprietary:** Paid plugins licensed to specific organizations, deployed inside local internal networks.
- **Subscription Services:** Custom cloud integrations or data provider APIs billed monthly per user.
