# Semantic Tables Milestone — Product and Engineering Contract

**Status (2026-11-21):** Schema-v5 table validation, canvas/SVG/PNG rendering, accessible cell editing, bounded row/column insert/delete, JSON/history regressions and Unicode budget tests are merged through PR #153. The engineering iteration lane is now CLOSED (legacy feature exceeded the newly introduced five-PR rule). Manual screen-reader/usability issue #82, physical print/PDF issue #85, and real owner-run Ubuntu/Docker Compose acceptance remain NOT RUN, so this is not customer acceptance or release certification.
**Target:** First editable, data-bearing table primitive after schema v4 Frames and Grids.
**Product scope:** Exam-paper and shop-banner authoring. This milestone does not expand into spreadsheet software.

## 1. User problem and outcome

A visual Grid provides a lattice, but every cell is empty structure. Users need a semantic Table when each cell contains meaningful information.

Initial jobs:
- Exam papers: question number, question text, marks, and optional answer/working columns.
- Shop banners and price lists: product, size/quantity, and price.
- Simple schedules: day/time/activity.

A user should be able to add a table, edit cell text, add/remove rows and columns, resize the table, style its basic appearance, save/reopen it, and export it without losing data.

## 2. Domain distinction

| Concept | Meaning | Content model |
|---|---|---|
| Grid | Visual lattice used for alignment or layout | Row/column counts and stroke |
| Table | Structured data arranged in rows and columns | Rectangular matrix of cell values |

Do not implement a Table as a Grid plus separately positioned text elements. That would fragment identity, make row/column edits fragile, and complicate selection, history, validation, and export.

A Table is one first-class document element. Its cells are owned by the table and edited through table-specific commands.

## 3. Schema v5 document contract

Schema v5 adds a `table` element variant. It preserves all schema-v4 element variants and page background metadata.

Persisted table data:
- Common element identity and geometry: `id`, `x`, `y`, `width`, `height`.
- `rows` and `columns`: positive bounded integers.
- `cells`: rectangular two-dimensional array of plain-text strings; exactly `rows` arrays, each exactly `columns` cells.
- `header_rows`: integer 0 or 1; a semantic indication that the first row is a header, not a separate element.
- `stroke_color`, `stroke_width`, `cell_padding`.
- `font_size`, `text_color`, `header_fill`, and `cell_fill`.

Initial enforced bounds (subject to future usability review):
- Rows: 1–20.
- Columns: 1–20.
- Cells per table: at most 400.
- Characters per cell: at most 2,000.
- Total text characters per table: at most 20,000.
- Stroke width: same validated range as frames/grids (0.1–100 logical units).
- Cell padding: 2–24 logical units.
- Font size: 8–96 logical units.
- Colors: strict #RGB or #RRGGBB allowlist.
- Table geometry must remain finite, positive, and within existing page/document limits.

All counts must be integers. The matrix must be rectangular and match the declared dimensions. Reject malformed, sparse, oversized, or inconsistent cell arrays; do not silently truncate or pad imported user data.

Plain text only. Render cell content as text, never as HTML, Markdown, or SVG. Preserve newline characters as text. Export must escape XML text and constrain rendering work by the existing document and table limits.

## 4. Migration and compatibility

- Bump the current schema from v4 to v5 only when implementation is ready.
- Add explicit v1, v2, v3, and v4 → v5 migration paths.
- Preserve page geometry, physical output size, template metadata, background images, frames, and grids.
- Do not convert a Grid to a Table automatically: a Grid has no cell data, and inventing cell semantics would be incorrect.
- Keep a schema-v5 shared JSON fixture consumed by Rust and TypeScript tests.
- Keep old fixtures as migration inputs. Test both successful migration and preservation of every existing element kind.

## 5. User interaction and editor behavior

First vertical slice:
1. Add a Table from the insert/tools area with a small sensible default (for example, 3 rows × 3 columns).
2. Select the table as one object; move and resize it with existing editor mechanisms.
3. Select a cell and edit its plain text in an accessible labeled editor control.
4. Navigate cells with keyboard; define predictable Tab/Shift+Tab behavior and do not trap focus.
5. Add/remove rows and columns with explicit controls. Never permit zero rows or zero columns.
6. Change row/column counts while preserving existing cell values by stable row/column position; newly added cells start empty. Deletion must clearly identify which row/column is removed.
7. Configure header row, border, padding, font size, text color, and fills through bounded controls.
8. Undo/redo cell edits and structural edits as user-visible operations.
9. Save/reopen, JSON import/export, PNG export, and print/PDF preserve the table.

The canvas must expose a meaningful accessible name for the table and announce selected cell coordinates and operation results without excessive repetition. All table actions must be keyboard-operable.

## 6. Rendering and export contract

- Use one deterministic table layout calculation shared by canvas and export.
- Start with equal column widths and equal row heights; do not introduce column resizing in this increment.
- Define text wrapping, vertical alignment, padding, and clipping behavior explicitly. Never mutate or truncate the underlying cell value to make it fit.
- Clip text to its own cell bounds in SVG/PNG/print output to prevent overlap into adjacent cells.
- Header styling is determined by `header_rows` and the persisted header fill; do not infer headers from cell text.
- Keep render order based on document element order.
- Export must not fetch remote resources or accept user-authored markup.

## 7. Architecture and implementation sequence

1. **Contract/ADR:** accepted domain model, limits, migration policy, and text overflow policy.
2. **Core schema:** Rust and TypeScript types, strict validation, v1–v4 migration, shared fixture, and parity tests (current slice).
3. **Domain commands (next):** add/update cell, insert/delete row, insert/delete column, and table style commands with deterministic validation and undo/redo semantics.
4. **Editor workflow:** table insertion, selection, cell editing, keyboard navigation, row/column controls, accessible status.
5. **Rendering/export:** shared layout calculation, SVG/PNG and print/PDF output.
6. **Persistence:** local autosave, reopen, import/export, history compatibility.
7. **Verification:** unit, property/boundary, migration, parity, browser, export and accessibility regression tests.

Keep the current modular-monolith architecture. Rust remains framework-independent. Vue owns presentation and transient editor state. The browser/WASM validator is defense-in-depth, not a security boundary. Any future API must independently validate imported documents.

Do not add a database, server, Redis, queue, microservice, or new runtime dependency for this feature.

## 8. Explicit non-goals

- Spreadsheet formulas, calculations, sorting, filtering, or charting.
- Merged cells, nested tables, arbitrary per-cell rich text, images, links, or embedded HTML.
- Independent column widths, row heights, drag-to-merge, or advanced table layout.
- CSV/XLSX import/export in this first increment.
- Multi-page table continuation/repeating headers across PDF pages.
- Real-time collaboration or cloud persistence.

## 9. Acceptance criteria

- Table is a first-class element with a stable ID and rectangular cell matrix.
- Rust and TypeScript accept/reject the same shared v5 fixtures and boundary cases.
- v1–v4 migration preserves every previously supported field and element.
- Invalid counts, ragged matrices, excessive text, invalid styles, duplicate IDs, invalid geometry, and unknown variants are rejected.
- Cell editing and row/column operations are deterministic and undoable.
- Keyboard-only users can create, select, edit, navigate, and modify tables.
- Save/reopen, import/export, PNG, and print/PDF preserve table content and geometry.
- Browser tests inspect actual exported files, not only success messages.
- Manual accessibility, cross-browser rendering, and print-quality claims remain open until evidence is recorded.

## 10. Product and business validation

Observe at least one teacher/tutor creating an exam question/marks table and one shop owner creating a price list. Record task completion, time, correction frequency, export quality, and requests for features outside scope.

Do not assume that a larger table feature creates willingness to pay. Validate whether it reduces document preparation time or improves output quality before expanding into spreadsheet-like behavior.
