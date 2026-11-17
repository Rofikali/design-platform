# Design Platform — Hourly Autopilot Operating Agreement

**Status:** A separate ChatGPT scheduled automation named **Design Platform Autopilot** was created and enabled on 2026-11-16, hourly in Asia/Kolkata. This document describes its owner-approved **bounded continuation workflow**, not a GitHub Actions workflow or a guarantee that every scheduled run can complete a PR. Pause it through ChatGPT task controls when desired.

<!-- milestone-sync:start -->
<!-- GENERATED from docs/engineering/milestone-record.json by scripts/sync-milestone-docs.mjs. DO NOT EDIT. -->
### Milestone snapshot (generated: 2026-11-17)

**Reference main:** f7f55126c34dc01cc2c86cb2fc9b611d9b75402a (dated snapshot; re-check live GitHub before acting).

**NOW:** **DP-M1-ACC-03 — Keyboard-operated background image removal** [PR_OPEN]. [PR #115](https://github.com/Rofikali/design-platform/pull/115) [Issue #82](https://github.com/Rofikali/design-platform/issues/82)

**NEXT:** DP-M1-ACC-02 [BLOCKED] [Issue #82](https://github.com/Rofikali/design-platform/issues/82); DP-M1-BG-09 [PLANNED] [Issue #85](https://github.com/Rofikali/design-platform/issues/85)

**Review gate:** A human reviews and manually merges each PR. No automated merges, publishing or deployments.

<!-- milestone-sync:end -->

**Read first:** [AGENTS](../../AGENTS.md) → [SKILLS](../../SKILLS.md) → [live NOW / NEXT / DONE board](../../next.md) → [agent continuation](agent-continuation-runbook.md) → [seven-level operating model](seven-level-operating-model.md) → [milestone handoff](agent-milestone-handoff.md) → [change-scoped verification](change-scoped-verification.md) → [CI evidence policy](ci-evidence-policy.md).

## What "go ahead" means — manually or on an hourly run

1. Fetch **current** GitHub state for `Rofikali/design-platform`: main SHA, all active PRs/issues, each PR's latest head, exact-head CI/check conclusions, changed files and merge status. Historical dashboard and chat content are only orientation.
2. Read `next.md`'s live NOW/NEXT/DONE sections and reconcile them with GitHub. Explicitly mark IMPLEMENTED, VERIFIED, PARTIAL, PR_OPEN, CI_PENDING, FAILED, BLOCKED, MERGED, RELEASED and DEFERRED accurately.
3. Choose **one** highest-priority eligible, bounded task from NOW. Prefer fixing a confirmed data-loss/security/reliability blocker or continuing an existing PR (for example current cross-browser export work) rather than duplicating earlier implementation. Do not advance to a feature that depends on unresolved critical blockers.
4. Assess scope using seven engineering levels, plus product, UX/accessibility, QA, security, DevOps/SRE, finance/CA/MBA and management review as justified. For small fixes, keep review proportional.
5. Make a small, cohesive implementation, test or docs improvement when repository write permissions/tools and task prerequisites permit. Prefer targeted local/check evidence and one reviewed PR or update to an existing owned PR; never perform speculative broad refactors.
6. For latest head, report **PASS/FAIL/RUNNING/QUEUED/CANCELLED/SKIPPED/NOT RUN** with checks/failed job and step URLs. Do not reuse successes from earlier heads. Inspect only focused failure logs, and never turn skipped security or unexecuted E2E tests into a pass.
7. At meaningful transitions, update `next.md`, milestone handoff and relevant contract/evidence docs with task ID, scope, latest SHA, PR, CI, risks and exactly one next action. Avoid pushing a commit just to say a run is still queued.
8. Report what was actually accomplished and which approvals remain. If blocked (access denied, owner review needed, CI failure, unresolved design decision), report and stop that lane safely. An hourly run may open and review a PR, but must NEVER automatically merge, publish or deploy.

## Human-reviewed pull request workflow (latest owner rule, 2026-11-17)

The owner now requires **human-reviewed PRs and manual merges**. This supersedes the earlier automatic-merge permission. The hourly autopilot may create/update branches, commits and PRs, inspect diffs and exact-head CI, and prepare review notes; it must **never** automatically merge, publish or deploy even after a green CI result.

For milestone status changes edit [milestone-record.json](milestone-record.json) first, then run the six-document generator. GitHub CI rejects missing or stale generated sections. A dated snapshot never supersedes live GitHub evidence.

## Standing permission boundaries

**Permitted within an hourly run:** source/code review, issue/PR inspection, tests, small branches and commits, creating/updating review PRs, reviewing checks, and updating the milestone record plus generated docs.

**Still prohibited without separate owner approval:** dismissing reviews, force-pushing/rebasing others' work, unrelated branch/code deletion, changing visibility/security/secrets, spending money, paid resources, deployment, real customer document changes, new user-data collection, changing prices/billing, or weakening required tests/CI.

The latest owner instruction explicitly prohibits automated merging/publishing, as well as spending or deployment. If a service connector requests authentication or a host needs approval, stop and surface the required action.

## CI cost and security rules

- Use free standard GitHub-hosted workflows where applicable to this public repository, **but never assume billing is unconditionally free**. No paid resources or metered overages without explicit owner approval.
- Avoid redundant full Rust/WASM/Docker builds, duplicate browser runs, and rapid successive commits. Group a cohesive fix and assess changed boundaries.
- Keep required PR/security/contract checks and release gates. Cache appropriately without compromising reproducibility.
- Do not put secrets, user data, design documents or private attachments in public CI artifacts.
- Work from the current source/lockfile/toolchain, not older imgengine scripts. The relevant design-platform stack is Nuxt/Vue/TS + Rust design-core + WASM.

## Scheduled-run lifecycle

- **Frequency:** once hourly, continuing every day while the automation is enabled. Exact launch/execution timing is governed by the ChatGPT scheduling service.
- **Owner control:** pause/resume the **Design Platform Autopilot** task in ChatGPT's Tasks/Automations controls. This documentation cannot pause a separate task.
- **Continuation:** each run is a newly scoped attempt to advance one bounded task, not a promise of an always-on computer, endlessly running agent, guaranteed merges or guaranteed task completion.
- **Multiple repos:** do **not** apply this automation to imgengine or Messy-File-Cleaner. They have independent priorities and separate automation.
- **Avoid duplicate scheduling:** before creating another schedule, check existing scheduled tasks; update the existing Design Platform Autopilot instead of creating a second hourly one.

## Minimum completion report (one run)

```text
Mode: scheduled hourly "go ahead" / manual "go ahead"
Main SHA / active PR head SHA:
NOW task ID, priority, previous status:
Evidence checked, including current-head CI / security:
Files changed and PR URL (or "no changes", with reason):
Tests actually executed (PASS/FAIL/PENDING/SKIPPED/NOT RUN):
Seven-level/security/accessibility/QA and CA-MBA risk notes:
Owner approval needed:
Updated status / next smallest safe action:
Zero-unapproved-spend check:
```

## Comparison to imgengine

This adopts imgengine's persistent NOW/NEXT/LATER queue, exact-SHA verification, task statuses, seven-level engineering lenses, cost-aware testing and explicit agent handoffs. **Do not** transplant imgengine's C17 ABI, C/Rust FFI, SIMDs, image codec pipeline, VPS deployment or unrelated free/paid image-tool features into this document-editor repository.
