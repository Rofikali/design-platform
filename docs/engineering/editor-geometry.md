# Editor Geometry: Resize and Movement

## Status

Implemented in the browser prototype. The Rust core does not yet own or execute these interactions, so frontend geometry helpers are not a cross-platform source of truth yet.

## Component boundary

`web/components/editor/EditorCanvas.vue` owns canvas rendering and forwards selection/pointer events. The page currently owns the document state and interaction orchestration; this keeps the visual canvas separate without introducing a second source of truth. Future extraction of interaction state should happen only with focused tests and a clear ownership boundary.

## Coordinate model

- The editable page uses logical coordinates with an origin at the top-left.
- The current page is 800 × 600 logical pixels.
- Element position is its top-left corner; width and height describe its bounding box.
- Pointer deltas are measured in client coordinates. The current canvas is rendered at 1 CSS pixel per logical pixel; if zoom or scaling is introduced, pointer deltas must be converted into logical coordinates before applying geometry rules.

## Current resize behavior

The selected element exposes a bottom-right handle. Resizing keeps the top-left corner fixed and adjusts width and height using the pointer's delta from the interaction start. The helper clamps dimensions to the remaining page area and enforces an 8-pixel minimum. The operation uses the starting geometry rather than accumulating per-event deltas, avoiding drift from repeated floating-point updates.

Movement and resize each track the active pointer ID. Pointer capture keeps the interaction associated with the initiating pointer, and unrelated pointer events are ignored. A cancelled pointer interaction restores the geometry captured at its start.

## Invariants

1. Resize does not intentionally move the top-left anchor.
2. Width and height remain finite and at least the minimum size.
3. The resize helper limits the element to the available page area for valid in-page anchors.
4. Pointer movement must not create NaN or infinite geometry.
5. The existing document validator remains the import boundary; UI helpers are not a substitute for validating imported JSON.
6. Undo/redo history and local autosave observe the resulting document changes through the existing debounced watcher.

## Complexity and performance

The resize math is O(1) time and O(1) extra space per pointer event. Looking up the target element in the current array is O(n), where n is the element count (currently capped at 1,000). This is acceptable for the current MVP. If profiling shows a bottleneck at larger document sizes, consider maintaining an ID-to-element index while preserving a single authoritative document model.

## Verification requirements

- Unit-test normal resizing, minimum size, right/bottom boundaries, and non-finite values.
- Run frontend tests, type checking, and the production build in CI.
- Manually verify mouse and touch resizing, undo/redo after resize, autosave/reload, and pointer cancellation in a real browser before describing the interaction as manually verified.
- When zoom, multi-handle resizing, rotation, groups, or shared editing is added, update this design note and test the new coordinate transforms and invariants.
