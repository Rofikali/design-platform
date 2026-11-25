# Design Platform — HLD and LLD for Document Editing

**Status:** Source-informed architecture map and proposed evolution points. This document is not proof that all diagram boxes are implemented. Read [system overview](system-overview.md), [MVP](../product/mvp.md), [semantic-table contract](../product/semantic-tables-milestone.md) and [ADRs](../adr/ADR-0001-architecture.md).

## Proposed advanced-feature evolution (not implemented)

The [owner's advanced feature roadmap](../product/advanced-feature-roadmap.md) and [L1–L7/security/business acceptance matrix](../engineering/advanced-feature-acceptance.md) require *additive* modules for typography, vector shapes, guides, local assets, multi-page exams, shop banners and PDF. Current architecture remains Nuxt/Vue/TypeScript + Rust/WASM validation; do not replace existing document history, canvas, v1–v5 migration, PNG or browser print. A new foreground image variant requires a reviewed **new schema version when necessary** and matching Rust/TypeScript validation, current document backward compatibility, local save/reopen and export tests. Old designs and default tools must behave as before. Treat any future backend as a separate approved product decision.

## 1. Observed implementation and boundaries

| Component | Existing role | Contract/risk |
| --- | --- | --- |
| `web/pages/index.vue` | Nuxt editor and browser interactions | Large page currently combines significant UI/state behavior; decompose incrementally, not a broad rewrite |
| `web/utils/document.ts` | TypeScript document model and rules | Must match Rust accept/reject behavior, especially future migrations |
| `web/utils/document-validation.ts` | Imported document handling | Untrusted JSON and cross-language parity |
| `web/utils/background-image.ts` | Page-level raster image checks | Bounded byte/pixel/type and resource ownership |
| `crates/design-core/src/lib.rs` | Framework-independent Rust model | Schema, invariants and backward compatibility |
| `crates/design-wasm/src/lib.rs` | JS/WASM adapter | Thin marshaling, explicit errors; not a server security boundary |
| `web/scripts/editor-browser-smoke.mjs` | Real Nuxt user-flow checks | Deterministic browser state |
| `web/scripts/export-cross-browser.mjs` | Cross-browser export checks (PR #102 changes) | Actual image bytes/dimensions; per-engine isolation |

These paths are code inspection entry points, not a frozen module architecture.

## 2. HLD: today's browser/local-first product

```text
User (keyboard, mouse, touch)
    |
Nuxt / Vue UI ----------------> Browser DOM, SVG preview
    |                           | browser download/print
    |                           | localStorage (not cloud backup)
    |
Application/editor actions
    |
TypeScript document checks <--> Rust document model via WASM adapter
    |                            | bounded geometry / migration / validation
    +-------- shared JSON fixtures and parity tests --------+
```

The browser cannot be trusted for server authorization. There is currently no production Rust API, account database, remote collaboration, server-side billing or durable backup. A future Axum API and persistence should be added only through an approved ADR, with independent validation and resource authorization.

## 3. Document lifecycle

1. **Create from template:** produce a known versioned document with explicit page geometry and elements.
2. **Edit:** apply bounded user operations, maintain stable IDs, undo/redo and selection semantics.
3. **Validate:** inspect untrusted import without silently truncating, accepting NaN/invalid bounds, or losing unknown user data.
4. **Persist local:** serialise to browser storage; explain quota and data-loss limitations; preserve recovery source on failure.
5. **Reopen and migrate:** accept supported old versions through explicit migration, preserving intended content and geometry.
6. **Export:** render validated document into PNG; browser print currently supplies PDF workflow. Check actual file bytes, dimensions, clipping and text rather than only a status message.
7. **Delete or recover:** clear user-owned data through explicit actions; failure states should be understandable and recoverable.

## 4. LLD: domain and state invariants

| Concern | Invariant | Verification |
| --- | --- | --- |
| Document schema | Version is explicit; supported v1–v4 preserved | Historical fixture round-trip |
| Identity | Unique element IDs, stable selection targets | Insert/delete/reorder tests |
| Geometry | Finite positions, positive bounded sizes within page constraints | Rust/TS/WASM negative fixtures |
| Order | Array order defines element stacking; new layer commands must preserve stable IDs | Pure reorder, undo/redo, JSON and overlapping PNG/print tests |
| History | Atomic edit, redo invalidation after new edit, bounded stack | Unit + browser edit sequence |
| Raster background | Supported PNG/JPEG/WebP with byte/decoded dimension bounds | Malformed/large asset tests |
| SVG text | Untrusted string becomes escaped text, never arbitrary HTML | Injection-oriented tests |
| Export | File signature, dimensions, content and acceptable fidelity | Real downloaded artifact tests |
| Persistence | Storage failure cannot silently destroy current document | Failure simulation and manual recovery |

Schema v5 Tables are now typed, first-class elements with an owned rectangular cell matrix, bounded 1–20 rows/columns and Unicode code-point budgets. Cell editing, insertion/deletion and history regressions are merged through PR #153. Preserve visual Grids as a distinct element kind; manual accessibility, print fidelity and owner-run Ubuntu/Docker Compose acceptance remain unverified. The next feature is an accessible element layer-ordering workflow with no schema change planned.

## 5. Key operations and failure paths

```text
Import JSON
  -> bound input length and parse
  -> identify version
  -> validate / explicitly migrate
  -> construct document
  -> commit as one undoable action or reject without changing current document

User edits
  -> check selection and proposed geometry
  -> validate edited value
  -> update document + history consistently
  -> render state and accessibility feedback
  -> persist locally within resource limit

Export
  -> validate document and embedded assets
  -> render within pixel/CPU/memory limits
  -> produce downloadable PNG / print flow
  -> verify status, cleanup Object URLs and temporary resources
```

## 6. Design patterns by demonstrated benefit

- **Command:** undo/redo operations; use bounded atomic updates.
- **State machine:** multi-step pointer/selection interactions if their states become difficult to reason about.
- **Adapter:** Rust/WASM marshaling and future storage/renderer boundary.
- **Strategy:** only when there are genuinely different export algorithms.
- **Repository:** future durable storage; avoid pretending localStorage is a network repository.
- **Factory:** validated template/document creation.
- **Observer:** only for multiple actual subscribers to document-change events.

SOLID, DRY, KISS and YAGNI are decision tools; do not add layers merely to demonstrate patterns. The Rust core should not depend on Nuxt, storage or HTTP.

## Feature-budget architecture gate (2026-11-21)

The [five-PR delivery policy](../engineering/feature-delivery-policy.md) closes the historical semantic table development lane and advances to element layers. Preserve DOM/canvas order, serialized element-array order and export renderer stacking parity; do not add a new `z-index` document field without explicit accepted contract and migration evidence. Prefer a pure immutable reorder operation and accessible UI controls before extracting editor state. The next feature is limited to five opened PR attempts. Real owner-run Ubuntu/Compose, manual screen-reader and physical print remain NOT RUN.

## 7. Planned extraction sequence (not implemented)

- Extract document operations/state from the growing page component **one concern per PR**.
- Define explicit typed command semantics and history behavior.
- Consolidate duplicated Rust/TypeScript validation through shared fixtures and optionally generated contracts after evaluating build impact.
- Create renderer/export seams only as new output paths are justified.
- Define service API, auth, tenancy and persistence in a separate approved server-stage ADR.

## 8. Threats, operations and economics

Threat boundaries include JSON, data URLs, SVG, browser storage, generated files and future HTTP/account identities. Operations risks include lost local data, renderer drift, resource exhaustion and unhelpful browser errors. Business risks include disproportionate export support cost, expensive server compute and premature paid storage. Review [threat model](../security/threat-model.md), [reliability](../operations/release-readiness.md) and [commercial strategy](../product/platform-business-strategy.md).

## 9. HLD/LLD release gate

Do not label this document "production-ready" until accepted target requirements, measured performance, complete accessibility review, import/export regression and the actual deployment/recovery evidence exist. This map evolves with code; an older diagram never overrides current source.

## Replaceable adapters

Native browser primitives first. Optional prebuilt typography/layout, PDF and asset engines sit behind narrow adapters; own canonical Rust/TS contracts, preserve v5/v7 compatibility, test migration and rollback. No wholesale rewrite. See [reuse-first and zero-unapproved-spend policy](../engineering/reuse-first-policy.md).
