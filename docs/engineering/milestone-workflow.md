# Milestone Documentation Workflow — Single Source of Truth

**Status:** Repository process. This is documentation generation and validation; it does not run an agent, mark a GitHub PR merged, publish the app or prove an unexecuted test.

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
