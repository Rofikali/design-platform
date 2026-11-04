# Frames and Grids Milestone — Product and Engineering Contract

**Status:** Proposed; implementation must follow in a separate code-focused PR.
**Target:** First frames/grids increment after schema-v3 background images.
**Scope:** Browser design editor for exam papers and shop banners. This milestone does not add audio, video, animation, arbitrary SVG, or a general-purpose page-layout engine.

## User outcomes

A user can:
- Add a rectangular frame to visually group or emphasize content.
- Add a grid with a chosen row and column count for structured layouts (for example, price lists, schedules, answer tables, or product panels).
- Select, move, resize, configure, undo/redo, save/reopen, import/export JSON, and export PNG/PDF without losing the frame/grid.
- Understand the grid's row/column structure and see predictable results on canvas and exports.

## Milestone boundaries

### Included
- One frame primitive and one grid primitive.
- Selection, drag, resize, keyboard focus, accessible labels, and property controls.
- Grid row/column counts with bounded integer values.
- Stroke color and width; frame fill/background options only if the existing rendering model can support them safely and consistently.
- Document schema migration, validation, import/export, local autosave, history, SVG/PNG export, print/PDF output.
- Unit tests, contract fixtures, and a real-browser smoke test.

### Not included
- Cell text/content editing, merged cells, spreadsheet formulas, tables with semantic row/column data, nested frames, clipping masks, arbitrary paths, snapping/guides, or a general grouping system.
- New backend, database, remote asset storage, or collaboration infrastructure.
- Arbitrary SVG/HTML supplied by users.

## Proposed interaction model

- Frame and Grid are first-class document elements, not collections of synthetic rectangles. This keeps selection, resize, history, and serialization coherent.
- A Grid is a single selectable element with a visual lattice. In this increment, cells are structural regions only; text remains separate editable text elements.
- Resize preserves the selected grid's row/column counts and recomputes line positions from its bounds.
- Row and column counts are explicit integer properties with conservative caps (proposed 1–20 each; confirm against performance and UX testing).
- Grid lines and frame borders are rendered by the shared SVG/export path, not by separate DOM-only decoration.
- Rendering order follows document element order, preserving predictable overlap behavior.

## Document contract proposal

Introduce schema version 4 only when implementation is ready. Keep v1–v3 migration behavior explicit and covered by fixtures.

Proposed variants (names and exact representation are subject to implementation review):

- **Frame:** id, position, dimensions, stroke color, stroke width, and optional fill color.
- **Grid:** id, position, dimensions, rows, columns, stroke color, and stroke width.

Validation requirements:
- IDs are unique and bounded; geometry is finite, positive, within page/resource limits.
- Stroke widths and colors use allowlisted ranges/formats.
- Grid rows/columns are integers within the documented caps.
- Reject unknown element variants and malformed fields rather than silently normalizing unsafe values.
- Preserve supported metadata and background images during migration.
- Imported data remains untrusted; WASM/client validation is not a security boundary. Any future API must independently validate the contract.

## Architecture and implementation sequence

1. **Contract and migration:** TypeScript/Rust document types, v4 migration, shared fixtures, parity tests.
2. **Core rendering:** frame/grid SVG primitives with escaped/validated values and deterministic geometry.
3. **Editor workflow:** add tools, selection, resize, property controls, accessible keyboard behavior.
4. **State integrity:** snapshots, undo/redo, local autosave/restore, import/export.
5. **Export:** PNG and print/PDF visual parity.
6. **Verification:** focused unit tests, Rust/TS parity, browser smoke test, production build, Docker builds, dependency audits.

Keep this as a modular-monolith feature. No new runtime dependencies are expected unless a concrete need is documented and reviewed.

## Acceptance criteria

- Both primitives can be added, selected, moved, resized, and configured using keyboard-accessible controls.
- Grid line count and spacing remain correct after resize and reload.
- Save/reopen, undo/redo, JSON import/export, PNG export, and print/PDF preserve the visual structure.
- v1, v2, and v3 documents migrate without losing supported content.
- Invalid dimensions, grid counts, colors, stroke widths, duplicate IDs, and unknown variants are rejected.
- Rust and TypeScript validators agree on accepted/rejected fixtures.
- Browser smoke test exercises add → configure → resize → autosave/reload → export.
- CI evidence is recorded; no local test results are claimed unless run.

## Risks and review questions

- **Schema evolution:** v4 is a persisted contract change; migration compatibility is release-critical.
- **Canvas usability:** grids may visually dominate small designs; provide sensible defaults and clear property controls.
- **Export parity:** use the same primitive geometry for canvas and export to avoid mismatches.
- **Scope creep:** keep cell text and semantic tables separate until this primitive is proven useful.
- **Accessibility:** visual lattice alone is not a semantic table; label the control as a design grid and expose its row/column properties.

## Product validation

Test with at least one exam-paper workflow and one shop-banner workflow. Observe whether users can create a structured layout without coaching. Track completion, edit time, export correctness, and whether users request cell-level content or semantic tables. Use those findings to decide the next milestone.
