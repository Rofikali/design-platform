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


### Staged editor typography controls

The feature branch now wires native family, weight and style selects into text element state. Default-only designs remain schema v5; nondefault styles serialize as proposed v7 and restore through the version-aware editor parser. Existing deep history/autosave snapshots include style changes, JSON validation uses a separate WASM migration boundary with TypeScript fallback, PNG uses matching style bindings, and print inherits canvas styling. No claim of browser acceptance until tests pass. Actual local tests NOT RUN. No new dependencies, remote fonts, network, infrastructure or spending. Main remains v5 until integration.


### Browser acceptance coverage

Added actual Chrome/WASM shared style fixture cases, v1 to v7 normalization, nondefault style roundtrip and invalid binding rejection. Existing Nuxt smoke now exercises typography controls, computed CSS, undo/redo, debounced local persistence, reload and real PNG download dimensions before print geometry. Browser assertions are written, not yet executed; PNG glyph pixel parity, styled JSON file import/export UI, physical print and multilingual acceptance remain pending. Local tests NOT RUN.

## Reuse-first future work and adoption gate

Consult the [reuse-first policy](reuse-first-policy.md) for prioritized typography, font, rich-text, graphics, PDF, raster, assets and deferred native-engine evaluations; license, security, performance and 12-month TCO gates apply to every contributor. Existing feature caps and live PR priority remain unchanged. No new dependencies or paid services authorized by documentation alone.


### REUSE-02 native layout foundation

PR #175 merged (exact-head four workflow families passed). Native bounded layout candidate uses CSS/SVG alignment and letter-spacing attributes, line-height ratio and shared line advance for existing export defaults. A browser smoke probe measures DOM/Canvas letter-spacing support and line heights; unsupported Canvas spacing is recorded, not silently approximated. Unit and browser assertions added; NOT RUN locally. No new persisted fields, editor controls, font files, dependencies or new spending; further schema ADR and actual cross-browser/print parity needed before activation.


### REUSE-02 staged v8 document contract

Use a separate v8 layout envelope rather than mutating merged v7 semantics. Exactly one bounded layout binding per text element, deterministic z-order, v1–v5/v7 migration, no v6 acceptance, explicit null/invalid/missing/duplicate/unknown binding rejection; existing v7 font styles and page metadata preserved through the established validator. Rust, TypeScript, WASM normalization and shared fixtures staged. Live editor remains v5/v7; no v8 activation until ADR, anti-downgrade checks, native renderer/browser/print parity, undo/autosave/import/export tests and CI. Local tests NOT RUN. No new dependencies, fonts, network or financial commitments.


### REUSE-02 staged native export adapter

SVG/PNG renderer accepts optional complete validated layout bindings; left/center/right anchors, finite letter spacing, line advance, clipping and native Canvas metrics share the staged layout contract. Legacy/default SVG bytes and table behavior are covered by regression assertions. Nonzero spacing fails explicitly if native measurement is unavailable; Canvas state is restored per measurement. No fake complex-script shaping approximation, no editor activation, no dependency or spend. Unit assertions added, local tests NOT RUN. Native browser probe and actual pixel/print/Indic parity remain acceptance gates.


### PR #176 CI remediation and v8 WASM browser coverage

Exact head d7bdb7191267545ca04bfc27e719613ae5ceae60: CI run 45553330205 Rust formatting failed (job 138999495914), Rust tests/Clippy skipped, documentation sync and frontend unit tests/existing WASM smoke passed; editor browser and other workflows still running at checkpoint. Applied the two formatting corrections shown by the runner. Added actual Chrome/WASM v1/v7-to-v8 migration, preservation of existing content/styles, shared 12 layout fixture outcomes, valid roundtrip and invalid binding/version rejection. New-head tests pending; local tests NOT RUN. No editor v8 activation, dependency or spending.


### REUSE-02 v8 activation candidate

PR #176 merged at 553711d; four exact-head workflow families passed, integrated-main workflow query returned no runs. Candidate editor wiring uses native alignment/line-height/spacing controls, complete v8 bindings only when nondefault layout is present, v5/v7 otherwise, version-aware TS/WASM validation, snapshots and native PNG adapter. Existing history/autosave observe layout state; unit assertions added. Browser and physical print/glyph parity not yet verified; v8 activation is branch-only until merge. No new dependency, font asset or spend. Local tests NOT RUN.


Added candidate Chrome smoke checks for v8 live CSS, v7/v8 undo/redo, autosave/reload, actual JSON download and PNG dimensions/changed bytes (or explicit unsupported native spacing error), reusing the existing PDF geometry smoke. Updated legacy font-size selector to avoid ambiguous numeric control selection. These are written assertions, not executed evidence. File import UI roundtrip and glyph pixel fidelity remain separate gates. Local tests NOT RUN.
