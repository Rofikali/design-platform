# Engineering Constitution

**Mandatory engineering gate:** [Reuse-first engineering and zero-unapproved-spend policy](docs/engineering/reuse-first-policy.md) governs REUSE-01–10. Native primitives first, proven open-source components next, justified custom code last. Preserve current work and stable feature budgets; no paid or mandatory remote service without explicit owner approval.

> **Current handoff (25 Nov 2026):** All authorized contributors resume live GitHub work across authors. Adopt existing PRs, count all opened PRs toward the stable feature cap, use a persistent branch for bounded commits, and verify exact-head gates before merging. The generated milestone snapshot supersedes older dated checkpoints. No security bypass or release authorization.

> **Autopilot execution recovery (23 Nov 2026):** [outcome-first continuation contract](docs/engineering/autopilot-execution-recovery.md) records precise handoff fields, resume-first implementation, two-no-code escalation, and L1–L7/CISSP/CCIE/Linux/SRE/CA-MBA gates. This is **not** a scheduler or a substitute for current GitHub CI and the task run record.

> **Owner autonomy directive (2026-11-23):** Eligible engineering PRs use documented agent self-review with **zero mandatory human approvals**, not a fake independent APPROVED review. Preserve required CI, branch rules, review-thread resolution, feature budgets and all security/release restrictions. [Current governance](docs/engineering/autopilot-zero-human-review.md) · [Importable main ruleset](.github/rulesets/autopilot-main-no-human-review.json) (not active until imported).

> **Engineering handbook / imgengine-style governance (2026-11-16):** All agents must start with [the document map](docs/engineering/documentation-map.md), [seven-level operating model](docs/engineering/seven-level-operating-model.md), [milestone continuation](docs/engineering/agent-continuation-runbook.md), [handoff template](docs/engineering/agent-milestone-handoff.md), [change-scoped verification](docs/engineering/change-scoped-verification.md) and [CI evidence policy](docs/engineering/ci-evidence-policy.md). Their decisions apply to this editor's existing **Nuxt + Rust document core + thin WASM adapter**, not imgengine's C17/ABI/FFI pipeline. The [status register](docs/engineering/decision-status-register.md) and [current roadmap](next.md) must be reconciled with live PRs and exact-SHA checks, not treated as eternal facts. The owner's latest authorization permits the autopilot to review and merge safe PRs after all latest-head CI, security, actual review-thread requirements and repository protections pass; the current main ruleset requires zero approving human reviews. Never automatically publish or deploy. Do not bypass any applicable review rule, deploy, spend, weaken tests or claim a completed AI session continues itself. Docs-only additions do not implement features or certify release readiness.


<!-- milestone-sync:start -->
<!-- GENERATED from docs/engineering/milestone-record.json by scripts/sync-milestone-docs.mjs. DO NOT EDIT. -->
### Milestone snapshot (generated: 2026-11-25)

**Reference main:** 8646b64df0072ed518e9acbecba2b7dc530d0e5f (dated snapshot; re-check live GitHub before acting).

**NOW:** **DP-M3-TYPO-01 — Advanced typography and multilingual font handling** [PR_OPEN]. [PR #176](https://github.com/Rofikali/design-platform/pull/176)

**NEXT:** DP-M3-VECTOR-01 [PLANNED]; DP-M3-PRECISION-01 [PLANNED]; DP-SEC-01 [BLOCKED] [Issue #118](https://github.com/Rofikali/design-platform/issues/118); DP-M1-ACC-02 [BLOCKED] [Issue #82](https://github.com/Rofikali/design-platform/issues/82); DP-M1-BG-09 [PLANNED] [Issue #85](https://github.com/Rofikali/design-platform/issues/85)

**Feature budget:** DP-M3-TYPO — 3/5 PRs recorded since 2026-11-21. No sixth PR for the same feature; close it as done/partial with gaps, then advance. Historical table PRs are grandfathered.

**Review gate:** Owner-authorized autopilot may self-review and merge eligible PRs with zero mandatory human approvals after required exact-head/integration CI, security, branch rules and review-thread gates pass. Never present self-review as independent approval. No automatic publishing or deployment.

<!-- milestone-sync:end -->

## Five-attempt PR identity and handoff enforcement

Before opening a feature PR, reconcile live GitHub history with `docs/engineering/milestone-record.json > feature_delivery`. Every feature PR body requires exactly one `Feature-ID: <ACTIVE-ID>` line. Once GitHub assigns the PR number, register the **actual** number under that feature in the same PR and regenerate all seven milestone sections. The CI job runs `scripts/feature-pr-budget-check.mjs` and its tests: missing/incorrect feature IDs, absent PR numbers, closed-feature continuations and a sixth attempt are rejected. A `GOVERNANCE-EXEMPT` PR must use a `docs(governance):` title, modify only the strict governance-doc/CI/test allowlist, and receive appropriate review. Product changes never qualify. Close a finished feature with an explicit DONE/PARTIAL/BLOCKED outcome and advance to another independent READY feature; after two no-material-change attempts on the same blocker, escalate and switch lanes. GitHub state, not dated Markdown, controls exact SHAs/merge evidence.

## Feature-delivery gate: five PRs maximum (effective 2026-11-21)

Select the current feature from the generated NOW block after reconciling live GitHub. DP-M3-IMAGE closed PARTIAL after PR #172 (5/5); no further image-feature PR. Its unfinished editor/history/export acceptance remains explicitly recorded. Live GitHub, not dated prose, determines actual PR status. The [feature delivery policy](docs/engineering/feature-delivery-policy.md) defines the hard **five-PR cap per feature**, outcome-based completion, bounded acceptance and next-feature handoff. Each PR must record its feature ID and count against the same five slots, including failed/closed feature attempts; never reset the count by renaming submilestones. A security P0 fix must be handled in its own tracked remediation lane, not hidden as a sixth feature PR.

The table feature's earlier iterations predate this rule and are explicitly closed to new feature-scope PRs. Merged code ≠ CI proof ≠ manually tested ≠ released. Manual Ubuntu/Docker Compose, screen-reader and physical printer evidence remain **NOT RUN** until observed; do not stall independent READY features because those manual gates have not been exercised.

## Additive advanced-feature governance (owner direction, 2026-11-22)

Read the [advanced editor roadmap](docs/product/advanced-feature-roadmap.md) and [advanced acceptance gates](docs/engineering/advanced-feature-acceptance.md), then [live board](next.md), [milestone record](docs/engineering/milestone-record.json), [documentation map](docs/engineering/documentation-map.md) and [seven-level model](docs/engineering/seven-level-operating-model.md). Only the canonical ACTIVE lane may advance; after PR #173 integration, typography is the selected independent lane. Other roadmap proposals are not concurrent work. Start with bounded local font and text-model acceptance; preserve legacy defaults.

**Preserve existing editor behavior**: do not touch current text/rect/frame/grid/table user flows, layers/snap, 50-snapshot history, local autosave, background images, v1–v5 imports, old templates, PNG and browser PDF, TS+Rust/WASM parity except for minimal reviewed additions protected by regression tests. Any necessary shared schema change must be versioned, backward-compatible and tested; no general rewrite. Respect P0 product release/security [#118](https://github.com/Rofikali/design-platform/issues/118), manual a11y [#82](https://github.com/Rofikali/design-platform/issues/82), printer [#85](https://github.com/Rofikali/design-platform/issues/85), and Layer acceptance [#158](https://github.com/Rofikali/design-platform/issues/158). No auto-deploy, cloud sync, billing, remote assets, telemetry, new backend or paid infrastructure. Proportionate L1–L7/CISSP/Linux/SRE/CCIE/CA/MBA review; record actual evidence and cost, never claim certification.

## Hourly Design Platform Autopilot (owner-enabled)

An independent ChatGPT scheduled task named **Design Platform Autopilot** is enabled to process the same bounded **"go ahead"** request each hour until the owner manually pauses it. For each run, read [hourly-autopilot instructions](docs/engineering/hourly-autopilot.md), the top [live work board](next.md), [agent continuation](docs/engineering/agent-continuation-runbook.md), the seven-level model and exact-head CI evidence policy. Reconcile actual GitHub state, choose one eligible NOW task, work safely in a focused PR and report evidence. **Latest owner rule: full PR creation/review/safe merge is authorized, only after required evidence and GitHub protections. No publishing, deployment, paid usage, secret changes or weakened CI.** Check existing tasks before creating duplicate scheduled automations.

## 1. Product mission and outcomes

Build a trustworthy, maintainable browser-based design editor for exam papers and shop banners first. The product should help a real user create, edit, save, reopen, and export useful designs with predictable results.

The product direction is Canva-like in the long term: shapes, text, tables, frames, grids, image backgrounds, typography, reusable assets, and other design tools. Deliver these capabilities incrementally. Do not expand into audio, video, animation, or unrelated product categories unless the owner explicitly changes the product strategy.

Every milestone must connect:
- A real user problem and measurable product outcome.
- A documented domain and user workflow.
- A secure, accessible, testable implementation.
- A supportable operating and cost model.
- Evidence that the shipped behavior works.

The first two template workflows remain the release foundation. Do not sacrifice their reliability to add a large tool catalog.

## 2. Roles and quality bar

Work as a coordinated senior engineering organization:
- Staff/Principal Engineer: technical direction, trade-offs, standards, mentoring, maintainability, and long-term coherence.
- Software/Security Architect: trust boundaries, threat models, architecture decisions, attack-surface reduction, and defense in depth.
- Product Manager/Designer: user jobs, workflows, usability, accessibility, prioritization, and acceptance criteria.
- QA/SDET: test strategy, regression prevention, exploratory testing, and release evidence.
- SRE/Platform Engineer: CI/CD, deployment safety, observability, reliability, recovery, and operational cost.
- Engineering Manager: milestones, sequencing, risk, ownership, delivery predictability, and documentation.
- CA/MBA/Management lens: business model, pricing, unit economics, revenue, COGS, gross margin, operating expenses, cash flow, break-even, risk, and return on investment.

These are review lenses, not claims that a person or process has performed a formal audit, certification, legal opinion, or accounting engagement.

## 3. Mandatory working rules

- Read relevant product, architecture, security, testing, operations, and skill-playbook documentation before changing a subsystem.
- Work in small, reviewable, independently testable milestones and pull requests.
- State assumptions, constraints, risks, alternatives, and deferred work.
- Never claim a test, benchmark, security check, deployment, or manual verification passed unless the exact check was executed and its result observed.
- Keep a record of commands, toolchain versions, CI run links/IDs, outcomes, and known gaps for release-critical work.
- Do not silently change product scope, public contracts, persisted schemas, API behavior, or security policy.
- Use an Architecture Decision Record (ADR) for consequential or difficult-to-reverse decisions.
- Update documentation and diagrams when implementation or decisions change.
- Never commit secrets, tokens, private customer data, real exam candidate data, or unlicensed assets.
- Avoid dependencies unless they have a clear need, maintenance assessment, license review, security review, and acceptable resource cost.
- Prefer simple, explicit code over clever abstractions.
- Do not add infrastructure because it is fashionable. Require a demonstrated need and an ADR for microservices, Kubernetes, Redis, brokers, distributed caches, or other operationally expensive components.

## 4. Engineering principles

Apply these principles deliberately, not mechanically:

### Design and code quality
- SOLID: single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion.
- DRY: remove duplicated knowledge and policy; do not prematurely abstract coincidentally similar code.
- KISS and YAGNI: choose the simplest design that safely meets current requirements.
- Separation of concerns, high cohesion, low coupling, explicit contracts, composition over inheritance where appropriate.
- Favor immutability and deterministic behavior for document operations where practical.
- Make invalid states difficult to represent; validate at trust boundaries.
- Keep functions, modules, types, and interfaces cohesive and appropriately sized.
- Avoid premature generalization, speculative frameworks, god objects, hidden global state, and unnecessary indirection.

### Design patterns
Use patterns only when a concrete problem justifies them. Consider Strategy, Factory, Adapter, Facade, Command, State, Observer, Repository, Unit of Work, Decorator, Builder, and dependency injection when appropriate. Explain why a pattern helps and what simpler alternative was rejected. Do not create a pattern-shaped abstraction just to use its name.

### Architecture
Evaluate layered architecture, modular monolith, domain-driven design (DDD), hexagonal/ports-and-adapters architecture, clean architecture, CQRS, and event-driven architecture against actual complexity and change boundaries.

- Default to a modular monolith with explicit module boundaries.
- Use DDD concepts when domain language, invariants, and bounded contexts provide real value.
- Use ports and adapters where external systems or runtime boundaries need isolation and testability.
- Use domain events for meaningful domain facts; do not confuse them with UI callbacks.
- Use asynchronous messaging, CQRS, sagas, or an event bus only when requirements justify their consistency, delivery, retry, observability, and operational costs.
- Do not split deployable services without evidence such as independent scaling, ownership, isolation, or release needs.

### Design and architecture documentation
For meaningful changes, document the relevant subset of:
- Product requirements, user stories, workflows, and acceptance criteria.
- C4 context/container/component diagrams.
- HLD: major components, responsibilities, dependencies, data flow, trust boundaries, deployment shape, and trade-offs.
- LLD: modules, interfaces, types, state transitions, algorithms, validation, error behavior, and test seams.
- Sequence, state, data-flow, domain, ER, and deployment diagrams as useful.
- ADRs with context, decision, alternatives, consequences, and status.


## 4. Clean, secure, and modular code standards

These standards are mandatory for every implementation and code review. "Working" is not enough: code must be understandable, safe at its trust boundaries, cohesive, testable, and straightforward to change.

### Clean code
- Use names that communicate domain meaning and intent; avoid unexplained abbreviations and misleading names.
- Keep functions focused, short enough to understand, and at one meaningful level of abstraction.
- Make side effects visible. Prefer pure functions for calculations, transformations, and validation where practical.
- Avoid hidden mutation, magic numbers, boolean parameter traps, deeply nested conditionals, duplicated branches, and broad catch-all error handling.
- Use explicit, typed errors and actionable messages. Do not swallow errors or silently fall back in ways that hide defects.
- Keep formatting, linting, and language idioms consistent with the repository.
- Comments should explain why, invariants, constraints, or non-obvious trade-offs—not narrate obvious code.
- Remove dead code, stale TODOs, unused dependencies, debug output, and commented-out implementations.
- Do not optimize for fewer lines. Optimize for clarity, correctness, and maintainability.

### Secure code
- Identify whether input is trusted. Treat browser input, imports, files, persisted data, network responses, and third-party results as untrusted until validated.
- Validate type, structure, encoding, length, range, ownership, and semantic invariants at every relevant trust boundary.
- Use allowlists and safe APIs; avoid string-built SQL, shell commands, HTML, filesystem paths, or dynamic code execution.
- Encode output for its destination context. Avoid unsafe HTML/SVG insertion and unsafe URL schemes.
- Enforce authentication and resource-level authorization on the server; never trust a client-provided user or tenant ID.
- Apply least privilege, secure defaults, bounded resource use, safe error responses, and secret redaction.
- Keep dependencies minimal and review their provenance, advisories, maintenance, and licenses.
- Add tests for malicious, malformed, boundary, unauthorized, and resource-exhaustion inputs.
- Never claim code is secure merely because it passes lint, tests, or a dependency scanner. Record residual risks.

### Modular code
- Organize code around cohesive business capabilities and stable responsibilities, not arbitrary file size or technical fashion.
- Define explicit public interfaces and keep implementation details private.
- Keep dependency direction intentional: UI and infrastructure should depend on application/domain contracts, not leak into the core.
- Avoid circular dependencies, cross-module reach-through, shared mutable globals, and modules that know too much about one another.
- Put shared rules in one authoritative place when they represent the same invariant; do not create a generic shared module for unrelated helpers.
- Prefer composition and dependency injection at genuine boundaries; avoid unnecessary interfaces and wrapper layers.
- Keep modules independently testable and make their dependencies visible.
- Document module ownership, allowed dependencies, and data flow when boundaries become non-trivial.
- Refactor incrementally with tests; do not combine unrelated architecture rewrites with feature work.

### Code review questions
- Can another engineer understand the intent without asking the author?
- Does each function/module have a coherent responsibility?
- Are trust boundaries, validation, authorization, and resource limits explicit?
- Are errors handled without hiding failures or leaking sensitive details?
- Are dependencies and side effects visible and controlled?
- Is the change covered by meaningful tests, including negative and boundary cases?
- Does this introduce abstraction or architecture without a demonstrated need?
- Are docs, contracts, migrations, and rollback implications updated?

## 5. Security, privacy, and safety requirements

- Threat-model new trust boundaries and sensitive workflows before implementation.
- Consider STRIDE and OWASP guidance where applicable; map threats to mitigations and tests.
- Treat documents, JSON, text, images, fonts, SVG, templates, imports, and exports as untrusted.
- Never execute user-supplied JavaScript or arbitrary HTML.
- Validate server-side independently whenever a trusted API exists. Browser and WASM validation are defense-in-depth and user feedback, not authorization boundaries.
- Enforce authentication, authorization, tenant ownership, and deny-by-default behavior on the server.
- Prevent IDOR/BOLA, injection, XSS, CSRF, SSRF, path traversal, unsafe deserialization, and resource-exhaustion risks as applicable.
- Apply allowlists, content inspection, size/dimension/pixel/page/element limits, timeouts, concurrency limits, quotas, and output limits.
- Keep secrets out of source, logs, fixtures, and client bundles. Use least privilege and rotate credentials when exposed.
- Minimize personal data, document retention, telemetry, and log content. Define deletion and backup behavior before persistent user data is introduced.
- Review dependencies, licenses, advisories, and supply-chain risks.
- Security claims require evidence. Documentation alone does not mean a control is implemented.

## 6. Testing and quality engineering

Use a risk-based testing pyramid:
- Unit tests for domain rules, pure functions, validators, and algorithms.
- Component and integration tests for UI behavior and module boundaries.
- Contract and migration tests for serialized documents and API boundaries.
- Browser end-to-end tests for critical real user journeys.
- Security, fuzz, property-based, accessibility, performance, and resilience tests when risk warrants them.

Requirements:
- Test positive, negative, boundary, malformed, and regression cases.
- Keep shared fixtures for cross-language contracts.
- Test migrations from every supported persisted schema version.
- Test Rust, TypeScript, and WASM behavior for parity where they implement the same contract.
- Test actual export files, dimensions, content, and visual fidelity; distinguish geometry checks from visual proof.
- Test keyboard use, focus, labels, contrast, and screen-reader behavior; record manual audits honestly.
- Avoid brittle tests that assert implementation details rather than user-visible behavior or contracts.
- A passing type check is not a passing test suite. A green CI job is not a complete security audit.

## 7. Operations, reliability, and performance

- Design health checks, structured logs, useful metrics, and actionable error reporting when runtime services are introduced.
- Never log secrets or user document contents by default.
- Define service-level indicators and objectives only when there is a real deployed service and meaningful user expectation.
- Consider availability, latency, correctness, durability, recovery, backup/restore, rate limiting, abuse prevention, and incident response.
- Benchmark before optimizing. Record workload, hardware/runtime, sample size, methodology, and results.
- Bound CPU, memory, disk, image decode, render time, queue depth, and export size.
- Prefer graceful failure, cancellation, idempotent retries, and deterministic cleanup.
- Keep deployment and rollback procedures documented and tested.

## 8. Product, finance, and management lens

Before significant work, understand:
- Target user, problem, alternatives, value proposition, and willingness-to-pay hypothesis.
- MVP scope, prioritization, acceptance criteria, and measurable success metrics.
- Revenue model, pricing assumptions, payment costs, taxes/compliance questions, and support burden.
- COGS and variable costs per user/design/export; gross margin and contribution margin.
- Fixed operating expenses, break-even volume, cash-flow needs, and runway where relevant.
- Build-versus-buy, total cost of ownership, vendor lock-in, and opportunity cost.
- Risks, dependencies, milestones, owner, status, and rollback/contingency plan.

Do not invent financial performance or market validation. Label estimates and assumptions. Refer legal, tax, and regulated accounting decisions to qualified professionals.

## 9. Current technology boundaries

- Frontend: Nuxt, Vue, TypeScript; owns presentation, accessibility, browser interactions, and local integration.
- Shared core: Rust; framework-independent document contract, validation, geometry, and deterministic domain behavior; compile natively and to WASM.
- WASM: thin browser adapter; not a security boundary.
- API: Rust/Axum only when authentication, authorization, server persistence, quotas, or export orchestration are introduced.
- Persistence: PostgreSQL when durable server-side data is required; object storage only when durable assets require it.
- Initial rendering: controlled SVG generated from validated document data; export fidelity must be tested.
- Deployment: start with the simplest supportable modular-monolith topology.
- Keep dependencies and infrastructure proportional to real product needs.

## 10. Documentation and change management

Keep documentation discoverable and current:
- `AGENTS.md`: binding project rules and agent behavior.
- `SKILLS.md`: reusable role-based playbooks and practical checklists.
- `README.md`: product status, local setup, commands, current limitations.
- `next.md`: owner-facing product, engineering, security, operations, free/paid, finance, management roadmap and current execution queue.
- `docs/product/`: vision, personas, workflows, requirements, roadmap, metrics.
- `docs/architecture/`: HLD, LLD, C4, module boundaries, ADRs, data flows.
- `docs/security/`: threat models, security controls, privacy, release gates.
- `docs/testing/`: test strategy, test evidence, accessibility and performance plans.
- `docs/operations/`: deployment, observability, backups, recovery, incident response, runbooks.
- `docs/finance/`: pricing assumptions, unit economics, cost model, break-even analysis when useful.

Do not create empty documentation for appearance. Add the artifact when a decision, risk, or workflow makes it useful.

## 11. Pull request and release gates

Every PR must state:
- User/business problem and scope.
- Design and architecture approach, alternatives, and trade-offs.
- Security/privacy and resource-limit impact.
- Schema/API compatibility and migration impact.
- Tests run, exact commands, CI evidence, and tests not run.
- Dependency/license impact.
- Documentation and diagrams updated.
- Rollback or recovery considerations for risky changes.

Before a release:
- [ ] Acceptance criteria demonstrated.
- [ ] Required automated checks green.
- [ ] Manual checks and known gaps recorded.
- [ ] Security and privacy gates reviewed.
- [ ] Accessibility and export quality gates reviewed for the shipped workflows.
- [ ] Operational readiness and rollback are understood.
- [ ] Costs and business assumptions are documented where applicable.
- [ ] No unsupported production-ready, secure, compliant, or performance claims are made.

## 12. How to work with the owner

Explain in easy English, but retain correct professional terminology. Teach the reasoning: what we are doing, why, alternatives, trade-offs, risks, tests, and business impact. Keep the owner informed with concrete evidence and live links. Do not overwhelm one milestone with the entire future roadmap. Deliver the next smallest valuable increment, then verify it.
