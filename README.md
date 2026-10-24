# Design Platform

A template-driven design editor, built incrementally with security, export fidelity, and operating cost treated as product requirements.

## Current milestone

The first prototype contains:
- A Nuxt/Vue/TypeScript browser UI.
- A page with selectable text and rectangle elements.
- Basic text/color/font-size editing and position controls.
- A framework-independent Rust document model with schema version 1 and validation.
- A GitHub Actions workflow for Rust checks and frontend type-check/build.
- A Docker-based frontend development path and a multi-stage frontend image.

**Prototype limitations:** the browser editor is local-only. It does not yet save or reopen documents, support undo/redo or dragging/resizing, integrate Rust/WASM into the browser, export PDF, authenticate users, or persist data. Do not treat this as production-ready.

## Development

Requirements for native development:
- Rust toolchain with `rustfmt` and `clippy`
- Node.js 22.14.0 and npm

Rust core:

```sh
cargo fmt --all -- --check
cargo test --workspace
cargo clippy --workspace --all-targets -- -D warnings
```

Frontend:

```sh
cd web
npm install
npm run typecheck
npm run build
npm run dev
```

Open http://localhost:3000 for the local editor.

Docker development from the repository root:

```sh
docker compose up
```

Then open http://localhost:3000. The first container start installs frontend dependencies into a named volume; subsequent starts reuse that volume. If dependencies change, recreate the volume deliberately with `docker compose down -v` before starting again. This removes the named dependency volume, not repository files.

## Architecture direction

- `web/`: UI and interaction layer.
- `crates/design-core/`: framework-independent document schema and validation.
- Later milestones will prove browser/native schema parity, persistence, and export fidelity before expanding template categories.

Read `docs/product/mvp.md`, `docs/architecture/system-overview.md`, `docs/security/threat-model.md`, and `docs/testing/strategy.md` before extending the prototype.
