# Quality Gates and Release Readiness

## Purpose

A quality gate is a decision rule backed by observable evidence. This document defines the minimum progression from a local change to a release candidate. It describes required practice, not a claim that the current product has already passed every gate.

## Gate 1 — Change design

Before implementation, identify:

- User problem and acceptance criteria.
- Affected components and data flow.
- Inputs, outputs, invariants, and failure behavior.
- Security/privacy concerns and resource limits.
- Schema compatibility and migration impact.
- Dependencies, license, maintenance, and operational cost.
- How the change will be tested and safely reverted.

For small changes, put this in the PR description. For a cross-component or hard-to-reverse decision, write an ADR or feature design document.

## Gate 2 — Local verification

Run the applicable commands from the repository's current README and CI workflow. Typical checks include:

- Rust formatting: `cargo fmt --all -- --check`
- Rust tests: `cargo test --workspace`
- Rust lint: `cargo clippy --workspace --all-targets -- -D warnings`
- Frontend type checking: `corepack pnpm run typecheck`
- Frontend tests: `corepack pnpm test`
- Frontend production build: `corepack pnpm run build`

Commands may change as the repository evolves. Confirm current scripts before relying on this list. Record the environment and exact result. Do not claim a local check passed if it was not run.

## Gate 3 — Pull request CI

- Use the pinned package manager and committed lockfile.
- Use a frozen dependency install in CI.
- Run formatting, linting, tests, type checks, and production build as applicable.
- Fail clearly on errors; do not hide failures behind `continue-on-error` or skipped tests.
- Review the result for the exact PR head commit.
- Inspect dependency or workflow changes for unexpected network access, permissions, and secret exposure.

A green CI run proves only that the configured checks passed for that commit. It does not prove complete security, accessibility, fidelity, scalability, or production readiness.

## Gate 4 — Feature acceptance

For editor behavior, verify the user journey end to end:

1. Create or open a supported template.
2. Add and edit supported objects.
3. Select and modify objects using keyboard-accessible controls.
4. Undo and redo edits without corrupting document state.
5. Save and restore according to the documented persistence model.
6. Import malformed or oversized data and confirm the current valid document remains intact.
7. Export supported content and verify dimensions, fonts, text, wrapping, clipping, and margins.
8. Confirm that unsupported operations fail safely and explain the limitation.

The exact acceptance steps should evolve with the MVP. Do not claim a feature is complete if its main journey works only in a developer's browser without repeatable tests or recorded manual evidence.

## Gate 5 — Security and resilience

Before handling real user data or enabling server-side exports, review:

- Server-side authorization for every protected resource.
- Runtime validation for imported JSON and uploaded assets.
- File, page, element, image, text, CPU, memory, and output-size limits.
- Safe handling of SVG, fonts, image decoders, and PDF/PNG renderer inputs.
- Isolation and least privilege for untrusted rendering work.
- Request timeouts, cancellation, concurrency limits, and backpressure.
- Temporary-file cleanup and data retention/deletion behavior.
- Redacted logs, secrets management, dependency vulnerabilities, and abuse controls.
- Backup, restore, migration, and incident-response procedures where durable data exists.

Security tests should target the real trust boundary, not only the UI. A hidden button or TypeScript type is not an authorization or runtime-validation control.

## Gate 6 — Operational readiness

Before production use, define measurable targets for:

- Availability and acceptable failure rate.
- Latency by user journey, including export.
- Maximum document and export size.
- Per-user and global concurrency.
- Memory and CPU limits on the actual deployment tier.
- Error reporting and actionable, privacy-preserving logs.
- Deployment rollback and database migration recovery.
- Retention, deletion, backup, and restore expectations.
- Support process and incident ownership.

Measure on the intended hardware and representative workloads. Do not infer capacity from a developer laptop or a single happy-path test.

## Gate 7 — Business readiness

Track costs and product outcomes separately from technical correctness:

- Infrastructure cost per successful document/export.
- Average and high-percentile CPU time, memory, and output size.
- Failed exports and support burden.
- Storage and bandwidth per active customer.
- Conversion, repeat usage, and willingness to pay when measured.
- Gross margin after infrastructure, payment fees, refunds, support, and taxes as applicable.

Pricing and scale claims must state assumptions and evidence. Do not promise profitability or millions of users based only on an architecture diagram.

## Release record template

For each release candidate, record:

- Commit/tag:
- Scope and known limitations:
- Toolchain and deployment environment:
- CI run and conclusion:
- Tests and exact outcomes:
- Manual acceptance evidence:
- Security review and unresolved risks:
- Migration/backup/rollback plan:
- Operational metrics or benchmark workload:
- Cost assumptions:
- Approval and release date:

If a gate is not applicable, explain why. If it is not complete, label it as a blocker or accepted risk rather than silently omitting it.
