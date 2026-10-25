# Document History

## Status

Implemented as a pure TypeScript history state machine for the browser-only editor. The editor still stores its current document in Vue state; this module does not add cloud persistence or durable history.

## Ownership and flow

- `web/pages/index.vue` owns the live document, serializes it to a stable JSON snapshot, owns the 300 ms coalescing timer, and applies snapshots to the editor.
- `web/utils/document-history.ts` owns the bounded undo/redo transition rules. It has no Vue, DOM, storage, or timer dependency.
- `web/tests/document-history.test.ts` verifies the history state machine independently of the UI.

After a quiet 300 ms period, the page records the current snapshot. Undo/redo cancel the pending history timer first, so a user can immediately undo a change without waiting for the debounce window.

## Invariants

1. `stableSnapshot` identifies the document state represented by the history cursor.
2. Undo snapshots and redo snapshots are immutable arrays from the caller's perspective.
3. Each stack retains at most `limit` snapshots; the default is 50. A zero limit intentionally disables retained history.
4. Recording a genuinely new edit clears redo history, preventing redo from crossing into an obsolete branch.
5. Empty undo/redo operations return no snapshot and do not mutate the supplied state.
6. Importing a document starts a fresh history so undo cannot cross into the document that was previously open.
7. A pending edit is included in undo/redo decisions even if the debounce timer has not fired yet.

## Algorithm and complexity

Recording an edit appends the previous stable snapshot and trims the oldest entry when over the configured limit. With the default limit of 50, stack copying is bounded by a small constant. More generally, transitions are O(limit) time and memory because arrays are copied to keep state transitions immutable. Snapshot serialization itself is O(document size) and is owned by the page, not this module.

This is deliberately simple for the current MVP. If documents become much larger or history becomes a measured memory bottleneck, evaluate structural sharing or command-based history with explicit undo operations; do not optimize before measuring.

## Verification

Unit tests cover normal undo/redo, undo before debounce, bounded retention, branch invalidation, no-op/empty behavior, limit normalization, and redo after an unexpected edit. CI must pass formatting/type-checking, frontend tests, and the production build. Browser-level verification of edit → undo → redo → branch edit remains a separate manual acceptance step.
