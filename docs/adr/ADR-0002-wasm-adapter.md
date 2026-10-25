# ADR-0002: Introduce a Thin WebAssembly Adapter

- **Status:** Accepted for incremental implementation
- **Date:** 2026-10-25

## Context

The project has a framework-independent Rust document core and a TypeScript browser validator. Before the browser depends on Rust, it needs a small, stable JavaScript boundary and CI evidence that the core can compile to WebAssembly. A full editor rewrite or per-event WASM calls would increase risk before parity and performance are known.

## Decision

- Add a separate `design-wasm` crate that depends on `design-core`; do not put wasm-bindgen or browser concerns into the domain crate.
- Initially expose one coarse-grained JSON-string validation/normalization function.
- Reject input larger than 2,000,000 UTF-8 bytes before parsing, then use the same Rust domain validator used by native code.
- Compile-check the adapter for `wasm32-unknown-unknown` in CI.
- Keep TypeScript validation active until package generation/loading, browser error behavior, and cross-language parity are tested.
- Do not call WASM for pointer-move frames or other high-frequency UI interactions without measured evidence.

## Consequences

**Benefits**
- Establishes an explicit boundary without coupling domain logic to Vue or Nuxt.
- Uses one Rust validation implementation for native and future browser callers.
- Adds an early resource bound and a target-specific CI gate.

**Costs and limitations**
- Adds wasm-bindgen and a new crate to the dependency graph.
- JSON parsing/serialization still copies data and may cost more than TypeScript for small documents.
- A successful target compile does not prove browser integration, parity, performance, or production readiness.
- The existing frontend validator can still diverge until parity tests cover shared valid and invalid fixtures.

## Acceptance criteria for browser integration

1. Reproducibly generate/load the WASM package without committing machine-generated build output.
2. Run valid and invalid shared fixtures through both Rust/WASM and TypeScript.
3. Test oversized inputs and malformed JSON in a browser runtime.
4. Preserve a safe fallback and clear user-facing errors if WASM initialization fails.
5. Measure initialization time, bundle-size impact, and validation latency on representative documents.
