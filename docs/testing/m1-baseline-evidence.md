# M1 Baseline Evidence — CI and Dependency Audit

- **Repository:** Rofikali/design-platform
- **Baseline main commit:** `91ff02d0c0c4c32396f83bcf083a9351d54065c9`
- **Roadmap merge:** PR #100
- **Reviewed:** 2026-11-15
- **Purpose:** Record the CI evidence available at the start of M1. This is not a full security audit, manual QA report, or production-readiness approval.

## 1. Verified GitHub Actions evidence

The following runs were associated with PR #100 head commit `4dc85279d414a86df4c4f7c9f510e7031382ad7c`. The PR changed documentation only (`next.md`, `AGENTS.md`, `README.md`), so the tested application source matched the source merged into main.

### CI — run #292

- Run ID: `43722467588`
- URL: https://github.com/Rofikali/design-platform/actions/runs/43722467588
- Overall result: **completed / success**

| Job / step | Observed result |
|---|---|
| Rust core job | Success |
| `cargo fmt --all -- --check` | Success |
| `cargo test --workspace --locked` | Success |
| `cargo clippy --workspace --all-targets --locked -- -D warnings` | Success |
| WASM target installation and adapter check | Success |
| Nuxt frontend job | Success |
| Node/pnpm dependency installation | Success |
| Nuxt type check | Success |
| Frontend Vitest suite | Success |
| Real-browser WASM smoke test | Success |
| Real Nuxt editor import/export browser test | Success |
| Nuxt production build | Success |
| Production Docker image build | Success |
| Development Docker image build | Success |

### Dependency security audit — run #88

- Run ID: `43722467594`
- URL: https://github.com/Rofikali/design-platform/actions/runs/43722467594
- Overall result: **completed / success**

| Job / step | Observed result |
|---|---|
| Production JavaScript dependency audit | Success |
| Locked Rust dependency audit | Success |

## 2. What this evidence establishes

- The PR head snapshot passed the repository's configured Rust, frontend, browser, build and Docker CI jobs.
- The configured production JavaScript and locked Rust dependency audit jobs completed successfully.
- The application code was unchanged by PR #100; only documentation files were changed.
- The merged main commit contains the same final blobs for `next.md`, `AGENTS.md` and `README.md` as the reviewed PR head.

## 3. What this evidence does NOT establish

- These are CI results for the PR head commit, not a new CI run on the merge commit itself.
- This report does not claim that a local Docker test was run during this review.
- A successful dependency audit does not prove the absence of vulnerabilities or a secure application.
- CI does not replace manual keyboard-only, screen-reader, zoom/reflow or contrast review.
- CI does not prove cross-browser/OS export fidelity, real printer output, product-market fit, or production readiness.
- This is not a complete review of all open PRs, repository branch protections, GitHub Actions permissions, or every trust boundary.

## 4. Outstanding baseline work

- [x] Confirm current CI status on the latest main commit: push-triggered CI run #293 and dependency audit run #89 both passed on `91ff02d0c0c4c32396f83bcf083a9351d54065c9`.
- [ ] Verify branch protection / required status checks. The connected GitHub API returned 403 for branch protection and ruleset reads; the integration cannot verify this setting.
- [x] Obtain a fresh CI verification on the current main SHA (run #293); no local test run is claimed.
- [ ] Complete the manual accessibility worksheet in `accessibility-manual-audit.md`.
- [ ] Complete document validation parity, import/render/export limits and dependency provenance review as M1 work.
- [ ] Record confirmed findings, owners and remediation PRs.


## 5. Follow-up CI evidence on the M1 evidence PR

The documentation-only M1 evidence PR triggered fresh PR workflows on commit `530a957c6e3dd7437936e87c09782c21ead6930c`. Those checks completed successfully. A later documentation-only commit (`804a1109faa8d93b6e50b3abc7f09ab1cd28eab5`) corrected this report's baseline details; it changed no application source, lockfile, workflow, Dockerfile or runtime configuration. The successful CI therefore still verifies the application source, but it is not a status check on the latest PR head.

### CI — run #294

- Run ID: `43737834551`
- Tested commit: `530a957c6e3dd7437936e87c09782c21ead6930c`
- URL: https://github.com/Rofikali/design-platform/actions/runs/43737834551
- Overall result: **completed / success**
- Rust core: formatting, workspace tests, Clippy and WASM target check all succeeded.
- Nuxt frontend: install, typecheck, frontend tests, real-browser WASM smoke, real Nuxt editor browser smoke, production build, production Docker build and development Docker build all succeeded.

### Dependency audit — run #90

- Run ID: `43737834783`
- Tested commit: `530a957c6e3dd7437936e87c09782c21ead6930c`
- URL: https://github.com/Rofikali/design-platform/actions/runs/43737834783
- Overall result: **completed / success**
- Locked Rust dependency audit: succeeded.
- Production JavaScript dependency audit: succeeded.

**Interpretation:** This is fresh CI evidence for the same application source as main, executed on the documentation PR head. It is not a push-triggered workflow run on the main merge commit. No source-code delta was introduced by this PR.


## 6. Push-triggered verification on the current main commit

- Main commit: `91ff02d0c0c4c32396f83bcf083a9351d54065c9`
- CI run #293: [run 43737165093](https://github.com/Rofikali/design-platform/actions/runs/43737165093) — **completed / success**.
- Dependency audit run #89: [run 43737165136](https://github.com/Rofikali/design-platform/actions/runs/43737165136) — **completed / success**.
- The CI jobs completed Rust formatting/tests/Clippy/WASM checks and frontend typecheck/tests, Chrome WASM/editor browser smoke, production build, and both Docker builds.
- The dependency audit completed the locked Rust audit and production JavaScript audit.

This closes the post-merge CI verification item for the current main baseline. It does not close manual accessibility or branch-protection verification.

## 7. Cross-browser workflow failure and remediation

- Historical cross-browser run #2: [run 42631540312](https://github.com/Rofikali/design-platform/actions/runs/42631540312) — failed before test execution.
- Job log shows `ubuntu-latest` resolved to Ubuntu 26.04; Playwright 1.56.1 rejected the runner during `playwright install --with-deps chromium firefox webkit`.
- The browser export assertion step was skipped. This is a runner/tool compatibility failure, not a failed rendering assertion.
- The workflow was previously scheduled/manual only, so this regression was not part of normal PR CI.
- Remediation is proposed in [PR #102](https://github.com/Rofikali/design-platform/pull/102): pin Ubuntu 24.04 and trigger on relevant pull requests. Await its CI result before considering the remediation verified.

## 8. Repository protection visibility

- The connected GitHub integration returned HTTP 403 when reading `branches/main/protection`.
- The repository rulesets endpoint also returned HTTP 403 (GitHub reports rulesets are unavailable for this private repository under its current plan).
- Therefore branch protection, required checks, and ruleset enforcement remain **not verified**. Do not infer that protection is enabled or disabled.

## 9. Interpretation

Treat the current application test baseline as **CI-passing on the PR head snapshot**, with post-merge main verification and manual accessibility still open. Do not label M0 fully complete until the outstanding baseline checks are reconciled.
