# Engineering Skills and Playbooks

**PR enforcement:** Use one PR-body `Feature-ID: <ACTIVE-ID>` line, record GitHub's actual PR number in the milestone record, and regenerate seven sections in the same implementation PR. CI verifies the linkage; governance-only exemptions must be diff-limited and independently reviewed. For CLOSED features, record explicit DONE/PARTIAL/BLOCKED outcome.

**Feature execution rule (2026-11-21):** Follow [feature-delivery-policy.md](docs/engineering/feature-delivery-policy.md). Maximum **five PRs per feature**, count abandoned feature PR attempts, and after the budget is used close as DONE/PARTIAL/BLOCKED and advance to a different READY feature. Evidence labels are separate: merged source, exact-head CI, local Ubuntu/Docker Compose, manual accessibility, print, and release. Do not repeat table-only tests while the new layers feature is NOW.

This file is the practical companion to `AGENTS.md`. It describes how an agent should apply professional engineering, security, architecture, product, and management skills to this repository.

The goal is to build a real product and help the owner understand the decisions in easy English. A checklist is a prompt for investigation, not proof that the work was completed.

## 1. Principal Engineer playbook

For each milestone:
1. Restate the user problem and expected outcome.
2. Inspect the current implementation, tests, docs, and constraints before proposing a change.
3. Identify the smallest vertical slice that delivers observable value.
4. Map dependencies and ownership boundaries.
5. Compare at least one simpler alternative for consequential design choices.
6. Record assumptions, risks, migration needs, and deferred scope.
7. Implement in small reviewable commits.
8. Run targeted checks, then the relevant full suite.
9. Inspect CI results and fix failures before declaring completion.
10. Update docs and explain the result, evidence, and next step.

Do not make broad rewrites when a focused change will work. Do not merge based only on local confidence.

## 2. Product and business analysis (CA/MBA/Management)

Use this lens for product-shaping or commercially meaningful work:
- Customer segment, persona, job-to-be-done, pain point, current workaround, and buying trigger.
- Value proposition and differentiation; distinguish hypotheses from validated evidence.
- User journey, friction, activation, task completion, retention, and support needs.
- MVP prioritization by user value, risk reduction, effort, and dependency.
- Pricing hypotheses and packaging; test willingness to pay rather than assuming it.
- Revenue, COGS, gross profit, gross margin, contribution margin, fixed costs, operating profit, cash flow, and break-even.
- Cost drivers: hosting, storage, bandwidth, image processing, export compute, payment fees, support, and third-party licenses.
- Build-versus-buy and total cost of ownership.
- Roadmap, milestone exit criteria, risk register, owners, and decision log.

Useful formulas (state units and assumptions):
- Gross profit = Revenue - Cost of goods sold.
- Gross margin % = Gross profit / Revenue × 100.
- Contribution per paid unit = Selling price - variable cost per unit.
- Break-even units = Fixed costs / contribution per unit.
- Operating profit = Gross profit - operating expenses.

Never present estimates as actual results. Do not give definitive tax/legal advice.

## 3. Requirements and UX playbook

Before building a feature:
- Identify user, goal, trigger, normal path, alternate path, and failure path.
- Write acceptance criteria that can be observed and tested.
- Define empty, loading, success, validation-error, permission-denied, and failure states.
- Consider keyboard-only use, focus order, labels, contrast, zoom, touch targets, and assistive technology.
- Keep destructive actions explicit and recoverable where possible.
- Prefer progressive disclosure over exposing every advanced control at once.
- Validate workflows with real users; do not infer usability from developer testing alone.

## 4. Architecture and HLD/LLD playbook

### HLD questions
- What are the major runtime components and their responsibilities?
- What data crosses each boundary, and who owns it?
- Where are the trust boundaries?
- What is synchronous versus asynchronous?
- What are the deployment units and failure domains?
- What are the major cost, scaling, availability, and recovery constraints?
- What is the simplest architecture that meets current requirements?

Use C4 context/container/component diagrams and sequence/data-flow diagrams when they clarify these questions.

### LLD questions
- What are the modules, interfaces, types, invariants, and state transitions?
- How are invalid inputs rejected?
- What errors can occur and how are they represented?
- Which dependencies are injected or adapted?
- What are the concurrency, lifecycle, and resource-limit rules?
- What test seams make behavior deterministic?

Document the subset that matters. Do not create diagrams that merely restate code.

## 5. Architecture styles: selection guide

### Modular monolith
Default starting point. Separate cohesive modules inside one deployable application, enforce dependency direction, and test module contracts. Split services only when independent scaling, ownership, isolation, or release cadence justifies the operational cost.

### Domain-driven design (DDD)
Use when domain complexity is real:
- Establish ubiquitous language with users and domain experts.
- Identify entities, value objects, aggregates, invariants, domain services, and repositories only where useful.
- Define bounded contexts and explicit context boundaries.
- Keep domain rules independent from UI and infrastructure.
- Avoid anemic ceremony or creating aggregates for every data structure.

### Hexagonal / ports and adapters
Use to isolate core policy from external mechanisms:
- Domain/application logic defines ports (interfaces).
- Adapters implement persistence, HTTP, browser, filesystem, renderer, or third-party integration.
- Keep dependencies pointing inward.
- Test core behavior without requiring infrastructure.
- Avoid interfaces with only one trivial implementation unless they provide a real boundary or test seam.

### Clean / layered architecture
Use clear dependency direction and separation between presentation, application orchestration, domain policy, and infrastructure. Do not add layers that simply forward calls without protecting a boundary.

### Event-driven architecture
Use events when independent consumers, asynchronous workflows, or temporal decoupling are required. Define event ownership, schema/versioning, delivery guarantees, retries, idempotency, ordering, dead-letter handling, observability, and replay strategy. A domain event is a fact that happened; it is not every internal function call. Do not add a broker to the MVP without a demonstrated need.

### CQRS and sagas
Use CQRS when read and write models have materially different needs. Use sagas for multi-step distributed workflows with compensating actions. Both add complexity; do not adopt them by default.

## 6. SOLID, DRY, KISS, YAGNI playbook

- SRP: a module should have one coherent reason to change.
- OCP: extend behavior through stable boundaries when change pressure warrants it; do not predict every future variation.
- LSP: implementations must honor the behavior promised by their abstraction.
- ISP: keep interfaces focused on the needs of their consumers.
- DIP: high-level policy should not depend directly on low-level implementation details.
- DRY: centralize duplicated business rules and knowledge. Similar-looking code is not automatically the same concept.
- KISS: prefer the least complex design that safely solves the requirement.
- YAGNI: defer speculative capabilities until evidence or a committed requirement exists.

When reviewing, identify the actual maintenance or correctness problem each abstraction solves.

## 7. Design patterns playbook

Potential patterns and appropriate use:
- Strategy: interchangeable algorithms with a real selection point.
- Factory: controlled construction when creation rules are nontrivial.
- Adapter: translate an external API or runtime into an owned interface.
- Facade: provide a simpler boundary over a complex subsystem.
- Command: represent user operations for undo/redo, auditing, or replay.
- State: make a meaningful state machine explicit.
- Observer / Pub-Sub: notify multiple consumers when loose coupling is valuable.
- Repository: isolate persistence queries behind domain/application needs.
- Unit of Work: coordinate a transaction when multiple changes must commit together.
- Decorator: add composable behavior without changing the wrapped implementation.
- Builder: construct complex validated objects in readable steps.

For any pattern used, state the problem, why the pattern fits, alternatives, and test strategy. Avoid pattern proliferation.

## 8. Security engineering playbook

For a new feature or boundary:
1. Identify assets and sensitive data.
2. Draw trust boundaries and data flows.
3. Enumerate threats (STRIDE is a useful prompt).
4. Review relevant OWASP risks and secure defaults.
5. Define prevention, detection, containment, and recovery controls.
6. Add negative and boundary tests.
7. Record residual risks and owners.

For this editor, pay special attention to:
- Malicious JSON/documents, image decoders, fonts, SVG, and imported assets.
- XSS and unsafe DOM/SVG rendering.
- Remote resource loading and SSRF when server-side fetches exist.
- IDOR/BOLA and tenant isolation when accounts/API exist.
- Resource exhaustion through dimensions, pixel counts, element counts, page counts, decompression, render time, and output size.
- Secret handling, dependency/supply-chain risks, log redaction, retention, and deletion.
- Export sandboxing and temporary-file cleanup if untrusted content is rendered server-side.

Validate at the trusted server boundary. Client/WASM validation is not authorization. Do not claim security certification from automated scans alone.

## 9. Rust, TypeScript, and WASM playbook

- Keep the Rust core independent of browser and web-framework concerns.
- Use explicit types and validated constructors for domain invariants.
- Keep WASM glue thin and predictable; map errors deliberately.
- Maintain shared fixtures and parity tests across Rust, TypeScript, and WASM.
- Bound serialization and input sizes before expensive parsing.
- Avoid panics at untrusted boundaries; return typed errors.
- Test native behavior and browser integration separately.
- Keep TypeScript types aligned with the versioned Rust document contract.
- Treat TypeScript fallback as a separately tested implementation, not a hidden success path that masks WASM failure.

## 10. Data and document lifecycle playbook

For every persisted contract:
- Version it explicitly.
- Define canonical serialization and defaults.
- Specify validation and unknown-field behavior.
- Add fixtures for current and supported historical versions.
- Write explicit migrations and test old-to-new conversion.
- Preserve data that remains semantically valid.
- Reject unsupported or unsafe data with useful errors.
- Define size, count, and complexity limits.
- Consider backup, restore, export, deletion, and retention once server persistence exists.

## 11. Testing and QA playbook

Select tests by risk and behavior:
- Unit: pure logic and invariants.
- Integration: modules and adapters.
- Contract: schema/API compatibility.
- Migration: every supported old schema.
- Browser E2E: critical user journeys and actual downloads.
- Security: malformed inputs, authorization, injection, limits.
- Property/fuzz: parsers, geometry, serialization, and complex input spaces.
- Accessibility: automated checks plus manual keyboard/screen-reader audit.
- Visual regression: stable baselines with documented review and tolerances.
- Performance: representative workload and measured budgets.

Every report must distinguish passed, failed, skipped, not run, and not applicable. Preserve logs or CI links for material failures. Never rewrite tests merely to make a feature appear green; update expectations only when the contract intentionally changed.

## 12. Frontend/editor design playbook

Build the editor incrementally:
- Document model is the source of truth.
- Separate document state from transient UI state (selection, hover, active tool, drag preview).
- Use explicit commands for user-visible edits where undo/redo is required.
- Keep canvas rendering deterministic from document data.
- Keep pointer movement efficient; avoid expensive full-document work per pointer frame.
- Keep keyboard alternatives for core pointer interactions.
- Make selection, handles, controls, and focus states accessible.
- Treat image decode, font load, SVG import, and export as failure-prone operations.
- Keep import/export round trips covered by fixtures and browser tests.

Add shapes, tables, frames, grids, typography, and background/image tools as separate user-value milestones with acceptance criteria. Do not add audio/video as implied scope.

## 13. API, persistence, and distributed systems playbook

When server capabilities are introduced:
- Define resource ownership, authorization, validation, rate limits, idempotency, pagination, and error contracts.
- Use transactions for invariants spanning multiple database writes.
- Add indexes based on query patterns and measured plans.
- Define schema migrations and rollback/forward compatibility.
- For async jobs, define state transitions, retry policy, idempotency key, timeout, cancellation, dead-letter handling, and cleanup.
- For events, define event version, producer/consumer ownership, delivery semantics, ordering, replay, and observability.
- Keep tenant isolation tests mandatory.
- Start with a modular monolith and one database unless measured constraints say otherwise.

## 14. DevSecOps, SRE, and release playbook

- CI: formatting, linting, tests, type checks, build, dependency/security checks, and relevant browser tests.
- CD: controlled environments, least-privilege credentials, immutable artifacts, approvals where needed, and rollback strategy.
- Observability: structured logs, metrics, traces, correlation IDs, and actionable alerts when services exist.
- Reliability: define SLI/SLO only for meaningful user-facing service behavior; test backup/restore and failure recovery.
- Operations: document deployment, configuration, secrets, migration, incident, rollback, and support procedures.
- Cost: monitor compute, storage, bandwidth, database, third-party, and support costs against product assumptions.

## 15. Documentation deliverables

Create or update the relevant artifact when work changes:
- Product brief, personas, workflows, requirements, acceptance criteria, roadmap.
- HLD and LLD, C4 diagrams, sequence/data-flow diagrams, module contracts.
- ADRs for consequential architecture choices.
- Threat model, security controls, privacy/data lifecycle, residual risk.
- Test plan, regression evidence, accessibility audit, performance report.
- API and schema references, migration notes.
- Deployment/runbook, backup/restore, incident response, rollback.
- Pricing assumptions, unit economics, cost model, break-even analysis.

Suggested documentation map:
- `docs/product/`
- `docs/architecture/`
- `docs/security/`
- `docs/testing/`
- `docs/operations/`
- `docs/finance/`

## 16. Owner-facing delivery report

At the end of a milestone, explain:
1. What changed and what the user can now do.
2. Why the design was selected and which principles/patterns were applied.
3. HLD/LLD or trust-boundary impact.
4. Security, accessibility, and business/cost implications.
5. Exact tests and CI outcomes (including failures/skips).
6. Known limitations and deferred work.
7. PR/commit/live test links and the next smallest milestone.

Use easy English alongside correct technical vocabulary. Teach the reason, not only the command.


## 17. Permanent agent continuation and low-cost verification recipes

The following guides are repository-specific counterparts of the owner's imgengine playbooks; **do not** import that repository's C17/FFI/ABI requirements into Design Platform.

1. [Seven engineering review lenses](docs/engineering/seven-level-operating-model.md): proportional Junior → Mid → Senior → Tech Lead → Staff → Principal → Distinguished scrutiny with security/SRE/QA/finance.
2. [Milestone continuation](docs/engineering/agent-continuation-runbook.md): reconcile latest `main`, PRs and checks, choose one READY task and checkpoint. Documentation cannot initiate an asynchronous agent or authorize an automatic merge.
3. [Milestone handoff template](docs/engineering/agent-milestone-handoff.md): specify user outcome, in/out scope, schema, negative tests, threat boundaries, rollout, owner approval and exact SHA.
4. [Change-scoped verification](docs/engineering/change-scoped-verification.md): select targeted Rust, WASM, TypeScript, browser, export, Docker and dependency checks without suppressing required CI.
5. [CI evidence and minimal context](docs/engineering/ci-evidence-policy.md): report PASS/FAIL/PENDING/CANCELLED/SKIPPED/NOT RUN at current tested revision, link successful logs and read only failed steps when diagnosing.
6. [Document editor HLD/LLD](docs/architecture/document-editor-hld-lld.md): code-level ownership and lifecycle of versioned documents, localStorage and browser exports.
7. [Business strategy](docs/product/platform-business-strategy.md), [security operations](docs/security/security-and-privacy-operations.md) and [release gates](docs/operations/release-readiness.md): free-versus-paid and customer-data decisions remain proposals until approved and verified.

**Standing principle:** avoid expensive duplicate compilation and rapid speculative CI-triggering commits; batching unrelated milestones is not acceptable either. A single bounded coherent PR, with exact-head required tests, is the unit of review. A public repository's free standard Actions usage is not a reason to waste compute, and caching is not a correctness guarantee.


## 18. Scheduled hourly "go ahead" engineering autopilot

The owner enabled an independent ChatGPT task named **Design Platform Autopilot** (hourly, 24/7 until manually paused). When the task fires—or the owner manually says "go ahead"—follow the [hourly autopilot agreement](docs/engineering/hourly-autopilot.md) and [agent continuation](docs/engineering/agent-continuation-runbook.md). Fetch current GitHub and exact-head status; choose the highest-priority eligible unfinished NOW task; do one bounded change; record PR/CI/risks/next action. No repetitive full Docker/test builds. The latest owner rule authorizes the autopilot to review and merge PRs when current-head checks, security, protection and any independent-review requirements pass. Never fake independent review or bypass checks; no publishing, deployment, paid services, credentials or customer-data changes. A scheduled task is separate from Markdown and from GitHub Actions.

<!-- milestone-sync:start -->
<!-- GENERATED from docs/engineering/milestone-record.json by scripts/sync-milestone-docs.mjs. DO NOT EDIT. -->
### Milestone snapshot (generated: 2026-11-22)

**Reference main:** a4cd88eba5a475601a70c6a3b6a393c560273f23 (dated snapshot; re-check live GitHub before acting).

**NOW:** **DP-M3-ALIGN-01 — Basic alignment and optional snapping** [PR_OPEN]. [PR #162](https://github.com/Rofikali/design-platform/pull/162)

**NEXT:** DP-M3-IMAGE-01 [PLANNED]; DP-SEC-01 [BLOCKED] [Issue #118](https://github.com/Rofikali/design-platform/issues/118); DP-M1-ACC-02 [BLOCKED] [Issue #82](https://github.com/Rofikali/design-platform/issues/82); DP-M1-BG-09 [PLANNED] [Issue #85](https://github.com/Rofikali/design-platform/issues/85)

**Feature budget:** DP-M3-ALIGN — 2/5 PRs recorded since 2026-11-21. No sixth PR for the same feature; close it as done/partial with gaps, then advance. Historical table PRs are grandfathered.

**Review gate:** Owner-authorized autopilot may review and merge only after all exact-head/integration CI, security, branch protection and required independent-review gates pass. No automatic publishing or deployment.

<!-- milestone-sync:end -->
