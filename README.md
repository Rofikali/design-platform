# Design Platform

A template-driven design editor, built incrementally with security, export fidelity, and operating cost treated as product requirements.

## Current milestone

The current prototype includes:

- A Nuxt/Vue/TypeScript browser editor with text and rectangle elements; schema v2 supports configurable logical page dimensions.
- Add/select elements, edit text/color/font size, bounded directional movement, pointer drag, and resize handles.
- Bounded undo/redo history (up to 50 snapshots).
- Browser-local autosave and restore using localStorage.
- Versioned JSON import/export with a 2 MB input limit and Rust/WASM validation when available; TypeScript validation is the fallback if WASM cannot initialize.\n- PNG export rendered from the document model at 2× logical resolution, plus a print dialog workflow for saving PDF with print-size metadata when configured.
- A framework-independent Rust document model and validation rules, compiled for native tests and WebAssembly.
- Shared validation fixtures exercised by Rust, TypeScript, direct Chrome/WASM smoke tests, and the production Nuxt editor browser test.
- CI checks for Rust formatting/tests/Clippy, frontend type-check/tests, browser smoke tests, and the production build.
- A Docker-based frontend development path and a multi-stage frontend image.

## Current limitations

This is still a prototype, **not production-ready**.

- The UI does not yet provide a template picker or finished Exam Paper / Shop Banner workflows.
- PDF/PNG export is not implemented.
- There is no account system, server-side persistence, cross-device synchronization, billing, or collaboration.
- Schema-v1 documents migrate to v2 with their original 800 × 600 geometry. New documents can use bounded configurable page dimensions and optional physical output-size metadata. The editor currently supports only text and rectangles. The editor currently supports only text and rectangles.
- The real-browser suite covers WASM-backed JSON import/export, rejection safety, adding text/rectangles, text/style editing, directional movement, undo/redo, local autosave/restore, pointer drag/resize, page-boundary limits, and template creation. PNG/PDF export needs real-browser output checks and visual regression baselines. Export fidelity, accessibility, and performance gates remain open work.
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
docker compose up
```

Then open http://localhost:3000. The first container start installs frontend dependencies into a named volume; subsequent starts reuse that volume. If dependencies change, recreate the volume deliberately with `docker compose down -v` before starting again. This removes the named dependency volume, not repository files.

## Architecture direction

- `web/`: UI, interaction state, and browser integration.
- `crates/design-core/`: framework-independent document schema and validation.
- `crates/design-wasm/`: thin WASM adapter for browser-side document validation.
- Later milestones should prove core editor interaction reliability, template workflows, and export fidelity before adding server persistence or expanding template categories.

Read `docs/product/mvp.md`, `docs/architecture/system-overview.md`, `docs/security/threat-model.md`, and `docs/testing/strategy.md` before extending the prototype.
