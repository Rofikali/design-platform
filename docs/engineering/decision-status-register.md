# Project Status, Decisions and Evidence Register

**Status:** Dated decisions/evidence register, reconciled 2026-11-16 with live GitHub. **Generated milestone status comes from [milestone-record.json](milestone-record.json);** historical boundary notes below are dated context, and live GitHub overrides all snapshots.

<!-- milestone-sync:start -->
<!-- GENERATED from docs/engineering/milestone-record.json by scripts/sync-milestone-docs.mjs. DO NOT EDIT. -->
### Milestone snapshot (generated: 2026-11-20)

**Reference main:** 6a3f9d07aa2ef7c0b84f9dcb42b579138b92d9b0 (dated snapshot; re-check live GitHub before acting).

**NOW:** **DP-M2-TBL-02J — Maximum-height final-row deletion history regression** [IN_PROGRESS]. [PR #149](https://github.com/Rofikali/design-platform/pull/149)

**NEXT:** DP-M2-TBL-02B [IN_PROGRESS]; DP-SEC-01 [BLOCKED] [Issue #118](https://github.com/Rofikali/design-platform/issues/118); DP-M1-ACC-02 [BLOCKED] [Issue #82](https://github.com/Rofikali/design-platform/issues/82); DP-M1-BG-09 [PLANNED] [Issue #85](https://github.com/Rofikali/design-platform/issues/85)

**Review gate:** Owner-authorized autopilot may review and merge only after all exact-head/integration CI, security, branch protection and required independent-review gates pass. No automatic publishing or deployment.

| Milestone | Status | PR / issue | Verified scope (not a live CI claim) |
| --- | --- | --- | --- |
| DP-M1-BG-07 — Image-backed PNG pixel acceptance | MERGED | [PR #112](https://github.com/Rofikali/design-platform/pull/112) | Downloaded PNG pixel and foreground regression merged |
| DP-M1-BG-08 — Image-backed Chrome print/PDF regression | MERGED | [PR #113](https://github.com/Rofikali/design-platform/pull/113) | Chrome print stylesheet and one-page PDF regression merged; physical printer unverified |
| DP-M1-ACC-03 — Keyboard-operated background image removal | MERGED | [PR #115](https://github.com/Rofikali/design-platform/pull/115) [Issue #82](https://github.com/Rofikali/design-platform/issues/82) | Tab/Space background-removal browser regression merged; final-head CI, dependency audit and cross-browser export passed. Manual accessibility issue #82 remains open |
| DP-M1-ACC-02 — Manual editor accessibility audit | BLOCKED | [Issue #82](https://github.com/Rofikali/design-platform/issues/82) | Requires real keyboard, NVDA or VoiceOver, zoom and contrast observations; automation cannot certify |
| DP-M1-BG-09 — Physical printer and PDF fidelity review | PLANNED | [Issue #85](https://github.com/Rofikali/design-platform/issues/85) | Automated Chrome PDF is not physical printer or cross-browser output certification |
| DP-M1-ACC-04 — Automated 200% zoom and keyboard layout regression | MERGED | [PR #119](https://github.com/Rofikali/design-platform/pull/119) [Issue #82](https://github.com/Rofikali/design-platform/issues/82) | PR #119 merged as 83f3945f on 2026-11-18; 320px/640px zoom/reflow and keyboard regressions integrated. PR-head application, cross-browser and dependency audit CI passed; manual screen-reader audit #82 remains open. |
| DP-SEC-01 — Production JavaScript picomatch advisory remediation | BLOCKED | [Issue #118](https://github.com/Rofikali/design-platform/issues/118) | PR #130 restored strict production dependency audit, but issue #118 remains open; independently verify actual advisory remediation and exposure before any production authorization. |
| DP-SEC-02 — Built Nuxt bundle dependency indicator inventory | MERGED | [PR #120](https://github.com/Rofikali/design-platform/pull/120) [Issue #118](https://github.com/Rofikali/design-platform/issues/118) | PR #120 merged as adb3bd1f into main on 2026-11-18. Rust/Nuxt, browser, cross-browser, doc sync and Rust audit passed; JS audit passed ONLY with owner-approved development exception through 2026-12-02, not a fix or production approval. |
| DP-DEPS-01 — Nuxt 4 compatibility upgrade | MERGED | [PR #98](https://github.com/Rofikali/design-platform/pull/98) [Issue #118](https://github.com/Rofikali/design-platform/issues/118) | Nuxt 4.6.4 PR #98 merged into main as 9ccac618 on 2026-11-18. Nuxt/Rust, browser export, Docker, docs and dependency checks passed on integrated head b8d73662; JS audit passed with DEVELOPMENT-ONLY picomatch exception, not a vulnerability fix or release approval. |
| DP-M2-TBL-02A — Accessible first table-cell editing workflow | MERGED | [PR #123](https://github.com/Rofikali/design-platform/pull/123) | PR #123 merged as 32e9c5a5 on 2026-11-18: add table, accessible cell selection/editing, text bounds, JSON/history/autosave and browser regression. Exact-head Nuxt, Rust, PNG cross-browser, doc and audit checks passed; manual a11y remains open. |
| DP-M2-TBL-02B — Bounded accessible table row and column commands | IN_PROGRESS | — | Row/column editing and bounded schema-v5 validation merged through PR #138; manual accessibility issue #82 remains open. |
| DP-M2-TBL-02C — Over-budget imported table regression | MERGED | [PR #138](https://github.com/Rofikali/design-platform/pull/138) | PR #138 merged into main as b033a44d on 2026-11-20; malformed 20,001-code-point imported table rejection and source immutability regression integrated; manual accessibility remains open. |
| DP-M2-TBL-02D — Header-row deletion schema-v5 history regression | MERGED | [PR #139](https://github.com/Rofikali/design-platform/pull/139) | PR #139 merged into main as ce249b53 on 2026-11-20; sole-header deletion, schema-v5 serialization and undo/redo regression integrated; manual accessibility remains open. |
| DP-M2-TBL-02E — Maximum-width table column deletion history regression | MERGED | [PR #140](https://github.com/Rofikali/design-platform/pull/140) | PR #140 merged into main as d21215d4 on 2026-11-20; 20-column deletion Unicode, history and schema-v5 regression integrated; manual accessibility remains open. |
| DP-M2-TBL-02F — First-row header insertion history regression | MERGED | [PR #141](https://github.com/Rofikali/design-platform/pull/141) | PR #141 merged into main as 92e25a6b on 2026-11-20; header insertion Unicode and undo/redo regression integrated; manual accessibility remains open. |
| DP-M2-TBL-02G — Headerless row insertion schema-v5 history regression | MERGED | [PR #147](https://github.com/Rofikali/design-platform/pull/147) | PR #147 merged as 1cdcbc7e on 2026-11-20; headerless row insertion Unicode/schema-v5 history regression integrated; manual accessibility remains open. |
| DP-M2-TBL-02H — Single-column deletion safety regression | MERGED | [PR #146](https://github.com/Rofikali/design-platform/pull/146) | PR #146 merged into main as 14bfe826 on 2026-11-20; invalid single-column deletion preserves Unicode, header and schema-v5 content; no production release. |
| DP-M2-TBL-02I — Headerless first-row deletion schema-v5 history regression | MERGED | [PR #148](https://github.com/Rofikali/design-platform/pull/148) | PR #148 merged at 6a3f9d07 on 2026-11-20; headerless first-row deletion Unicode/schema-v5 history regression integrated; manual accessibility remains open. |
| DP-M2-TBL-02J — Maximum-height final-row deletion history regression | IN_PROGRESS | [PR #149](https://github.com/Rofikali/design-platform/pull/149) | PR #149 implements 20-row final-row deletion, Unicode/header preservation, schema-v5 JSON and undo/redo regression; exact-head CI pending, not merged. |

<!-- milestone-sync:end -->

## Status definitions

- **IMPLEMENTED:** observed in source at identified revision; may need current tests.
- **PROPOSED:** planning/ADR only, not an existing feature.
- **VERIFIED:** specific test/workflow executed on stated revision.
- **IN REVIEW:** PR open, not merged.
- **BLOCKED/UNKNOWN:** evidence or decision unavailable.
- **RELEASED:** separately approved, shipped artifact/environment supported by release evidence.

## Historical source-informed boundaries (dated observations, not live state)

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
| Cross-browser PNG CI improvement | **OPEN / FAILED** [PR #102](https://github.com/Rofikali/design-platform/pull/102), head `00c926d651883f46783347e1e88cd7f223b99de0` | CI, audit and dev Docker success; [cross-browser #16](https://github.com/Rofikali/design-platform/actions/runs/43825386593) failed: export status overwritten by autosave announcement; do not merge on partial green |
| M1 baseline report | [PR #101](https://github.com/Rofikali/design-platform/pull/101) **MERGED**, documentation evidence | Reports are dated; revalidate current SHA before claiming fresh test results |
| Seven-level documentation handbook | [PR #103](https://github.com/Rofikali/design-platform/pull/103) **MERGED** at `c6a03ba5f378f237e442377e44bfefc28a52fcf6` | Docs only: it does not release a SaaS or fix runtime defects |
| Semantic Tables v5 core | [Draft PR #93](https://github.com/Rofikali/design-platform/pull/93) **OPEN** on old head `e8cfcfd3539dfccd9986eabd82d1fb05a24f30b9` | Proposed partial core/readonly slice; migration/rebase and latest checks needed; not editable table functionality |
| Nuxt major-version dependency bump | [PR #98](https://github.com/Rofikali/design-platform/pull/98) **OPEN** | [CI failed](https://github.com/Rofikali/design-platform/actions/runs/43826311389); [dependency audit passed](https://github.com/Rofikali/design-platform/actions/runs/43826311510) on its own SHA, not a merge gate pass |
| Legacy background feature branch | [Draft PR #87](https://github.com/Rofikali/design-platform/pull/87) **OPEN** | Compare against main's already present background implementation; do not replay old migrations |
| Manual accessibility | [Issue #82](https://github.com/Rofikali/design-platform/issues/82) **OPEN** | Screen reader, keyboard, focus, zoom and contrast remain to be verified |
| Background-image acceptance | [Issue #85](https://github.com/Rofikali/design-platform/issues/85) **OPEN** | Existing implementation does not prove every remove/history/export/print acceptance case |

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
