# CI-First Minimal-Context Evidence Policy

**Status:** Standing contributor policy. This adapts imgengine's CI-first minimal-AI-context rule to design-platform's actual checks. No code, workflow or GitHub spending setting is changed by this document.

## Non-negotiable rule

**The checks must execute where required; the AI does not need thousands of successful log lines.** For every requested verification, inspect the PR's **current latest head SHA**, attached workflow runs, individual jobs, their status and conclusion. Keep successful output in GitHub. If failing, read only the failed step and a small diagnostic excerpt; expand when required.

AI input tokens and GitHub Actions minutes are distinct. Reducing AI log consumption is not a reason to weaken test coverage. Do not promise unlimited free compute, or infer free/private status from old email/screenshots; recheck repository/account settings when it matters.

## Minimum evidence

| Question | Minimum evidence |
| --- | --- |
| Is PR open/draft/merged? | Live PR metadata |
| Which commit? | Full current head SHA and base |
| Did required CI pass? | Every required job status/conclusion attached to that head |
| Did dependency audit pass? | Locked Cargo and production JS jobs at same head |
| Did export work? | Actual test step and downloaded artifact assertions |
| Is a failure real? | Job/step and failure log excerpt; distinguish harness/runner from product behavior |
| Is performance faster? | Recorded workload, before/after durations and cache state |
| Is product releasable? | Separate security, accessibility, migration, export, operations, customer and owner gates |

## Reporting rules

- **PASS:** executed successfully at identified SHA.
- **FAIL:** executed and failed; link failed step/log.
- **PENDING:** queued or running. State which step currently active when available.
- **CANCELLED:** never count as pass; investigate why, including superseded commits, timeouts and owner cancellation.
- **SKIPPED:** not executed due to path filter/condition; not pass.
- **NOT RUN:** no run or no evidence.
- **NOT APPLICABLE:** explain why requirement doesn't apply.
- **HISTORICAL:** prior SHA's result; never cite as proof for new head.

Keep successful summary brief (job, SHA, result, link). For failure, fetch targeted ~40–60 relevant lines, not the entire multi-minute Docker/apt log unless essential. Never expose credentials, tokens, private assets or user designs in public logs.

## CI and PR discipline

1. Read live PR and head before looking at runs.
2. Fetch workflows associated with exact head; examine jobs, not just overall green label.
3. If current head changes, discard old-head success for merge readiness.
4. Avoid repeatedly triggering builds by serial documentation-only commits; batch changes.
5. Do not assume workflow checks on a GitHub generated merge ref and checks on the PR head have identical identifiers; report the tested ref accurately.
6. Verify required-check configuration where access permits; otherwise say **unverified**.
7. Do not claim automatic required status enforcement from a workflow YAML alone.
8. Merge/deploy/billing require explicit owner authorization; a green check is not authority.

## Design Platform regression example

PR #102's historical cross-browser runs revealed separate issues: Ubuntu runner/Playwright incompatibility, missing wasm-pack, and ambiguous `[role="status"]` matching both export and selected-element announcements. Each failure must be identified by run and head; some were cancelled before all browsers exported. This example explains evidence discipline; it is **not** a declaration that PR #102 is green or merged.

## Agent handoff

Use [milestone handoff](agent-milestone-handoff.md), [test lanes](change-scoped-verification.md), the [current roadmap](../../next.md) and [release checklist](../operations/release-readiness.md). Record exactly which checks were not executed.
