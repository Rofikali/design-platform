# Engineering Documentation Map

This index explains where project knowledge belongs. Keep each document focused and update the existing source of truth rather than creating competing copies.

## Product and architecture

- [MVP scope](../product/mvp.md): initial users, outcomes, and explicit non-goals.
- [System overview](../architecture/system-overview.md): HLD, responsibilities, trust boundaries, and target component flow.
- [Architecture decision records](../adr/ADR-0001-architecture.md): current foundational architecture decision.
- [Security threat model](../security/threat-model.md): assets, threats, controls, and risks to revisit.
- [Engineering standards](standards.md): SOLID, DRY, design-pattern selection, HLD/LLD, and definition of done.
- [Testing strategy](../testing/strategy.md): test layers and MVP release gates.

## Delivery and operations

- [Docker development](../operations/docker-development.md): local development environment and commands.
- [Unit economics](../finance/unit-economics.md): costs, pricing assumptions, and measurement principles.
- [Repository instructions](../../AGENTS.md): mandatory implementation and review rules.
- [README](../../README.md): project overview and developer quick start.

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

## Documentation rules

1. Mark proposed architecture as proposed until implemented.
2. Record the status and date for decisions that may change.
3. Link to a single source of truth instead of copying whole sections.
4. Include an owner or responsible area for operational procedures when the team grows.
5. Update docs in the same pull request as behavior changes.
6. Record commands and observed outcomes; do not write “tested” just because a test was added.
7. Never place credentials, private customer data, real exam candidate data, or production secrets in docs or fixtures.
8. Prefer diagrams and tables when they make boundaries or responsibilities easier to review, but keep the written explanation sufficient on its own.
