# Design Platform — bounded engineering PR

## Scope and evidence
- Milestone / customer problem / selected READY item:
- Base main SHA, actual PR head SHA, related issue:
- Changed editor (Nuxt/Vue/TypeScript) / Rust/WASM files, compatibility and rollback:
- Tested commands actually run and exact-head GitHub CI / security / browser / export run URLs:
- PASS / FAIL / PENDING / SKIPPED / NOT RUN per gate; unresolved review/protection requirements:
- Security, local-first privacy, keyboard, screen-reader and physical-print evidence or explicit N/A:

## IMGENGINE-derived milestone documentation transaction
- [ ] Reconciled `main`, existing PRs and merged SHAs from live GitHub before updating dated documentation.
- [ ] Material milestone status, NOW/NEXT, selected PR head or merge evidence updated in `docs/engineering/milestone-record.json`; ran generator and included **all seven generated views in the same PR**, or explained N/A for an immaterial change.
- [ ] Ran `node --test scripts/tests/sync-milestone-docs.test.mjs` and `node scripts/sync-milestone-docs.mjs --check` or recorded local NOT RUN and awaited exact-head CI.
- [ ] Assessed AGENTS.md, SKILLS.md, README.md, next.md, docs index and scoped instructions; updated only affected facts.
- [ ] Assessed HLD/LLD/ADR/schema migrations, WASM parity, undo/history, privacy/security, a11y, PNG/print, CI/Docker, finance/CA/MBA/product; marked unaffected areas N/A.
- [ ] No premature MERGED/RELEASED, no timestamp-only docs churn; recorded next READY task and required post-merge reconciliation.

**Documentation updated and why:**

**Documentation reviewed, N/A and why:**

**Unverified owner/human gates:**

## Integration
- [ ] Required exact-head CI and dependency security PASS; skipped checks are not PASS.
- [ ] Branch protection, independent reviewer requirements and unresolved review threads checked.
- [ ] No deployment, production publishing, spending or security policy bypass.
