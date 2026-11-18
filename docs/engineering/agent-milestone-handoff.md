# Design Platform — Agent Milestone and PR Handoff Template

**Status:** Copy/fill for an individual task, not evidence that work was done. Adapted from imgengine's bounded agent-handoff method; Design Platform has a Rust document contract/WASM/browser editor, **not** imgengine's C ABI and native processing pipeline.

## A. Before starting

| Field | Required factual entry |
| --- | --- |
| Task ID / title / status | Link to issue or next.md item, current status |
| User and job-to-be-done | Teacher exam paper, retailer banner/price list, etc. |
| Deliverable, user outcome | Verifiable end-to-end behavior |
| Mode | Audit only / docs only / code plus tests / release review |
| Repository / branch / base SHA / current head | Fetch live; no old SHA assumptions |
| In scope and out of scope | Explicit directories, exact limits |
| Current contract | Schema v4 or proposed v5; fixtures and ADR |
| Design | HLD/LLD impact, alternatives, ownership and failure paths |
| Risks and threat boundary | JSON, images, SVG, browser persistence, assets, privacy |
| Accessibility | Keyboard, focus, label, live region, screen reader/zoom plan |
| Compatibility | v1–v4 migrations, import/export round trip, semantic vs visual grid |
| Cost | Toolchain, GitHub runner minutes, cloud/vendor/license costs |
| Tests | Targeted commands, actual expected assertions, required CI |
| Rollback | Revert, migration/recovery, safe failure path |
| Human approval | Merge, schema, deployment, paid service, data retention |
| Completion evidence | PR URL, exact head SHA, CI/steps, manual evidence |

## B. Work procedure

1. Read `AGENTS.md`, `SKILLS.md`, `next.md`, [seven-level model](seven-level-operating-model.md), current milestone docs and actual code.
2. Inspect `git status`, base/main, open PRs and existing CI; do not erase or rewrite another branch.
3. For a significant domain/architecture change produce an ADR or bounded design note; state why a simpler option is insufficient.
4. Implement a cohesive vertical slice. Keep Rust domain rules separate from Nuxt interaction state; keep WASM adapter thin.
5. Run change-scoped tests; record negative, malformed, oversized and compatibility cases.
6. Create/update one PR, wait for required latest-head checks, report unresolved risk.
7. Owner reviews and approves merge; do not auto-merge.
8. Update `next.md` and only affected documentation with actual evidence, not optimistic descriptions.

## C. Test report

| Test | Command / run ID | Exact SHA | Result | Reason if skipped/not run |
| --- | --- | --- | --- | --- |
| Rust format/tests/Clippy | | | | |
| Rust WASM compilation | | | | |
| TS/Nuxt typecheck and unit tests | | | | |
| Browser import/edit/export | | | | |
| Cross-browser PNG/PDF | | | | |
| Dependency security | | | | |
| Docker production/development | | | | |
| Manual keyboard/screen-reader | | | | |
| Performance or fuzz/security | | | | |

Allowed result labels: **PASS, FAIL, PENDING, CANCELLED, SKIPPED, NOT RUN, NOT APPLICABLE**. Do not turn a green earlier commit into latest-head success; do not treat a skipped path-scoped job as a passed test.

## D. PR body outline

```text
Why this change / user value:
Files and boundaries touched:
User-visible outcome and acceptance:
Architecture/ADR decision and alternative:
Security/privacy/resource impact:
Schema and migrations:
Accessibility:
Tests actually executed (exact SHA, commands, CI URLs):
What is NOT RUN / skipped and why:
Performance evidence and measured cost (if any):
Risks and rollback:
Docs updated:
Owner decision required:
Next task:
```

## E. Stop conditions

Stop before altering public visibility, billing, production credentials, user data retention, schema incompatibility, bypassing required CI or merging without approval. Do not claim an external model or CI has unlimited time, money, context or autonomous continuation.
