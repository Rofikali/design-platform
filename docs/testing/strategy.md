# Testing Strategy

## Rule
Documentation describes intended tests; it is not evidence that they have run. Record actual commands, environment, exit status, and important output for every release gate.

## Test layers

### Shared document contract
- Keep a representative versioned JSON fixture under `fixtures/`.
- Parse and validate the same fixture in both the Rust core and TypeScript frontend.
- Assert Rust serialization and TypeScript serialization preserve the fixture's field names and values.
- Treat differences that are intentional for the current MVP (such as the frontend's fixed 800 × 600 page) as documented compatibility constraints, not accidental parity.
- Maintain `fixtures/validation-cases-v1.json` as a shared accept/reject corpus consumed by Rust, TypeScript, and browser/WASM tests.
- Shared cases are a regression corpus, not proof of exhaustive equivalence; add a case whenever validation behavior changes.

### Rust core
- Unit tests for schema validation, geometry, IDs, styles, and invalid values.
- Command tests for insert, update, move, resize, delete, undo, and redo.
- Property-based tests for geometry invariants and serialization round trips when the chosen test stack supports them.
- Run the shared validation case corpus against the native core.

### Frontend
- Component tests for selection, text editing, style controls, keyboard actions, and accessible labels.
- Editor interaction tests for add/select/move/resize and undo/redo.
- Verify untrusted text is rendered as text, not executable markup.
- Run the shared validation case corpus against the TypeScript fallback parser.

### Browser/WASM smoke
- Generate the WASM package with `pnpm run build:wasm`.
- Run `pnpm run test:wasm-browser` with Chrome available on `PATH` or `CHROME_BIN`.
- Verify WASM initializes, accepts/rejects the shared validation cases as expected, rejects malformed JSON, and enforces the 2,000,000-byte UTF-8 input limit.
- Call the WASM adapter directly so domain validation errors cannot be masked by TypeScript fallback.

### Actual Nuxt editor browser test
- Run `pnpm run test:editor-browser` with Chrome available on `PATH` or `CHROME_BIN`.
- Build the Nuxt app and start its production preview; use headless Chrome to exercise the visible file input, import handler, export button, download, and status messages.
- Require export/import success messages to explicitly identify WASM validation, not the TypeScript fallback.
- Verify the downloaded JSON is parseable and versioned, valid imported content appears on the canvas, and a rejected import does not replace the current valid document.
- Keep temporary browser profiles/downloads isolated and clean them after the test.
- This is focused UI coverage; it does not replace broader interaction, accessibility, PDF export, or performance testing.

### Persistence and API (when introduced)
- Schema version and migration tests.
- Authentication, ownership, and cross-account authorization tests.
- Validation of malformed, oversized, and unsupported requests.
- Failure handling and deletion behavior tests.

### Export
- Golden fixtures for both MVP templates.
- Verify page size, orientation, margins, text content, wrapping, font fallback, and clipping.
- Compare rasterized output using a documented tolerance; avoid brittle byte-for-byte PDF checks where metadata or timestamps vary.
- Test timeout, cancellation, output limits, and temporary-file cleanup.

### Security and resilience
- Malformed document/file fixtures.
- Boundary-value tests for dimensions, element count, and text length.
- Dependency and secret scanning in CI.
- Fuzzing parsers or core serialization where useful and supported.
- Load tests only after defining a target workload and a realistic resource budget.

## CI expectations
CI should install pinned toolchains, run formatting and lint checks, execute tests, and report failures clearly. Keep the initial workflow appropriate for the files that exist; do not create a green-looking workflow that silently skips all tests.

## MVP release checklist
- [ ] Core tests pass.
- [ ] Frontend tests pass.
- [ ] Shared native/TypeScript/WASM validation cases pass.
- [ ] Real Nuxt import/export browser test passes.
- [ ] Both template export fixtures pass.
- [ ] Resource-limit and cleanup tests pass.
- [ ] Dependency/security checks have been reviewed.
- [ ] Commands, versions, and results are recorded.
