# Unit Economics and Cost Controls

## Advanced-feature investment checkpoint

Use the [new candidate roadmap](../product/advanced-feature-roadmap.md) and [engineering/business acceptance](../engineering/advanced-feature-acceptance.md) to compare user-facing value, implementation/review/CI cost, third-party font/PDF licenses, privacy exposure and ongoing support. Browser-local typography/shapes/guides may have lower variable hosting cost than cloud sync, billing or server PDF. No speculative margin or rupee price is evidence. No paid infrastructure without an explicit owner decision.

## Purpose
Keep the product financially sustainable while validating whether users value the editor. These are measurement rules, not forecasts or proof of profitability.

## Measure from the first usable prototype
- Successful exports per active user.
- Export failure rate and retry count.
- Median and high-percentile export latency.
- CPU time, peak memory, temporary disk, and output bytes per export.
- Storage and egress per retained document/asset.
- Support time per active customer.
- Returning users and repeat exports.
- Conversion to paid usage only after pricing is tested.

## Cost per successful export
Estimate a fully loaded variable cost:

`cost per successful export = (compute + storage + egress + variable third-party fees) / successful exports`

State the measurement period and allocation method. Keep fixed costs such as domain and baseline hosting separate, then calculate contribution margin after variable costs.

## Pricing experiments
- Interview teachers/tutors and shop owners before assuming willingness to pay.
- Test whether users value export quality, saved templates, convenience, or commercial usage.
- Avoid unlimited export promises until resource use and abuse controls are understood.
- Introduce a paid tier only after the core workflow works and there is evidence of repeat value.

## Financial dashboard
Track:
- Revenue, refunds, taxes/fees, and payment-provider costs.
- Active and returning users.
- Free-to-paid conversion and churn, if subscriptions are introduced.
- Contribution margin and cost per successful export.
- Customer acquisition cost only when acquisition spend is measurable.
- Support burden and export-related complaints.

## Decision discipline
Do not confuse revenue with profit, downloads with active users, or sign-ups with product-market fit. Make scale and pricing decisions from observed data, not optimistic assumptions.
