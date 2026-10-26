# ADR-0003: Configurable Page Geometry and Print-Size Metadata

- **Status:** Proposed for review
- **Date:** 2026-10-26
- **Related issue:** [#26](https://github.com/Rofikali/design-platform/issues/26)

## Context

The current schema-v1 editor and TypeScript parser require an 800 × 600 page. The product MVP requires two different layouts: an A4 portrait exam paper and a landscape shop banner. A template picker built on top of the fixed page would misrepresent page geometry, while silently assigning a physical print size to existing documents would change their meaning.

The Rust core, TypeScript fallback, WASM adapter, JSON fixtures, browser editor, and eventual PDF renderer must agree on one versioned contract. Browser canvas pixels are not themselves a physical paper size.

## Decision proposed

### 1. Separate logical canvas geometry from physical output size

- Keep element coordinates, element widths/heights, and text font sizes in logical CSS-pixel-like units at a defined 96-units-per-inch reference scale.
- Make page logical `width` and `height` configurable instead of requiring 800 × 600.
- Represent optional physical output dimensions explicitly as `output_size_mm: { width, height }` in millimetres.
- A print-ready page must preserve the same aspect ratio between logical dimensions and physical output dimensions. Reject mismatched ratios beyond a documented tolerance; do not stretch content independently on the X and Y axes.
- Screen-only documents may omit `output_size_mm`; PDF export must ask for or require a physical output size rather than inventing one.
- Define conversion and rounding rules once and test them. At the 96-units-per-inch reference scale, 1 logical unit corresponds to 0.75 PDF points before any explicit page-fit scale is applied.

### 2. Version the contract; do not mutate v1 semantics

- Keep schema-v1 documents importable through an explicit migration path.
- Introduce schema v2 for configurable page geometry and optional template metadata.
- A v1 document migrates to v2 with its original 800 × 600 logical page and elements unchanged. It has no inferred template identity or physical output size.
- If a migrated v1 document is exported to PDF, the user must choose a physical size or a future explicit conversion flow must do so. Do not silently label a 4:3 document as A4.
- Unsupported future schema versions must continue to be rejected with a clear message.
- Keep schema migration separate from validation: migration transforms a supported old version into the current model, then current validation runs on the result.

### 3. Keep template identity descriptive, not privileged

- Add optional, validated template metadata such as `template: { id, version }`.
- Template IDs identify a starting layout; they must not bypass document validation, resource limits, import checks, or export policy.
- The document remains editable after a template is selected. Template identity must not become a hidden source of truth for dimensions or element content; the actual page and element data are explicit in the document.

### 4. Define bounds before accepting arbitrary dimensions

The implementation PR must set and test hard bounds for logical page width/height, total page area, aspect ratio, physical output dimensions, element count, text length, and export output. Keep the bounds aligned in Rust, TypeScript, WASM, and browser tests. Reject non-finite values and unreasonable dimensions before layout or rendering.

## Example presets

These are proposed initial presets, not yet implemented or validated by an export engine.

| Template | Logical page | Physical output | Purpose |
|---|---:|---:|---|
| Exam Paper | 794 × 1123 logical units | 210 × 297 mm (A4 portrait) | Print-first document |
| Shop Banner | 1200 × 600 logical units | 600 × 300 mm (landscape example) | Print/digital promotional banner |

The logical dimensions intentionally approximate the physical aspect ratio. The exact preset constants and permitted tolerance must be locked by tests before shipping.

## Alternatives considered

### Keep 800 × 600 for every template

Rejected. It cannot represent A4 portrait and a landscape banner faithfully with one fixed page geometry.

### Store only physical millimetres for every element coordinate

Not selected for the first implementation. It complicates browser styling and existing editor code without proving that it improves the MVP. It remains a valid alternative if measured export fidelity or layout requirements justify a coordinate-system change.

### Infer output size from template name

Rejected. Names are descriptive metadata, can be stale or user-edited, and must not override explicit validated page properties.

### Add an API/database now to manage templates

Rejected. Template definitions can remain versioned local assets while the product has no account or server-persistence requirement. Backend services do not solve coordinate semantics.

## Consequences

**Benefits**
- Supports multiple page aspect ratios without making the UI or Rust core depend on one template.
- Keeps physical print intent explicit and avoids silently turning an existing 800 × 600 document into A4.
- Makes schema migration, validation parity, and PDF conversion testable.
- Keeps the architecture as a modular monolith and allows templates to be implemented before accounts or server persistence.

**Costs and limitations**
- Requires coordinated Rust, TypeScript, WASM, fixture, and browser-test changes.
- Schema-v2 migration and the UI must handle documents with no physical output size.
- The proposed preset dimensions are not proof of PDF fidelity; export still needs golden fixtures and physical-size checks.

## Implementation acceptance criteria

1. Review and accept this ADR before schema changes are merged.
2. Add a schema-v2 fixture and explicit v1-to-v2 migration tests in Rust and TypeScript; prove parity through WASM.
3. Test both presets, aspect-ratio rejection, dimension/area limits, unsupported versions, and malformed input.
4. Preserve the existing v1 fixture and current import behavior.
5. Update the editor to derive canvas dimensions from validated document data, not fixed constants.
6. Keep template picker UI and PDF/PNG renderer in focused follow-up PRs.
7. Document exact test commands and observed results; do not claim export correctness until the renderer exists and is tested.
