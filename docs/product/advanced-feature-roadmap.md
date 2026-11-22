# Design Platform — Advanced Editor Feature Roadmap

**Owner-requested roadmap, 22 November 2026. Status: DESIGN / PLANNED only; not a release or feature-completion claim.** Verified baseline: GitHub `main` `222e550e31e859b2b8e06538f27d07f424a88e19` (PR #165 merged). [Live work board](../../next.md) and [structured milestone record](../engineering/milestone-record.json) remain the *only active task selectors*. [Acceptance and governance](../engineering/advanced-feature-acceptance.md) supplies requirements; this document is a prioritized candidate catalog, **not** a parallel active queue.

## Non-regression contract — preserve every existing feature

**Do not delete, rewrite, silently replace, or change established behavior** of the existing Nuxt 4/Vue/TypeScript editor, text/rectangles, frames, visual grids, semantic tables, element selection/drag/resize, layers, alignment/opt-in snapping, bounded 50-snapshot history, local autosave, JSON import/export and v1–v5 migrations, page-level raster backgrounds, existing starter templates, PNG renderer, browser print/PDF, Rust/WASM validation with TypeScript fallback, Docker or CI. A *minimal* shared-source change is permitted only with a justified new feature, scoped tests and parity evidence; preserve compatibility and user-visible defaults. No bulk architectural rewrite.

**In-progress boundary:** `DP-M3-IMAGE` is the sole ACTIVE feature (1/5 opened PR attempts). [PR #165](https://github.com/Rofikali/design-platform/pull/165) **MERGED** at `222e550e31e859b2b8e06538f27d07f424a88e19` and added bounded embedded PNG/JPEG/WebP data URL format/base64 checks only. There is **no foreground image element** in the current v5 document union and no draggable editor/image export integration. Next PR must build a bounded vertical slice **under the same DP-M3-IMAGE stable feature ID**, not open a renamed sixth attempt. At feature exit, close DONE/PARTIAL/BLOCKED and choose a genuinely independent candidate. The record is a dated checkpoint; verify live GitHub before each run.

## Staged outcomes and dependencies

| Priority | Planning milestone / feature | User result and specific acceptance direction | Prerequisites / gate |
| --- | --- | --- | --- |
| P0 NOW | **DP-M3-IMAGE-01**; `DP-M3-IMAGE` (ACTIVE 1/5) | Add an actual foreground raster element through document model, editor add/select/move/resize/layer, history/storage/JSON and PNG/print, with bounded decoding and import validation | Existing #165 validation; schema migration/TypeScript–Rust parity; exact-head CI; preserve v1–v5 |
| P1 NEXT | **DP-M3-TYPO-01**; `DP-M3-TYPO` (PLANNED) | Named approved fonts, weight/style, underline, paragraph/line/letter spacing, text alignment and multilingual fallback, including Assamese/Bengali/Hindi/English where browser fonts permit | Image feature closure, font licensing, deterministic export/print tests, old text defaults |
| P1 | **DP-M3-VECTOR-01**; `DP-M3-VECTOR` (PLANNED) | Ellipse, line, arrow, triangle, star, rounded rectangle, polygon; selected/moved/resized with geometry and export parity | Stable typed element contracts, complexity limits, visual/keyboard tests |
| P1 | **DP-M3-PRECISION-01**; `DP-M3-PRECISION` (PLANNED) | Optional rulers, guides, margin/safe-area overlays, spacing measures and precision coordinates without altering current snapping | Opt-in preferences only; no unwanted serialization changes; accessibility |
| P2 | **DP-M3-OBJECT-01**; `DP-M3-OBJECT` (PLANNED) | Optional grouping, locking, rotation, flip, opacity and border/fill effects | Separate bounded changes, identity/history invariants, export parity; no broad rewrite |
| P1 product | **DP-M4-EXAM-PAGES-01**; `DP-M4-EXAM-PAGES` (PLANNED) | Multi-page A4 exam document, safe page breaks, headers/footers/page numbers, print-aware pagination | Distinct accepted schema/print ADR, size bounds, v1–v5 migration safety |
| P2 product | **DP-M4-EXAM-TOOLS-01**; `DP-M4-EXAM-TOOLS` (PLANNED) | Numbered questions, sections/marks, reusable question blocks, bounded math text | Multi-page acceptance, locale/typography, semantic and printer tests |
| P1 product | **DP-M4-BANNER-01**; `DP-M4-BANNER` (PLANNED) | Shop banner presets, editable price cards, user-provided QR information, typography/brand components, print dimensions | Foreground image and typography, validation, print-safe layout |
| P2 | **DP-M4-ASSETS-01**; `DP-M4-ASSETS` (PLANNED) | Opt-in local asset library: approved user images, logos, palettes, offline brand kit | IndexedDB feasibility/privacy quota review; no silent migration/deletion of localStorage |
| P2 | **DP-M4-TEMPLATES-01**; `DP-M4-TEMPLATES` (PLANNED) | Curated teacher/shop components, template variables and validated data-driven repeat designs | Existing templates remain unchanged; provenance and bounded import |
| P1 release | **DP-M4-PRINT-01**; `DP-M4-PRINT` (PLANNED) | Preflight report for clipping, margins, page sizes, bleed, crop marks and effective raster resolution | Printer-specific evidence; real-printer issue #85 remains open |
| P1 release | **DP-M4-PDF-01**; `DP-M4-PDF` (PLANNED) | Add direct PDF download *alongside* existing browser print, then tested multi-page export | Licensing/font evaluation, PDF dimensions/fidelity, no external backend by default |
| P1 release | **DP-M5-RELEASE-01**; `DP-M5-RELEASE` (BLOCKED) | Reliable first browser-local release with accessibility, security, export, recovery, dependency and provenance evidence | Issues [#118](https://github.com/Rofikali/design-platform/issues/118), [#82](https://github.com/Rofikali/design-platform/issues/82), [#85](https://github.com/Rofikali/design-platform/issues/85), physical print and release approval |
| P2 business | **DP-M5-BIZ-01**; `DP-M5-BIZ` (PLANNED) | Observe teachers and shop users, validate retention, export success, support expectations and possible paid tier | Consent/privacy, evidence not invented revenue; finance go/no-go |
| DEFERRED | Team/cloud/API/desktop collaboration | Optional secure sync, multi-user roles, API or signed desktop application | Proven demand + separate ADR for tenancy, privacy, networking, security, cost; not default |

**Roadmap IDs are candidates.** Only one feature may be ACTIVE in `milestone-record.json`. Mark future items PLANNED/BLOCKED until prerequisites, owner authority and evidence permit the next eligible bounded feature. Five OPENED PRs per stable feature is an absolute ceiling, including abandoned/closed attempts; do not rename unfinished work to evade it.

## Complete protected workflow requirements

For every new element or editor interaction, preserve **source document immutability where used, selected element ID, undo/redo and redo-branch rules, save/reopen, JSON import/export, migrations, original template output, page units, accessibility announcements, keyboard interaction, SVG/PNG output, print fallback, TS/Rust/WASM validation parity, privacy and resource limits**. A new variant may require a versioned schema change and a narrow reviewed modification to shared document/rendering code; never claim feature isolation means no shared source edits.

Existing `--` expectations and product interfaces: no backend/database/payment requirement for current local-first tool; no unapproved network fetches, external asset loading, telemetry or cloud document uploads; no video/audio/animation, general collaboration platform, Kubernetes or microservices without owner-approved demand and ADR.

## Development progression and review

1. **Reconcile before coding:** fetch live main, open/closed PRs, exact head/merge SHA, CI/security reviews. As of 22 Nov #165 is merged; any generated `PR_OPEN` line is stale until the source record is reconciled and regenerated.
2. **Finish image authoring feature:** prefer implementation in bounded vertical slices; first design schema contract + validation parity with tests, then editor element operations, then persistence/export and browser regression; include all necessary integrated behavior within at most four remaining feature PRs; close early when accepted. Same PR can contain multiple commits for fixes.
3. **Promote one new candidate:** after image DONE/PARTIAL/BLOCKED, choose the highest-value dependency-unblocked feature; update milestone source record and seven generated views in the substantive feature PR. Proposed order: typography, vector shapes, precision guides, exam-paper print journey, banner presets, direct PDF/print preflight.
4. **Release is separately gated:** running hosted CI is not manual NVDA/VoiceOver, actual printer or local Docker Compose. An owner-approved static/no-cost deployment would require explicit request and check; no unattended publish.
5. **Business learning:** interview teachers/tutors, shops and coaching centers before speculative paid features. Record actual cost, risk, support and dependency/license decisions.

## References: one accountable source per domain

- Execution: [live work board](../../next.md), [milestone record](../engineering/milestone-record.json), [five-PR policy](../engineering/feature-delivery-policy.md), [autopilot runbook](../engineering/hourly-autopilot.md)
- Advanced acceptance: [feature quality/decision matrix](../engineering/advanced-feature-acceptance.md), [seven-level review](../engineering/seven-level-operating-model.md), [CI evidence](../engineering/ci-evidence-policy.md)
- Architecture/data: [system overview](../architecture/system-overview.md), [document editor HLD/LLD](../architecture/document-editor-hld-lld.md), [WASM boundary](../engineering/wasm-boundary.md), [local document persistence](../engineering/local-document-persistence.md)
- Security/quality: [threat model](../security/threat-model.md), [test strategy](../testing/strategy.md), [security issue #118](https://github.com/Rofikali/design-platform/issues/118), [a11y #82](https://github.com/Rofikali/design-platform/issues/82), [print #85](https://github.com/Rofikali/design-platform/issues/85), [layers #158](https://github.com/Rofikali/design-platform/issues/158)
- Finance/product: [business strategy](platform-business-strategy.md), [unit economics](../finance/unit-economics.md), [MVP promise](mvp.md), [README](../../README.md), [AGENTS](../../AGENTS.md), [SKILLS](../../SKILLS.md)

No claim of full SDK, direct PDF, advanced typography, multi-page rendering, product-market fit or release is authorized by this roadmap.
