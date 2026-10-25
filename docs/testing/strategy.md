# Testing Strategy

## Rule
Documentation describes intended tests; it is not evidence that they have run. Record actual commands, environment, exit status, and important output for every release gate.

## Test layers

### Shared document contract
- Keep a representative versioned JSON fixture under `fixtures/`.
- Parse and validate the same fixture in both the Rust core and TypeScript frontend.
- Assert Rust serialization and TypeScript serialization preserve the fixture's field names and values.
- Treat differences that are intentional for the current MVP (such as the frontend's fixed 800 × 600 page) as documented compatibility constraints, not accidental parity.
- Maintain `fixtures/validation-cases-v1.json` as a small shared accept/reject corpus. Rust integration tests, TypeScript tests, and the browser/WASM smoke suite must consume the same cases.
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
- Verify that WASM initializes, accepts the shared valid case, and rejects each shared invalid case.
- Reject malformed JSON and non-ASCII input whose UTF-8 byte length exceeds 2,000,000.
- Call the WASM adapter directly in this test so domain validation errors cannot be masked by the TypeScript fallback.
- Keep this distinct from an end-to-end test of the Nuxt import/export controls; do not claim UI-level coverage until that exists.

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
- [ ] Both template export fixtures pass.
- [ ] Resource-limit and cleanup tests pass.
- [ ] Dependency/security checks have been reviewed.
- [ ] Commands, versions, and results are recorded.
