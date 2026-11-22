# Design Platform — Product, Free/Paid and Business Strategy

**Status:** Business/product proposal, not approved prices, launched subscriptions, customer-demand proof or a production launch. This is adapted from imgengine's product/finance strategy, **not** its native-C image pipeline. Authority: [MVP](mvp.md), [next](../../next.md), [unit economics](../finance/unit-economics.md), [seven-level model](../engineering/seven-level-operating-model.md).

## Owner-requested advanced product options (2026-11-22)

See the [advanced editor feature roadmap](advanced-feature-roadmap.md), [engineering acceptance gates](../engineering/advanced-feature-acceptance.md), [unit economics](../finance/unit-economics.md) and [live NOW](../../next.md). Propose advanced typography, vector shapes, precise guides and native local asset/template blocks first; exam-paper multi-page/question workflows, shop banner price/brand components and direct PDF/print preflight follow on validated user jobs. Current DP-M3-IMAGE is still in progress, with only PR #165's resource guard merged. These are **cost and product hypotheses**, not implemented features, approved paid tiers, revenue or market validation.

CA/MBA/management review must distinguish one-off dev/CI and review effort from variable export/storage/support, finance/legal/privacy/license obligations and potential paid-hosting risk. Prefer zero-surprise local-first operations; no SaaS, external uploads, telemetry, accounts, billing or paid infrastructure without a separate owner-approved business/security decision. Track successful first export, print fidelity, repeat use and interview outcomes, not invented pricing or ROI.

## Product decision: one good editor for real jobs first

Initial jobs:
- **Teachers/tutors:** create printable A4 exam papers with editable text, marks, questions and eventually semantic tables.
- **Shops/service centres:** produce reusable banners, notices and price lists with reliable dimensions and printing.
- **Coaching centres:** reuse classroom assessment designs without re-entering information.

These are customer hypotheses. Do not describe them as validated demand or invent paid customers. Interview and observe users, their printing habits, current costs, real error frequency, and willingness to pay.

**Not now:** audio, video, animation, generalized spreadsheets, generative asset marketplace, real-time team collaboration, native mobile apps, Kubernetes, ad monetization or a large multi-service system.

## Three stages of product-market learning

| Stage | User-visible offer | Infrastructure | Decision gate |
| --- | --- | --- | --- |
| 0 — Reliable local editor | Templates, bounded shapes/frames/grids, JSON save/reopen, PNG and browser print | Nuxt + Rust/WASM, localStorage (not backup) | Successful complete exam-paper/banner workflows |
| 1 — Professional workflow | Semantic tables, typography, layers, image elements, reliable PDF, templates and accessibility | Browser-first; no accounts by default | Returning users, successful real printing/export, qualitative demand |
| 2 — Paid workflow (proposal) | Brand kits, reusable business templates, batch/advanced print, optional secure sync | Rust/Axum API + storage only if customers need it | Measured willingness to pay, privacy/security and positive contribution |
| 3 — Teams/API/desktop (deferred) | Shared organizational assets, automation API, signed offline desktop | Separate ADRs for tenancy, billing, support and native packaging | Demonstrated retained usage and sustainable operations |

Features in future stages are **not implemented** merely because they appear here.

## Free and paid packaging hypotheses

| Tier | Possible value | Restrictions / transparency |
| --- | --- | --- |
| Free local | Basic editor, local templates, JSON download, standard export | Local documents can be lost; no server backup; clear browser limits |
| Paid Pro (future) | Advanced print/export, reusable presets/brand assets, professional templates | No payment integration until commercial/security approval |
| School/Business (future) | Shared templates and multi-user controls | Requires role-based access, tenancy, privacy and retention policy |
| API (later) | Validated document rendering/automation | Separate API contract, quotas, abuse prevention and pricing |
| Desktop (optional) | Offline design at shop/school | Packaging, code signing, update policy and support costs |

**Do not select a rupee price from guesswork.** Test several offers with real users and calculate transaction/hosting/support costs.

## Customer research and product metrics

Before adding major functionality, observe at least several users from each primary segment and document recruitment bias. Measure:
- First useful export completion and time to first value.
- Export correctness and printer success; failure and retry rate.
- Repeat visits/designs and retention (privacy-preserving collection only).
- Accessibility completion, perceived friction, support requests.
- Willingness to pay for *specific repeatable value*, not generic enthusiasm.

Any telemetry that sends personal document content off-device needs explicit product/privacy approval. Do not assume local browser functionality implies a cloud tracking permission.

## Finance: CA/MBA view

```text
Gross profit = Revenue - direct cost of services
Contribution per paying user = Net revenue/user - variable user cost
Operating profit = Gross profit - operating expenses
Break-even paying users = Monthly fixed costs / contribution per paying user
Cash runway = Available cash / monthly net cash outflow
```

Use measured, dated data and disclose assumptions. Separate:
- Variable: server export CPU, bytes stored/egressed, payment fees, support per export and licensed assets.
- Fixed: domain, base hosting, tooling, administration and minimum storage.
- Working-capital/cash: payout delays, refunds, subscriptions, bills and taxes.
- Liability: public commitments, copyright/font licensing, paid template rights, data breach response and refunds.

Do not confuse revenue with cash received, downloads with retained users, or zero infrastructure bill with zero business cost.

## Infrastructure, commercial and privacy decision gates

- Continue using the public repository's standard GitHub Actions allowance policy and avoid unnecessary reruns. Maintain a $0 budget protection if the owner wants zero overage.
- Avoid claims of guaranteed forever-free VPS; verify current official cloud terms before signup.
- Do not add server databases or persistent user assets without an owner-approved data lifecycle and tested backup/restore.
- Payment provider, GST/invoicing, copyright and consumer/privacy obligations require applicable professional legal/tax review before a paid launch.
- Compare build versus buy and include maintenance burden in total cost of ownership.

## Prioritization rule

Fix a verified data-loss/unsafe import/export issue first; then finish core accessibility/reliability; then semantic tables; then typography and printing. Add paid infrastructure **only after** repeated value is observed. Record decisions in [decision register](../engineering/decision-status-register.md) and [next](../../next.md).
