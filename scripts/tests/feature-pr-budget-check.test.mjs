import test from "node:test";
import assert from "node:assert/strict";
import { validatePrEvent, isGovernanceOnlyPath } from "../feature-pr-budget-check.mjs";

function record() {
  return {
    schema_version: 1, repository: "Rofikali/design-platform", snapshot_date: "2026-11-21",
    reference_main_sha: "a".repeat(40), approval_policy: "HUMAN_REVIEW_REQUIRED",
    now_id: "DP-M3-ALIGN-01", next_ids: ["DP-M3-IMAGE-01"],
    milestones: [
      { id: "DP-M3-ALIGN-01", feature_id: "DP-M3-ALIGN", title: "Alignment", status: "READY", summary: "Next" },
      { id: "DP-M3-IMAGE-01", feature_id: "DP-M3-IMAGE", title: "Images", status: "PLANNED", summary: "Later" },
    ],
    feature_delivery: {
      policy_start: "2026-11-21", max_prs_per_feature: 5, active_feature_id: "DP-M3-ALIGN",
      features: [
        { id: "DP-M3-ALIGN", title: "Alignment", state: "ACTIVE", prs: [160, 161], notes: "Active" },
        { id: "DP-M3-IMAGE", title: "Images", state: "PLANNED", prs: [], notes: "Next" },
        { id: "DP-M3-LAYERS", title: "Layers", state: "CLOSED", outcome: "PARTIAL", prs: [155], notes: "Manual work outstanding" },
      ],
    },
  };
}
function event(id = "DP-M3-ALIGN", num = 161, title = "feat: alignment") {
  return { number: num, pull_request: { number: num, title, body: "Feature-ID: " + id, base: { sha: "a".repeat(40) } } };
}
test("accepts one declared active feature and registered real number", () => {
  const r = record(); assert.equal(validatePrEvent(r, event()), r);
});
test("closed/failed attempts still count, and a sixth registered PR fails", () => {
  assert.throws(() => validatePrEvent(record(), event("DP-M3-ALIGN", 162)), /Actual GitHub PR #162 missing/);
  const r = record(); r.feature_delivery.features[0].prs = [160, 161, 162, 163, 164];
  assert.equal(validatePrEvent(r, event("DP-M3-ALIGN", 164)), r);
  r.feature_delivery.features[0].prs.push(165);
  assert.throws(() => validatePrEvent(r, event("DP-M3-ALIGN", 165)), /Five-PR feature budget exceeded/);
});
test("cannot attach a PR to a planned, closed or unknown feature", () => {
  assert.throws(() => validatePrEvent(record(), event("DP-M3-IMAGE")), /currently active/);
  assert.throws(() => validatePrEvent(record(), event("DP-M3-LAYERS")), /currently active/);
  assert.throws(() => validatePrEvent(record(), event("DP-UNKNOWN")), /Unregistered feature/);
});
test("missing, malformed, duplicated or invalid PR metadata fails", () => {
  const e = event(); e.pull_request.body = "";
  assert.throws(() => validatePrEvent(record(), e), /exactly one/);
  e.pull_request.body = "Feature-ID: DP-M3-ALIGN\nFeature-ID: DP-M3-IMAGE";
  assert.throws(() => validatePrEvent(record(), e), /exactly one/);
  e.pull_request.body = "Feature-ID: bad";
  assert.throws(() => validatePrEvent(record(), e), /Malformed/);
  e.pull_request.body = "Feature-ID : DP-M3-ALIGN";
  assert.throws(() => validatePrEvent(record(), e), /Malformed/);
  e.pull_request.body = "Feature-ID: DP-M3-ALIGN"; e.pull_request.number = 0;
  assert.throws(() => validatePrEvent(record(), e), /Invalid GitHub PR number/);
});
test("ruleset import JSON is a governance-only path", () => {
  assert.equal(isGovernanceOnlyPath(".github/rulesets/autopilot-main-no-human-review.json"), true);
});

test("governance exemption allows only reviewed docs, CI and policy tests", () => {
  const e = event("GOVERNANCE-EXEMPT", 200, "docs(governance): implement budget gate");
  const r = record();
  assert.equal(validatePrEvent(r, e, ["AGENTS.md", "docs/engineering/feature-delivery-policy.md", ".github/workflows/ci.yml"]), r);
  assert.equal(isGovernanceOnlyPath("web/pages/index.vue"), false);
  assert.equal(isGovernanceOnlyPath("docs/security/temporary-picomatch-exception.json"), false);
  assert.throws(() => validatePrEvent(r, e, ["web/pages/index.vue"]), /limited to approved/);
  assert.throws(() => validatePrEvent(r, e, []), /limited to approved/);
  e.pull_request.title = "feat: product";
  assert.throws(() => validatePrEvent(r, e, ["AGENTS.md"]), /docs\(governance\)/);
});
test("main push checks the ledger without inventing a PR number", () => {
  const r = record(); assert.equal(validatePrEvent(r, { ref: "refs/heads/main" }), r);
});

test("governance transition preserves exhausted feature budget across contributors", () => {
  const r = record();
  const previous = r.feature_delivery.features[0];
  previous.prs = [160, 161, 162, 163, 164];
  previous.state = "CLOSED"; previous.outcome = "PARTIAL";
  r.feature_delivery.features[1].state = "ACTIVE";
  r.feature_delivery.active_feature_id = "DP-M3-IMAGE";
  r.now_id = "DP-M3-IMAGE-01"; r.next_ids = [];
  r.milestones[1].status = "READY";
  const governance = event("GOVERNANCE-EXEMPT", 200, "docs(governance): reconcile exhausted feature");
  assert.equal(validatePrEvent(r, governance, ["docs/engineering/milestone-record.json", "next.md", "scripts/tests/feature-pr-budget-check.test.mjs"]), r);
  assert.throws(() => validatePrEvent(r, event("DP-M3-ALIGN", 201)), /currently active/);
  assert.throws(() => validatePrEvent(r, event("DP-M3-IMAGE", 202)), /Actual GitHub PR #202 missing/);
});
