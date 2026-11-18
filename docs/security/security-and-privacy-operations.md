# Design Platform — Security, Privacy and Operational Controls

**Status:** Gap-aware design/runbook supplement; not a security certificate or claim that all controls run today. Primary threat inventory: [threat model](threat-model.md). Release proof: [release readiness](../operations/release-readiness.md).

## Assets and trust boundaries

| Asset | Boundary | Required safeguards |
| --- | --- | --- |
| Imported JSON | Untrusted browser/file input to document model | Byte, schema, geometry and text limits; explicit migration; reject safely |
| Embedded PNG/JPEG/WebP | Encoded data to decoded pixels / SVG | Allowlisted formats, bounded bytes/dimensions/pixels, no untrusted external fetch |
| User text and names | Model to SVG/DOM/print | Escape text; never interpolate as HTML or arbitrary SVG |
| Local browser documents | Application memory to localStorage | Clear warning, safe recovery, errors on quota and corrupt data; don't claim backup |
| Downloaded PNG/PDF | Renderer to user filesystem/print | Validate signatures, page/pixel geometry and content, cleanup object URLs |
| Build dependencies | npm/Cargo/Actions to build runner | Locked versions, relevant audits, action permissions, license review, incident path |
| Accounts/documents (future) | Browser to Rust API/database | Independent auth and per-resource authorization, rate limits, backup/retention/deletion |
| Payment (future) | Billing provider webhooks/accounts | Signatures, idempotency, reconciliation, refunds and privacy/tax controls |

Browser/WASM validation improves usability but **cannot** authorize access to future server-owned documents.

## Priority threat scenarios

1. Parser handles malformed/oversized/deep JSON; reject without corrupting last good document.
2. Migrating v1–v4 (and proposed v5) accidentally changes page geometry, element identities, background assets or content.
3. Crafted image expands into excessive memory/pixels or crashes renderer.
4. User input is interpreted as executable markup or external resource URL.
5. Broken history/autosave silently overwrites a user's only design.
6. Export creates excessive CPU/memory/output or leaks temporary resources.
7. Public workflows log secrets or accept unsafe contribution inputs.
8. Future authenticated API allows one customer to read another customer's design.
9. Bundled fonts/stock graphics cannot legally be redistributed commercially.

## Current controls versus unverified proof

The repository documents bounded schema, image and WASM inputs, shared fixtures, a threat model, dependency checks and browser smoke tests. **Their existence is not proof** of resistance to all attacks, manual accessibility, cross-browser fidelity, real server isolation or compliance. Review specific implementation and exact-SHA tests before marking controls verified. No server authentication, multi-tenant storage or payment processor is established as implemented.

## Engineering controls for every relevant PR

- Explicitly identify untrusted input, maximum bytes/pixels/elements and failure state.
- Keep Rust, TS and WASM accept/reject behavior aligned using shared negative fixtures; use independent server validation in future.
- Use typed commands and no arbitrary HTML.
- Bound export canvas resolution and rendering work; clean temporary URLs/buffers.
- Enforce least-privilege CI token and action/third-party provenance review.
- Avoid storing private design content in CI logs, screenshots or analytics without informed review.
- Keep a dependency advisory register: `cargo audit`, package-manager audit and accepted exceptions with expiry.
- Add targeted fuzz/property-based testing where a parser or migration risk warrants it.
- Require accessibility and recovery tests for lost focus/local state.
- Document supply-chain and license exceptions; green audit ≠ secure application.

## Future server gate (not implemented)

Prior to handling hosted user documents:
- Threat model for account, share link, tokens, quota and object-store boundaries.
- Authorization tests for cross-account document IDs (IDOR/BOLA).
- Secure sessions, CSRF review, TLS, request-size limits, quotas and abuse prevention.
- Encrypted storage where needed, minimum retention, user export/deletion and tested backup restore.
- Separation of environments, least-privilege secrets, audit events and incident process.
- Bound rendering workers with timeout, concurrency and resource limits.

No deployment, payment or customer-data collection is authorized by this plan.

## Operational response template

```text
Incident/finding ID and reporter:
Affected source SHA, deployment and versions:
Observed behavior / affected customer data (do not paste data):
Severity and evidence:
Containment and owner:
Reproduction and tests:
Root cause / violated invariant:
Fix PR and exact-SHA evidence:
Rollback or restore steps:
Follow-up and owner acceptance:
```

Protect the evidence. Escalate suspected real customer-data exposure promptly; never publicly disclose secrets as debugging output.
