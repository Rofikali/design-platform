# System Overview

## Status
Proposed architecture for the first MVP. Implementation choices must be validated with a thin end-to-end prototype and measured tests.

## High-level components

```text
Browser
  └── Nuxt / Vue / TypeScript
        ├── Editor UI, keyboard/accessibility, SVG presentation
        └── Rust design core compiled to WebAssembly (WASM)
                    │ versioned document + commands
                    ▼
              Rust / Axum API (introduced with persistence/auth)
                    ├── authorization and validation
                    ├── document persistence (PostgreSQL)
                    └── bounded export orchestration
                              └── isolated PDF/PNG renderer
```

The diagram is a target boundary, not a claim that these components already exist. Keep the first implementation as a modular monolith; do not deploy every box as a separate service.

## Responsibilities

### Frontend
- Own interface state, selection handles, accessible controls, keyboard events, and browser-specific integration.
- Render the current document for interactive editing.
- Send meaningful, coarse-grained operations to the WASM core rather than calling across the boundary for every animation frame or property read.
- Never rely on client-side checks as the sole authorization control.

### Shared Rust design core
- Define the versioned document model and element IDs.
- Validate geometry and style values.
- Apply commands and maintain deterministic undo/redo semantics.
- Implement transforms and layout rules independent of Vue, Axum, and browser APIs.
- Compile for native tests and WASM, with parity tests for shared behavior.
- Avoid prematurely building a generic constraint solver; start with the simplest model that supports both templates.

### API and persistence
- Introduce Axum endpoints when server persistence/authentication is needed.
- Enforce ownership/authorization for every document operation.
- Store a schema version with every persisted document.
- Use PostgreSQL for durable metadata/documents when persistence is implemented.
- Add object storage only when user-uploaded assets require durable storage; define retention and deletion behavior first.

### Rendering and export
- Interactive rendering starts with controlled SVG generated from validated document data.
- Schema-v3 page background images are embedded PNG/JPEG/WebP data URLs with explicit Cover/Contain fit. They are page-level backgrounds, not foreground image elements. The current browser checks file signatures and decoded dimensions; no remote fetch or asset service is used. These client checks are not trusted validation. Any future API must independently validate the bytes and decoded resource limits.
- PDF/PNG export must use a defined, testable rendering path with controlled fonts.
- Do not assume browser SVG and server PDF render identically. Text shaping, line wrapping, font fallback, DPI, and SVG feature support can differ.
- Add golden fixtures and compare page dimensions, text, and rendered images within documented tolerances.
- Run untrusted rendering work with time, memory, page, image, and output-size limits.

## Initial document model
Use stable IDs and explicit units. A document should include:
- `schema_version`
- document dimensions and unit
- background
- ordered elements
- optional template metadata that does not control security decisions

Initial element kinds:
- Text
- Rectangle
- Ellipse
- Line
- Image, only after safe image handling is implemented

Each element has an ID, position, dimensions, and kind-specific validated properties. Define coordinate units and rounding rules before implementing export.

## Decisions to validate early
1. Physical units and DPI conversion.
2. Font packaging, licensing, fallback, and text shaping.
3. How document commands serialize and how undo history behaves.
4. SVG sanitization and the exact supported SVG subset.
5. Export engine choice based on fidelity, security, operational footprint, and license.
6. Whether image assets are embedded or referenced, and how asset deletion works.

## Non-goals
No microservices, distributed event bus, Redis, Kubernetes, or custom plugin execution in the MVP without a written ADR backed by a measured requirement.
