# Project Status, Decisions and Evidence Register

**Status:** Living, source-informed register. This is a snapshot guide, **not** a substitute for current GitHub PR state or `next.md`. Review date: 2026-11-16.

## Status definitions

- **IMPLEMENTED:** observed in source at identified revision; may need current tests.
- **PROPOSED:** planning/ADR only, not an existing feature.
- **VERIFIED:** specific test/workflow executed on stated revision.
- **IN REVIEW:** PR open, not merged.
- **BLOCKED/UNKNOWN:** evidence or decision unavailable.
- **RELEASED:** separately approved, shipped artifact/environment supported by release evidence.

## Current source-informed boundaries

| Area | Status / evidence | Important qualification |
| --- | --- | --- |
| Nuxt/Vue/TypeScript editor | IMPLEMENTED | UI and browser paths require ongoing accessibility regression |
| Rust design-core + thin WASM adapter | IMPLEMENTED | No native C ABI or C17 engine in this product |
| Schema v4 frame and visual-grid model | IMPLEMENTED in repo design/contracts | Grid ≠ data-bearing Table |
| v1–v3 migration paths | IMPLEMENTED in documented core; test per revision | Future v5 not assumed |
| Browser-local JSON save/reopen | IMPLEMENTED | localStorage is not server backup |
| Page raster background image | IMPLEMENTED as page-level asset | Not an independently editable image element |
| PNG export and browser print | IMPLEMENTED | Direct PDF generator and universal print fidelity not established |
| Semantic Tables v5 | PROPOSED in ADR-0006 and milestone document | Requires model, migration, UI, history, keyboard/export tests |
| Rust/Axum API, PostgreSQL, accounts | DEFERRED / PROPOSED | Not current runtime or permission to collect user data |
| Payment, paid tier, collaboration | PROPOSED | No approved price, processor, billing model or demand proof |
| Accessibility/keyboard/screen reader | PARTIAL / UNVERIFIED manual gate | Issue #82 / manual worksheet should be reconciled |
| Cross-browser PNG CI improvement | IN REVIEW at PR #102 on review date | Do not infer latest CI or merge from this dated snapshot |
| M1 baseline report | Historical evidence in testing docs | Revalidate current SHA before asserting up-to-date results |

## Decision principles

| Decision | Rationale | Revisit trigger |
| --- | --- | --- |
| Local-first browser prototype | Avoid premature hosting/account cost | Real sync or shared team demand |
| Framework-independent Rust document core | Stable schema, commands and native/WASM tests | Measured incompatibility, accepted ADR |
| Thin WASM adapter | Reuse validation, minimize duplicated policy | Contract boundary changes |
| Nuxt/Vue/TS frontend | Current implemented UI | Unambiguous need for replacement |
| No premature microservices, Redis, queue, Kubernetes | Operational cost disproportionate to prototype | Measured service-specific need |
| First-class semantic Table rather than Grid + text | Atomic identity, row/cell data, accessibility and history | Accepted schema design changes |
| No premature billing | Cost and user value not validated | Retained paying demand, security/finance approval |

## Milestone closure record

```text
Milestone/task ID:
Issue and PR:
Implementation / merge / release SHAs (distinct):
Exact tested SHA and workflow/run URLs:
Acceptance requirements passed:
Manual checks completed:
Cost/resource implication:
Known risks, deferred scope and rollback:
Owner decision:
Next READY task:
```

Keep dated decisions with ADRs and actual acceptance in PRs; do not duplicate entire implementation history here. Reconcile this register and `next.md` at each merge and before release.
