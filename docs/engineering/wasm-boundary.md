# WebAssembly Boundary

## Status

The `design-wasm` adapter is integrated into the frontend JSON import/export validation path. CI compiles the adapter, generates the JavaScript package, and runs a real Chrome smoke test against the generated package. The browser suite now checks shared valid/invalid validation cases in addition to module initialization and resource-boundary behavior. It is not yet a full end-to-end test of the Nuxt editor's visible import/export buttons.

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

From `web/`, run `pnpm run build:wasm` to generate the ignored package at `web/generated/design-wasm`; do not commit generated output. CI installs wasm-pack and Chrome, then runs `pnpm run test:wasm-browser` after the generated package is built by the frontend lifecycle scripts.

The versioned `fixtures/validation-cases-v1.json` cases are consumed by:
- Rust integration tests for the `design-core` validator.
- TypeScript Vitest tests for the editor's fallback parser.
- The real Chrome smoke harness, which invokes the generated WASM adapter and checks each case against its expected accept/reject outcome.

The browser test also rejects malformed JSON and verifies the 2,000,000-byte limit with non-ASCII UTF-8 input. The adapter is called directly, so domain validation failures are not hidden by the TypeScript fallback in this test.

These tests establish agreement for the representative shared cases, not exhaustive semantic parity across every possible input. The suite still does not exercise the editor's visible import/export controls or measure performance; those remain separate release gates.

## Performance and cost

Do not call into WASM for every pointer-move frame or individual property read. Start with coarse-grained document validation/normalization at import and before persistence/export. Measure initialization cost, transfer/serialization time, bundle size, and latency before deciding where WASM adds value.
