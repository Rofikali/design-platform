# Design Platform

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

## Current engineering milestone and delivery status

<!-- milestone-sync:start -->
<!-- GENERATED from docs/engineering/milestone-record.json by scripts/sync-milestone-docs.mjs. DO NOT EDIT. -->
### Milestone snapshot (generated: 2026-11-18)

**Reference main:** 9ccac618837dac660172d5cf2be08c2b51111737 (dated snapshot; re-check live GitHub before acting).

**NOW:** **DP-M2-TBL-02A — Accessible first table-cell editing workflow** [READY].

**NEXT:** DP-SEC-01 [BLOCKED] [Issue #118](https://github.com/Rofikali/design-platform/issues/118); DP-M1-ACC-02 [BLOCKED] [Issue #82](https://github.com/Rofikali/design-platform/issues/82); DP-M1-BG-09 [PLANNED] [Issue #85](https://github.com/Rofikali/design-platform/issues/85)

**Review gate:** Owner-authorized autopilot may review and merge only after all exact-head/integration CI, security, branch protection and required independent-review gates pass. No automatic publishing or deployment.

<!-- milestone-sync:end -->

For detailed CI and status decisions, see [the milestone workflow](docs/engineering/milestone-workflow.md) and [the full work board](next.md). The snapshot above is dated; always verify GitHub before claiming a PR is merged.

## Current limitations

This is still a prototype, **not production-ready**.

- Frame and grid primitives are now part of the editor model. Grid cells remain visual regions. Schema v5 defines bounded semantic table data; imported tables can be previewed on the canvas and rendered to SVG/PNG, but cell editing and structural table commands are not yet implemented. The starter templates remain foundations, not complete exam-paper or shop-banner authoring workflows.
- PNG export is implemented from the document model; Chrome CI verifies real 2× PNG downloads and compares both MVP template exports against checked-in SVG visual references with a pixel-difference tolerance. This is a deterministic regression gate for the current Chrome renderer, not proof of cross-browser font parity or user-validated print quality.
- PDF currently uses the browser's print dialog. The user must choose “Save as PDF”; this is not a direct PDF download. Chrome CI checks the Shop Banner print layout scale and generated PDF page box (one 300 × 125 mm page), but visual fidelity and cross-browser behavior remain unverified.
- There is no account system, server-side persistence, cross-device synchronization, billing, or collaboration.
- Schema-v1 through v4 documents migrate to v5 while preserving supported geometry, physical output-size metadata, page background images, frames, and grids. Schema v5 adds a first-class semantic Table variant with a bounded rectangular plain-text cell matrix. The table contract enforces at most 20 rows, 20 columns, 400 cells, 2,000 characters per cell, and 20,000 characters per table. Table cell editing and structural commands are not yet implemented; the current implementation provides bounded validation, a read-only canvas preview, and SVG/PNG table rendering. Background uploads are decoded in the browser, checked against 4,096-pixel edge and 16-million-pixel limits, and constrained by the 1 MiB embedded-data limit. PNG export includes the page background. Browser-side checks are usability and data-integrity safeguards, not a server-side trust boundary.
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
