# Atlas Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | :white_check_mark: |

## Reporting a Vulnerability

**DO NOT open a public GitHub issue for security vulnerabilities.**

Atlas treats security as a constitutional right of its users (see [CONSTITUTION.md](foundation/constitution/CONSTITUTION.md), Article VII). We take all security reports seriously and will respond promptly.

### Reporting Process

1. **Email**: security@atlas.engineering
2. **Subject**: `[SECURITY] Brief description of vulnerability`
3. **PGP Key**: Available at https://atlas.engineering/security.asc
4. **Response SLA**: Initial response within 24 hours, triage within 72 hours

### What to Include

- Type of vulnerability (XSS, SQLi, IDOR, prompt injection, etc.)
- Component affected (engine name, API endpoint, agent)
- Steps to reproduce
- Potential impact assessment
- Suggested fix (if any)

### What to Expect

- **24 hours**: Acknowledgment of receipt
- **72 hours**: Initial severity assessment
- **7 days**: Patch development begins for Critical/High severity
- **90 days**: Full disclosure (with your credit, unless anonymity requested)

### Severity Classification

| Severity | Description | SLA |
|----------|-------------|-----|
| Critical | RCE, auth bypass, data exposure | 24h patch |
| High     | Privilege escalation, injection | 7d patch |
| Medium   | Information disclosure, DoS | 30d patch |
| Low      | Minor issues, informational | 90d patch |

### AI-Specific Vulnerabilities

Atlas operates AI agents with significant system access. We are particularly interested in reports involving:
- Prompt injection attacks on Atlas agents
- Jailbreaking of Constitution Engine constraints
- Unauthorized data exfiltration via MCP servers
- Agent privilege escalation
- Memory poisoning attacks

### Bug Bounty

Atlas operates a private bug bounty program. Responsible disclosures of Critical and High severity issues qualify for rewards. Contact security@atlas.engineering for details.

### Hall of Fame

Security researchers who responsibly disclose vulnerabilities will be credited in our Security Hall of Fame (with their permission).

---

*This policy is governed by the Atlas Constitution, Article VII: Security as Constitutional Right.*
