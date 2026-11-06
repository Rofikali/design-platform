# ADR-0006: Semantic Tables as First-Class Document Elements

- **Status:** Proposed
- **Date:** 2026-11-06
- **Decision owners:** Product owner and engineering owner
- **Related:** ADR-0005 (Frames and Grids schema v4), Semantic Tables Milestone

## Context

Schema v4 supports a Frame and a Grid. A Grid is a visual lattice with row and column counts; its cells do not contain data. Exam-paper and shop-banner workflows need actual cell content such as question number, question text, marks, product, and price.

Representing a table as a Grid plus independent text elements would split one user concept across many unrelated elements. Row insertion/deletion would require coordinated geometry changes, selection would be confusing, and undo/redo could leave partially updated content.

The document format is versioned and validated in both the framework-independent Rust core and TypeScript fallback. Imported JSON is untrusted. Browser/WASM validation is not a security boundary.

## Decision proposed

Add a first-class `Table` element in schema v5 when implementation begins.

The table owns:
- Stable element identity and page geometry.
- A bounded row/column count.
- A rectangular matrix of plain-text cell values.
- An optional first header row.
- A small, explicit set of table-wide style properties.

A table remains one selectable/movable/resizable object. Cell editing and row/column changes are domain operations on that object, not synthetic child elements.

Keep Grid and Table separate:
- Grid means visual alignment structure with no cell data.
- Table means structured row/column data with editable cells.

## Alternatives considered

### A. Grid plus text elements
Rejected. It creates many independent IDs and geometry objects, makes structural edits fragile, increases element-count pressure, and makes undo/redo difficult to keep atomic.

### B. Table as an array of generic child elements
Rejected for the first increment. It adds hierarchy and ownership semantics before the product needs nested objects. A single table aggregate is simpler and preserves cell ownership.

### C. Full spreadsheet model
Rejected. Formulas, independent cell dimensions, merged cells, calculation dependencies, and large data imports materially increase product and security complexity. They are not required for the first exam-paper and shop price-list workflows.

## Consequences

Positive:
- One table has one identity, selection state, geometry, and history boundary.
- Row/column changes can be validated and committed atomically.
- Rust and TypeScript can share one bounded data contract.
- Rendering and export can use one deterministic layout calculation.

Costs and constraints:
- Schema v5 requires explicit v1–v4 migration and compatibility tests.
- Matrix and text limits must be enforced before expensive rendering.
- The editor needs cell focus/navigation semantics in addition to object selection.
- Export must clip text to cell bounds and preserve the full source cell value.

## Security and reliability requirements

- Strict integer bounds for rows/columns and a maximum cell count.
- Strict per-cell and aggregate text limits.
- Rectangular matrix validation; reject ragged or inconsistent data.
- Strict color, stroke, padding, font-size, and geometry validation.
- Render cell content as escaped text only; never parse user HTML/Markdown/SVG.
- Bound wrapping and rendering complexity; never silently truncate persisted data.
- Keep client/WASM checks as defense-in-depth; a future server must independently validate.
- Test malformed JSON, boundary values, duplicate IDs, invalid styles, and export clipping.

## Deferred decisions

The following require implementation-time review and evidence:
- Final row/column and text limits.
- Whether the first row is styled bold by default.
- Exact wrapping and clipping algorithm.
- Keyboard navigation details for Tab, Shift+Tab, Enter, and arrow keys.
- Whether a future release needs per-column widths, merged cells, or multi-page table continuation.

## Revisit triggers

Revisit this ADR if user testing shows that equal-width/equal-height cells are inadequate, tables must span PDF pages, or users need spreadsheet calculations. Do not add those capabilities preemptively.
