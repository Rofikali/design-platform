# WebAssembly Boundary

## Status

The `design-wasm` adapter is integrated into the frontend JSON import/export validation path. CI compiles the adapter, generates the JavaScript package, and runs both a direct real-Chrome WASM smoke test and a browser test against the actual Nuxt editor.

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

From `web/`, run `pnpm run build:wasm` to generate the ignored package at `web/generated/design-wasm`; do not commit generated output. CI installs wasm-pack and Chrome. `pnpm test` builds the WASM package through the pnpm lifecycle before browser checks run.

### Direct WASM smoke

Run `pnpm run test:wasm-browser` with Chrome available on `PATH` or `CHROME_BIN`. It loads the generated module over HTTP in headless Chrome, consumes `fixtures/validation-cases-v1.json`, rejects malformed JSON, and verifies the 2,000,000-byte limit using non-ASCII UTF-8 input. This calls WASM directly so validation errors cannot be hidden by TypeScript fallback.

### Actual Nuxt editor import/export

Run `pnpm run test:editor-browser` with Chrome available on `PATH` or `CHROME_BIN`. The runner builds the Nuxt app, starts its production preview server, drives the real page in headless Chrome through the DevTools protocol, and verifies:
- JSON export reports the WASM engine and produces a downloaded, parseable version-1 document.
- Importing `fixtures/document-v1.json` reports WASM validation and renders the imported text on the visible canvas.
- Importing an unsupported schema is rejected and leaves the previously loaded valid document unchanged.

The runner uses a temporary Chrome profile and download directory and removes them when the test finishes. It does not add a browser automation package or change the pnpm lockfile.

### Shared validation corpus

The versioned `fixtures/validation-cases-v1.json` cases are consumed by Rust integration tests, TypeScript Vitest tests, and the direct WASM browser smoke. This establishes agreement for representative cases, not exhaustive semantic equivalence across every possible input.

## Remaining release gates

These tests exercise the current JSON import/export path, not all pointer/keyboard editor interactions, PDF export, accessibility, or performance. Measure initialization cost, serialization time, bundle size, and latency on representative documents before claiming a performance benefit or production readiness.

## Performance and cost

Do not call into WASM for every pointer-move frame or individual property read. Keep the cross-language boundary coarse-grained around document validation/normalization. Measure initialization cost, transfer/serialization time, bundle size, and latency before deciding where WASM adds value.

## Reuse-first WASM decision

Use browser shaping first; preserve thin WASM and Rust/TS contract parity. Defer COSMIC Text/HarfBuzz/FreeType until measured native requirement, ABI/FFI ADR and performance/security evidence. See [reuse-first and zero-unapproved-spend policy](reuse-first-policy.md).
