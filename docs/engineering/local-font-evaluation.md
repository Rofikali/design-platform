# REUSE-03 local font evaluation — bounded fifth typography slice

Status: **candidate research verified, font adoption deferred**. 25 November 2026. The current browser-local generic font stacks remain unchanged. No font binaries, new libraries, CDN requests, paid services or subscriptions are added.

## Pinned upstream evidence

Google Fonts catalogue snapshot [83c62e3](https://github.com/google/fonts/tree/83c62e30d87daa70216dab6b984d00d20d96d585/ofl). METADATA.pb and OFL.txt for each family were read at this exact commit. The upstream metadata lists the following release archives and language tags; this is not a direct binary inspection or proof of glyph coverage.

| Candidate | Upstream release in metadata | Source commit | Relevant language tags | Evidence |
| --- | --- | --- | --- | --- |
| Noto Sans | v2.015 | c4a321e123e4d4ff315f57f4e0adf294fe3a95be | en_Latn (also hi_Deva/ne_Deva declared) | [metadata](https://github.com/google/fonts/blob/83c62e30d87daa70216dab6b984d00d20d96d585/ofl/notosans/METADATA.pb), [OFL](https://github.com/google/fonts/blob/83c62e30d87daa70216dab6b984d00d20d96d585/ofl/notosans/OFL.txt) |
| Noto Sans Bengali | v3.011 | 85d80394cbbbb798ca0a41c983902e6cf77be3a3 | as_Beng, bn_Beng | [metadata](https://github.com/google/fonts/blob/83c62e30d87daa70216dab6b984d00d20d96d585/ofl/notosansbengali/METADATA.pb), [OFL](https://github.com/google/fonts/blob/83c62e30d87daa70216dab6b984d00d20d96d585/ofl/notosansbengali/OFL.txt) |
| Noto Sans Devanagari | v2.007 | e123d230c160ebe949d731cc19017cdb354180d1 | hi_Deva, ne_Deva | [metadata](https://github.com/google/fonts/blob/83c62e30d87daa70216dab6b984d00d20d96d585/ofl/notosansdevanagari/METADATA.pb), [OFL](https://github.com/google/fonts/blob/83c62e30d87daa70216dab6b984d00d20d96d585/ofl/notosansdevanagari/OFL.txt) |

All three catalogue license files identify SIL OFL 1.1. Candidate Bengali metadata states copyright 2025 but catalogue OFL notice states 2022: reconcile the exact selected binary's notice and upstream release before redistribution, not an accusation of license invalidity. Bengali and Devanagari catalogue metadata list normal variable faces, not separate italic files; synthetic italic and bold require separate fidelity checks. No claim of exact binary hash, asset size, font coverage or release license verification.

## Decision and acceptance

- TRIAL/DEFER: establish the actual current system-font baseline before adopting assets. No user-facing font-family additions, network dependencies, or changed wire formats.
- Cross-browser fixture document-v8-multilingual.json includes English combining acute, Assamese-specific ৰ and ৱ, Assamese/Bengali/Devanagari conjuncts and digits, Hindi and Nepali samples. Actual JSON file input/import through WASM, DOM exact text, JSON download retaining v8 bindings, PNG dimensions and per-language dark ink, no external requests. Ink is not proof of correct glyphs, shaping, font selection, text accessibility, or absence of tofu. Tests written; exact-head CI pending.
- Adoption gates remaining: fetch trusted exact release/font binaries, compute SHA-256 and sizes, inspect cmap and shaping with a vetted tool, reconcile notices, decide licensed unmodified assets/subsetting and reserved font names, benchmark compressed bytes/cold load/memory, test offline cached loading and font readiness, actual SVG-as-image embedded-font behavior (external CSS fonts may not carry into image rendering), PNG/DOM/print parity and native language reviewer/IME. Do not make remote font requests or silently change legacy font stacks.
- Record actual font asset inventory and attribution only when adopted. No paid extensions/services. Incremental dependency and vendor spend INR 0; engineering, test and future distribution costs are not zero. No deployment. If these gates remain unmet at feature cap, close typography PARTIAL with exact residual gaps and advance an independent feature. Do not open a sixth typography PR or relabel incomplete work to evade cap.


### PR #178 cross-browser CI remediation

On exact head ba0136e47bbf7023266dae285e116458d1695660, cross-browser run 45555056217 / job 139004997390 failed after both Chromium template exports passed: the selected English text element had a text span and an aria-hidden resize handle. The test locator incorrectly matched both. Restrict the locator to the canvas text content and assert exactly one match; also require the actual WASM JSON-export announcement. No rendering logic, font asset, acceptance threshold or dependency changed. Corrected-head CI pending; local tests NOT RUN. Remaining glyph, asset provenance, embedding and print gates unchanged.
