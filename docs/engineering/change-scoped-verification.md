# Change-Scoped Verification and CI Cost Policy

**Status:** Documentation policy, not a workflow implementation. Based on imgengine's lane-based testing approach but mapped to Design Platform's Nuxt/Rust/WASM/editor/PNG/PDF boundaries.

## Principle

**Run every required test, but don't run unrelated expensive work multiple times.** AI token consumption, local CPU time, GitHub-hosted runner minutes and paid cloud charges are different budgets. The repository is public as observed on 2026-11-16; standard public-repository hosted minutes are generally free subject to GitHub policy, but that does not excuse waste or replace budget controls.

A change-scoped *local* test plan does **not** silently modify required GitHub checks or release gates. Existing workflows, not this page, determine actual CI execution. Changed code, tests or CI on a new commit require new exact-SHA evidence.

## Verification matrix

| Change class | Fast developer feedback | Mandatory impacted evidence | Avoid by default |
| --- | --- | --- | --- |
| Markdown docs only | Links, file existence, status and diff review | Existing branch/review policies | Manual Rust toolchain, Docker image and browser suite re-runs only for a summary |
| Vue UI / CSS / control behavior | Typecheck, relevant Vitest, component checks | Critical affected browser journey, keyboard/focus where changed | Unrelated Rust domain profiling |
| Document schema / migration / validation | `cargo test --workspace --locked` plus shared fixtures | Rust + TS + WASM parity, v1–v4 migration and negative inputs | UI-only validation as security proof |
| Rust WASM adapter | Rust check and adapter smoke | ABI-free JS/WASM contract, browser initialization and failure cases | C ABI/FFI tests from imgengine |
| Editor history / geometry | Unit/command tests | Drag/resize history, bounds, round trip, accessible controls | Full public release rehearsal for trivial edits |
| Asset decode / background | Bounded image unit checks | Bytes/pixel constraints, malformed assets, undo/redo and actual PNG | Arbitrary remote image fetching |
| Export / print | Renderer focused test | Real downloaded PNG/PDF geometry, text and cross-browser cases | Claim print fidelity from status text alone |
| Docker / workflows | YAML/diff review and changed image build | CI on current head, cold build where packaging changes, cache-hit measurement | Rebuild dev Docker on unrelated frontend PRs |
| Dependency / security | Locked advisories, license and permission review | Relevant audit and supply-chain gate | Ignore warning because another repo passed |
| API/auth/database/payment (future) | Contract/authorization/unit tests | Cross-account isolation, migration, restore, quota, idempotency, security review | Introduce infrastructure before approved ADR |

When in doubt classify a shared boundary change more broadly rather than claiming it is isolated.

## Current CI posture (verify live workflows)

- Main CI checks Rust formatting/tests/Clippy and WASM compilation; frontend typecheck/unit/browser smoke and production image.
- Dependency security audit separately covers Rust and production JavaScript dependencies.
- A dedicated development-container workflow and targeted Chromium/Firefox/WebKit export verification are in PR #102 as of the 2026-11-16 review; **do not say merged until GitHub confirms**.
- Avoid duplicate `pretypecheck`, `pretest`, `prebuild` WASM compilation in a *single* frontend CI job where an explicit one-time build is sufficient.
- Docker BuildKit cache does not replace a reproducible uncached build; caching is not free of storage, expiration or supply-chain considerations.
- A cancelled cross-browser job is **not** a passed test. See live PR #102 status before decisions.

## CI expenditure controls

1. Check full diff and existing PR runs **before** rerunning.
2. Make one coherent, reviewed commit for a bounded defect, not multiple speculative pushes.
3. GitHub-hosted workflow concurrency should cancel stale PR work when appropriate; cancellation is not a refund of elapsed usage.
4. Use narrowly scoped path triggers only if they cannot silently skip a required check in branch protection.
5. Keep security, release and migration gates; do not disable tests to save time.
6. Prefer free local validation with the existing Docker environment for unpushed changes; hosted CI tests pushed code, not uncommitted edits.
7. Track number of runs per PR, cold/warm build duration, redundant compilation and CI failure causes.
8. Explicitly approve any paid provider/resource, and retain a zero-overage billing safeguard if applicable.

## Evidence/report format

```text
Repository / base SHA / PR head SHA:
Touched paths and impacted boundaries:
Targeted commands actually run:
GitHub workflow / job / run URL / conclusion:
Failed job + failed step (if any):
PASS / FAIL / PENDING / CANCELLED / SKIPPED / NOT RUN:
Time and cost evidence (only if measured):
Remaining risk and next step:
```

Follow [minimal-context CI policy](ci-evidence-policy.md) to avoid reading full logs unless diagnosing a failure.
