# ADR-0005: First-class frame and grid primitives in schema v4

- **Status:** Proposed for review in PR #90
- **Date:** 2026-11-04
- **Decision owners:** Product owner and engineering

## Context

The editor needs reusable rectangular frames and structural grids for exam papers and shop banners. These elements must survive selection, resizing, history, local persistence, JSON interchange, and PNG/PDF output. Persisted documents already use a versioned cross-language contract validated by Rust and TypeScript.

## Decision

Introduce schema v4 with two first-class element kinds:

- **Frame:** 'stroke_color', 'stroke_width', optional 'fill_color'.
- **Grid:** integer 'rows', 'columns', 'stroke_color', 'stroke_width'.

Both reuse the existing element identity and geometry fields. Frames and grids remain one selectable/resizable element each. A grid is a visual lattice only; cells are not semantic table cells and do not own text in this milestone.

Validation constraints:
- Grid rows and columns are integers in 1–20.
- Stroke width is finite and in 0.1–100 logical units.
- Colors are allowlisted '#RGB' or '#RRGGBB'.
- Existing element count, geometry, ID uniqueness, page and file limits continue to apply.
- v1, v2 and v3 documents migrate explicitly to v4; v3 page background images are preserved.
- Unknown element variants are rejected by both Rust and TypeScript.

The Rust core remains framework-independent. TypeScript provides matching browser fallback validation. SVG export renders frame/grid geometry from the same persisted properties used by the canvas. No new runtime dependency or backend service is introduced.

## Alternatives considered

1. **Represent a frame/grid as multiple rectangles/lines.** Rejected: selection, editing, identity, undo/redo and persistence would become fragmented, and synthetic children could exceed element limits.
2. **Store grid cells as a matrix of document elements.** Rejected for this milestone: cell text/content and semantic tables are separate product capabilities; a visual grid needs only bounded row/column counts.
3. **Add a generic shape/path abstraction.** Deferred: no demonstrated need for arbitrary paths, clipping, grouping or plugin-defined shapes yet.
4. **Keep schema v3 and encode fields ad hoc.** Rejected: a persisted document contract must identify supported variants and migration rules explicitly.

## Consequences

- Schema v4 is a compatibility boundary and must be covered by shared fixtures and Rust/TypeScript parity tests.
- Every supported renderer must handle both variants or reject unsupported schema versions clearly.
- Canvas and export must preserve document element ordering.
- Cell-level content, merged cells, semantic tables, snapping and grouping remain out of scope.
- Future server validation must independently enforce the same contract; WASM/client validation is not a security boundary.

## Verification

The implementation PR must demonstrate Rust tests, TypeScript tests, validator parity, WASM browser smoke tests, editor browser tests, export regression tests, production build and dependency audits. CI results—not this ADR—are the evidence of execution.
