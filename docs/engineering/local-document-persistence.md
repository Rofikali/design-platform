# Local Document Persistence

## Status

Implemented for the browser-only prototype. This is local browser storage, not account-backed cloud persistence or a backup guarantee.

## Ownership and boundary

The editor page owns the document state, serialization, and the 300 ms autosave debounce. `web/utils/local-document-storage.ts` owns the boundary around browser storage reads/writes and maps browser exceptions to explicit result states. The utility accepts an injectable storage provider so tests can simulate privacy/security restrictions and quota failures without relying on a real browser.

## Behavior

- Storage key: `design-platform:document:v1`.
- Serialized content is written only when it is no longer than the configured 2,000,000-character limit.
- Startup distinguishes a missing key from unavailable storage. A stored document is still passed through the document parser before being applied.
- Browser access, read, and write exceptions are caught; the editor remains usable and reports that local persistence is unavailable.
- Storage is not encrypted and may be cleared by the user, browser policy, or storage pressure. Users should download JSON if they need an independent copy.
- Autosave is debounced; a sudden tab/process termination before the debounce fires can lose the most recent edits. This prototype does not promise durable transactional storage.

## Design choices

The utility does not own timers, Vue state, JSON parsing, or UI messages. Keeping those responsibilities outside the storage boundary avoids coupling this small adapter to the editor framework and makes failure paths unit-testable. The injected provider also ensures a blocked `window.localStorage` getter is caught inside the utility rather than evaluated before entering it.

## Complexity

Read/write operations are O(n) in serialized content size as implemented by the browser. The editor caps saved serialized content at 2,000,000 characters; the browser's own quota can be lower. The adapter adds O(1) extra application memory, excluding the string and browser implementation.

## Verification

Unit tests cover successful load/save, missing keys, size rejection before writing, and exceptions from the storage provider and storage methods. CI type-check, frontend tests, and production build remain required. Manually verify persistence and recovery in a browser before describing the behavior as manually verified.
