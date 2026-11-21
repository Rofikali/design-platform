# Five-PR Feature Delivery and Acceptance Ledger

**Effective:** 2026-11-21. **Owner decision:** no more than **five pull requests for a single product feature** before progressing to the next independent feature. Applies prospectively. This is a delivery-budget rule, not a claim that untested work is feature-complete.

## 1. Scope and count (strict)

- Use one stable feature ID for the user-visible capability, e.g. `DP-M3-LAYERS`. Subtasks, test regressions, renamed milestones, refactors and follow-up bugs inside the feature share its budget. A sixth feature PR is prohibited.
- Each **opened feature-specific PR attempt counts once** (merged, closed, abandoned, failed CI or still open). Revisions/commits to the *same* PR do not add slots. Record real GitHub PR numbers in `docs/engineering/milestone-record.json > feature_delivery.features[].prs`, never guessed numbers.
- The five slots are a **maximum, not a quota**. When acceptance evidence is sufficient after fewer PRs, close the feature and move on. At the fifth PR, finish/review that PR; then close the feature as DONE/PARTIAL/BLOCKED and advance. No endless extra "one last regression" PR.
- A confirmed P0 security/data-loss incident can take priority in an **independent security/fix lane**, with separate issue, root cause and audit evidence. Do not relabel ordinary feature polishing as an incident or use security work to bypass the cap. If an architectural dependency genuinely blocks the next feature, record and escalate; select another unblocked feature.
- The **historical semantic-table** sequence predates this policy and exceeded five PRs. It is `CLOSED_LEGACY`: no additional table-only PRs during this cycle. Historic PR numbers live in GitHub; the new per-feature counter intentionally tracks *post-policy* attempts only.

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

## 3. Current feature transition

**Previous: DP-M2-TABLE — semantic tables; CLOSED_LEGACY.** Schema-v5 table primitives, accessible cell editing, row/column insert/delete, bounded Unicode text validation, JSON/history preservation, and browser/export regressions are merged through [PR #153](https://github.com/Rofikali/design-platform/pull/153). This is **engineering implemented**, not owner/manual validated. Deferred: [accessibility #82](https://github.com/Rofikali/design-platform/issues/82), [print fidelity #85](https://github.com/Rofikali/design-platform/issues/85), local Ubuntu/Docker Compose check. Production security [#118](https://github.com/Rofikali/design-platform/issues/118) also blocks release authorization.

**NOW: DP-M3-LAYERS — layer ordering and selection; 0/5 PRs as of the source snapshot.** Expected outcome: users can intentionally move overlapping text/shapes/frames/grids/tables forward/back with keyboard-accessible controls and unchanged document semantics. Likely PR partition (do not open empty PRs just to fill slots):

1. Pure immutable element reorder commands, bounded invalid-index/no-mutation cases, tests.
2. Accessible Layers list and keyboard move-forward/back commands, clear selection/focus feedback.
3. History/JSON import-export compatibility, local autosave/reopen and migration regression.
4. Chrome overlapping-element PNG/print stacking fidelity and keyboard accessibility regression.
5. Defect corrections necessary for the specified outcome and acceptance report, **only if needed**.

**NEXT: DP-M3-ALIGN**, bounded alignment and snapping; then **DP-M3-IMAGE**, foreground image elements (not the already implemented page background). Each receives its own five-PR ceiling. Typography/template enhancement comes after these, subject to the observed user jobs and MVP priorities.

## 4. End-of-feature handoff — mandatory

At each feature exit record in the same **substantive implementation PR**, or a narrowly scoped governance transition if the prior work was already merged: stable ID; feature PRs and exact merge SHAs; delivered user workflows; accepted automated checks; non-executed local/manual/Docker/a11y/print/security tests; open defects with issue links and impact; data/schema/architecture changes; rollback; cost/license/privacy effects; DONE/PARTIAL/BLOCKED classification; the next READY feature ID.

Reconcile `milestone-record.json` first, run `node scripts/sync-milestone-docs.mjs`, unit tests and `--check`, commit all seven generated sections with the meaningful code/status change, and assess affected non-generated README, product/architecture, security, testing, operations, finance and HLD/LLD documents. Generated sections are a **dated ledger**, not a live GitHub feed.

## 5. Release/finance/security/operations perspective

- **Security/CISSP:** imported documents remain untrusted; preserve schema bounds, escaping, dependency audit, local privacy and Rust/WASM boundary, with manual threat-review for genuinely new inputs. Do not claim vulnerability remediation from a green check alone.
- **Linux/DevOps/SRE:** GitHub Ubuntu CI and a Docker image build are not a user-run Ubuntu 24.04 Compose test, performance benchmark or production deployment; mark those **NOT RUN**.
- **Networking/CCIE:** browser-local MVP has no required distributed networking/backend stack; do not add DNS/TLS/load-balancers, microservices or a VPS as unproven prerequisites.
- **CA/MBA/Management:** cap iteration waste, record opportunity cost and customer utility; no assumed revenue, pricing or paid cloud spending. Deliver the user journey before expanding product scope.
