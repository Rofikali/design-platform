# Agent Continuation and New-Session Recovery — Design Platform

**Status:** Standing procedure, not running automation. Inspired by imgengine's milestone-continuation model and adapted to Design Platform. [AGENTS](../../AGENTS.md), [next](../../next.md), [handoff template](agent-milestone-handoff.md) and current source/CI remain authoritative.

<!-- milestone-sync:start -->
<!-- GENERATED from docs/engineering/milestone-record.json by scripts/sync-milestone-docs.mjs. DO NOT EDIT. -->
### Milestone snapshot (generated: 2026-11-20)

**Reference main:** d21215d4895bafc1c4b46416b7dfc71a9a7b137c (dated snapshot; re-check live GitHub before acting).

**NOW:** **DP-M2-TBL-02F — First-row header insertion history regression** [PR_OPEN]. [PR #141](https://github.com/Rofikali/design-platform/pull/141)

**NEXT:** DP-M2-TBL-02B [IN_PROGRESS]; DP-SEC-01 [BLOCKED] [Issue #118](https://github.com/Rofikali/design-platform/issues/118); DP-M1-ACC-02 [BLOCKED] [Issue #82](https://github.com/Rofikali/design-platform/issues/82); DP-M1-BG-09 [PLANNED] [Issue #85](https://github.com/Rofikali/design-platform/issues/85)

**Review gate:** Owner-authorized autopilot may review and merge only after all exact-head/integration CI, security, branch protection and required independent-review gates pass. No automatic publishing or deployment.

<!-- milestone-sync:end -->

## Enabled scheduled engineering autopilot

The owner has separately enabled a ChatGPT hourly task named **Design Platform Autopilot**, which runs this repository's bounded "go ahead" workflow. See [hourly autopilot](hourly-autopilot.md) for precise task-selection, safety, spending and reporting rules. This runbook alone does not schedule anything. At each hourly execution re-check GitHub live state before continuing. The automation must be manually paused through ChatGPT when the owner wishes to stop it.

## Persistent instructions are not a persistent process

A markdown rule **does not** wake ChatGPT/Astra/Codex after a session ends, submit work, monitor CI by itself or authorize a merge. Continuation happens either in a still-active authorized session, when the owner starts another session with the bootstrap line below, or when a separately approved actual agent runner/orchestrator exists. GitHub Actions merely runs configured workflows; it is not a coding agent.

## Bootstrap prompt for a new agent session

> Read AGENTS.md, SKILLS.md, next.md, docs/engineering/agent-continuation-runbook.md and current GitHub PR/CI state. Reconcile stale milestones and select one READY bounded task, performing a bounded PR creation, review and merge when all exact-head/integration CI, security, repository and required independent-review gates pass; publishing/deployment remain separately gated. Report exact-SHA evidence, costs and open risks; do not invent results or rerun full CI unnecessarily.

## "Go ahead" task-selection contract — use the live board

When the owner writes **"go ahead"**, the agent should not ask them to repeat already-documented product goals. First fetch live GitHub, reconcile [the top of next.md](../../next.md), and perform **one** smallest READY/unfinished bounded action in the **NOW** lane within authorized repository access.

1. **Continue before duplicating:** inspect an active feature/CI remediation PR and its exact latest head before opening a competing PR. If a regression has a failing latest-head job, it remains NOW even when other jobs pass. In the 2026-11-16 snapshot, PR #102 is the primary CI regression lane; this is not a permanent rule to target #102.
2. **Do not confuse statuses:** DONE/IMPLEMENTED/VERIFIED/CI_PENDING/FAILED/MERGED/RELEASED are different; only GitHub confirms a merge, a real launch confirms release, and only exact-head executed checks prove CI success.
3. **Do not invent time:** docs cannot trigger a background agent or future response; work happens only while the authorized runner is executing.
4. **Change control:** the latest owner rule authorizes safe verified PR merges, but never overrides required independent reviews or branch protections; no authority for publishing, deployment, visibility, billing, secrets, data deletion or security bypass. Small PRs and review remain standard.
5. **Checkpoint sparingly:** update the structured milestone record and regenerate the six documentation views after a meaningful transition, not after every queued/running CI poll. Preserve durable evidence in PRs and linked reports, not duplicated logs.
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
