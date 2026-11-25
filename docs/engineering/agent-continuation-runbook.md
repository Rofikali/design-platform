# Agent Continuation and New-Session Recovery — Design Platform

> **Current handoff (25 Nov 2026):** All authorized contributors resume live GitHub work across authors. Adopt existing PRs, count all opened PRs toward the stable feature cap, use a persistent branch for bounded commits, and verify exact-head gates before merging. The generated milestone snapshot supersedes older dated checkpoints. No security bypass or release authorization.

> **Owner update (23 Nov 2026):** [autopilot self-review + gated merges with zero required human approvals](autopilot-zero-human-review.md) supersedes historical mandatory-review language. Never call an agent self-review independent. GitHub rules and all CI/security/manual-release gates still apply.

**Status:** Standing procedure, not running automation. Inspired by imgengine's milestone-continuation model and adapted to Design Platform. [AGENTS](../../AGENTS.md), [next](../../next.md), [handoff template](agent-milestone-handoff.md) and current source/CI remain authoritative.

<!-- milestone-sync:start -->
<!-- GENERATED from docs/engineering/milestone-record.json by scripts/sync-milestone-docs.mjs. DO NOT EDIT. -->
### Milestone snapshot (generated: 2026-11-25)

**Reference main:** 553711d3c866be573f990d313f6c74038e7108e2 (dated snapshot; re-check live GitHub before acting).

**NOW:** **DP-M3-TYPO-01 — Advanced typography and multilingual font handling** [PR_OPEN]. [PR #177](https://github.com/Rofikali/design-platform/pull/177)

**NEXT:** DP-M3-VECTOR-01 [PLANNED]; DP-M3-PRECISION-01 [PLANNED]; DP-SEC-01 [BLOCKED] [Issue #118](https://github.com/Rofikali/design-platform/issues/118); DP-M1-ACC-02 [BLOCKED] [Issue #82](https://github.com/Rofikali/design-platform/issues/82); DP-M1-BG-09 [PLANNED] [Issue #85](https://github.com/Rofikali/design-platform/issues/85)

**Feature budget:** DP-M3-TYPO — 4/5 PRs recorded since 2026-11-21. No sixth PR for the same feature; close it as done/partial with gaps, then advance. Historical table PRs are grandfathered.

**Review gate:** Owner-authorized autopilot may self-review and merge eligible PRs with zero mandatory human approvals after required exact-head/integration CI, security, branch rules and review-thread gates pass. Never present self-review as independent approval. No automatic publishing or deployment.

<!-- milestone-sync:end -->

**Resumption protocol:** consult [hourly autopilot execution recovery](autopilot-execution-recovery.md). An earlier run's unresolved step is a hint to revalidate against live GitHub, not authority to repeat an old PR; report a specific next code/test step and after two identical NO CODE CHANGED runs either switch safe category or escalate without bypassing controls.

## Current feature continuation and future-job selection (2026-11-22)

Check [advanced roadmap](../product/advanced-feature-roadmap.md), [new feature acceptance matrix](advanced-feature-acceptance.md), [live work board](../../next.md) and [structured milestone record](milestone-record.json) after live GitHub state. PR #172 merged at `88f860deab1c56ca2947fde4406c96d3ccc9dd88`; DP-M3-IMAGE is CLOSED/PARTIAL, 5/5. Do not reopen that feature. Resume the canonical active lane across all contributors; typography is selected after this reconciliation integrates. Restore the generated seven documentation views from the record whenever status materially changes. Old tasks #162, closed Alignment/Layers and legacy tables must not be reselected. Preserve existing editor functionality and all original schema migrations.

## Enabled scheduled engineering autopilot

The owner has separately enabled a ChatGPT hourly task named **Design Platform Autopilot**, which runs this repository's bounded "go ahead" workflow. See [hourly autopilot](hourly-autopilot.md) for precise task-selection, safety, spending and reporting rules. This runbook alone does not schedule anything. At each hourly execution re-check GitHub live state before continuing. The automation must be manually paused through ChatGPT when the owner wishes to stop it.

## Persistent instructions are not a persistent process

A markdown rule **does not** wake ChatGPT/Astra/Codex after a session ends, submit work, monitor CI by itself or authorize a merge. Continuation happens either in a still-active authorized session, when the owner starts another session with the bootstrap line below, or when a separately approved actual agent runner/orchestrator exists. GitHub Actions merely runs configured workflows; it is not a coding agent.

## Bootstrap prompt for a new agent session

> Read AGENTS.md, SKILLS.md, next.md, docs/engineering/agent-continuation-runbook.md and current GitHub PR/CI state. Reconcile stale milestones and select one READY bounded task, performing a bounded PR creation, review and merge when all exact-head/integration CI, security, repository and actual GitHub review/branch-protection gates pass; publishing/deployment remain separately gated. Report exact-SHA evidence, costs and open risks; do not invent results or rerun full CI unnecessarily.

## Five-PR feature budget and handoff

The current feature is selected by the generated record and live GitHub, not repeated table/layer/image regressions. Check [the five-PR feature ledger](feature-delivery-policy.md) and `milestone-record.json` before creating a PR. Record every PR attempt under the stable feature ID. Never open a sixth PR for one feature. Close the feature as DONE, PARTIAL or BLOCKED, carry real gaps to independent acceptance issues, and advance to the next independently eligible feature. Local owner Ubuntu/Docker Compose, manual accessibility and real print remain NOT RUN without actual execution.

## "Go ahead" task-selection contract — use the live board

When the owner writes **"go ahead"**, the agent should not ask them to repeat already-documented product goals. First fetch live GitHub, reconcile [the top of next.md](../../next.md), and perform **one** smallest READY/unfinished bounded action in the **NOW** lane within authorized repository access.

1. **Continue before duplicating:** inspect an active feature/CI remediation PR and its exact latest head before opening a competing PR. If a regression has a failing latest-head job, it remains NOW even when other jobs pass. In the 2026-11-16 snapshot, PR #102 is the primary CI regression lane; this is not a permanent rule to target #102.
2. **Do not confuse statuses:** DONE/IMPLEMENTED/VERIFIED/CI_PENDING/FAILED/MERGED/RELEASED are different; only GitHub confirms a merge, a real launch confirms release, and only exact-head executed checks prove CI success.
3. **Do not invent time:** docs cannot trigger a background agent or future response; work happens only while the authorized runner is executing.
4. **Change control:** the latest owner rule authorizes safe verified PR merges, but never overrides applicable review requirements or branch protections; no authority for publishing, deployment, visibility, billing, secrets, data deletion or security bypass. Small PRs and review remain standard.
5. **Checkpoint sparingly:** update the structured milestone record and regenerate the seven documentation views after a meaningful transition, not after every queued/running CI poll. Preserve durable evidence in PRs and linked reports, not duplicated logs.
6. **Handoff once per bounded milestone:** include task ID, prior and current SHA, affected boundary, test status, known failures, PR link, next action, seven-level/security/SRE/product/finance review notes and owner gate.
7. **Next after merge:** confirm merge SHA and exact associated checks, mark the task MERGED (not RELEASED), then choose the next READY item after prerequisites—not the oldest long-term bullet.

### State transition example

```text
DP-M1-CB-01
  READY → IN_PROGRESS → PR_OPEN → CI_PENDING
  → FAILED (cross-browser status assertion; latest head)
  → IN_PROGRESS (one scoped repair)
  → CI_PENDING (new head, old evidence historical)
  → READY_FOR_REVIEW (all required checks pass on that head)
  → MERGED (GitHub confirms safe, owner-authorized merge after all required gates)
  → RELEASED (separate product/release gate, only if applicable)
```

**If the correct next task cannot proceed:** mark BLOCKED with exact reason, report it, and consider a separate independent READY task only when the owner has authorized that work and it cannot undermine the blocked milestone.

## Required sequence

1. **Inspect the actual repository:** `git status --short`, current branch and HEAD, upstream main, changed files, open PRs and checks. Do not overwrite dirty worktrees.
2. **Reconcile:** compare code and existing tests with `next.md` and milestone documentation. Dated audit statements may be historical; "the PR passed once" may refer to an older SHA.
3. **Classify work:** severity, customer value, dependencies, affected modules, schema/asset/export risk, data migration and operating cost.
4. **Choose exactly one eligible task:** highest-priority verified security/data-loss/regression blocker, then a ready in-progress milestone, then a product feature validated by customer need.
5. **Create bounded design:** user outcome; in/out of scope; changed files; HLD/LLD; negative/boundary tests; rollback; estimated CI and spending.
6. **Execute in the authorized scope:** one small PR with substantive review and verified CI; owner-authorized safe merge is permitted only after normal GitHub gates. No surprise payments, deployment or feature expansion.
7. **Verify:** local focused checks; automatic GitHub workflows at the **current** SHA; only failed-step excerpts in model context; label pending, cancelled, skipped and not-run accurately.
8. **Checkpoint:** record task ID/status and observed PR/head in milestone-record.json, generate the seven views, and keep detailed PR/CI evidence in the task handoff and GitHub.
9. **Wait at gates:** all required checks, branch protections and independent approval when configured before a safe merge; separate owner approval for breaking schema, customer data, paid infrastructure, release or pricing.

## Task states

`PLANNED → READY → IN_PROGRESS → PR_OPEN → CI_PENDING → READY_FOR_REVIEW → MERGED → RELEASE_CANDIDATE → RELEASED`. `BLOCKED`, `FAILED`, `CANCELLED`, and `DEFERRED` may interrupt. State transitions require supporting evidence; a completed CI run cannot advance to MERGED automatically.

## Repository-specific next-task safeguards

- **M1 reliability:** cross-browser export, JSON/migration parity, localStorage recovery, manual accessibility and dependency/CI security are open until latest evidence says otherwise.
- **Semantic Tables v5:** remain proposed until the accepted ADR, Rust/TS/WASM parity, keyboard behavior, undo/redo and JSON/PNG/PDF compatibility are demonstrated.
- **PDF:** browser print is not equivalent to independently validated direct PDF export.
- **Background image:** page-level asset is not an independently draggable image element.
- **Backend/monetization:** no implementation authorization from the roadmap alone.

## Exact handoff, no stale success

At session end record:

```text
Task ID / user outcome:
Main SHA / branch / PR head SHA:
Implementation status and files changed:
CI workflow IDs and exact tested SHA:
PASSED / FAILED / PENDING / CANCELLED / SKIPPED / NOT RUN:
Outstanding defects, security and accessibility risks:
Spending and free-tier impact:
Owner decision required:
Next smallest safe action:
```

Keep logs in GitHub rather than pasting all output. If latest CI cannot be fetched, say **unverified**, not "green". On resumed sessions fetch anew.

## Reuse-first future work and adoption gate

Consult the [reuse-first policy](reuse-first-policy.md) for prioritized typography, font, rich-text, graphics, PDF, raster, assets and deferred native-engine evaluations; license, security, performance and 12-month TCO gates apply to every contributor. Existing feature caps and live PR priority remain unchanged. No new dependencies or paid services authorized by documentation alone.
