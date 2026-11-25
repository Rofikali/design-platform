# Advanced Editor Feature — Acceptance, Risk and Governance Matrix

**Planning policy (22 Nov 2026), NOT a completed audit or production approval.** Companion to [advanced feature roadmap](../product/advanced-feature-roadmap.md) and [current milestone record](milestone-record.json). The [live work board](../../next.md) alone selects active tasks. All existing editor functions are protected by regression tests: no broad rewrite, deletion, silently changed behavior, unsafe data migration or release shortcut.

## Proportionate review across seven engineering levels

| Lens | Before implementation | Evidence at acceptance |
| --- | --- | --- |
| L1 implementation | Exact user behavior, non-goals and smallest code seam | Readable typed source, focused positive/negative unit tests |
| L2 integration | New element/tool through document, canvas, history and export | Complete small vertical slice, storage/JSON test |
| L3 reliability/concurrency | Error paths, async image decode, cancellation, storage quota and partial failure | Deterministic error/recovery cases, no silent data loss |
| L4 Staff architecture | Cohesive composables/modules; single schema authority with TS/WASM parity | HLD/LLD contract and narrow adapters, no unnecessary abstractions |
| L5 cross-cutting | Versioned migrations, accessibility, CI, browser differences, output | Rust tests + TS tests + browser, export and doc-sync at exact SHA |
| L6 Principal | Options and irreversible migration/print/asset tradeoffs | ADR where necessary, threat model, benchmark cost |
| L7 Distinguished | What invariant prevents whole classes of regressions? | Documented non-regression policy and reproducible tests |
| CISSP / security | Untrusted JSON, image decoding, fonts/assets, XSS, CSP, DoS, supply chain, privacy | Size and MIME/decode bounds, no network surprises, audit checks, explicit residual risk |
| Linux / SRE | Reproducible images/CI, release rollback, recoverability, supported platforms | Pinned builds, Docker smoke, monitored error/fallback, manual NOT RUN clearly |
| QA / accessibility | Keyboard actions, focus, announcements, zoom, screen readers | Automated checks plus manual acceptance; cannot label unexecuted work PASS |
| CCIE/network | Current editor remains local-first/offline; network risk proportional to actual endpoints | N/A unless API/sync is introduced; then TLS, auth, rate limits, segmentation, tenant model |
| CA / finance | Development effort, CI usage, licenses, support, possible liabilities | Cost assumptions vs observed spend, break-even/contribution inputs only when measured |
| MBA / management | Target user's job, priority, support ownership and delayed alternatives | User observation, time to useful export, failed print/export rates, explicit go/no-go |

Review lenses are not certifications, seven separate AI workers or permission to ignore actual review rules. Document UPDATED vs N/A for scoped contracts; prioritize user safety and output correctness over arbitrary PR count.

## Mandatory compatibility regression

- Preserve schema **v1–v5** existing imports and v5 export until a separately accepted, documented migration. Any new element type requires a version bump if the prior schema cannot represent it; never silently insert an unknown union variant.
- Preserve existing text/rect/frame/grid/table, page backgrounds, snapping and alignment, layers order, pointer/keyboard editing, undo/redo (50 snapshots), autosave/recovery path, JSON downloads and existing templates.
- Existing SVG/PNG and browser print paths must still pass unchanged fixtures, cross-browser regression and physical-geometry checks. New direct PDF must be **additive** and never silently replace browser print.
- Preserve local-first privacy; do not send user designs, filenames, assets, or telemetry to a server or inject remote image/font URLs without explicit approved policy.
- Keep Rust core, WASM adapter and TypeScript fallback behavior aligned on supported schema/invalid inputs; test both unavailable-WASM fallback and supported old versions. Browser validation is not trusted server authorization.

## Feature-specific acceptance (proposed, not yet tested)

| Family | New value | Required evidence | Stop/go condition |
| --- | --- | --- | --- |
| Foreground raster image `DP-M3-IMAGE` | Actual selected, draggable, resizable image objects | MIME signature+decode/pixel/encoded-size limits, bounds, selection, undo, save/reopen, v1–v5 JSON parity, PNG and print pixel/fidelity browser tests | Existing 1/5 PR; max four more; do not claim solved from data URL format guard |
| Typography | Bounded font families, weights, line/letter spacing, align and multilingual fallback | Font license review, glyph/Unicode grapheme tests, deterministic output and old-font defaults | Refuse unsupported font assets/remote fonts by default |
| Vector shapes | New typed ellipses/lines/arrows/polygons with keyboard editing | Bounded vertices/geometry, no unsafe SVG markup, selection/history and exporter parity | No broad canvas rewrite or arbitrary pasted active SVG |
| Precision/guides | Optional rulers, guides and margin overlays | Opt-in defaults, non-export overlays where intended, zero-drift tests, 200% zoom checks | Do not perturb existing snapping behavior |
| Object/group tools | Group/lock/rotation/opacity for supported variants | Identity and nested group limits, undo consistency, print/render compatibility | Defer if model complexity cannot be bounded |
| Multi-page exam workflow | A4 pages with stable pagination, headers/footers and marks | Versioned schema ADR, old document round-trips, deterministic pagination, actual PDF page count, print test | Manual physical print remains issue #85 |
| Shop banner workflow | Reusable price cards, QR, dimensions, brand assets | Plain-text validation, no untrusted QR remote fetch, crop/bleed specs, reference exports | No assumption of official brand rights or print correctness |
| Direct PDF and preflight | Download PDF while keeping print fallback; warnings for fonts/clipping/resolution | Size/aspect fidelity, font embedding/license, PNG/PDF comparisons, accessibility/fallback | Printer/fidelity signoff required before release |
| Local assets and templates | Approved offline images, palettes and reusable blocks | Permission/usage disclosure, storage quota and backup semantics, no silent localStorage migration | Explicit consent and privacy review for any cloud store |
| Performance | Responsive large design with bounded memory | p50/p95/p99 operations, memory, render/export, representative Chrome/Firefox/WebKit hardware | No unsupported 60-FPS or scale claims |
| Release and support | Maintainable first publicly authorized version | CI exact-head, dependency security, manual a11y/print, support/rollback/license/provenance, owner signoff | Issues #118/#82/#85 and release approval must be satisfied |

## Non-negotiable PR/handoff and autopilot contract

1. **Live GitHub overrides dated status**: open PRs, reviews, exact-head checks, merge SHA, issues. PR #165 merged at `222e550e31e859b2b8e06538f27d07f424a88e19`; old `PR_OPEN` in generated views must be corrected by changing only the record then running the generator.
2. **One stable feature / five opened PR attempts maximum**; fixes inside same PR do not consume another slot. No sixth feature PR, no renamed feature-budget loophole, no relaunch of CLOSED_LEGACY tables or CLOSED/PARTIAL Layers or Alignment for cosmetic regressions.
3. **Single active NOW** in `milestone-record.json`; roadmap PLANNED entries are candidates, not a concurrent queue. First continue DP-M3-IMAGE from merged resource guard. After completion/closure promote one bounded candidate and register actual GitHub PR number in that feature PR.
4. **Seven generated sections** must be emitted from `scripts/sync-milestone-docs.mjs`; do not hand-edit. Run its tests and `--check`; a GitHub API-only commit is not a local test PASS.
5. **No idle loop**: if current PR is merged, reconcile it then choose remaining independent READY work; no repeated recheck of obsolete #162/#165. After two no-material-change runs on a specific blocker, escalate and switch safe lanes while retaining release/security gates.
6. **Merge only with exact-head checks and required independent review/protection**. Never count self/owner COMMENTED as independent approval, never force-push or bypass security. No automated deployment, spend, accounts, telemetry, remote sync, customer data, license changes, enterprise claims or publication.
7. **Status semantics**: IMPLEMENTED / PR_OPEN / CI_PASS / MERGED / MANUAL_NOT_RUN / BLOCKED / RELEASED are different; record actual CLI/browser/manual results only when observed. Keep a next safe executable task and source-of-truth docs synchronized in implementation PR.

## References

- [AGENTS](../../AGENTS.md), [SKILLS](../../SKILLS.md), [README](../../README.md), [next.md](../../next.md), [five-PR policy](feature-delivery-policy.md), [hourly autopilot](hourly-autopilot.md)
- [architecture HLD/LLD](../architecture/document-editor-hld-lld.md), [WASM parity](wasm-boundary.md), [local storage](local-document-persistence.md), [testing](../testing/strategy.md), [security](../security/threat-model.md), [CI evidence](ci-evidence-policy.md)
- [product/business](../product/platform-business-strategy.md), [unit economics](../finance/unit-economics.md), [seven-level operating model](seven-level-operating-model.md)


### Typography foundation checkpoint (25 November 2026)

PR #174 introduces only fixed local family tokens, legacy default SVG/Canvas font resolution and negative regression tests. No user-facing family picker, weight/style, document migration or glyph/print certification yet. No font assets, remote requests or new dependency; system font availability remains host-dependent. Local tests NOT RUN; exact-head CI required. Next: coordinate the versioned TS/Rust/WASM model and migration fixtures before enabling editor controls.


### Proposed typography persistence boundary

Staged schema v7 adds a text_styles array keyed by existing text element IDs; schema v6 remains reserved for the incomplete raster contract. Each text element has exactly one allowlisted style; duplicate, missing, non-text and unknown targets are rejected. Legacy v1–v5 normalize through the unchanged v5 validator before default sans/normal/normal styles are attached. The editor still rejects v7; activation requires schema ADR, end-to-end parity, renderer/editor/history/autosave integration and migration tests. No network, font assets or new dependency. Local tests NOT RUN; CI not yet verified.


### Staged typography rendering checkpoint

SVG and Canvas export now accept optional validated text-style bindings; existing callers omit them and retain byte-identical default SVG output. Only text elements accept typography bindings; table cells retain legacy defaults. SVG attributes and Canvas font shorthand derive from the same fixed tokens. Tests cover measured-style propagation, escaping, invalid bindings and default output equivalence. Actual browser and local tests NOT RUN. Production editor, print, persistence and multilingual glyph acceptance remain pending. No new dependency, remote font request, networking, SRE or finance impact (N/A).
