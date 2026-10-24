# Engineering Instructions

## Mission
Build a template-driven design editor. The first milestone is one shared editor that can create, edit, save, reopen, and export:
1. An exam paper.
2. A shop banner.

Do not expand into additional template categories until this milestone is demonstrated.

## Working rules
- Read the relevant product, architecture, security, testing, and operations docs before making changes.
- Keep changes small, reviewable, and testable. Prefer a focused pull request over a large rewrite.
- Do not claim a command, test, benchmark, security check, deployment, or manual verification succeeded unless it was actually run and its result was observed.
- Clearly label assumptions, unverified behavior, and deferred work.
- Never commit secrets, access tokens, private customer data, real exam candidate data, or production assets.
- Do not introduce microservices, Kubernetes, Redis, or a message broker without a measured requirement and an approved ADR.
- Do not add a dependency without a reason, license review, maintenance assessment, and consideration of its resource cost.
- Preserve backward compatibility for persisted documents through explicit schema versions and migrations.
- Treat all imported documents, images, fonts, SVG, text, and template content as untrusted.
- Never execute user-supplied JavaScript or arbitrary HTML templates.
- Keep authorization checks server-side; hiding a UI control is not authorization.
- Bound file sizes, dimensions, page counts, render time, memory, and export output.
- Redact secrets and document contents from logs by default.

## Architecture boundaries
- Frontend: Nuxt/Vue/TypeScript for UI, accessibility, browser interactions, and presentation.
- Shared design core: Rust, designed to compile natively and to WebAssembly (WASM); keep core logic independent of browser and server frameworks.
- API: Rust/Axum for authentication, authorization, document persistence, usage controls, and export orchestration when introduced.
- Persistence: PostgreSQL when persistence implementation begins; object storage only when user assets require it.
- Initial renderer: controlled SVG-based editor rendering, with a deliberate and tested export strategy.
- Keep a modular monolith until evidence justifies splitting deployable services.

## Pull request checklist
- [ ] Scope matches an issue or stated milestone.
- [ ] Tests were run; exact commands and outcomes are recorded.
- [ ] Security and resource-limit implications were reviewed.
- [ ] Document schema and migration implications were reviewed.
- [ ] Dependencies and licenses were reviewed.
- [ ] README and relevant docs are updated.
- [ ] No secrets, generated build output, or accidental user data are included.
