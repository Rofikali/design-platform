# Engineering Documentation Map

This index explains where project knowledge belongs. **For the currently active NOW task, completed/merged work, blocked PRs and the next bounded move, start at the [top LIVE NOW / NEXT / DONE board](../../next.md).** This document maps detailed contracts; it is not a second status tracker. Keep each document focused and update the existing source of truth rather than creating competing copies.

The [hourly autopilot operating agreement](hourly-autopilot.md) describes the owner's enabled recurring "go ahead" task. It supplements—rather than replaces—the live work board and human merge gates.

## Product and architecture

- [MVP scope](../product/mvp.md): initial users, outcomes, and explicit non-goals.
- [Frames and Grids milestone](../product/frames-and-grids-milestone.md): implemented schema-v4 frame/grid scope and acceptance contract.
- [Semantic Tables milestone](../product/semantic-tables-milestone.md): proposed schema-v5 data-bearing table scope and acceptance contract.
- [System overview](../architecture/system-overview.md): HLD, responsibilities, trust boundaries, and target component flow.
- [Architecture decision records](../adr/ADR-0001-architecture.md): current foundational architecture decision.
- [ADR-0002: WebAssembly adapter](../adr/ADR-0002-wasm-adapter.md): thin Rust-to-JavaScript boundary and staged integration decision.
- [ADR-0005: Frames and Grids](../adr/ADR-0005-frames-and-grids-schema-v4.md): schema-v4 first-class visual layout primitives.
- [ADR-0006: Semantic Tables](../adr/ADR-0006-semantic-tables.md): proposed first-class table data model and rejected alternatives.
- [Security threat model](../security/threat-model.md): assets, threats, controls, and risks to revisit.
- [Engineering standards](standards.md): SOLID, DRY, design-pattern selection, HLD/LLD, and definition of done.
- [Editor geometry](editor-geometry.md): coordinate model, resize invariants, algorithm complexity, and verification requirements.
- [Document history](document-history.md): undo/redo state machine, bounded snapshots, branch invalidation, and verification.
- [WebAssembly boundary](wasm-boundary.md): adapter responsibilities, generated package workflow, input bounds, fallback behavior, and remaining browser-integration gates.
- [Local document persistence](local-document-persistence.md): browser-storage boundary, size limit, failure handling, and verification.
- [Testing strategy](../testing/strategy.md): test layers and MVP release gates.

## Delivery and operations

- [Docker development](../operations/docker-development.md): local development environment and commands.
- [Unit economics](../finance/unit-economics.md): costs, pricing assumptions, and measurement principles.
- [Repository instructions](../../AGENTS.md): mandatory implementation and review rules.
- [README](../../README.md): project overview and developer quick start.

## Deep-dive engineering, delivery, business and operations references

- [Seven-level engineering operating model](seven-level-operating-model.md): junior through distinguished/principal review lenses plus security, QA, SRE, product and CA/MBA oversight.
- [Agent continuation runbook](agent-continuation-runbook.md): resume from current PR/SHA, choose a bounded next milestone and checkpoint without autonomous merge or background promises.
- [Agent milestone handoff](agent-milestone-handoff.md): task specification, PR evidence and exact-SHA CI/report template.
- [Change-scoped verification](change-scoped-verification.md): Rust, WASM, Nuxt, renderer, Docker and security testing lanes and CI cost discipline.
- [CI evidence policy](ci-evidence-policy.md): minimum logs, failed-step debugging, current-head versus historical results.
- [Decision/status register](decision-status-register.md): source-informed implemented/proposed/in-review distinctions.
- [Document editor HLD/LLD](../architecture/document-editor-hld-lld.md): current UI/Rust/WASM/browser lifecycle and proposed modularization.
- [Platform/business strategy](../product/platform-business-strategy.md): jobs-to-be-done, browser-first free and conditional future paid plans.
- [Security/privacy operations](../security/security-and-privacy-operations.md): threat-boundary, data lifecycle and response guidance.
- [Release readiness](../operations/release-readiness.md): product, migration, accessibility, security, recovery and economics gates.

## Where to record new information

| Information | Authoritative location |
|---|---|
| User problem, scope, acceptance criteria | Product docs or linked issue |
| Component responsibilities and data flow | System overview (HLD) |
| A consequential technical choice and rejected alternatives | A new numbered ADR |
| Types, invariants, algorithms, command semantics | Feature LLD or code-level design note |
| Threats, mitigations, security assumptions | Threat model plus relevant feature notes |
| Test cases and release gates | Testing strategy and CI workflow |
| Environment setup and recovery procedures | Operations docs |
| Cost assumptions, metrics, break-even model | Unit economics |
| Actual validation evidence | Pull request and release record |
| Public usage and quick-start commands | README |

## Generated milestone documentation

- [Milestone workflow](milestone-workflow.md): update one structured source, generate six bounded sections, require GitHub CI freshness, and submit a human-reviewed PR.
- [Milestone record](milestone-record.json): dated single source for the current NOW/NEXT and milestone status fields.
- [Generator](../../scripts/sync-milestone-docs.mjs): Node script used in write or --check mode; do not manually edit marked sections.

## Documentation rules

1. Mark proposed architecture as proposed until implemented.
2. Record the status and date for decisions that may change.
3. Link to a single source of truth instead of copying whole sections.
4. Include an owner or responsible area for operational procedures when the team grows.
5. Update docs in the same pull request as behavior changes.
6. Record commands and observed outcomes; do not write “tested” just because a test was added.
7. Never place credentials, private customer data, real exam candidate data, or production secrets in docs or fixtures.
8. Prefer diagrams and tables when they make boundaries or responsibilities easier to review, but keep the written explanation sufficient on its own.
