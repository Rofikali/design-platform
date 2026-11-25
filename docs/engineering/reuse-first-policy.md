# Reuse-first engineering and zero-unapproved-spend policy

Owner direction, 25 November 2026. Applies to every engineer, manual agent and hourly autopilot. This policy is not a dependency approval, deployment, release, or completed audit. The canonical milestone record and live PR state select work.

## 1. Architecture and decisions
Native browser primitives first; mature free/open-source libraries second; justified custom code last. Own portable document contracts, product-specific templates, validation, privacy, history, accessibility, user experience and acceptance tests. Delegate commodity shaping, rasterization, codecs and rich text to proven components where justified. Use narrow replaceable adapters (SOLID dependency inversion / hexagonal boundary); maintain clean modular code and HLD/LLD. Never replace working features or import a library's private object model as the canonical document without measured need and rollback evidence. Do not write custom crypto, Unicode shaping, rasterizers, PDF parsers or codecs merely to avoid dependencies.

## 2. Candidate catalogue — evaluation only
| Area | Candidates | Adoption conditions |
| --- | --- | --- |
| Typography | CSS, SVG, Canvas, Intl.Segmenter, font loading API | Native baseline; test spacing, alignment, wrapping, print and export |
| Local fonts | Noto Sans, Noto Sans Bengali, Noto Sans Devanagari | Exact font file/license/hash, glyph and IME coverage for Assamese, Bengali, Hindi, Nepali, Latin; offline loading |
| Rich text | Tiptap open-source core / ProseMirror | Only if mixed runs need it; no paid extensions or cloud collaboration |
| Canvas / shapes | Fabric.js OR Konva.js; SVG first | Isolated prototype if real measured gap; no wholesale rewrite |
| Native text | COSMIC Text; HarfBuzz / FreeType | Defer until native/offline shaping requirement justifies it; evaluate Rust/C bindings only as needed |
| Icons/vector assets | SVG, Lucide or vetted local open assets | Provenance/license, sanitize SVG, accessible labels |
| PDF | Browser print; pdf-lib for generation, PDF.js for viewing | Different roles, verify font embedding, physical page, untrusted input, isolation |
| Images | Native decode/Canvas; vetted codec if needed | Bounded bytes/pixels, signatures, privacy, no remote fetch |
| Tables/grids/layout | Current editor primitives; focused library only for proved gap | Preserve semantic tables, z-order, history and accessibility |
| Templates | Product-owned exam/banner templates; licensed local assets | Provenance and redistribution rights |
| Security/testing/build | Existing Rust/TS validators, pnpm/Cargo, Docker, Vitest, Playwright; evaluate focused accessibility tooling such as axe-core | Never weaken tests, validation or reproducibility |

Official upstream starting points (verify exact version and LICENSE/NOTICE, not an approved allowlist): [Noto](https://fonts.google.com/noto), [Fabric](https://fabricjs.com/), [Konva](https://konvajs.org/), [Tiptap](https://tiptap.dev/), [COSMIC Text](https://github.com/pop-os/cosmic-text), [HarfBuzz](https://harfbuzz.github.io/), [FreeType](https://freetype.org/), [pdf-lib](https://pdf-lib.js.org/), [PDF.js](https://mozilla.github.io/pdf.js/), [Lucide](https://lucide.dev/). Prefer permissive MIT/Apache-2.0/BSD and OFL fonts after exact artifact and transitive license review. Check commercial feature boundaries, dual-license choices, notices, redistribution and modifications. Not legal advice or a certification.

## 3. Future jobs / moves / acceptance
| ID | Priority and feature ownership | Bounded deliverable and exit gate |
| --- | --- | --- |
| REUSE-01 | NOW: DP-M3-TYPO | Finish PR #175; apply rustfmt log corrections and exact-head CI; review v7 rollback and actual browser evidence; no mid-PR library switch |
| REUSE-02 | Next typography slice | Native line/letter spacing, alignment and wrapping comparison; preserve old defaults/v7, validate finite bounds, Rust/TS/WASM and DOM/SVG/PNG/print fixtures |
| REUSE-03 | Typography acceptance | Local Noto font evaluation: exact assets/license/hash, Indic grapheme/IME/glyph fixtures, cold/offline loading, PNG/PDF and bundle measurements; only ship approved necessary assets |
| REUSE-04 | Conditional rich-text scope | Compare native editing with bounded Tiptap/ProseMirror prototype for mixed runs; preserve IME, keyboard, history, portable JSON and export; no paid extensions |
| REUSE-05 | Existing vector/precision feature IDs | Native SVG baseline; compare one Fabric or Konva adapter only for measurable gaps in selection, hit testing, layout or rendering; same fixtures, rollback, no rewrite |
| REUSE-06 | Existing asset/template roadmap | Local icons/shapes/templates; provenance, license inventory, sanitized input and accessible names |
| REUSE-07 | Existing PDF/export roadmap | Evaluate generation and viewing separately; print dimensions, embedded font rights, malicious inputs, memory bounds |
| REUSE-08 | Existing raster/asset roadmap | Compare native decode with vetted codecs only when needed; preserve prior image closure and safety |
| REUSE-09 | Deferred native/desktop | COSMIC Text vs HarfBuzz/FreeType multilingual benchmark on Ubuntu/Docker; ABI/FFI only when justified by ADR |
| REUSE-10 | Ongoing per dependency | SBOM, notices, license/security review, measured baseline, cost/upgrade/removal evidence |

All tasks belong to existing stable feature IDs where applicable, not ten new PR entitlements. All opened PRs across authors, including abandoned/closed, count toward the same five-PR feature ceiling. Never reset or rename to evade it. Resume existing live PR first; at cap record DONE/PARTIAL/BLOCKED and gaps; move only to genuinely independent approved work. No existing working features are to be rewritten merely for reuse. Do not install candidates en masse.

## 4. Seven-level engineering adoption gate
L1 reproduce concrete problem and native baseline. L2 minimal safe adapter, errors and tests. L3 compare alternatives, modular interfaces and reproducibility. L4 cross-boundary schema compatibility, rollback, a11y, history and rendering. L5 HLD/LLD, dependency inversion, trust boundaries and system tests. L6 product/SRE/upgrade ownership, dependency risk, measured total cost. L7 strategy, portability, business value and release decision. These are review lenses, not independent reviewers or professional credentials.

Per candidate record ADR with problem, user outcome, baseline and alternatives; exact artifact version/hash, official license and transitive obligations; security advisories/provenance; bundle and runtime measurements; adapter interface, tests and rollback; economic estimate, owner approval needs and ADOPT/TRIAL/DEFER/REJECT decision. No approval based solely on popularity. Prefer one library at a time; no duplicate rendering stacks without justified evidence.

## 5. CISSP / supply-chain and privacy
Lock exact dependency versions, review lockfiles, verify provenance and known advisories, maintain SBOM and third-party notices when applicable. Restrict arbitrary CSS/HTML/SVG, remote font URLs, untrusted images/PDF and input sizes; fail closed on invalid document/style data. WASM is not a security boundary. No external telemetry or actual customer documents in logs. Test corrupt fonts, malformed assets, resource exhaustion, CSP and fallback; isolate risky parsers if introduced. Never bypass CI or claim security/compliance from docs alone.

## 6. CCIE / Linux / SRE
No mandatory outbound font/CDN requests, external API, DNS/TLS dependency or backend. Local versioned assets, lazy loading, caching and offline fallback. Future optional deployment requires reviewed flows, CSP connect/font/img sources, TLS, egress and cache limits. Ubuntu 24.04/Docker reproducibility, pinned toolchain, resource bounds, upgrade/rollback. Benchmark same hardware, fixture and build: compressed JS/WASM/font bytes, cold/warm load, p50/p95 edit/export latency, CPU, peak memory, requests and visual correctness across supported browsers. Set limits from measured baseline; never claim nanosecond speed or manual Linux/Compose/device results not run.

## 7. CA / MBA / management
Target INR 0 incremental license fees, royalties, mandatory subscriptions, paid APIs and additional mandatory backend charges; no paid/trial-only service, paid extension, payment method, telemetry, account creation, publication or spending without explicit owner approval. Free tiers can change; no unlimited hosting guarantee. Track 12-month TCO: engineering hours x opportunity-cost rate, integration, legal/license notices, CI, storage/bandwidth, upgrade, support and replacement. Compare native/reuse/custom build; measure exam/banner creation time, successful exports, support burden and retention. No invented savings/revenue/ROI; contribution margin and break-even require observed data. Stop when measurable value fails or costs exceed approval. Record residual risks and decision owner.

## 8. Documentation and gates
Keep AGENTS.md, SKILLS.md, README.md, next.md, canonical milestone record and seven generated views consistent; link scoped architecture/security/testing/CI/Linux/SRE/network/finance docs or record N/A. Exact-head CI and integration checks are separate; local NOT RUN is not PASS. This policy installs no dependencies or font assets and authorizes no release. See [feature policy](feature-delivery-policy.md), [acceptance](advanced-feature-acceptance.md), [HLD/LLD](../architecture/document-editor-hld-lld.md), [security](../security/threat-model.md), [testing](../testing/strategy.md), [finance](../finance/unit-economics.md), [operations](../operations/release-readiness.md), [roadmap](../product/advanced-feature-roadmap.md).
