# Five-PR Feature Delivery and Acceptance Ledger

**Effective:** 2026-11-21. **Owner decision:** no more than **five pull requests for a single product feature** before progressing to the next independent feature. Applies prospectively. This is a delivery-budget rule, not a claim that untested work is feature-complete.

## Current feature selection and advanced candidate policy (2026-11-22)

The [advanced editor roadmap](../product/advanced-feature-roadmap.md) and [acceptance criteria](advanced-feature-acceptance.md) contain **planned candidates only**. Live GitHub verifies PR #165 merged at `222e550e31e859b2b8e06538f27d07f424a88e19` and current DP-M3-IMAGE remains ACTIVE at **1/5**; do not attempt stale alignment #162 or treat a merged #165 as open. `milestone-record.json` is the canonical feature-budget selector, and its seven generated views must be regenerated together. Future typography, shape, guide, exam, banner, asset, PDF and print work becomes active only after image closure and justified prerequisites; no parallel lanes or sixth PR by renamed feature. The dated 2026-11-21 progression below is historical, not today's NOW queue.

## 1. Scope and count (strict)

- Use one stable feature ID for the user-visible capability, e.g. `DP-M3-LAYERS`. Subtasks, test regressions, renamed milestones, refactors and follow-up bugs inside the feature share its budget. A sixth feature PR is prohibited.
- Each **opened feature-specific PR attempt counts once** (merged, closed, abandoned, failed CI or still open). Revisions/commits to the *same* PR do not add slots. Record real GitHub PR numbers in `docs/engineering/milestone-record.json > feature_delivery.features[].prs`, never guessed numbers.
- The five slots are a **maximum, not a quota**. When acceptance evidence is sufficient after fewer PRs, close the feature and move on. At the fifth PR, finish/review that PR; then close the feature as DONE/PARTIAL/BLOCKED and advance. No endless extra "one last regression" PR.
- A confirmed P0 security/data-loss incident can take priority in an **independent security/fix lane**, with separate issue, root cause and audit evidence. Do not relabel ordinary feature polishing as an incident or use security work to bypass the cap. If an architectural dependency genuinely blocks the next feature, record and escalate; select another unblocked feature.
- The **historical semantic-table** sequence predates this policy and exceeded five PRs. It is `CLOSED_LEGACY`: no additional table-only PRs during this cycle. Historic PR numbers live in GitHub; the new per-feature counter intentionally tracks *post-policy* attempts only.

### New CI feature-PR identity gate (from Messy-File-Cleaner)

The existing milestone generator already checks the ledger's five-PR limit and duplicate numbers, but previously did not check each actual PR's Feature-ID and GitHub number. The new dependency-free Node 22 script `scripts/feature-pr-budget-check.mjs` reads pull_request event metadata. Every feature PR body must contain **exactly one standalone `Feature-ID: DP-...` line** matching the ACTIVE feature. Once the PR is opened, GitHub assigns its real number; add that number to the feature's `prs` list in `docs/engineering/milestone-record.json` and regenerate all seven sections **in the same PR**. Until that update, the new CI check must fail. The real GitHub PR history remains authoritative; the local ledger alone cannot prove all historical/closed attempts are counted.

A governance-only exception uses `Feature-ID: GOVERNANCE-EXEMPT` plus a `docs(governance):` PR title. The job rejects this exception if changes include product Nuxt/Vue/TypeScript, Rust/WASM, Docker runtime or other non-allowlisted files. Reviewer scrutiny is still required. A confirmed security incident needs its own separately approved and traced work lane, not a disguised sixth feature PR or a governance exception. GitHub branch protection must be configured separately to make any CI job required.

For every post-policy feature closed as `state: CLOSED`, the structured ledger must also record `outcome: DONE`, `PARTIAL` or `BLOCKED`, plus factual evidence in its notes. The generator rejects missing or invalid closure outcomes.

## 2. Completion statuses — do not conflate

| Label | Meaning |
| --- | --- |
| IMPLEMENTED | Source behavior exists on an identified Git commit, possibly only in an open PR |
| MERGED | GitHub confirms integration into main at an exact SHA |
| AUTOMATED_VERIFIED | Named exact-head or integrated CI jobs executed successfully; skipped checks do not count |
| MANUAL_NOT_RUN | Owner has not validated Ubuntu/Docker Compose, assistive technology, or print on an actual target setup |
| DONE | Scoped technical acceptance verified; manual product/release signoff may still be outstanding |
| PARTIAL | Useful implementation merged, but a documented acceptance criterion remains unmet/untested |
| BLOCKED | Further required work needs a real dependency, owner action or verified remediation |
| RELEASED | Separately authorized and observed deployment/release; never inferred from merge |

Track `software implementation`, `CI evidence`, `manual device/OS acceptance`, `security approval`, `release approval` as **separate axes**. Do not say "fully complete" just because automated tests are green. Product-level quality and user acceptance are independent release gates, not reasons to keep producing endless PRs for one feature.

## 3. Current progression (verified GitHub snapshot, 2026-11-21)

**DP-M2-TABLE — CLOSED_LEGACY.** The many pre-policy semantic-table PRs remain historical. No new table-only PRs to restart the budget. Manual accessibility/print and native Ubuntu Compose acceptance remain unobserved.

**DP-M3-LAYERS — CLOSED / PARTIAL (4/5).** PRs #155, #156, #157 and #159 merged; outstanding browser stacking, keyboard and export acceptance is tracked in [issue #158](https://github.com/Rofikali/design-platform/issues/158). The remaining fifth slot is not permission for scope-free polishing after feature closure. Manual accessibility [#82](https://github.com/Rofikali/design-platform/issues/82), physical print [#85](https://github.com/Rofikali/design-platform/issues/85), Ubuntu Compose and production advisory [#118](https://github.com/Rofikali/design-platform/issues/118) remain distinct acceptance or release gates.

**NOW: DP-M3-ALIGN — ACTIVE (1/5).** [PR #160](https://github.com/Rofikali/design-platform/pull/160) merged at `a26acfd2b7108d48a8d8bb7018da185ce315608b`, introducing bounded immutable page-alignment geometry and tests. Continue with keyboard-accessible editor controls and optional snapping, validated by scoped UI/browser/negative tests. Do not claim unobserved manual signoff.

**NEXT: DP-M3-IMAGE — PLANNED (0/5).** Foreground image elements, independently bounded by resource limits, history, validation, privacy, accessible interaction and image export. When alignment is done or budget-exhausted, record DONE/PARTIAL/BLOCKED and move to this or another independent READY feature. A renamed alignment tweak is not a new feature.

## 4. End-of-feature handoff — mandatory

At each feature exit record in the same **substantive implementation PR**, or a narrowly scoped governance transition if the prior work was already merged: stable ID; feature PRs and exact merge SHAs; delivered user workflows; accepted automated checks; non-executed local/manual/Docker/a11y/print/security tests; open defects with issue links and impact; data/schema/architecture changes; rollback; cost/license/privacy effects; DONE/PARTIAL/BLOCKED classification; the next READY feature ID.

Reconcile `milestone-record.json` first, run `node scripts/sync-milestone-docs.mjs`, unit tests and `--check`, commit all seven generated sections with the meaningful code/status change, and assess affected non-generated README, product/architecture, security, testing, operations, finance and HLD/LLD documents. Generated sections are a **dated ledger**, not a live GitHub feed.

## 5. Release/finance/security/operations perspective

- **Security/CISSP:** imported documents remain untrusted; preserve schema bounds, escaping, dependency audit, local privacy and Rust/WASM boundary, with manual threat-review for genuinely new inputs. Do not claim vulnerability remediation from a green check alone.
- **Linux/DevOps/SRE:** GitHub Ubuntu CI and a Docker image build are not a user-run Ubuntu 24.04 Compose test, performance benchmark or production deployment; mark those **NOT RUN**.
- **Networking/CCIE:** browser-local MVP has no required distributed networking/backend stack; do not add DNS/TLS/load-balancers, microservices or a VPS as unproven prerequisites.
- **CA/MBA/Management:** cap iteration waste, record opportunity cost and customer utility; no assumed revenue, pricing or paid cloud spending. Deliver the user journey before expanding product scope.
