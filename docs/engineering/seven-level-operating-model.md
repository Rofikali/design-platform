# Seven-Level Engineering Operating Model — Design Platform

**Status:** Contributor governance proposal; documentation only. **Authority:** [AGENTS](../../AGENTS.md) → [next](../../next.md) → [SKILLS](../../SKILLS.md) → [document map](documentation-map.md). Inspired by the review methodology in the owner's imgengine repository; this is **not** its C/ABI/FFI architecture transplanted into a design editor.

## Mission and non-negotiable constraints

Build a correct, accessible, secure, maintainable and economically sustainable browser design editor. The first jobs are **exam papers** and **shop banners**, not a generic audio/video/animation suite. Treat the versioned document contract and users' saved work as more important than framework fashion. Preserve v1–v4 migrations and do not implement schema v5 until its accepted contract and migration tests exist.

The technology currently in the repo is Nuxt/Vue/TypeScript, a framework-independent Rust design core and a thin Rust/WASM adapter. A Rust/Axum API, accounts, PostgreSQL, durable remote assets, hosted exports and billing are proposals, **not deployed features**. Do not adopt C17, public C ABI, FFI, SIMD or a native image scheduler simply because imgengine uses them.

## Seven perspectives: ask the right questions

| Level / perspective | Central question | Design Platform responsibility | Evidence |
| --- | --- | --- | --- |
| L1 Junior | What behavior is expected? | Locate current code and fixture; reproduce selection, import, edit or export problem | Small diff, reproducible test |
| L2 Mid-level | Does a whole user workflow work? | Template → edit → history → save → reopen → export | Positive, failure and boundary test |
| L3 Senior | Are invariants and failures correct? | Schema migration, document IDs, geometry, error states, rendering input limits | Contract tests, rollback/failure handling |
| L4 Tech Lead | Is the milestone coherent? | Coordinate Rust model, TS fallback, WASM adapter, Nuxt UI, keyboard interactions and export | Scope/ownership matrix, acceptance |
| L5 Staff | Are module boundaries sustainable? | Prevent duplicated validation drift, isolate UI interaction from domain state, keep renderer separate | HLD/LLD decision and parity evidence |
| L6 Principal | Is the long-term choice rational? | Cost/risk/compatibility tradeoffs, technical debt, free-to-paid triggers, roadmap sequencing | ADR, measurement, risk register |
| L7 Distinguished / Architect | Can the product evolve safely? | Preserve document portability, support future renderer/desktop/API without data loss or rewrites | Evolution plan, release/migration and restore evidence |

Level titles are review **lenses**, not seven actual hires or seven autonomous agents. Review depth should be proportional to risk.

## Cross-functional mandatory perspectives

- **Product/UX:** teachers and retailers finish their real jobs; keyboard and assistive technology are first-class.
- **Security:** imported documents, embedded images, SVG text, local persistence, dependency supply chain and future authorization are reviewed as trust boundaries.
- **QA/SDET:** shared Rust/TypeScript/WASM accept/reject fixtures, historical migration cases, real export bytes, browser and accessibility evidence.
- **SRE/DevOps:** reproducible Docker/CI, minimal costs, supply-chain posture, availability and backup decisions *if* hosted.
- **Management and CA/MBA:** actual cost per successful export, conversion/retention, support expense, variable cost, cash flow, pricing hypotheses and customer evidence. No untested market claims.

## Escalation matrix

| Change | Minimum review lenses | Mandatory extra checks |
| --- | --- | --- |
| Docs/copy | L1–L2 | Correct links, no false status |
| UI-only change | L1–L4 + UX | Typecheck, changed-flow browser test, keyboard/accessibility where impacted |
| Schema, migration, command or export | L1–L6 + security/QA | Rust/TS/WASM parity, old fixtures, actual output, failure paths |
| New server persistence, account or payment | L1–L7 + security/SRE/finance | Owner-approved ADR, authorization, data lifecycle, cost, backups/recovery |
| Public release | L1–L7 + owner | Exact candidate checks, real user-flow/accessibility evidence, rollback and cost envelope |

## Stop / approval rules

- Never edit an unrelated subsystem to satisfy a vague "A-to-Z" mandate.
- Never silently merge, deploy, enable billing, expose user content, rotate secrets, or change public API/schema/privacy policy.
- Report **verified / implemented but not retested / proposed / blocked / not run** separately.
- "Green PR CI" is not "merged", "production ready", "accessible", or "commercially validated".
- A standing document cannot run a future AI session; see [continuation runbook](agent-continuation-runbook.md).

## Practical milestone walk-through

For a **semantic table**, L1 identifies the current v4 element types; L2 defines add/edit/export; L3 proves rectangular cell bounds and v1–v4 migration; L4 coordinates keyboard navigation, layout and history; L5 checks that Table is a first-class element and Grid remains visual-only; L6 checks customer value and effort; L7 ensures old documents and future renderers survive. QA, security, product, finance and owner review occur alongside, not instead of, these checks.

Complete the [milestone handoff template](agent-milestone-handoff.md) and follow [change-scoped verification](change-scoped-verification.md) before every substantial PR.
