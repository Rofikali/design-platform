# Design Platform

**Engineering direction:** [Reuse-first engineering and zero-unapproved-spend policy](docs/engineering/reuse-first-policy.md) governs REUSE-01–10. Native primitives first, proven open-source components next, justified custom code last. Preserve current work and stable feature budgets; no paid or mandatory remote service without explicit owner approval.

> **Current handoff (25 Nov 2026):** All authorized contributors resume live GitHub work across authors. Adopt existing PRs, count all opened PRs toward the stable feature cap, use a persistent branch for bounded commits, and verify exact-head gates before merging. The generated milestone snapshot supersedes older dated checkpoints. No security bypass or release authorization.

> **Autopilot execution recovery (23 Nov 2026):** [outcome-first continuation contract](docs/engineering/autopilot-execution-recovery.md) records precise handoff fields, resume-first implementation, two-no-code escalation, and L1–L7/CISSP/CCIE/Linux/SRE/CA-MBA gates. This is **not** a scheduler or a substitute for current GitHub CI and the task run record.

> **Autopilot policy (2026-11-23):** scoped PRs may be self-reviewed and merged without a human approval after all required CI/security/branch gates. [Policy and docs-sync process](docs/engineering/autopilot-zero-human-review.md) · [importable protection JSON](.github/rulesets/autopilot-main-no-human-review.json). GitHub ruleset import requires a separate Settings action; the earlier browser autosave failure was followed by a reported passing main run; intermittent regression risk still needs evidence-based triage.

A template-driven design editor, built incrementally with security, export fidelity, and operating cost treated as product requirements.

## Current milestone

The current prototype includes:

- A Nuxt/Vue/TypeScript browser editor with text, rectangle, frame, grid, and semantic table document primitives, configurable page dimensions, and page-level PNG/JPEG/WebP background image upload with Cover/Contain fit controls.
- Add/select text, rectangles, frames, and grids; edit text/style and grid structure; bounded directional movement, pointer drag, and resize handles.
- Bounded undo/redo history (up to 50 snapshots).
- Browser-local autosave and restore using localStorage.
- Versioned JSON import/export with a 2 MB input limit and Rust/WASM validation when available; TypeScript validation is the fallback if WASM cannot initialize.
- A typed starter-template catalog and editor picker for Exam Paper (A4) and Shop Banner (landscape) starter documents.
- PNG export rendered from the document model at 2× logical resolution, plus a browser print-dialog workflow for saving PDF with configured physical output dimensions when available.
- A framework-independent Rust document model and validation rules, compiled for native tests and WebAssembly.
- Shared validation fixtures exercised by Rust, TypeScript, direct Chrome/WASM smoke tests, and the production Nuxt editor browser test.
- CI checks for Rust formatting/tests/Clippy, frontend type-check/tests, browser smoke tests, and the production build.
- A Docker-based frontend development path and a multi-stage frontend image.

## Advanced future features (owner roadmap, 22 November 2026)

The existing editor, text/shapes, frames/grids/tables, layers and snapping, page image backgrounds, undo/redo, localStorage, v1–v5 JSON compatibility, PNG and browser print **must keep working**. The [advanced editor feature roadmap](docs/product/advanced-feature-roadmap.md) records proposed typography, vector shapes, guides/rulers, object tools, multi-page exam papers, shop banner studio, local assets, templates, print preflight and optional direct PDF. The [advanced feature acceptance matrix](docs/engineering/advanced-feature-acceptance.md) adds L1–L7 architecture, CISSP/security, Linux/SRE, proportionate networking, CA/MBA and management evidence gates. Proposed does **not** mean implemented or release-approved.

**Source-backed milestone:** DP-M3-IMAGE closed PARTIAL at 5/5 including merged #172. Full editable foreground image objects remain incomplete. The [milestone record](docs/engineering/milestone-record.json) and live GitHub determine the sole active feature; typography is next on this reconciliation branch. No SaaS/backend or unapproved paid deployment is implied.

## Five-attempt feature governance

A feature is one stable user outcome with up to **five opened PR attempts**, counting failed, abandoned, closed and merged PRs. Updates to the same PR consume no extra slot. Each implementation PR must declare its active `Feature-ID` and register the actual GitHub PR number in the [milestone record](docs/engineering/milestone-record.json). [CI](.github/workflows/ci.yml) verifies it, and the seven-section documentation generator keeps the living board consistent. After accepted completion or five PRs, close as DONE/PARTIAL/BLOCKED, record evidence and move to the next independent READY feature. See [the policy](docs/engineering/feature-delivery-policy.md). Security, manual accessibility, physical printing, local Compose and release approvals remain separate gates.

## Current engineering milestone and delivery status

<!-- milestone-sync:start -->
<!-- GENERATED from docs/engineering/milestone-record.json by scripts/sync-milestone-docs.mjs. DO NOT EDIT. -->
### Milestone snapshot (generated: 2026-11-25)

**Reference main:** 553711d3c866be573f990d313f6c74038e7108e2 (dated snapshot; re-check live GitHub before acting).

**NOW:** **DP-M3-TYPO-01 — Advanced typography and multilingual font handling** [PR_OPEN]. [PR #177](https://github.com/Rofikali/design-platform/pull/177)

**NEXT:** DP-M3-VECTOR-01 [PLANNED]; DP-M3-PRECISION-01 [PLANNED]; DP-SEC-01 [BLOCKED] [Issue #118](https://github.com/Rofikali/design-platform/issues/118); DP-M1-ACC-02 [BLOCKED] [Issue #82](https://github.com/Rofikali/design-platform/issues/82); DP-M1-BG-09 [PLANNED] [Issue #85](https://github.com/Rofikali/design-platform/issues/85)

**Feature budget:** DP-M3-TYPO — 4/5 PRs recorded since 2026-11-21. No sixth PR for the same feature; close it as done/partial with gaps, then advance. Historical table PRs are grandfathered.

**Review gate:** Owner-authorized autopilot may self-review and merge eligible PRs with zero mandatory human approvals after required exact-head/integration CI, security, branch rules and review-thread gates pass. Never present self-review as independent approval. No automatic publishing or deployment.

<!-- milestone-sync:end -->

For detailed CI and status decisions, see [the milestone workflow](docs/engineering/milestone-workflow.md) and [the full work board](next.md). The snapshot above is dated; always verify GitHub before claiming a PR is merged.

## Evidence and feature progression (2026-11-21)

**Historical 2026-11-21 checkpoint:** accessible Layers work was the next feature at that time; current Layers and Alignment have since been closed PARTIAL, and PR #165's resource-guard scope merged. Use the generated NOW block above, not this earlier snapshot, for today's active feature. The [five-PR delivery policy](docs/engineering/feature-delivery-policy.md) records per-feature PR budgets, completed software versus remaining acceptance, and the next lane. The old table iteration loop is closed; manual accessibility and print gates remain open. GitHub CI has run in hosted Ubuntu and includes a production Docker **image build**; this does not establish a user's local Ubuntu/Docker Compose run, physical printer output, manual screen-reader behavior or a production release.

## Current limitations

This is still a prototype, **not production-ready**.

- Frame and grid primitives are now part of the editor model. Grid cells remain visual regions. Schema v5 includes semantic tables with accessible cell-selection/edit controls and bounded row/column insert/delete commands. Automated serialization/history and browser regressions exist; manual screen-reader and physical-print acceptance remain outstanding. The starter templates remain foundations, not complete exam-paper or shop-banner authoring workflows.
- PNG export is implemented from the document model; Chrome CI verifies real 2× PNG downloads and compares both MVP template exports against checked-in SVG visual references with a pixel-difference tolerance. This is a deterministic regression gate for the current Chrome renderer, not proof of cross-browser font parity or user-validated print quality.
- PDF currently uses the browser's print dialog. The user must choose “Save as PDF”; this is not a direct PDF download. Chrome CI checks the Shop Banner print layout scale and generated PDF page box (one 300 × 125 mm page), but visual fidelity and cross-browser behavior remain unverified.
- There is no account system, server-side persistence, cross-device synchronization, billing, or collaboration.
- Schema-v1 through v4 documents migrate to v5 while preserving supported geometry, physical output-size metadata, page background images, frames, and grids. Schema v5 adds a first-class semantic Table variant with a bounded rectangular plain-text cell matrix. The table contract enforces at most 20 rows, 20 columns, 400 cells, 2,000 Unicode code points per cell, and 20,000 Unicode code points per table. Table cell editing and structural commands are now implemented, with bounded validation, canvas preview and SVG/PNG table rendering. Manual accessibility and physical print acceptance are not established. Background uploads are decoded in the browser, checked against 4,096-pixel edge and 16-million-pixel limits, and constrained by the 1 MiB embedded-data limit. PNG export includes the page background. Browser-side checks are usability and data-integrity safeguards, not a server-side trust boundary.
- The real-browser suite covers WASM-backed JSON import/export, rejection safety, adding text/rectangles/frames/grids, text/style editing, directional movement, keyboard-driven width editing, undo/redo, local autosave/restore, pointer drag/resize, page-boundary limits, template creation, actual 2× PNG file integrity/dimensions, pixel-level checks and checked-in SVG reference-image comparisons for both MVP templates, plus one-page PDF geometry. Focus indicators, keyboard activation, named canvas elements/group, labeled form controls, and keyboard-accessible width/height controls have targeted regression checks. Full screen-reader/manual accessibility review, cross-browser export fidelity, and performance gates remain open work. The [manual accessibility audit worksheet](docs/testing/accessibility-manual-audit.md) is prepared but not yet completed.
- Browser-side validation improves feedback and data consistency; it is not an authorization boundary. A future trusted API must validate documents independently.
- Local browser storage is not a backup. Users should download a JSON copy if they need a portable copy.

Do not claim production readiness, performance advantages, or product-market fit without the corresponding evidence.

## Development requirements

- Rust toolchain with `rustfmt` and `clippy`
- Node.js 22.14.0 with Corepack and pnpm 10.11.0
- Chrome/Chromium for the browser tests

## Rust core checks

From the repository root:

```sh
cargo fmt --all -- --check
cargo test --workspace
cargo clippy --workspace --all-targets -- -D warnings
```

## Frontend checks

From the repository root:

```sh
cd web
corepack pnpm install --frozen-lockfile
corepack pnpm run typecheck
corepack pnpm test
corepack pnpm run test:wasm-browser
corepack pnpm run test:editor-browser
corepack pnpm run build
```

The browser tests require Chrome on `PATH` or `CHROME_BIN`. The scripts generate the ignored WASM package as part of the pnpm lifecycle; do not commit generated WASM output. The editor browser test builds and runs the production Nuxt preview rather than relying on a development server.

Open http://localhost:3000 for the local editor when running `corepack pnpm run dev`.

## Docker development

From the repository root:

```sh
docker compose up --build
```

The development image includes the pinned Node.js 22.14.0 and Rust 1.91.0 toolchains, the `wasm32-unknown-unknown` target, and wasm-pack 0.15.0. The Compose command installs frontend dependencies with the committed pnpm lockfile, then `pnpm run dev` invokes the `predev` lifecycle script to build the WASM adapter before starting Nuxt.

Then open http://localhost:3000. The first image build installs the toolchains and can take several minutes; the first container start installs frontend dependencies into a named volume and compiles the Rust/WASM adapter. Subsequent starts reuse the image and named dependency/cache volumes. If frontend dependencies change, recreate the dependency volume deliberately with `docker compose down -v` before starting again. This removes the named volumes, not repository files. Rebuild the image with `docker compose up --build` when the toolchain or Dockerfile changes.

## Architecture direction

- `web/`: UI, interaction state, and browser integration.
- `crates/design-core/`: framework-independent document schema and validation.
- `crates/design-wasm/`: thin WASM adapter for browser-side document validation.
- Later milestones should prove core editor interaction reliability, template workflows, and export fidelity before adding server persistence or expanding template categories.

Read [`next.md`](next.md) for the complete product, engineering, security, operations, free/paid, finance and management roadmap and the current execution queue. For the seven-level engineering model, agent handoff/continuation, CI efficiency, document HLD/LLD, security, release and product strategy, start with the [engineering documentation map](docs/engineering/documentation-map.md). Also read `docs/product/mvp.md`, `docs/architecture/system-overview.md`, `docs/security/threat-model.md`, and `docs/testing/strategy.md` before extending the prototype.
