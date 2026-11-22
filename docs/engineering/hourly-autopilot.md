# Design Platform — Hourly Autopilot Operating Agreement

**Status:** A separate ChatGPT scheduled automation named **Design Platform Autopilot** was created and enabled on 2026-11-16, hourly in Asia/Kolkata. This document describes its owner-approved **bounded continuation workflow**, not a GitHub Actions workflow or a guarantee that every scheduled run can complete a PR. Pause it through ChatGPT task controls when desired.

<!-- milestone-sync:start -->
<!-- GENERATED from docs/engineering/milestone-record.json by scripts/sync-milestone-docs.mjs. DO NOT EDIT. -->
### Milestone snapshot (generated: 2026-11-22)

**Reference main:** 0163846f6338d6bbbda249c81ba35b04723fa00d (dated snapshot; re-check live GitHub before acting).

**NOW:** **DP-M3-IMAGE-01 — Foreground image element authoring** [PR_OPEN]. [PR #168](https://github.com/Rofikali/design-platform/pull/168)

**NEXT:** DP-M3-TYPO-01 [PLANNED]; DP-M3-VECTOR-01 [PLANNED]; DP-M3-PRECISION-01 [PLANNED]; DP-SEC-01 [BLOCKED] [Issue #118](https://github.com/Rofikali/design-platform/issues/118); DP-M1-ACC-02 [BLOCKED] [Issue #82](https://github.com/Rofikali/design-platform/issues/82); DP-M1-BG-09 [PLANNED] [Issue #85](https://github.com/Rofikali/design-platform/issues/85)

**Feature budget:** DP-M3-IMAGE — 3/5 PRs recorded since 2026-11-21. No sixth PR for the same feature; close it as done/partial with gaps, then advance. Historical table PRs are grandfathered.

**Review gate:** Owner-authorized autopilot may review and merge only after all exact-head/integration CI, security, branch protection and required independent-review gates pass. No automatic publishing or deployment.

<!-- milestone-sync:end -->

**Read first:** [AGENTS](../../AGENTS.md) → [SKILLS](../../SKILLS.md) → [live NOW / NEXT / DONE board](../../next.md) → [agent continuation](agent-continuation-runbook.md) → [seven-level operating model](seven-level-operating-model.md) → [milestone handoff](agent-milestone-handoff.md) → [change-scoped verification](change-scoped-verification.md) → [CI evidence policy](ci-evidence-policy.md).

## Five-PR feature progression (owner rule, 2026-11-21)

**Hard cap:** one feature ID gets no more than five opened feature PRs, including closed or failed attempts; changes within an existing PR do not cost additional slots. Read [feature delivery policy](feature-delivery-policy.md) and `feature_delivery` in the milestone record every run. Prefer the smallest actual customer-visible vertical slice and stop early if accepted. On the fifth PR, finish its gates, close as DONE/PARTIAL/BLOCKED with exact evidence and switch to next independent READY feature. Never open a sixth table regression PR; the historic table lane is CLOSED_LEGACY. **Current NOW (verified 2026-11-22) is DP-M3-IMAGE-01 (1/5; PR #165 MERGED)**; previous Alignment/Layers/Table lanes are CLOSED/PARTIAL or legacy. The next image-authoring implementation remains outstanding; first reconcile record, then continue the SAME feature ID. Manual screen reader, physical print and owner-run Ubuntu/Compose remain NOT RUN until observed; do not block independent editor feature work on those checks or declare release-ready.

## Advanced-feature continuation and stale-PR recovery (owner update 2026-11-22)

The saved scheduled automation previously contained a stale mandate to continue PR #162. This runbook now points to [advanced-feature roadmap](../product/advanced-feature-roadmap.md), [advanced acceptance](advanced-feature-acceptance.md), [record](milestone-record.json) and [next](../../next.md). Always check LIVE GitHub first. PR #165 was MERGED at `222e550e31e859b2b8e06538f27d07f424a88e19`; do not reopen or attempt to merge it again. Work on **DP-M3-IMAGE** for the next bounded PR, following existing v1–v5/TS+Rust/WASM, user element/keyboard, autosave/history and PNG/print non-regression contracts. When this feature is closed DONE/PARTIAL/BLOCKED within five opened feature PR attempts, promote exactly one independent PLANNED candidate after a prerequisite/approval check. The roadmap is not a second live queue.

A governance-only documentation PR opened to record this roadmap is not an image PR budget attempt; do not create a duplicate or miscount it. If existing governance/feature PR is open, finish it subject to all exact-head CI and independent-review gates rather than generate another. On merge, reconcile evidence in the next substantive implementation PR. After two consecutive no-code runs on the same blocker, disclose the precise failed gate and choose another independently safe task or request the necessary owner approval. Never attempt to bypass dependency security, #118, manual #82/#85, protection checks, or paid/deployment authorization.

## What "go ahead" means — manually or on an hourly run

1. Fetch **current** GitHub state for `Rofikali/design-platform`: main SHA, all active PRs/issues, each PR's latest head, exact-head CI/check conclusions, changed files and merge status. Historical dashboard and chat content are only orientation.
2. Read `next.md`'s live NOW/NEXT/DONE sections and reconcile them with GitHub. Explicitly mark IMPLEMENTED, VERIFIED, PARTIAL, PR_OPEN, CI_PENDING, FAILED, BLOCKED, MERGED, RELEASED and DEFERRED accurately.
3. Choose **one** highest-priority eligible, bounded task from NOW. Prefer fixing a confirmed data-loss/security/reliability blocker or continuing an existing PR (for example current cross-browser export work) rather than duplicating earlier implementation. Do not advance to a feature that depends on unresolved critical blockers.
4. Assess scope using seven engineering levels, plus product, UX/accessibility, QA, security, DevOps/SRE, finance/CA/MBA and management review as justified. For small fixes, keep review proportional.
5. Make a small, cohesive implementation, test or docs improvement when repository write permissions/tools and task prerequisites permit. Prefer targeted local/check evidence and one reviewed PR or update to an existing owned PR; never perform speculative broad refactors.
6. For latest head, report **PASS/FAIL/RUNNING/QUEUED/CANCELLED/SKIPPED/NOT RUN** with checks/failed job and step URLs. Do not reuse successes from earlier heads. Inspect only focused failure logs, and never turn skipped security or unexecuted E2E tests into a pass.
7. At meaningful transitions edit the **structured milestone record**, run the seven-document generator, and keep detailed CI/tests/risks in the milestone handoff; never edit marked sections manually. Avoid pushing a commit just to say a run is still queued.
8. Report what was actually accomplished and which approvals remain. If blocked (access denied, owner review needed, CI failure, unresolved design decision), report and stop that lane safely. An hourly run may open, review and merge a safe verified PR after all required gates; it must NEVER publish or deploy automatically.

## Outcome-first continuation and stalled-run recovery (adapted from Messy-File-Cleaner)

The hourly automation's actual **enabled/paused state and run history live in ChatGPT Tasks/Automations**, not this file. A past statement that it was enabled does not prove it is still running; if scheduled work stops, check the task state first, then its last run/result, connector permissions and only then repository CI. GitHub Actions passing does **not** establish that an autonomous coding run fired. Update the existing scheduled task; never create a duplicate to compensate for a paused task.

Each run follows one bounded **SELECT → INVESTIGATE → IMPLEMENT → VERIFY → REVIEW → INTEGRATE → RECORD** loop. Apply the following safeguards alongside the numbered workflow above:

1. **Code-first work:** prefer an actual Nuxt/Vue/TypeScript or Rust/WASM source/test/config change with focused negative and accessibility tests. Existing applicable open PRs take precedence over fresh branches. A PR already merged is not a new task. When local execution is unavailable but connector writes are permitted, safely edit source/tests and open or update a PR; mark local tests **NOT RUN** and rely on exact-head CI for observed evidence.
2. **No status-churn PRs:** do not create a separate PR only to restate a completed merge, update a timestamp, reprint green checks, or synchronize an unchanged board. Include any necessary source-of-truth status record and seven generated documents in the substantive implementation PR after a material transition. If generator execution is unavailable, do not hand-edit its protected sections or commit a partially synchronized record.
3. **Blocked-work fallback:** when a security/advisory, manual screen-reader audit, real-printer check or owner decision blocks the selected lane, record the exact dependency and switch to a **different independent READY code/test milestone** from the live queue, without bypassing the gate. After **two consecutive runs without material change on the same blocker**, escalate the specific owner/upstream decision; do not repeatedly inspect the same CI logs and call it progress.
4. **One milestone, evidenced delivery:** a scheduled run marked *completed* is not proof of changed code. Report **CODE CHANGED / NO CODE CHANGED**, exact main and PR-head SHAs, files/PR link or NONE, latest-head/integration/security check outcomes, local tests actually executed, merge state, generator status, blocker, and next executable task. Keep *implemented*, *PR open*, *CI passed*, *merged*, and *released* distinct.
5. **Safe integration:** owner standing permission applies only to a fully reviewed, current-head and current-base, security-green, non-conflicting PR satisfying all required independent reviews and repository protections. Do not self-approve, force a merge or treat unprotected `main` as permission to skip checks. Verify the merged SHA on `main` and work on a dependent milestone only after that verification.
6. **Project scope:** preserve schema-v5 plus supported migrations, local-first privacy, edit history, accessible table row/column commands, visual grid/frame distinctions and predictable PNG/print exports. Never transplant Messy-File-Cleaner's C17 filesystem/journal rules; Design Platform uses Nuxt/Vue/TypeScript and Rust/WASM. No unapproved deployment, user-data changes, paid infrastructure, or automatic release.

**Operational priority:** favor smallest measurable customer-visible or defect-preventing work over extra ceremonial reviews. Reuse existing HLD/LLD, tests and security documents; update only those materially affected.

## Owner-authorized gated PR review and merge (latest owner rule, 2026-11-17)

The owner now authorizes **the full bounded PR lifecycle including reviewing and merging**, superseding the prior review-only policy. The autopilot must inspect the current diff/head/base, check all required latest-head and integration CI/security, verify GitHub branch protections, and respect any required independent human review. Self-review is not independent review. Use the expected PR head SHA when merging and verify main afterward. Never merge failing, pending, skipped-required, or unknown work; never bypass checks, dismiss reviews or force push. Publishing and deployment remain prohibited.

For milestone status changes edit [milestone-record.json](milestone-record.json) first, then run the seven-document generator. GitHub CI rejects missing or stale generated sections. A dated snapshot never supersedes live GitHub evidence.

## Standing permission boundaries

**Permitted within an hourly run:** source/code review, issue/PR inspection, tests, small branches/commits, PR creation and updates, substantive review, safe gated merges into main, and updating the milestone record plus generated docs.

**Still prohibited without separate owner approval:** dismissing reviews, force-pushing/rebasing others' work, unrelated branch/code deletion, changing visibility/security/secrets, spending money, paid resources, deployment, real customer document changes, new user-data collection, changing prices/billing, or weakening required tests/CI.

The latest owner instruction permits safe gated merges only, not automatic publishing, spending or deployment. If a service connector requests authentication or a host needs approval, stop and surface the required action.

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
