# ADR-0001: Modular Monolith with a Shared Rust Design Core

- **Status:** Proposed
- **Date:** 2026-10-24

## Context
The MVP needs two different templates to share editing, document validation, history, persistence, and export behavior. The project is early, and operational complexity and hosting cost matter. Rendering consistency and untrusted input are key risks.

## Decision
- Use Nuxt/Vue/TypeScript for the browser UI.
- Prototype a framework-independent Rust design core that can compile to native targets and WASM.
- Use Rust/Axum for API capabilities when backend persistence and authentication are introduced.
- Start as a modular monolith rather than multiple independently deployed services.
- Use a versioned document schema and command-oriented editing operations.
- Begin with controlled SVG-based editor rendering and validate the export engine before committing to a production export architecture.
- Defer billing, marketplace, collaboration, Redis, and Kubernetes until evidence requires them.

## Reasons
- A shared core can reduce divergent validation and editing behavior.
- WASM can keep deterministic document operations close to the browser, but it adds build, debugging, and boundary costs that must be measured.
- A modular monolith is easier to test, deploy, and operate at MVP scale.
- A deliberately narrow template scope makes it possible to validate the model before supporting many categories.

## Consequences and risks
- Rust/WASM interop introduces toolchain and debugging complexity.
- Shared geometry logic does not guarantee identical text rendering across browser and PDF engines.
- A server export path adds resource-isolation and operational requirements.
- A document schema requires migration policy and compatibility tests.
- The team must measure memory, latency, and bundle size on realistic documents rather than assume WASM is automatically faster.

## Revisit when
- Benchmarks show the shared core is too costly or unsuitable for browser use.
- Export fidelity requirements demand a different renderer.
- Measured load or organizational constraints justify a separate service.
- Real user research demonstrates a need for collaboration, marketplace, or billing.
