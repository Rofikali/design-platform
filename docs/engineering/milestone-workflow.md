# Milestone Documentation Workflow — Single Source of Truth

**Status:** Repository process. This is documentation generation and validation; it does not run an agent, mark a GitHub PR merged, publish the app or prove an unexecuted test.

## Four-gate workflow

1. **Milestone record updated:** Edit only [milestone-record.json](milestone-record.json) to change the current NOW/NEXT IDs, status, PR/issue links, observed full commit SHA and evidence summary. A dated snapshot is not a live GitHub feed. Check GitHub before changing MERGED/PR_OPEN.
2. **Documentation generator:** From the repository root run the Node 22 built-in-only generator. It synchronizes exactly six bounded generated sections while preserving the rest of each Markdown file:
   - AGENTS.md
   - SKILLS.md
   - next.md
   - docs/engineering/decision-status-register.md
   - docs/engineering/agent-continuation-runbook.md
   - docs/engineering/hourly-autopilot.md
3. **GitHub CI validation:** Pull-request CI executes the generator's unit tests and --check mode. It exits nonzero for a stale or removed generated section, invalid record, duplicate/malformed markers, or unsupported auto-merge policy. CI does **not** edit committed files or claim to verify the live GitHub status.
4. **Human-reviewed PR:** The contributor/agent opens a PR, supplies exact-head CI evidence and highlights changed record fields. A **human** reviews and manually merges or publishes if approved. The scheduler must **never automatically merge, publish or deploy**, even when CI is green.

## Commands (run at repository root)

The generator and tests require only the existing Node.js runtime; no npm install, Docker build, Rust build or network request.

~~~sh
node scripts/sync-milestone-docs.mjs
node --test scripts/tests/sync-milestone-docs.test.mjs
node scripts/sync-milestone-docs.mjs --check
git diff -- docs/engineering/milestone-record.json AGENTS.md SKILLS.md next.md docs/engineering/
~~~

If CI reports stale documents, run the generator, review the six generated diffs for correctness, and commit them alongside the source record. Do **not** delete the CI check, add generated sections manually, or replace existing human-owned context.

## Guardrails and review evidence

- **Single source of truth:** The structured JSON is authoritative for **the generated milestone fields only**. It is not authoritative for source code, tests, business decisions, releases or real-time GitHub state.
- **Generated boundaries:** Each target has one marker pair named milestone-sync:start / milestone-sync:end. The generator refuses missing, duplicated or unordered boundaries. Human authors can edit text outside the markers.
- **Human approval:** Reconcile records with current repo and PR head. Do not infer MERGED from checks passing, claim screen-reader tests executed, or silently move a blocked milestone to done.
- **Failure safety:** --check reads but never writes. In normal mode, generated text replaces only marked ranges.
- **Security and finance:** No customer documents, secrets, cloud credentials, network calls, extra paid services, publishing or automatic merges are part of this workflow.
- **Branch protections:** The CI job is one workflow check; repository owners must configure any required-check / code-owner settings in GitHub separately. A workflow file alone does not establish enforced branch protection.
