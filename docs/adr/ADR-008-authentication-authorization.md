# ADR-008: Authentication & Authorization Strategy via OAuth2/OIDC & Keycloak

**Date:** 2026-07-06  
**Status:** Accepted  
**Deciders:** Atlas Architecture Council  
**Technical Area:** Security / Identity Management  

---

## Context and Problem Statement

Atlas handles highly sensitive resources, including proprietary requirements, architecture blueprints, security finding logs, and agent credentials. We require an enterprise-grade authentication and authorization mechanism that supports:

1. **Multi-Tenancy:** Secure data segregation between different organizations and workspaces.
2. **Federated Identity:** SSO support for developer ecosystems (GitHub, GitLab, Okta, Active Directory).
3. **Decentralized Service Verification:** Engines must quickly validate client requests without querying a central database on every HTTP/gRPC invocation.
4. **Granular Access Control:** Role-Based Access Control (RBAC) for platform access, combined with Attribute-Based Access Control (ABAC) to restrict access to specific sensitive files or environments.

---

## Decision Drivers

- **Security & Compliance:** Alignment with OIDC and OAuth2 standards, SOC2, and GDPR requirements.
- **Integration Friction:** Seamless CLI authentications (`agy login` initiating OAuth Device Auth Flow).
- **Maintenance Cost:** Avoiding writing and auditing custom identity management/passwords logic.
- **Performance:** Cryptographically verified tokens with zero internal DB latency.

---

## Considered Options

### Option 1: Custom Auth Implementation (Postgres + JWT)
- *Description:* Write bespoke user registration, login, token refresh, and SSO integrations.
- *Pros:* Complete code control, minimal setup complexity.
- *Cons:* Extremely high security vulnerability risk, lacks advanced federated features out of the box, requires ongoing maintenance.

### Option 2: Auth0 / Okta (Managed SaaS)
- *Description:* Outsource identity management to a commercial SaaS provider.
- *Pros:* Fully managed, zero maintenance, highly secure.
- *Cons:* Vendor lock-in, data sovereignty compliance issues (some users require 100% on-premises deployment), high pricing at scale.

### Option 3: Keycloak (Self-Hosted / Managed OIDC)
- *Description:* Run Keycloak inside the Atlas Kubernetes cluster as the Identity Provider (IDP).
- *Pros:* OIDC/OAuth2 compliance, multi-tenancy, fully open source, supports local container testing, easily federates with GitHub/Active Directory.
- *Cons:* Requires infrastructure maintenance, Java-based memory footprint.

---

## Decision Outcome

**Option 3 (Keycloak OIDC IDP)** was selected.

### Authorization Model:
- **Authentication:** Clients use OAuth2 Authorization Code flow with PKCE (for Web Dashboard) and Device Authorization flow (for `agy` CLI). The IDP returns signed JWT access and refresh tokens.
- **Service Validation:** Microservices validate JWT signatures using asymmetric keys (JWKS endpoints).
- **Fine-Grained Access Control:** Implemented inside Atlas via RBAC roles (`org_admin`, `developer`, `security_auditor`) augmented with ABAC permissions checked at the database layer (e.g., matching user tags with blueprint security markings).
