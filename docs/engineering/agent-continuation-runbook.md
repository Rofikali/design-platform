# Agent Continuation and New-Session Recovery — Design Platform

**Status:** Standing procedure, not running automation. Inspired by imgengine's milestone-continuation model and adapted to Design Platform. [AGENTS](../../AGENTS.md), [next](../../next.md), [handoff template](agent-milestone-handoff.md) and current source/CI remain authoritative.

## Persistent instructions are not a persistent process

A markdown rule **does not** wake ChatGPT/Astra/Codex after a session ends, submit work, monitor CI by itself or authorize a merge. Continuation happens either in a still-active authorized session, when the owner starts another session with the bootstrap line below, or when a separately approved actual agent runner/orchestrator exists. GitHub Actions merely runs configured workflows; it is not a coding agent.

## Bootstrap prompt for a new agent session

> Read AGENTS.md, SKILLS.md, next.md, docs/engineering/agent-continuation-runbook.md and current GitHub PR/CI state. Reconcile stale milestones and select one READY bounded task, preserving owner approval for merges/deployments. Report exact-SHA evidence, costs and open risks; do not invent results or rerun full CI unnecessarily.

## Required sequence

1. **Inspect the actual repository:** `git status --short`, current branch and HEAD, upstream main, changed files, open PRs and checks. Do not overwrite dirty worktrees.
2. **Reconcile:** compare code and existing tests with `next.md` and milestone documentation. Dated audit statements may be historical; "the PR passed once" may refer to an older SHA.
3. **Classify work:** severity, customer value, dependencies, affected modules, schema/asset/export risk, data migration and operating cost.
4. **Choose exactly one eligible task:** highest-priority verified security/data-loss/regression blocker, then a ready in-progress milestone, then a product feature validated by customer need.
5. **Create bounded design:** user outcome; in/out of scope; changed files; HLD/LLD; negative/boundary tests; rollback; estimated CI and spending.
6. **Execute in the authorized scope:** one small PR, no surprise payments, deployment, feature expansion or autonomous merge.
7. **Verify:** local focused checks; automatic GitHub workflows at the **current** SHA; only failed-step excerpts in model context; label pending, cancelled, skipped and not-run accurately.
8. **Checkpoint:** record task ID/status, repo/branch/commit, PR/CI links, commands/results, risks and the next action in the task handoff and appropriate register.
9. **Wait at gates:** owner approval for merge, breaking schema, account/customer data handling, paid infrastructure, production release or material pricing decisions.

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
