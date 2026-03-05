# Security Policy

## Supported Versions

The following versions are currently considered maintained and reliable for security updates:

| Version | Supported |
| ------- | --------- |
| 0.0.1   | Yes       |
| < 0.0.1 | No        |

## Known Security Limitations

- The desktop bundle currently embeds `server/.env` for runtime compatibility.
- Secrets in bundled artifacts should be treated as potentially extractable by local attackers.
- This project is designed for controlled/local deployments and is not yet hardened for hostile multi-tenant environments.

## Reporting a Vulnerability

If you discover a security issue:

1. Do not open a public issue with exploit details.
2. Send a private report to: `diomankeita001@gmail.com` or `niagnouma001@gmail.com`
3. Include reproduction steps, impact, and affected version.

Target response times:

- Initial acknowledgment: within 72 hours
- Triage decision: within 7 business days
- Patch/release target: depends on severity and reproducibility

## Security Update Process

- Vulnerabilities are triaged by severity (critical/high/medium/low).
- Fixes are prepared in a dedicated branch and reviewed before release.
- Patched versions are published through the tag-driven release workflow (`v*`).
