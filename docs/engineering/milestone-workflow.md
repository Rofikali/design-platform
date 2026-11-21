# Milestone Documentation Workflow — Single Source of Truth

**Status:** Repository process. This is documentation generation and validation; it does not run an agent, mark a GitHub PR merged, publish the app or prove an unexecuted test.

## Five-PR feature progression gate

From 2026-11-21, each newly started feature has one stable feature ID and **at most five opened PR attempts**. Record actual PR numbers in `feature_delivery.features[].prs` (including abandoned attempts), and never relabel the same feature to escape the cap. The generator rejects six or more PRs for any post-policy feature and rejects stale/mismatched active feature selection. After five PRs, document exact behavior implemented, CI/manual gaps, decisions/deferred work, move the active feature to CLOSED, and start another independent READY feature. The pre-policy semantic-tables iteration is recorded as CLOSED_LEGACY, exempt from retroactive rewriting but not eligible for more table-only PRs. See [feature delivery policy](feature-delivery-policy.md).

**New CI guard:** `scripts/feature-pr-budget-check.mjs` verifies the PR body's stable Feature-ID and the **actual opened GitHub PR number** against the ledger on every pull_request. The JSON generator alone cannot enforce that cross-reference. Open the PR, register its real number in the same PR, regenerate seven docs and await its exact-head CI. A narrow governance-only diff exception requires `docs(governance):` title and independent review. Closed post-policy features must record an explicit DONE/PARTIAL/BLOCKED outcome in the structured source, and the agent must advance to a genuinely independent READY feature.

## Four-gate workflow

1. **Milestone record updated:** Edit only [milestone-record.json](milestone-record.json) to change the current NOW/NEXT IDs, status, PR/issue links, observed full commit SHA and evidence summary. A dated snapshot is not a live GitHub feed. Check GitHub before changing MERGED/PR_OPEN.
2. **Documentation generator:** From the repository root run the Node 22 built-in-only generator. It synchronizes exactly seven bounded generated sections while preserving the rest of each Markdown file:
   - AGENTS.md
   - SKILLS.md
   - README.md
   - next.md
   - docs/engineering/decision-status-register.md
   - docs/engineering/agent-continuation-runbook.md
   - docs/engineering/hourly-autopilot.md
3. **GitHub CI validation:** Pull-request CI executes the generator's unit tests and --check mode. It exits nonzero for a stale or removed generated section, invalid record, duplicate/malformed markers, or unsupported merge-authorization policy. CI does **not** edit committed files or claim to verify the live GitHub status.
4. **Reviewed PR with gated merge:** The autopilot opens or updates a PR, reviews the actual diff and exact-head CI, fixes failures, and may merge a safe PR into main under the owner's latest standing authorization **only** after required latest-head/integration CI, security, GitHub protections and any mandatory independent human review pass. It must never fake independent approval, override checks, dismiss reviews or force-push. **Publishing and deployment remain separate and prohibited without explicit approval.**

## Commands (run at repository root)

The generator and tests require only the existing Node.js runtime; no npm install, Docker build, Rust build or network request.

~~~sh
node scripts/sync-milestone-docs.mjs
node --test scripts/tests/sync-milestone-docs.test.mjs
node scripts/sync-milestone-docs.mjs --check
git diff -- docs/engineering/milestone-record.json AGENTS.md SKILLS.md README.md next.md docs/engineering/
~~~

If CI reports stale documents, run the generator, review the seven generated diffs for correctness, and commit them alongside the source record. Do **not** delete the CI check, add generated sections manually, or replace existing human-owned context.

## Guardrails and review evidence

- **Single source of truth:** The structured JSON is authoritative for **the generated milestone fields only**. It is not authoritative for source code, tests, business decisions, releases or real-time GitHub state.
- **Generated boundaries:** Each target has one marker pair named milestone-sync:start / milestone-sync:end. The generator refuses missing, duplicated or unordered boundaries. Human authors can edit text outside the markers.
- **Verified merge authorization:** Reconcile records with current repo and PR head. The owner authorizes safe verified PR merges, not bypasses or publication. A self-review is not independent review if one is required. Do not infer MERGED from checks passing, claim screen-reader tests executed, or silently move a blocked milestone to done.
- **Failure safety:** --check reads but never writes. In normal mode, generated text replaces only marked ranges.
- **Security and finance:** No customer documents, secrets, cloud credentials, network calls, extra paid services, publishing or deployment are part of this workflow. Only owner-authorized, verified PR merges are permitted.
- **Branch protections:** The CI job is one workflow check; repository owners must configure any required-check / code-owner settings in GitHub separately. A workflow file alone does not establish enforced branch protection.

## Milestone documentation impact, adapted from IMGENGINE (2026-11-20)

**Why stale docs can still pass CI:** The existing sync check checks seven generated sections against a *dated JSON record*, not against live GitHub main, PR merges or exact-head checks. It cannot establish that a record is current. Do not infer freshness from a green generator check.

**Each implementation milestone PR must perform this transaction:** (1) reconcile the live main SHA, open and merged PRs, exact-head CI and issues; (2) change the structured milestone record when the NOW/NEXT selection, milestone status, PR head/merge evidence or security decision materially changes; (3) regenerate and commit **all seven** marked sections in the same implementation PR; (4) review affected non-generated contracts and report UPDATED or N/A; (5) run the generator unit tests and `--check` before merge. Do not fabricate a merged SHA while a PR is still open. After an actual merge, record the real merge SHA in the next authorized implementation milestone, not in a repetitive timestamp-only PR.

**Impact lenses:** review root and scoped AGENTS, SKILLS, README and the docs map; schema-v5 and older import migrations, Rust/WASM/TS parity, undo/redo, local-only persistence, PNG/print/a11y/security, Docker/CI and the relevant HLD/LLD/ADR. Only update business/finance/CA/MBA/management documentation for changed product or economic facts. No C ABI/IMGENGINE architecture should be copied into this editor.

**Connector-only contingency:** If an editable checkout is unavailable, write exactly the canonical generated sections from the verified source and let latest-head CI run `node --test scripts/tests/sync-milestone-docs.test.mjs` and `node scripts/sync-milestone-docs.mjs --check`. Mark local generator and tests **NOT RUN** rather than treating written output as executed tests. Do not merge partial synchronization or waive the CI gate.

**Evidence:** every PR records base/head SHA, actual changes, observed PASS/FAIL/PENDING/NOT RUN per check, reviewed documents updated versus N/A, risks and one next READY job. Distinguish PR_OPEN, CI_PASS, MERGED and RELEASED. The independently enabled hourly ChatGPT autopilot is not run by this file and remains subject to GitHub protections and required independent review.
