# Temporary development-only security risk acceptance: picomatch

**Decision:** Explicit owner-approved, scoped, time-limited nonproduction exception. This is NOT a security remediation, a clean audit, a certification, a release, or approval for production.
**Owner authorization:** 2026-11-18 in ChatGPT; review this decision in PR #120.
**Expiry:** 2026-12-02 UTC inclusive; CI must fail after expiry unless a new decision is separately approved.
**Machine-readable authority:** temporary-picomatch-exception.json in this folder.
**Security tracking:** https://github.com/Rofikali/design-platform/issues/118

## Risk, evidence, limitations

Only GHSA-fc5q-39xc-vjpf (CVE-2026-112366), a HIGH-severity ReDoS issue in picomatch through 4.0.7, is temporarily accepted. As checked on 2026-11-18, there was no verified patched release. Supplying crafted repeated extglob patterns to a vulnerable parser can block a Node event loop (availability). A 76-file built-output indicator scan finding no recognizable strings does NOT prove nonreachability or safety.

The owner says Design Platform remains a local, nonproduction prototype. This is not independently verified. **No public production deployment, customer-data handling, or release is authorized under this exception.** The acceptance assumes there is no public attacker-controlled glob evaluation; this assumption is not proven and must be revisited before any exposure change. Do not equate an accepted advisory with a fixed vulnerability.

## Exact CI behavior and scope

1. Keep the locked pnpm 10.11.0 dependency install.
2. Run the real command: pnpm audit --prod --audit-level high --json. The raw audit still exits 1 because the advisory remains present.
3. The guard is tested using built-in Node tests and accepts only the exact HIGH picomatch GHSA while the owner-approved policy is unchanged and unexpired.
4. Any unrelated high/critical issue, critical severity even for picomatch, unknown identity, malformed or missing report, registry/CLI failure, changed policy, indicated patched version, expiry, or production/release context fails the job. Never use global audit suppression, blanket ignore, or unconditional success.
5. Logs must explicitly state TEMPORARY SECURITY EXCEPTION, NOT A CLEAN AUDIT, with expiry. A passing GitHub job means **risk accepted for development**, not that the package is secure. Rust, application, WASM, browser, cross-browser, security and documentation tests remain separate.

## Seven engineering levels and cross-functional review

| Lens | Responsibility |
| --- | --- |
| 1. Junior engineer | Record raw audit exit code, tested SHA, advisory identity, and CI evidence. |
| 2. Mid-level engineer | Implement scoped, readable validation and positive/negative test cases. |
| 3. Senior engineer | Keep the frozen lockfile, audit command, and other high/critical blockers intact. |
| 4. Staff engineer | Make exception scope, expiry, owner and rollback auditable; avoid unrelated PRs. |
| 5. Principal engineer | Plan dependency remediation and compatibility tests across Nuxt/Rust/WASM/browser. |
| 6. Security/software architect | Assess untrusted glob input and backend trust boundaries; reject false nonreachability claims. |
| 7. CTO / engineering leadership | Record owner risk acceptance and forbid production pending real remediation. |
| QA / accessibility | Preserve actual exported-image, keyboard, zoom and multi-browser evidence. |
| SRE / security | Monitor official upstream and npm patch status; fail on new issues and expiry. |
| CA / finance | Authorize zero new paid resources; avoid unmeasured cost or performance claims. |
| MBA / product / management | Preserve development momentum while withholding public launch to limit outage and reputation risk. |

## Required removal when upstream fixes issue

1. Monitor https://github.com/advisories/GHSA-fc5q-39xc-vjpf and https://github.com/micromatch/picomatch/releases; confirm the released npm version actually contains the fix. Draft/unreleased changes are not evidence.
2. Upgrade the owning Nuxt/transitive dependency or verified patched package and regenerate/review its lockfile. Do not invent a version or substitute an untested dependency.
3. Remove the exception policy JSON, validator script, validator tests and this active waiver; restore the original strict CI step: pnpm audit --prod --audit-level high.
4. Verify exact-head strict security, Rust, Nuxt/WASM, accessibility/browser, cross-browser export, Docker and documentation checks, then satisfy branch protections and any independent review.
5. Seek separate explicit owner authorization for production release. This exception never permits deployment.

**Rollback:** Revert the exception commit to restore the original failing strict audit immediately. After 2026-12-02, CI must fail until repaired or a fresh separately authorized and reviewed risk decision exists. Upstream verification is due at least daily or upon material change; do not automatically extend the date.
