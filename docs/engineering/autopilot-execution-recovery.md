# Hourly Autopilot — Outcome-First Execution and Recovery

**Scope:** `Rofikali/design-platform`, 23 November 2026. This is a **repository documentation contract**, not a scheduled job or continuous worker. The separately enabled ChatGPT **Design Platform Autopilot** owns hourly invocation and its run history; user **go ahead** is an additional immediate request, never a replacement for that schedule. A completed scheduled invocation can still produce **NO CODE CHANGED**. GitHub Actions builds and tests are not proof a coding agent fired. Apply [AGENTS](../../AGENTS.md), [autopilot governance](autopilot-zero-human-review.md), [hourly operations](hourly-autopilot.md), [living board](../../next.md), [source-of-truth milestone record](milestone-record.json) and [five-PR policy](feature-delivery-policy.md).

## Execution objective and resume-first decision tree

Each *actual* invocation attempts **one bounded, evidence-based engineering advancement**, not a full re-audit of already merged milestones. No success is promised where GitHub access, safe task discovery, tests or scheduler execution fail.

1. **Read checkpoint then live GitHub.** Capture previous run's pending action/retry count when available. Recheck actual `main`, all open/draft PRs, newest merges, head/base SHAs, required/current security checks, review threads and active protection. Live evidence overrides dated `PR_OPEN` prose or even the last run's checkpoint. Do not repeat full historical PR analysis unless it bears on today's task.
2. **Open PR present? Resume it.** Fix source/tests or required CI in the same PR, revalidate exact head/base, inspect changed files and any blocking review threads. Do not open a competing PR or count extra commits as new feature attempts. A self-review COMMENT is truthful evidence, **not** an independent GitHub approval.
3. **No open PR? Implement the selected feature.** Identify smallest meaningful ready vertical slice, tests and rollback before opening the next feature PR. `DP-M3-IMAGE` has **4 of 5 opened attempts** as of the dated PR #170 merge; a fifth attempt must prioritize a usable foreground-image authoring slice with versioned document contract and Rust/TypeScript/WASM parity, editor add/select/move/resize, history/autosave/import/export and PNG/print non-regression, scoped to genuinely verifiable coverage. Do not claim everything fits into one change without evidence. At acceptance or five attempts close DONE/PARTIAL/BLOCKED honestly, preserve unmet criteria and promote only one independently eligible next feature. No sixth PR by relabeling.
4. **Make material code/tests/CI progress, then document.** For a feature PR, update `docs/engineering/milestone-record.json` as the single structured source, register the actual PR number, regenerate exactly **seven** marked views via `node scripts/sync-milestone-docs.mjs`, and verify `--check` plus generator tests in the same PR. If local Node cannot run, use only a proven byte-equivalent method or defer source-of-truth edits rather than commit an unsynchronized partial record. Mark local tests NOT RUN; never hand-edit generator-owned sections.
5. **Review and integrate only if gates truly pass.** Latest-head required Nuxt/Rust/doc-sync/dependency CI; applicable browser/image/export/keyboard checks; active branch rules; updated base; no blocking threads; and proportionate security/a11y/rollback evidence. Check GitHub current state again before any merge, use `expected_head_sha`, and separately verify integrated-main CI. Green CI is not manual screen-reader, physical printer or production-release approval.
6. **Hand off exactly one next step.** Store in the task run result and (when a PR exists) its factual PR conversation the concrete next path/function/test, current head, failing or pending checks and retry count. The next invocation must revalidate live state rather than assume the checkpoint is still accurate. Avoid status-only commits and duplicate task registrations.

## Mandatory per-run checkpoint (actual executions)

| Record | Evidence to supply |
| --- | --- |
| Invocation vs execution | Scheduled/manual trigger; expected and actual times if task service exposes them; enablement and failure only when observed from actual task history |
| Engineering progress | **CODE CHANGED** or **NO CODE CHANGED**, why, exact changed files, observable outcome and next executable code/test action |
| Git state | Live main SHA, exact PR head/base, PR number/link or NONE, merge SHA if integrated, stable Feature-ID and opened-PR count |
| CI and verification | Required vs conditional jobs, PASS/FAIL/RUNNING/SKIPPED/NOT RUN at exact commit, URLs, local Node/Rust/browser tests actually run or NOT RUN |
| Documentation | Milestone record and all seven generated views VERIFIED/NOT TOUCHED/DEFERRED; affected HLD/LLD/security/operations/product/finance docs UPDATED or N/A |
| Risk | Privacy/localStorage invariants, schema migration/TS-Rust-WASM parity, keyboard/a11y/export evidence, security #118, manual #82/#85/#158, unapproved-spend/deploy gate |
| Continuation | Last verified step, exact blocker and same-blocker no-change counter, distinct safe fallback or owner-only decision |

A last-run note is only a resumable hint, **not** an alternative backlog. Current GitHub identifies merges, docs identify planned work, and code/tests demonstrate behavior. Do not promise uninterrupted execution.

## Recovery and escalation

* **Scheduler failure:** First inspect ChatGPT Tasks/Automations for enabled status, exact next/last run, recorded failure, delivery and environment/connection status. Neither repository text nor Actions run history can establish a missed ChatGPT invocation. Update the existing task if authorized; do not duplicate it.
* **Tooling failure:** If checkout/Node/Rust/browser tooling is unavailable, use safe GitHub connector edits where permitted and rely on later exact-head GitHub CI evidence. Report local checks NOT RUN rather than assuming Chrome, Docker or native Compose were executed.
* **Repeated analysis-only output:** After **two consecutive NO CODE CHANGED executions on the same blocker**, specify the repeated failed step and move to a different independent, approved safe task or escalate the required owner/admin choice. Do not reset the count with a renamed feature or create cosmetic governance PRs.
* **Stale generator views:** Historical failure snapshots remain historical. After PR #169 an autosave browser smoke test failed; a later integrated-main run #45106836566 was reported passing on `37fbe383`. Neither establishes that an intermittent race is impossible. Verify current SHA/steps, and correct material milestone records with all seven generated views in the same eligible PR.
* **No READY work:** Name the precise dependency and bounded reproduction/acceptance needed, then evaluate an independent work category with no affected protected data. Do not force a premature image/schema/print release merely to make the hourly metric green.

## L1–L7, CISSP, CCIE, Linux/SRE, CA/MBA and management evidence

| Lens | Concrete question for this project |
| --- | --- |
| L1–L2 engineer | Does the user-visible editor slice work with negative tests, accessible keyboard behavior, readable modular Nuxt/Vue/TypeScript and small changes? |
| L3–L4 senior engineer | Are schema v1–v5 migrations, type/validation contracts, Rust/TypeScript/WASM parity, undo/redo, localStorage and import/export intact? |
| L5 staff engineer | Are element lifecycle, decoded-resource budgets, image rendering, error states and predictable PNG/print geometry proven across boundaries? |
| L6 principal/SRE | Are reproducible CI, supply-chain gates, browser test flake triage, Docker/Ubuntu environment and rollback cost recorded? |
| L7 architect/CTO | Does the work advance a single accepted outcome within five PR attempts, preserve optional future capabilities and avoid speculative services? |
| CISSP/security | Protect untrusted images, input size/pixel budgets, CSP/dependency issues (#118), local-first privacy, least privilege and zero telemetry surprise |
| CCIE/network | Current editor is browser-local; network/API/remote upload controls are N/A until separately authorized. Reassess origin, TLS, bandwidth and privacy on any later service design |
| CA/finance, MBA/management | No unapproved paid service, account, deploy or usage charge; assess user benefit, support burden, technical debt, licensing and opportunity cost |

**Hard stops:** No unapproved upload, telemetry, secret changes, destructive user-document operations, paid infrastructure, billing, deployment/release, GitHub protection bypass or false independent approval. Manual screen-reader #82, printer #85 and layers #158 remain separate acceptance; dependency issue #118 remains a risk until resolved with proof. Documentation cannot create a working hourly executor by itself.
