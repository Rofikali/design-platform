# Design Platform — LIVE Work Board and Master Roadmap

> **Live-board snapshot:** Reconciled 2026-11-17 against GitHub; main `1c99b3dae0c9a8d568870406ff40341d708100d9` before the work on this branch. The snapshot is **dated**, not a live-updating dashboard. Re-fetch main/PRs/checks before executing or declaring completion.
>
> **Source discipline:** This board adopts the **NOW / NEXT / LATER**, evidence, priority and agent continuation pattern in `Rofikali/imgengine/next.md`, not its IMGENGINE C17, FFI, VPS or five image tools. Code/tests and GitHub state override stale descriptions.
>
> **Authority:** [AGENTS.md](AGENTS.md) = mandatory rules; [SKILLS.md](SKILLS.md) = recipes; **this live board** = task selection and current status; [documentation map](docs/engineering/documentation-map.md) = detailed contracts; [status register](docs/engineering/decision-status-register.md) = decisions and durable evidence.

> **Hourly autopilot enabled (2026-11-16):** An independent ChatGPT scheduled task named **Design Platform Autopilot** runs the bounded "go ahead" workflow hourly while enabled. Its [runbook](docs/engineering/hourly-autopilot.md) defines status reconciliation, seven-level review, zero-unapproved-spend, exact-head checks, one task per run and owner-authorized verified PR review and merge gates (latest owner rule, 2026-11-17). The task can be paused manually in ChatGPT. This file is a status board, not the scheduler.

## LIVE NOW / NEXT / LATER — authoritative task selector

### Current milestone snapshot — generated

<!-- milestone-sync:start -->
<!-- GENERATED from docs/engineering/milestone-record.json by scripts/sync-milestone-docs.mjs. DO NOT EDIT. -->
### Milestone snapshot (generated: 2026-11-20)

**Reference main:** 1cdcbc7edf319ffd39812762a0005ceb1b598924 (dated snapshot; re-check live GitHub before acting).

**NOW:** **DP-M2-TBL-02I — Headerless first-row deletion schema-v5 history regression** [IN_PROGRESS].

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
| DP-M2-TBL-02I — Headerless first-row deletion schema-v5 history regression | IN_PROGRESS | — | Regression committed on implementation branch: removing row zero from headerless table preserves Unicode body text, source immutability, schema-v5 JSON and undo/redo. Exact-head CI pending. |

<!-- milestone-sync:end -->

### Historical parallel review lanes — recheck live GitHub (not generated)

| Lane / ID | Verified state at snapshot | Next smallest action | Exit evidence |
| --- | --- | --- | --- |
| **DP-M1-ACC-02** | [Issue #82](https://github.com/Rofikali/design-platform/issues/82) **OPEN**; automated accessibility coverage exists but manual screen reader/keyboard/zoom review is not established | Perform/document NVDA+browser, keyboard-only, focus, live announcements, 200% zoom and contrast review; remediate reproduced failures | Device/tool versions, steps, results and linked regression PRs; manual audit signed off |
| **DP-M1-BG-03** | [Issue #85](https://github.com/Rofikali/design-platform/issues/85) **OPEN**; background validation PR #107 and remove/history/reopen PR #108 MERGED; JSON/PNG/print acceptance remains | Reconcile background implementation, schema/negative fixture parity, remove/undo/redo, autosave/reopen, JSON round-trip and image-backed PNG/print evidence | Full issue criteria verified; close issue only with owner/reviewer agreement |
| **DP-M1-CI-04** | [PR #102](https://github.com/Rofikali/design-platform/pull/102) owns cross-browser, caching and conditional development-container work; **MERGED** | Main and PR-head checks succeeded; measure actual cold/warm build times before claiming measured speed gains | Latest head all required gates green, reviewed PR, owner approval; no invented cost/speed numbers |
| **DP-M1-DOC-05** | [PR #101](https://github.com/Rofikali/design-platform/pull/101) **MERGED**; baseline evidence recorded | Reconcile old checklist when new release evidence exists; avoid rebuilding same documentation | Link historical reports as historical and reflect actual merged SHA |
| **DP-M1-DEP-06** | [PR #98](https://github.com/Rofikali/design-platform/pull/98) **OPEN** Nuxt 3→4 dependency jump; [CI](https://github.com/Rofikali/design-platform/actions/runs/43826311389) **FAILED**, audit [PASSED](https://github.com/Rofikali/design-platform/actions/runs/43826311510) at its head `643799551a35373a92d7f9b9aae1729da04d7f40` | Evaluate migration compatibility, release-notes, lockfile, security and source changes in separate reviewed dependency work | Passing full current-head CI plus supported migration test and approval |
| **DP-M2-TBL-01** | [PR #93](https://github.com/Rofikali/design-platform/pull/93) **MERGED** as `803e7f9edfe2ef5edd0f8234eac7a996dd8928d9`; first-class schema-v5 table core and readonly canvas support exist | Preserve v1–v4 migrations and distinguish data Tables from visual Grids; next user-facing milestone is cell editing/keyboard/history | Merged core **does not** establish a full accessible table editor or customer workflow |
| **DP-LEGACY-87** | [PR #87](https://github.com/Rofikali/design-platform/pull/87) **DRAFT**, older schema-v3 background branch; background-related work already exists in main | Assess whether draft is superseded; avoid blindly merging an old migration branch or repeating its code | Explicit close/rebase decision after diff comparison |

### Historical completed work — generated status above takes precedence

| ID | Completed deliverable | Evidence / limits |
| --- | --- | --- |
| **DP-DOC-100** | Owner-facing product, free/paid, security, architecture and management roadmap `next.md` | [PR #100](https://github.com/Rofikali/design-platform/pull/100) **MERGED**; documentation, not shipped SaaS |
| **DP-DOC-101** | CI baseline evidence and refreshed roadmap checkpoint | [PR #101](https://github.com/Rofikali/design-platform/pull/101) **MERGED**; reports are dated, not current universal verification |
| **DP-DOC-103** | Seven-level handbook: agent handoff, continuation, HLD/LLD, cost/test/security/finance/release guides | [PR #103](https://github.com/Rofikali/design-platform/pull/103) **MERGED** as `c6a03ba5f378f237e442377e44bfefc28a52fcf6`; **docs only** |
| **DP-DOC-105** | Hourly autopilot, seven-level PR review/merge authority and governance links | [PR #105](https://github.com/Rofikali/design-platform/pull/105) **MERGED** as `872a2cb35db141b5e76a84d9bce3bc273542635b`; no deployment or spending permission |
| **DP-M1-BG-07** | Actual image-backed PNG pixels and foreground preservation | [PR #112](https://github.com/Rofikali/design-platform/pull/112) **MERGED** at `1c99b3dae0c9a8d568870406ff40341d708100d9`; print remains separate |
| **DP-M1-BG-06** | Legacy background JSON import/export/reopen regression | [PR #110](https://github.com/Rofikali/design-platform/pull/110) **MERGED** as `adb6d3b6f020307412348d71ae27b80d6e6f18e8`; image-backed PNG/print fidelity remains OPEN |
| **DP-M1-BG-108** | Real-browser background remove/undo/redo/reopen regression with foreground preservation | [PR #108](https://github.com/Rofikali/design-platform/pull/108) **MERGED** as `8d72b8a85086dad94d4ba18c2b738e481db62302`; full JSON/PNG/print acceptance remains OPEN |
| **DP-M1-BG-107** | Bound encoded embedded raster input and reject noncanonical base64 before decoding | [PR #107](https://github.com/Rofikali/design-platform/pull/107) **MERGED** as `5164b55bb602a021029915da23eb316fd5bffff4`; does not close the full background workflow acceptance |
| **DP-M1-A11Y-106** | Correct Table versus Grid accessible canvas-selection labels with regression tests | [PR #106](https://github.com/Rofikali/design-platform/pull/106) **MERGED** as `3755b363605dc1cec62ea481578cfd6487ebed79`; manual screen-reader/keyboard audit [issue #82](https://github.com/Rofikali/design-platform/issues/82) remains OPEN |
| **DP-MVP-BASE** | Local-first Nuxt/Vue editor, Rust design core + WASM, schema-v4 frames/visual grids, JSON import/export, bounded history, page backgrounds, PNG and browser-print path | **IMPLEMENTED in current source**, not a completed manual accessibility audit or paid/production release |

### NEXT — dependent milestones, not automatically READY

1. **DP-M1-EXIT:** cross-browser PR #102 and accessibility label PR #106 are merged; reconcile remaining manual accessibility, background-image acceptance and security/resource evidence. Record any residual risks. M1 cannot be marked CLOSED until explicit exit criteria are met.
2. **DP-M2-TBL-01:** first-class table-core PR #93 is merged; verify completeness and prioritize bounded editable table UX tasks after remaining M1 blockers. Schema v5 must preserve v1–v4, Rust/TS/WASM parity, first-class cell ownership, export geometry and safe text escaping.
3. **DP-M2-TBL-02:** implement table cell editing, row/column operations, history, keyboard accessibility and export in *separate bounded* PRs with real teacher/shop acceptance.
4. **DP-M3:** document/editor-state modularization, layers, alignment/snapping and image elements only in response to tested user workflows.
5. **DP-M4–M5:** typography, fonts/licensing, templates and direct PDF/print fidelity with actual exported artifact and print evidence.
6. **DP-M6–M8:** customer validation, cost model, optional Rust/Axum accounts/storage, business packages and paid launch *only after* a separate owner-approved architecture/security/legal/finance gate.

### LATER / DEFERRED — do not silently start

Account sync, collaboration, a multi-tenant SaaS, paid subscriptions, metered API, desktop, marketplace and mobile apps are **proposals**. Audio, video, animation and unrelated spreadsheet functionality are **out of initial scope**. No price, cloud bill, domain purchase, new database or launch is authorized by this board.

## Permanent status rules: "go ahead" and milestone reconciliation

When the owner says **"go ahead"**, perform the **next smallest eligible bounded task in the NOW lane** rather than asking for a repeated product brief. **Latest owner rule permits the autopilot to review and merge qualifying PRs after exact-head/integration CI, security, GitHub protection and any required independent-review gates. No publishing or deployment permission.**

**Every new session, after a PR update, after checks complete and after a merge:**

1. Fetch live `main` full SHA, current branch/worktree, open PRs/issues, latest PR head SHA and exact attached workflow/job statuses. GitHub checks from older commits are **HISTORICAL**.
2. Reconcile milestone rows: `PLANNED → READY → IN_PROGRESS → PR_OPEN → CI_PENDING → READY_FOR_REVIEW → MERGED → RELEASE_CANDIDATE → RELEASED`; `FAILED`, `BLOCKED`, `CANCELLED`, `DEFERRED` are explicit. `IMPLEMENTED` and `VERIFIED` are *distinct attributes*; not substitute states.
3. First choose verified P0 security/data-loss/release-blocking defects. Otherwise continue an existing **in-progress PR** before starting a duplicate feature. Then choose the first dependency-cleared READY task in NOW. Keep parallel tracks independent.
4. Update **docs/engineering/milestone-record.json** with task ID, scope, status, PR, observed SHA and summary; run **node scripts/sync-milestone-docs.mjs** to synchronize all seven generated sections. Preserve rich PR/CI evidence in GitHub and milestone handoffs. Preserve original history in PRs/evidence docs rather than pasting long logs into `next.md`.
5. Don't rewrite the main board for each CI tick; only update with meaningful state transitions. A failed check needs its job/step evidence, not a 10,000-line log.
6. One small PR per bounded milestone, coherent commits, no redundant Docker/CI work. Read [agent continuation](docs/engineering/agent-continuation-runbook.md), [seven-level review](docs/engineering/seven-level-operating-model.md), [handoff](docs/engineering/agent-milestone-handoff.md), and [test lanes](docs/engineering/change-scoped-verification.md).
7. Review the actual PR and merge only after every required latest-head/integration CI, security, independent-review (if required) and branch-protection gate passes. Reconcile GitHub and update the milestone record after a confirmed merge. Publishing/deployment is never automatic. **CI success is not merge; merge is not release; a markdown rule cannot restart a stopped agent.**

---

## Master product, engineering, finance and release reference (long-term)

The sections below preserve the detailed product roadmap and backlog, **not** an alternative live task-selection list. If a statement below conflicts with the live board or current GitHub, reconcile it before acting. Long-term architecture and commercial items are explicitly conditional.

## 0. How to use this roadmap

1. Read `AGENTS.md` first. Its engineering constitution is binding.
2. Read `SKILLS.md` for the playbooks relevant to the task.
3. Read this `NEXT.md` to understand direction, sequencing, constraints and the next milestone.
4. Read the linked product, architecture, ADR, security, testing and operations documents before changing that area.
5. Inspect the live repository and current CI. This roadmap can become stale; code and observed evidence outrank assumptions.
6. Work only on the **Current execution queue** unless the owner explicitly reprioritizes.
7. Create a small PR, review the actual diff and exact-head evidence, then merge only if the owner's standing authorization and repository gates allow it. Never merge merely because a task is marked complete in this file.

### Status vocabulary

- **Implemented:** verified in the repository snapshot or by recorded evidence.
- **In progress:** implementation is underway; scope and branch must be identified.
- **Proposed:** agreed direction, not implemented.
- **Deferred:** intentionally not in the current scope.
- **Not verified:** no current evidence; do not claim success.
- **Blocked:** dependency, decision or failure prevents safe progress.

A checkbox is a tracking aid, not evidence. Add a link to the PR, commit, CI run, test report or decision when changing an item to complete.

---

## 1. Product vision and mission

Build a trustworthy, approachable, template-driven design editor for people who need to create useful, professional documents without learning complex desktop design software.

### Initial product promise

A teacher, tutor, coaching centre or small shop owner should be able to:

1. Start from a useful template or blank page.
2. Add and edit text and visual elements.
3. Arrange content accurately.
4. Save and reopen a design.
5. Export a predictable, high-quality file.
6. Understand where their data is stored and what is free or paid.

### Initial customer segments

| Segment | Job to be done | First useful outcome |
|---|---|---|
| Teachers and tutors | Prepare exam papers and worksheets | A clean, printable question paper |
| Coaching centres and schools | Reuse and adapt assessment layouts | Consistent branded paper templates |
| Small shops and retailers | Prepare offers, price lists and shop banners | A clear printable/promotional design |
| Local service businesses | Create simple notices and promotional material | Reusable, editable designs |

These are target hypotheses, not validated demand. Interview and observe real users before claiming product-market fit.

### Product boundary

The long-term direction may be Canva-like in the design-editor sense: text, shapes, tables, frames, grids, images, typography, templates, layers, reusable assets and exports.

Do **not** silently expand into audio, video, animation, social networks, a spreadsheet suite, a stock-media marketplace or unrelated products. Each major expansion requires an owner decision, user evidence, an ADR where architecture changes, and a cost/security review.

---

## 2. Current verified baseline and known gaps

The repository snapshot inspected for this roadmap shows:

### Implemented or documented in the codebase

- Nuxt/Vue/TypeScript browser editor.
- Rust framework-independent document core.
- Thin Rust-to-WASM adapter.
- Versioned document schema v4 with explicit older-schema migration.
- Text, rectangle, frame and visual-grid elements.
- Page background image workflow for bounded PNG/JPEG/WebP inputs.
- Bounded undo/redo history.
- Browser-local autosave/restore.
- JSON import/export with validation.
- Exam Paper A4 and Shop Banner starter templates.
- PNG export from the document model.
- Browser print-dialog PDF workflow (not a direct dedicated PDF export pipeline).
- Shared fixtures and Rust/TypeScript/WASM validation paths.
- Rust, frontend and browser-oriented CI checks.
- Docker development workflow.
- Engineering constitution, skill playbooks, initial threat model and testing strategy.
- Semantic Tables schema-v5 proposal and ADR-0006; these are **proposed documentation**, not implemented schema-v5 functionality.

### Important current limitations

- No authentication, account system, server API, server-side persistence, cross-device sync, collaboration or billing.
- LocalStorage is not cloud backup and can be cleared or unavailable.
- PDF currently depends on the browser print dialog; direct, deterministic PDF generation is future work.
- Full accessibility review, cross-browser export fidelity and performance budgets remain open.
- A browser/WASM validator is not a security boundary.
- No production deployment, incident-response exercise, restore drill, paid conversion or unit economics are verified by this roadmap.
- CI workflow definitions were inspected, but this review did not execute the full suite or verify a green current-main workflow.

Before changing these statements, inspect current code and attach evidence. Never copy a planned feature into the "implemented" list merely because an ADR exists.

---

## 3. Product principles and non-negotiable constraints

1. **User value before feature count.** Prioritize successful exam-paper and shop-banner workflows over a large tool catalog.
2. **Correctness before performance; security before convenience; reliability before scale; cost before unnecessary infrastructure.**
3. **The document contract outlives the UI framework.** Preserve old customer documents across schema and renderer changes.
4. **Local-first while it is sufficient.** Do not require accounts or a backend for a useful local prototype.
5. **Privacy by design.** Collect the minimum data needed; explain storage, retention, export and deletion.
6. **No silent data loss.** Invalid imports, migrations, autosaves and exports must fail clearly and preserve recoverable source data.
7. **Accessibility is product quality.** Core workflows must not require a mouse.
8. **Free means a clearly bounded cost model.** A provider's free tier can change, expire, require a card or create overage exposure. Never promise lifetime-free hosting without verified terms and a zero-bill plan.
9. **Paid does not automatically mean better.** Buy a service only when it reduces risk or total cost of ownership.
10. **Evidence beats confidence.** A test plan is not a test result; a scanner is not a security audit; a benchmark without a workload is not a performance claim.
11. **No architecture theatre.** Use SOLID, DRY, KISS, YAGNI, DDD, Hexagonal Architecture, CQRS and event-driven patterns only when they solve a demonstrated problem.
12. **Owner approval.** Standing authorization covers gated safe PR merges, not deployment, paid charges, pricing, customer-data retention or irreversible schema/security decisions.

### Technology direction

- Frontend: Nuxt, Vue, TypeScript, JavaScript.
- Domain/core: Rust, framework-independent.
- Browser adapter: WebAssembly, kept thin.
- Future backend, when justified: Rust/Axum.
- Future relational persistence, when justified: PostgreSQL.
- No Python, FastAPI, Django REST Framework or Flask.
- No default requirement for Redis, Kafka, RabbitMQ, Kubernetes, microservices, a separate worker fleet or a paid SaaS dependency.

---

## 4. Product roadmap — what we intend to build

### 4.1 Editor foundation

- [x] Text and rectangle primitives (verify current behavior before extension).
- [x] Frames and visual grids (schema v4).
- [x] Starter Exam Paper and Shop Banner templates.
- [x] Page-level raster background image workflow.
- [x] JSON import/export and browser-local persistence.
- [x] Initial PNG export.
- [ ] Reliable semantic tables (schema v5; proposed).
- [ ] Image elements placed, cropped, scaled and layered independently of page background.
- [ ] Typography controls: font family, size, weight, line height, letter spacing, alignment and color.
- [ ] Alignment guides, snapping, rulers, margins, safe areas and consistent spacing.
- [ ] Layers panel, reorder, lock, hide, duplicate and delete.
- [ ] Multi-select, group/ungroup and keyboard shortcuts.
- [ ] Reliable selection and editing on desktop, tablet and mobile-sized screens.
- [ ] More reusable templates based on user research.
- [ ] Document/page duplication and clearly defined multi-page behavior.

### 4.2 Semantic tables

Use the existing ADR-0006 and semantic-tables milestone contract as the starting point.

- [ ] Finalize schema-v5 limits and migration rules before coding.
- [ ] Rust and TypeScript types/validation plus shared fixtures.
- [ ] v1–v4 to v5 migration tests and preservation tests.
- [ ] Add/edit table cells and bounded row/column operations.
- [ ] Keyboard navigation and accessible cell editor.
- [ ] Atomic undo/redo for cell and structural operations.
- [ ] Deterministic rendering and text wrapping/clipping.
- [ ] JSON, PNG and print/PDF preservation.
- [ ] Teacher and shop-owner workflow validation.

Do not turn this into a spreadsheet in this milestone. Formulas, sorting, filters, merged cells, independent cell geometry, XLSX and multi-page table continuation are deferred until real users demonstrate the need.

### 4.3 Images and assets

- [ ] Place an image as a document element.
- [ ] Crop, contain/cover, resize and reposition predictably.
- [ ] Define accepted formats, byte/pixel/dimension limits and decoding behavior.
- [ ] Avoid arbitrary remote URL fetching by default.
- [ ] Define asset ownership, local persistence and export behavior.
- [ ] Provide clear licensing and attribution rules for bundled templates, icons, images and fonts.
- [ ] Test malformed files, decompression bombs, oversized images and cleanup.
- [ ] Decide whether a future asset library is local, account-owned or licensed third-party content.

### 4.4 Typography and design system

- [ ] Establish design tokens for spacing, color, typography, borders and controls.
- [ ] Define supported fonts and fallback behavior.
- [ ] Review font redistribution and embedding licenses before shipping fonts.
- [ ] Ensure text measurement and wrapping are deterministic enough for export.
- [ ] Add accessible color contrast and focus states.
- [ ] Test Unicode, Assamese, Bengali, Hindi, Nepali and English text shaping/rendering before claiming language support.
- [ ] Test missing-font behavior and cross-platform export differences.

### 4.5 Export and print quality

- [ ] Define a renderer/export architecture independent from UI components.
- [ ] Preserve page dimensions, physical units, margins, bleed and safe areas.
- [ ] Implement direct PDF export only after selecting and reviewing a suitable Rust-compatible library or controlled rendering approach.
- [ ] Decide raster/vector output trade-offs and font embedding.
- [ ] Test PNG and PDF contents, dimensions, page count, clipping, text, image quality and color.
- [ ] Verify print dimensions with real printer/user workflows.
- [ ] Add cancellation, timeouts and output-size bounds if export becomes asynchronous.
- [ ] Record browser/OS/font versions for visual regression evidence.

Never state "print-ready" until physical page geometry, typography, margins and representative printer output have been checked.

---

## 5. User experience, accessibility and localization

### Core interaction requirements

- Every pointer action has a keyboard-accessible alternative.
- Visible controls have programmatic labels and logical focus order.
- Selection and canvas status are announced to assistive technology where appropriate.
- Focus is visible and never lost after modal or panel operations.
- Destructive actions are clear and recoverable where feasible.
- Empty, loading, success, invalid, offline, storage-full and export-failure states are designed.
- Touch targets and zoom work on small screens.
- Reduced-motion preferences are respected.
- No color-only status communication.

### Accessibility verification

- [ ] Automated accessibility checks in CI where appropriate.
- [ ] Manual keyboard-only review.
- [ ] Screen-reader review on representative supported platforms.
- [ ] Contrast review.
- [ ] Zoom/reflow review.
- [ ] Table keyboard-navigation review.
- [ ] Record findings in `docs/testing/accessibility-manual-audit.md`; never mark untested checks as passed.

### Localization

Start with a stable localization design, not a premature translation project.

- [ ] Externalize user-facing UI strings.
- [ ] Define locale, number/date and measurement behavior.
- [ ] Verify Unicode text in editor, JSON, PNG and PDF.
- [ ] Test fonts and line breaking for target scripts.
- [ ] Translate only after terminology and user demand are validated.

---

## 6. Architecture and technical direction

### Target architecture (staged, not all implemented)

```text
User
  |
Nuxt / Vue / TypeScript
  |-- presentation and accessible controls
  |-- transient interaction state
  |-- local document workflow
  |
Application/use-case boundary
  |
Rust design-core
  |-- versioned document model
  |-- validation and migrations
  |-- geometry and domain commands
  |-- deterministic layout rules
  |
WASM adapter (browser)        Native Rust runtime (future server)
  |                                  |
Browser renderer/export          Rust/Axum API (when justified)
                                     |
                             PostgreSQL (when justified)
                             Asset storage (when justified)
```

### Architecture rules

- Keep a modular monolith by default.
- Keep Rust domain logic independent of Vue, Nuxt, HTTP, browser APIs and database clients.
- Keep WASM as an adapter, not a second source of business rules.
- Keep document state distinct from transient UI state (selection, hover, active tool, drag preview).
- Model user-visible edits as explicit operations where undo/redo requires them.
- Keep renderers deterministic from validated document data.
- Define public module contracts and avoid circular dependencies.
- Add ports/adapters at genuine external boundaries; do not create pass-through abstractions.
- Use ADRs for schema, renderer, persistence, API, authentication, asset storage, licensing and other difficult-to-reverse decisions.

### Patterns to apply when justified

| Pattern | Suitable use | Do not use when |
|---|---|---|
| Command | Undo/redo and atomic user operations | It only wraps a trivial setter |
| Strategy | Multiple genuine rendering/export algorithms | There is only one stable path |
| Factory | Complex template/document construction | A simple constructor is enough |
| Adapter | WASM, browser, storage, API or renderer boundary | It only renames a method |
| State | Explicit editor interaction state machine | A boolean is sufficient |
| Observer | Multiple consumers of meaningful changes | Direct composition is clearer |
| Repository | Real persistence boundary | Data is still local and simple |
| Builder | Complex validated construction | It adds ceremony to simple structs |

DDD, Hexagonal Architecture, CQRS and event-driven systems are options, not goals. Adopt them only when domain complexity, ownership, independent scaling or asynchronous workflow requirements justify the added complexity.

---

## 7. Free, paid and build-versus-buy policy

This section is a decision framework, not a live price quote. Provider prices, quotas, eligibility, region availability, free-tier terms and card requirements change. Verify official pricing and terms immediately before signup or purchase.

### 7.1 What should remain free initially

| Capability | Preferred initial choice | Cost discipline |
|---|---|---|
| Source control | GitHub free features | Public/private repo limits may change |
| Local development | Rust, Node, pnpm, Docker, VS Code | Open-source/local tools |
| Core tests | Local Rust/frontend tests | Run locally before expensive hosted CI |
| Browser tests | Local Chrome/Chromium | Hosted browser minutes only when needed |
| Design document storage | Browser localStorage initially | Warn users it is not backup |
| Local export | Browser PNG/print workflow | No server compute bill |
| Documentation | Markdown in repository | No paid documentation SaaS |
| Static demo | Local Docker or a verified free static host | No sensitive customer data |
| Monitoring during prototype | Structured local logs and basic host metrics | No paid observability platform yet |

"Free" does not mean unlimited, durable, supported or guaranteed forever. The product must disclose local-storage limitations.

### 7.2 Future hosting options

Evaluate providers only when a public hosted service is needed. Compare the total monthly bill, not just the headline VM price.

| Option | Possible use | Trade-off / decision rule |
|---|---|---|
| Oracle Cloud Always Free | Small self-managed API/VM if eligible capacity is available | Capacity, region, account/card verification, resource limits and policy can change; do not assume availability |
| Google Cloud free program | Small trials and selected eligible services | Credits/quotas and free usage conditions are not the same as lifetime free compute |
| AWS Free Tier / promotional offers | Learning and short trials | Treat time-limited credits and promotional allowances as temporary, not permanent hosting |
| Cloudflare free offerings | DNS, CDN, static frontend and edge capabilities where suitable | Not a replacement for a general Rust VM; inspect execution, storage and usage limits |
| Low-cost paid VPS | Predictable small Rust service deployment | Pay for a known resource envelope; monitor renewal and overage |
| Managed application/database services | Reduce operational burden later | Convenient but may create recurring costs and vendor lock-in |

No provider is approved by this table. Before selecting one, verify:
- Official pricing and free-tier expiry.
- Region and ARM64/x86 availability.
- Outbound bandwidth and IPv4 charges.
- Disk, snapshots and backup charges.
- Taxes, currency conversion and payment authorization.
- Card verification and billing alerts.
- Resource quotas and suspension policy.
- Data location, privacy and contractual terms.
- Migration/exit strategy.

### 7.3 Zero-surprise billing policy

Before creating any paid resource:
1. Write down the exact resource, region, size, expected usage and official price.
2. Calculate expected monthly cost and worst credible cost.
3. Identify usage-based charges (bandwidth, storage, requests, logs, backups, IPs).
4. Set budgets/alerts where available; understand that alerts may not hard-stop spend.
5. Disable optional paid services and automatic upgrades where possible.
6. Confirm deletion and residual billing behavior.
7. Obtain explicit owner approval.
8. Record the decision and actual bill after the first month.

Never promise "100% safe", "no bill" or "lifetime free" for a third-party cloud account.

### 7.4 When paid services become justified

| Paid capability | Trigger to consider | Before purchase |
|---|---|---|
| VPS/compute | Public API or hosted app has real users | Load, memory, availability and cost model |
| Domain | Public launch needs a stable identity | Renewal cost and DNS ownership |
| Object storage | Persistent user assets exceed local/browser scope | Retention, encryption, lifecycle and egress cost |
| PostgreSQL hosting | Server-side accounts/documents need durable relational storage | Backup/restore, access control, migration and monthly cost |
| Email delivery | Account verification and transactional mail are needed | SPF/DKIM/DMARC, deliverability and data handling |
| Payment provider | Pricing is validated and paid features exist | Fees, refunds, disputes, tax/accounting and webhook security |
| Error monitoring | Deployed errors cannot be diagnosed from basic logs | PII redaction, retention and plan limits |
| Analytics | Product questions cannot be answered with privacy-preserving metrics | Consent/privacy requirements, minimization and retention |
| Font/image licenses | Commercial usage requires rights not covered by free assets | License scope, redistribution and attribution |
| Backup service | User data has a durability commitment | Restore tests, retention and deletion behavior |

### 7.5 Build vs buy

Build the differentiating design/document domain and user workflow. Buy commodity capabilities when the cost, reliability and security are better than maintaining them.

Do not build a payment processor, email delivery network, identity provider or observability platform from scratch without a compelling reason. Conversely, do not outsource the core document contract or give a third-party service unnecessary access to user designs.

---

## 8. Backend, persistence and account roadmap

**Not part of the current local prototype.** Add only after customer demand requires cross-device persistence, accounts, sharing or server processing.

### Future backend capabilities

- [ ] Rust/Axum API with explicit versioned contracts.
- [ ] Server-side validation using the Rust core.
- [ ] Authentication and secure session/token lifecycle.
- [ ] Authorization and document ownership on every read/write/export.
- [ ] PostgreSQL migrations and transaction boundaries.
- [ ] Asset storage only when needed.
- [ ] Quotas, rate limits, request-size limits and abuse controls.
- [ ] Idempotency for retryable operations.
- [ ] Export job state only if measured workload requires async processing.
- [ ] Account export, document export and account deletion.
- [ ] Backup/restore and disaster-recovery procedures.
- [ ] Audit events for security-sensitive account/document actions.

### Security rules

- Never trust client-supplied owner or tenant IDs.
- Test IDOR/BOLA across accounts.
- Validate every imported document on the server.
- Enforce authorization at the resource operation, not only the UI.
- Use parameterized database operations.
- Protect cookies/sessions and CSRF-sensitive actions.
- Keep secrets server-side and rotate them.
- Never log document bodies, credentials or payment details.
- Define retention and deletion before storing user content.
- Treat browser/WASM validation as usability and defense-in-depth only.

Do not add Redis, a message broker, microservices or Kubernetes by default. A single Rust modular monolith and PostgreSQL are the starting point if server persistence becomes necessary.

---

## 9. Security engineering roadmap

Maintain and evolve `docs/security/threat-model.md`.

### Threat areas

- Malicious or malformed JSON and schema migration.
- Duplicate IDs, invalid geometry and pathological document complexity.
- Image parser vulnerabilities and decompression/resource exhaustion.
- XSS, unsafe SVG/HTML and dangerous URL schemes.
- Font and asset licensing/provenance.
- SSRF if remote fetch is ever introduced.
- IDOR/BOLA, account takeover and tenant isolation when accounts exist.
- CSRF, session theft and insecure authentication.
- API abuse, brute force and export denial of service.
- Supply-chain attacks, vulnerable packages and compromised CI actions.
- Secrets exposure and overly broad repository/cloud permissions.
- Data leakage through logs, temporary files, backups and analytics.
- Payment webhook spoofing and duplicate billing events if payments exist.

### Required controls and evidence

- [ ] Strict schema validation and shared accept/reject fixtures.
- [ ] Resource limits for bytes, pixels, dimensions, element counts, text, pages, render time and output.
- [ ] Safe text rendering and context-specific escaping.
- [ ] Dependency advisory scanning for Cargo and pnpm.
- [ ] Secret scanning and least-privilege CI credentials.
- [ ] License inventory and review.
- [ ] Fuzz/property tests for parsers, migrations, geometry and serialization where useful.
- [ ] Server authorization tests before multi-user launch.
- [ ] Upload/export isolation, timeout and cleanup tests before server-side processing.
- [ ] Privacy, retention, deletion and incident-response procedures.
- [ ] Security review of release artifacts and deployment configuration.

A scanner finding must be triaged. A clean scanner does not prove the application is secure. Record residual risks and accepted exceptions with owner and review date.

---

## 10. Testing, performance and engineering quality

### Testing pyramid

1. Rust unit tests for domain rules and invariants.
2. TypeScript unit tests for UI-side behavior and fallback contract.
3. Shared contract and migration tests across Rust, TypeScript and WASM.
4. Component/integration tests for editor behavior.
5. Browser E2E tests for critical user workflows.
6. Actual export-file inspection and visual regression.
7. Security, fuzz, property, accessibility, performance and resilience testing according to risk.

### Deterministic browser testing

- Fresh browser profile per test.
- Explicit localStorage seed/clear.
- Isolated download directory.
- Fixed viewport and known fonts.
- Stable fixtures and deterministic IDs where appropriate.
- Capture screenshot, console, trace and logs on failure.
- Inspect actual downloaded JSON/PNG/PDF files.
- Do not rely only on success messages.
- Distinguish product failure from test-harness failure.

### Performance plan

Do not claim nanoseconds, "instant", "fastest" or a throughput target without measured evidence.

Define representative workloads:
- Small design: typical text and shapes.
- Medium design: realistic exam paper/shop banner.
- Large design: near documented element/image/text limits.
- Adversarial design: malformed or worst-case bounded input.

Measure:
- Startup and editor interaction responsiveness.
- Pointer drag/resize frame time.
- Document validation time.
- JSON import/export time.
- PNG/PDF export duration.
- Peak memory and output size.
- Failure/cancellation behavior.
- Device/browser variance.

Record hardware, OS, browser, toolchain, build mode, dataset, warm-up, repetitions, median and tail percentiles. Establish budgets only after baseline measurements and user expectations are known.

### Quality gates

- [ ] Format, lint, typecheck and build.
- [ ] Rust tests and Clippy.
- [ ] Frontend tests.
- [ ] WASM direct smoke and parity.
- [ ] Production browser E2E.
- [ ] Export integrity and visual checks.
- [ ] Dependency and secret scanning.
- [ ] Accessibility checks appropriate to the changed workflow.
- [ ] Performance checks when performance-sensitive code changes.
- [ ] CI results inspected and linked.

Every report must label checks **passed / failed / skipped / not run / not applicable**. Never claim a check passed unless it actually ran.

---

## 11. DevOps, deployment and operations

### Prototype stage

- Local Docker Compose development.
- Reproducible toolchain and lockfiles.
- No production secrets in images or source.
- Minimal services and dependencies.
- Clear local setup and cleanup instructions.

### Hosted stage (future)

- [ ] Separate development/staging/production configuration.
- [ ] HTTPS and secure headers.
- [ ] Non-root containers and minimal runtime images.
- [ ] Read-only filesystem where practical.
- [ ] Health/readiness checks.
- [ ] Resource limits and graceful shutdown.
- [ ] Structured logs with correlation IDs and redaction.
- [ ] Metrics for availability, latency, errors, memory and export workload.
- [ ] Backup schedule and tested restore.
- [ ] Deployment/rollback runbook.
- [ ] Incident contact and escalation process.
- [ ] Dependency and image patch process.
- [ ] Cost dashboard and budget alerts.

Do not claim an SLA/SLO until a service is deployed and the target is meaningful. Define service indicators from user-facing behavior, not vanity uptime alone.

### Recovery requirements

- Users can download their own portable document data.
- Server-side documents, if introduced, have documented backup and restore.
- Restore tests verify real readability and ownership, not just successful backup job status.
- Deletion covers primary data, derived assets, temporary files and backup retention according to a disclosed policy.
- Incident response records scope, timeline, containment, recovery and follow-up actions.

---

## 12. Product management and validation

### Discovery before expansion

For each target segment:
- Interview users about their current workflow.
- Observe a real task from blank page/template to printed/exported result.
- Record time, mistakes, workarounds and output quality.
- Identify the smallest feature that removes a real pain point.
- Test whether users return and recommend the product.
- Ask about willingness to pay only after value is demonstrated.

### Product metrics

| Metric | Definition / question |
|---|---|
| Activation | Did a new user complete a first useful design/export? |
| Time to first value | How long until first useful output? |
| Export success rate | What fraction of export attempts complete correctly? |
| Retention | Do users return to create another design? |
| Task completion | Can the target user complete the intended workflow? |
| Template usage | Which templates actually help users? |
| Support burden | What problems require human help? |
| Paid conversion | Do users pay for a clearly differentiated benefit? |
| Churn/refund | Are customers retaining value? |
| Cost per active user/export | Is usage economically sustainable? |

Do not optimize sign-ups or page views while users cannot reliably complete and export their designs.

---

## 13. CA/MBA/finance and pricing framework

### 13.1 Packaging hypotheses (not approved prices)

| Package | Possible offering | Monetization status |
|---|---|---|
| Free / Local | Core editor, starter templates, local save, standard export | Default entry point; bounded by local device capability |
| Free Account (future) | Sync/backup with explicit storage and usage limits | Only after backend cost and privacy review |
| Pro (future) | Premium templates, advanced export, brand kits or higher limits | Validate willingness to pay first |
| Team/Education (future) | Shared templates, team administration and controlled collaboration | Requires authorization, support and organization workflows |
| API/Enterprise (future) | Document generation API, higher quotas, support and contractual controls | Only after stable API, security and demand |

Do not invent plan prices. Run pricing interviews and experiments, calculate variable costs and fees, then obtain owner approval before publishing prices.

### 13.2 Financial model

Track monthly:

- Revenue by plan and channel.
- Refunds, discounts, payment fees and taxes.
- Hosting/compute, database, storage and bandwidth.
- Export compute and image processing.
- Email, analytics, monitoring and licensed assets.
- Support and operations time.
- Fixed expenses and cash runway.

Formulas:

```text
Gross profit = Revenue - COGS
Gross margin % = Gross profit / Revenue × 100
Contribution = Revenue - variable costs
Contribution per paid user = ARPU - variable cost per paid user
Break-even paid users = Monthly fixed costs / contribution per paid user
Operating profit = Gross profit - operating expenses
```

Use actual invoices and measured usage. Label forecasts as assumptions and include low/base/high scenarios. Do not confuse cash received with revenue earned, or gross revenue with profit.

### 13.3 Legal, tax and commercial checks

Before accepting payment or selling internationally, obtain qualified advice on applicable India business/tax obligations, GST registration/collection, invoicing, consumer terms, privacy/data protection, intellectual property, refunds and cross-border payment treatment. This roadmap is not legal or tax advice.

### 13.4 Build-vs-buy and ROI

For every paid tool/vendor, record:
- Problem solved and alternatives.
- One-time and recurring costs.
- Usage/overage fees.
- Integration and maintenance effort.
- Data access, retention, export and deletion.
- Security posture and vendor dependency.
- Exit/migration cost.
- Expected benefit and how it will be measured.

---

## 14. Management, ownership and seven engineering levels

All roles are review lenses. A small team or individual owner can perform several roles, but the responsibilities must still be covered.

| Level / role | Primary accountability | Required output |
|---|---|---|
| 1. Junior Engineer | Correct implementation | Focused code and tests |
| 2. Mid-level Engineer | Feature ownership | Working vertical slice |
| 3. Senior Engineer | Reliability and maintainability | Design review and regression evidence |
| 4. Tech Lead | Delivery coordination | Scope, dependencies and acceptance |
| 5. Staff Engineer | Cross-module architecture | Boundaries and technical strategy |
| 6. Principal Engineer | Long-term direction and trade-offs | Roadmap, ADRs and risk decisions |
| 7. Distinguished Engineer / Architect | System-wide technical coherence | Evolution strategy and platform guardrails |

Additional mandatory lenses:
- Product Manager/Designer: customer problem, UX and acceptance.
- Security Architect: threats, controls and residual risk.
- QA/SDET: verification and test reliability.
- SRE/DevOps: deployment, observability, recovery and cost.
- Engineering Manager: sequencing, risk and ownership.
- CA/MBA/Management: unit economics, pricing, cash flow and ROI.

For every milestone name a directly responsible owner, reviewers, dependencies, risk, acceptance evidence and approval point. Do not confuse "seven levels" with seven separate people being required.

---

## 15. Milestone roadmap and release gates

The roadmap is ordered by dependency and risk. Re-estimate after each milestone; do not promise dates before scope and capacity are known.

### M0 — Baseline and evidence freeze (small, first)

- [ ] Confirm current main SHA and working tree/branch.
- [ ] Run the documented baseline checks and record versions/results.
- [ ] Reconcile README, ADRs, milestone docs and actual code.
- [ ] Identify current CI failures/flakes and owners.
- [ ] Create a prioritized issue list with no speculative rewrites.

**Exit:** reproducible baseline report; known gaps clearly separated from defects.

### M1 — Reliability and security hardening (current recommended execution)

- [ ] Fix or explicitly disposition deterministic browser-state isolation.
- [ ] Review Rust/TypeScript/WASM contract parity.
- [ ] Test malformed, oversized and boundary document inputs.
- [ ] Review safe text/SVG rendering and import/export failure behavior.
- [ ] Add/review dependency, license and secret scanning gates.
- [ ] Verify required branch protection/status checks.
- [ ] Complete targeted accessibility review of current core workflows.
- [ ] Record exact CI evidence and residual risks.

**Exit:** current workflows reproducibly pass agreed gates; unresolved risks are documented and accepted/deferred by the owner.

### M2 — Semantic Tables (schema v5)

- [ ] Finalize ADR and product contract.
- [ ] Implement schema, validation and migrations.
- [ ] Implement table commands and undo/redo.
- [ ] Implement accessible editing and keyboard navigation.
- [ ] Implement rendering/export preservation.
- [ ] Validate teacher and retailer workflows.

**Exit:** users can create, edit, save, reopen and export a semantic table without losing data; all migration and parity gates pass.

### M3 — Editor modularization and interaction quality

- [ ] Extract cohesive state/use-case boundaries where justified.
- [ ] Separate document and transient UI state.
- [ ] Formalize editing commands and history semantics.
- [ ] Improve selection, alignment, snapping and keyboard shortcuts.
- [ ] Add image elements and layer ordering based on user priority.

**Exit:** no broad rewrite; measurable reduction in coupling or user friction, with regression coverage.

### M4 — Typography, templates and design system

- [ ] Establish design tokens and control consistency.
- [ ] Review font licenses and rendering.
- [ ] Improve template authoring/reuse.
- [ ] Validate multilingual text and output.
- [ ] Run accessibility and user workflow checks.

**Exit:** target users can complete representative designs with consistent, accessible output.

### M5 — Export and print quality

- [ ] Select and document direct PDF approach.
- [ ] Add font and physical page fidelity checks.
- [ ] Verify cross-browser/OS behavior within declared support matrix.
- [ ] Add resource limits, cancellation and failure cleanup.
- [ ] Benchmark representative workloads.

**Exit:** supported export formats meet documented geometry/content/quality criteria and resource budgets.

### M6 — Customer validation and commercial decision

- [ ] Observe target users completing real workflows.
- [ ] Measure activation, completion, repeat use and support issues.
- [ ] Validate pricing and packaging hypotheses.
- [ ] Calculate cost per user/design/export and contribution margin.
- [ ] Decide whether server accounts/sync are justified.

**Exit:** evidence-based product scope and a documented go/no-go decision for hosted accounts.

### M7 — Hosted SaaS foundation (only if M6 justifies it)

- [ ] Approve provider and monthly cost envelope.
- [ ] Create Rust/Axum API and independently validate documents.
- [ ] Implement authentication and resource-level authorization.
- [ ] Add PostgreSQL and migrations if durable relational data is needed.
- [ ] Add storage only for persistent assets.
- [ ] Implement quotas, rate limits, observability and backups.
- [ ] Test cross-account isolation, restore and deletion.

**Exit:** security, operational, privacy and recovery gates pass before public multi-user data is accepted.

### M8 — Paid plans and launch

- [ ] Approve plan definitions and prices based on evidence.
- [ ] Integrate payment provider and secure webhooks.
- [ ] Handle subscription state, cancellation, refunds and support.
- [ ] Complete applicable legal/tax/privacy review.
- [ ] Publish status, support and incident contact.
- [ ] Run production readiness review and rollback exercise.

**Exit:** a real customer can purchase, receive the stated benefit, get support and exercise their data rights with costs and operational risks understood.

### M9 — Scale only when evidence requires it

Potential future work: collaboration, team accounts, API/SDK, desktop/offline app, advanced asset library, multi-page publishing, additional rendering backends, job queues or service decomposition.

Each requires customer demand, architecture review, cost model, security model and explicit prioritization. None is automatically approved by appearing here.

---

## CI runtime and Docker build policy

Keep CI proportional to the change while preserving release confidence:

- Every relevant PR: Rust formatting/tests/Clippy, WASM compile check, frontend typecheck/tests, real-browser smoke tests, production build, production Docker image, and Rust/production-JavaScript dependency audits.
- Development Docker image: build and smoke-test only when `Dockerfile.dev`, `compose.yaml`, `.dockerignore`, Rust workspace inputs, frontend dependency manifests, or the dedicated development workflow changes; also allow manual dispatch.
- Cross-browser PNG regression: run when editor/export, Rust/WASM, fixture, or its workflow inputs change, plus the scheduled regression.
- Use BuildKit GitHub Actions layer caching with separate cache scopes for production and development images. Keep dependency lockfiles before frequently changing source copies in Dockerfiles so stable dependency layers can be reused.
- Do not remove the production image build from ordinary PR verification: it validates the deployable artifact. Do not rebuild the full development toolchain for unrelated UI changes.
- Measure elapsed time per workflow and compare cache-hit versus cache-miss runs. Treat caching as an optimization, not a correctness guarantee; builds must still pass from an empty cache.
- Cache pnpm's content-addressed store in the cross-browser workflow using the lockfile as its key input.
- Cache Playwright browser downloads by OS and the pinned Playwright version; still run Playwright's system-dependency installation and the actual browser tests.
- Prepare the pinned Corepack/pnpm version in the development image layer rather than downloading/activating it on every container start. Keep the lockfile install on startup so the mounted workspace remains consistent.
- Do not introduce cargo-chef or more elaborate Rust build graph machinery until timing evidence shows Rust dependency compilation is a dominant cold/warm build cost. The current workspace is small; extra build tooling may cost more complexity than it saves.

Current implementation is in `.github/workflows/ci.yml`, `.github/workflows/development-container.yml`, and `.github/workflows/cross-browser-export.yml`. The policy is considered validated only after the latest PR head passes its fresh workflows.
 
## 16. Current execution queue — do this next, not everything

Baseline evidence is recorded in [`docs/testing/m1-baseline-evidence.md`](docs/testing/m1-baseline-evidence.md). Push-triggered CI run #293 and dependency audit #89 passed on the current main SHA. M0 remains partially open because branch protection/required checks could not be verified through the connected integration and the manual accessibility audit remains open (issue #82). The separate cross-browser export workflow remediation is tracked in PR #102.

**Recommended active milestone: M1 — Reliability and Security Hardening.**

Order of work:

1. Inspect current branch, main SHA, open PRs and current CI runs. Do not assume the historical baseline is still current.
2. Run existing tests without changing code; capture exact commands, versions, exit codes and failure logs.
3. Reproduce browser tests with clean, isolated browser profiles and deterministic localStorage fixtures.
4. Audit document validation parity in Rust, TypeScript and WASM using the shared accept/reject corpus.
5. Audit import, image decode, text rendering, SVG generation and export resource bounds.
6. Review GitHub Actions permissions, pinned actions, dependency scanning, secret scanning and branch protection.
7. Complete a focused keyboard/accessibility audit of the currently shipped editor.
8. Convert confirmed findings into small, independently testable PRs.
9. Update the relevant documentation and this roadmap with links to evidence.
10. Stop and request owner approval before merging or introducing paid services.

### Files likely to be relevant (inspect before editing)

- `AGENTS.md`
- `SKILLS.md`
- `README.md`
- `crates/design-core/`
- `crates/design-wasm/`
- `web/`
- `fixtures/`
- `.github/workflows/`
- `docs/security/threat-model.md`
- `docs/testing/strategy.md`
- `docs/testing/accessibility-manual-audit.md`
- `docs/architecture/system-overview.md`
- `docs/adr/`
- `docs/product/`

This is a likely inspection list, not authorization for broad refactoring.

---

## 17. Definition of Done — mandatory for every milestone

A milestone is not complete until all applicable items are satisfied:

### Product
- [ ] User problem and expected outcome are explicit.
- [ ] Acceptance criteria are observable.
- [ ] Normal, empty, error and recovery states are covered.
- [ ] No unrelated scope was added.

### Engineering
- [ ] HLD/LLD and module contracts updated where needed.
- [ ] Clean, modular code; SOLID/DRY applied thoughtfully.
- [ ] Compatibility and migration reviewed.
- [ ] Dependencies justified and reviewed.
- [ ] No secrets or generated build artifacts committed accidentally.

### Security and privacy
- [ ] Trust boundaries and threats reviewed.
- [ ] Untrusted inputs and resource limits tested.
- [ ] Authorization tested where server resources exist.
- [ ] Data collection, retention and deletion understood.
- [ ] Residual risks recorded.

### Verification
- [ ] Relevant unit/integration/contract/browser tests run.
- [ ] Positive, negative, boundary and regression cases included.
- [ ] Actual exported artifacts inspected where applicable.
- [ ] Accessibility/performance checks completed where applicable.
- [ ] CI results linked; skipped/not-run checks disclosed.

### Operations and finance
- [ ] Deployment/configuration/rollback updated if affected.
- [ ] Backup/restore and cleanup updated if data lifecycle changes.
- [ ] Recurring and usage-based costs estimated if new services are added.
- [ ] Paid purchases/resources have explicit approval.
- [ ] Business metrics or validation plan updated where applicable.

### Delivery
- [ ] PR explains problem, scope, trade-offs, tests, risks and rollback.
- [ ] README/docs/ADR/roadmap updated.
- [ ] Known limitations and next step reported in easy English.
- [ ] Owner approval obtained before merge when required.

---

## 18. Pull request and agent handoff template

Every agent/engineer working from this roadmap must include:

```text
Milestone / task:
User problem:
Scope included:
Scope explicitly excluded:
Current base SHA:
Files inspected:
Architecture and data-flow impact:
Security/privacy impact:
Compatibility/migration impact:
Dependencies/licenses:
Implementation summary:
Tests actually executed:
Exact commands and tool versions:
CI links and outcomes:
Manual checks:
Performance evidence (if relevant):
Known gaps / residual risks:
Cost impact (free/paid/usage-based):
Rollback/recovery:
Docs updated:
PR link:
Approval required:
Recommended next task:
```

Agents must not:
- Invent test results, benchmark numbers, customer feedback, pricing or provider terms.
- Mark a proposed feature implemented.
- silently change schemas, public APIs, data retention or authentication policy.
- merge, deploy, purchase, enable billing or expand scope without approval.
- use a green-looking skipped workflow as evidence of quality.
- add a framework, service, dependency or architecture pattern without a concrete reason.

---

## 19. Decision log and roadmap maintenance

For consequential decisions, create an ADR containing:
- Context and problem.
- Constraints and goals.
- Decision and status (Proposed / Accepted / Superseded / Deprecated).
- Alternatives considered.
- Security, privacy, performance, cost and operational consequences.
- Migration and rollback.
- Revisit triggers.

Update this file when:
- A milestone changes status.
- Product scope or target users change.
- A schema/API or trust boundary changes.
- A provider, paid service or pricing decision is approved.
- A release gate changes.
- New customer evidence changes priority.

At every milestone close, update:
- Current baseline SHA.
- Current milestone and owner.
- Completed work with PR/commit/CI evidence.
- Open blockers and accepted risks.
- The next smallest bounded task.

Review the roadmap at least once per milestone and before a public release. Do not let future possibilities overwhelm the current execution queue.

---

## 20. Owner's product rule

Build a dependable design tool that solves a real problem for teachers, tutors and small businesses. Start local and free where practical; introduce paid infrastructure only when real user needs justify it. Protect customer documents, make exports trustworthy, measure costs and value, and grow in small verified steps.

**The next task is M1 reliability/security evidence and remediation. The next product feature after that is schema-v5 Semantic Tables, unless the evidence from M1 reveals a more urgent blocker.**
