# Release Readiness, Rollback and Recovery — Design Platform

**Status:** Release checklist/runbook proposal. A GitHub green PR is not a public deployment or security/accessibility certificate. Sources: [quality gates](../engineering/quality-gates.md), [testing strategy](../testing/strategy.md), [threat model](../security/threat-model.md) and [roadmap](../../next.md).

## 1. Product readiness matrix

| Gate | Evidence required | Current default |
| --- | --- | --- |
| Core customer flow | Teacher and shop banner create/edit/history/save/reopen/export in real browser | Check live source and tests |
| Document compatibility | Historical supported schema fixtures and round trips; future v5 migration explicitly tested | Recheck per release |
| Rendering | PNG downloaded content/signature/geometry; PDF page/print expectations and font fallback | Print dialog ≠ direct PDF proof |
| Browser support | Declared Chromium, Firefox and WebKit matrix; successful complete cases on release SHA | Cross-browser PR #102 cannot be presumed merged |
| Accessibility | Keyboard-only, focus, contrast, screen reader, zoom, table navigation when applicable | Manual review outstanding until recorded |
| Security | Threats, malformed inputs, resource bounds, dependency/CI checks, privacy and license review | No blanket secure claim |
| CI | Required workflows at exact candidate revision, none pending/skipped falsely green | Verify in GitHub |
| Operations | Reproducible build/deploy, configuration, rollback, support, monitoring | Hosted deployment not proven |
| Finance | Expected monthly worst-case cost, budget, customer value and legal/tax review if paid | Business assumptions only |
| Owner approval | Explicit approval to merge/release/spend money or handle customer data | Mandatory |

## 2. Local-only prototype release

1. Freeze candidate commit and document tool versions, package locks and reproducible Docker build.
2. Verify Rust/TS/WASM contract, frontend tests, browser template workflows and actual PNG outputs.
3. Run applicable negative, oversized and malformed document cases.
4. Complete manual accessibility and realistic print verification (A4 dimensions, margins, fonts, clipping).
5. Show visible disclosure: local browser storage is not backup; provide portable JSON export and recovery guidance.
6. Review included image/font/template licensing.
7. Document known unsupported functionality and rollback to prior signed/identified source revision.
8. Obtain owner go/no-go approval.

No inference of "production-ready" from a single successful local screenshot.

## 3. Future hosted SaaS release (only after separate ADR)

- Document identity, tenancy, authorization, database schema, asset retention and deletion.
- Test backup restore, cross-account access denial and secret rotation.
- Define explicit environment configuration, build provenance, TLS, security headers and rate limits.
- Measure capacity and cost at supported workload/region; define health/readiness, logs, alert and support procedures.
- Test migration forward and safe rollback; breaking persisted changes require recovery/migration decision.
- Perform privacy and commercial review; comply with applicable tax, billing, cancellation/refund and rights requirements.
- Perform staged release and support observation; production release approval remains human.

## 4. Recovery paths

| Failure | Response |
| --- | --- |
| Broken PR workflow | Stop merge; inspect failed job/step; fix in bounded PR; retest latest head |
| Invalid imported JSON | Preserve current document and rejected input for user recovery; show clear error |
| localStorage quota/corruption | Preserve in-memory document, warn and offer JSON download/reimport; verify actual UI behavior |
| Wrong export geometry | Keep source JSON, reproduce fixture and browser, revert renderer change |
| Backward migration regression | Stop release; restore compatibility or accepted migration path without silent data loss |
| Future server outage | Use approved rollback, recovery and incident runbook; restore tested backup |
| Third-party cost spike | Pause optional resources, inspect usage, enforce budget/limits without data loss |

## 5. Release report format

```text
Candidate SHA and source branch:
Customer workflows and actual exported artifacts:
Rust / TypeScript / WASM / browser / Docker / audit CI:
Cross-browser and accessibility results:
Security risks and accepted exceptions:
Known limitations:
Deployment environment and rollback test:
Cost envelope and provider terms:
Business/legal approvals:
Go / No-go and owner signoff:
```

Do not relabel a workflow result from an older PR head as candidate release evidence.
