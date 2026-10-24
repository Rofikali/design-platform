# Principal Engineering Standards

## Purpose

These standards define how Design Platform is designed, implemented, reviewed, operated, and evaluated as a product. They apply to code, tests, documentation, security, and business decisions.

The standards are deliberately evidence-driven: a design proposal is not implementation, a passing unit test is not production proof, and an architecture diagram is not proof that every component exists.

## Engineering principles

### SOLID

Apply SOLID where it reduces change risk:

- **Single Responsibility:** a module should have one clear reason to change. Keep document validation, editor interaction, persistence, and export concerns separate.
- **Open/Closed:** extend supported element kinds and export strategies through explicit, tested boundaries instead of repeatedly editing unrelated code.
- **Liskov Substitution:** implementations of a shared interface must preserve its documented behavior and failure semantics.
- **Interface Segregation:** prefer small interfaces tailored to actual callers over broad service objects.
- **Dependency Inversion:** keep domain rules independent of Vue, Nuxt, Axum, storage, and renderer frameworks.

SOLID is guidance, not a requirement to create an interface for every function. Use the simplest design that protects a real boundary.

### DRY

Avoid duplicating business rules, schema definitions, limits, and validation behavior when duplication can drift. Prefer a single source of truth for each rule where technically practical.

Do not confuse DRY with removing all repetition. A little local repetition can be clearer and safer than a generic abstraction that couples unrelated behavior. Shared logic must have explicit ownership, tests, and a stable contract.

### KISS and YAGNI

Start with the simplest design that meets a demonstrated MVP requirement. Do not build speculative plugin systems, generalized layout solvers, microservices, queues, Kubernetes deployment, Redis, collaboration, or billing before a documented need and approved decision.

### Explicit boundaries

- Frontend owns presentation, accessibility, browser events, and transient UI state.
- Rust design core owns framework-independent document rules, validation, geometry, and deterministic commands.
- API, when introduced, owns authentication, authorization, durable document operations, usage controls, and export orchestration.
- Persistence owns durable data and schema migrations.
- Renderer owns conversion to export formats and must have resource limits.
- Business logic must not depend on UI-only checks for security.

## Design patterns: use when justified

| Pattern | Appropriate use | Avoid when |
|---|---|---|
| Command | Editor operations that need deterministic undo/redo | An operation is a trivial one-off with no history semantics |
| Strategy | Distinct export or layout algorithms behind a stable contract | There is only one implementation and no credible variation |
| Adapter | Rust/WASM or renderer boundary that translates types and failures | It merely renames a function without isolating change |
| Factory | Constructing validated supported element types | A simple constructor is enough |
| Repository | Isolating durable storage behind an application boundary | There is no persistence layer yet |
| State machine | Explicit multi-step workflows with legal transitions | A few booleans and simple local state remain clearer |
| Dependency injection | Supplying real external dependencies at composition boundaries | It creates a framework or service locator without a need |

Do not introduce patterns for their names. Document the problem, constraints, alternatives, and cost first when a pattern materially changes the architecture.

## High-level design and low-level design

Before a substantial feature, record:

1. **Problem and outcome:** user need, success measure, and non-goals.
2. **HLD:** affected components, data flow, trust boundaries, dependencies, failure modes, and deployment impact.
3. **LLD:** types, invariants, command semantics, validation rules, error behavior, and key algorithms.
4. **Security:** untrusted inputs, authorization, resource limits, data retention, and logging.
5. **Verification:** tests, manual checks, measurable acceptance criteria, and rollback approach.
6. **Cost:** dependency/runtime/storage/network costs and a way to measure actual usage.

Small, low-risk changes can document these points in the pull request instead of creating a separate design document.

## Rust and TypeScript conventions

- Keep the Rust core independent of web frameworks and browser APIs.
- Keep schema versions explicit; persisted format changes require compatibility and migration decisions.
- Validate at trust boundaries. Do not assume TypeScript types validate runtime JSON.
- Return typed, actionable errors at domain boundaries; do not leak secrets or private document content.
- Prefer immutable transformations where they clarify state transitions; avoid needless cloning of large documents.
- Bound user-controlled collections, dimensions, text, import size, render duration, memory, and output size.
- Avoid unsafe Rust. Any proposed exception requires a documented safety case and explicit review.
- Keep dependencies pinned through the selected package manager and lockfile. Review maintenance, license, security posture, and resource cost before adding them.
- Use descriptive names and small cohesive functions; comments should explain why or invariants, not restate obvious code.

## Pull request definition of done

A change is not done until applicable items are satisfied:

- [ ] User problem and acceptance criteria are clear.
- [ ] HLD/LLD or PR-level design notes cover material changes.
- [ ] Tests cover normal behavior, boundary cases, and relevant failures.
- [ ] Formatting, linting, type checking, tests, and build were actually run.
- [ ] Security, privacy, authorization, and resource impact were reviewed.
- [ ] Document schema compatibility was considered.
- [ ] New dependencies and licenses were reviewed.
- [ ] Relevant docs and operational instructions were updated.
- [ ] Logs avoid secrets and user document contents.
- [ ] The PR describes limitations, deferred work, and observed evidence.
- [ ] No merge or release is represented as complete before verification.

## Evidence vocabulary

Use these terms precisely:

- **Proposed:** design documented but not implemented.
- **Implemented:** code exists; quality gates may still be pending.
- **Tested:** named tests ran in a stated environment with observed results.
- **CI green:** required checks for the exact commit succeeded.
- **Verified manually:** a documented manual procedure was completed and observed.
- **Production-ready:** all defined release, security, operations, recovery, and acceptance gates have evidence. Do not use this label merely because a demo works.
