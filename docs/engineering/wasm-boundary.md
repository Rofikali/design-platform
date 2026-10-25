# WebAssembly Boundary

## Status

The `design-wasm` adapter is implemented in this change, and CI is configured to compile it for `wasm32-unknown-unknown`. The target compile is not yet verified for this PR, and the adapter is not generated as a JavaScript package or called by the Nuxt editor. The TypeScript parser remains the active browser validation path until a follow-up integration change proves parity and failure handling.

## Responsibility boundary

- `design-core` owns the document schema and domain validation rules.
- `design-wasm` is a thin adapter that accepts JSON text, deserializes a `DesignDocument`, calls `validate()`, and returns validated JSON text.
- Nuxt/Vue owns UI state, selection, pointer events, localStorage, and user-facing messages.
- The adapter must not own browser storage, network calls, timers, or editor state.

The JSON-string boundary is intentional: it avoids exposing Rust struct layout or many small cross-language calls. It also means serialization/parsing cost must be measured with representative documents before expanding the API.

## Resource and error behavior

- Reject inputs larger than 2,000,000 UTF-8 bytes before parsing.
- Use the shared Rust validator for schema version, page geometry, element count, IDs, element geometry, text length, font size, and color.
- Return a JavaScript error for malformed JSON, invalid domain data, or serialization failure. Do not silently coerce invalid fields.
- Keep all document-level limits in the core; adapter-specific limits must only add protective bounds, not loosen core rules.
- A caller still needs to handle errors and avoid treating browser-side validation as an authorization boundary if a server API is introduced.

## Build and verification

CI runs the native Rust workspace tests and Clippy, then installs `wasm32-unknown-unknown` and checks that `design-wasm` compiles for the target. A target compile proves the adapter can build; it does not prove that Nuxt loads it, that browser calls work, or that Rust and TypeScript behavior is equivalent.

The next integration step should generate/load the WASM package through a reproducible build, exercise valid and invalid fixtures in a real browser test, and compare Rust/TypeScript behavior for shared valid and invalid cases. Keep the TypeScript fallback until those checks pass.

## Performance and cost

Do not call into WASM for every pointer-move frame or individual property read. Start with coarse-grained document validation/normalization at import and before persistence/export. Measure initialization cost, transfer/serialization time, bundle size, and latency before deciding where WASM adds value.
