import test from "node:test";
import assert from "node:assert/strict";
import { TARGETS, validateRecord, renderGeneratedBlock, synchronizeDocument } from "../sync-milestone-docs.mjs";

function fixture() {
  return {
    schema_version: 1,
    repository: "Rofikali/design-platform",
    snapshot_date: "2026-11-17",
    reference_main_sha: "a".repeat(40),
    approval_policy: "HUMAN_REVIEW_REQUIRED",
    now_id: "DP-M1-ACC-03",
    next_ids: ["DP-M1-ACC-02"],
    feature_delivery: {
      policy_start: "2026-11-21",
      max_prs_per_feature: 5,
      active_feature_id: "DP-M1-ACC",
      features: [{ id: "DP-M1-ACC", title: "Accessibility", state: "ACTIVE", prs: [115], notes: "Test fixture" }],
    },
    milestones: [
      { id: "DP-M1-ACC-03", feature_id: "DP-M1-ACC", title: "Keyboard operation", status: "PR_OPEN", pr: 115, sha: "b".repeat(40), summary: "Pending human review" },
      { id: "DP-M1-ACC-02", title: "Manual audit", status: "BLOCKED", issue: 82, summary: "Manual evidence required" },
    ],
  };
}

test("the generator owns exactly seven distinct documents", () => {
  assert.equal(TARGETS.length, 7);
  assert.equal(new Set(TARGETS.map(t => t.path)).size, 7);
  assert.deepEqual(TARGETS.map(t => t.view), ["compact", "compact", "compact", "detailed", "detailed", "compact", "compact"]);
});

test("one structured source creates stable compact and detailed sections", () => {
  const record = fixture();
  const detailed = renderGeneratedBlock(record, "detailed");
  const compact = renderGeneratedBlock(record, "compact");
  assert.match(compact, /DP-M1-ACC-03/);
  assert.match(detailed, /Manual evidence required/);
  assert.doesNotMatch(compact, /Manual evidence required/);
  assert.match(detailed, /A human reviews and manually merges/);
  assert.equal(detailed, renderGeneratedBlock(record, "detailed"));
});

test("a changed milestone makes existing generated sections stale", () => {
  const doc = "Human-written intro\n\n" + renderGeneratedBlock(fixture(), "detailed") + "\n\nHuman-written outro\n";
  assert.equal(synchronizeDocument(doc, renderGeneratedBlock(fixture(), "detailed")), doc);
  const updated = fixture();
  updated.milestones[0].title = "Keyboard workflow reviewed";
  const result = synchronizeDocument(doc, renderGeneratedBlock(updated, "detailed"));
  assert.notEqual(result, doc);
  assert.match(result, /Keyboard workflow reviewed/);
  assert.match(result, /Human-written intro/);
  assert.match(result, /Human-written outro/);
  assert.equal(synchronizeDocument(result, renderGeneratedBlock(updated, "detailed")), result);
});

test("the guard rejects removed, duplicated and unordered generated markers", () => {
  const block = renderGeneratedBlock(fixture(), "compact");
  assert.throws(() => synchronizeDocument("Nothing here", block), /exactly one/);
  assert.throws(() => synchronizeDocument("<!-- milestone-sync:end -->\n<!-- milestone-sync:start -->", block), /exactly one/);
  assert.throws(() => synchronizeDocument(block + "\n" + block, block), /exactly one/);
});

test("scoped owner authorization allows gated PR merges without publishing", () => {
  const record = fixture();
  record.approval_policy = "OWNER_APPROVED_GATED_MERGE";
  const block = renderGeneratedBlock(record, "compact");
  assert.match(block, /Owner-authorized autopilot may review and merge only after all exact-head\/integration CI/);
  assert.match(block, /zero mandatory human approvals/);
  assert.match(block, /Never present self-review as independent approval/);
  assert.match(block, /No automatic publishing or deployment/);
  assert.doesNotMatch(block, /No automated merges/);
});

test("snapshot dates must exist on the calendar, including leap-day boundaries", () => {
  for (const invalidDate of ["2026-02-29", "2026-02-31", "2026-04-31", "2026-13-01"]) {
    const record = fixture();
    record.snapshot_date = invalidDate;
    assert.throws(() => validateRecord(record), /Invalid snapshot_date/, invalidDate);
  }
  const leapDay = fixture();
  leapDay.snapshot_date = "2024-02-29";
  assert.equal(validateRecord(leapDay), leapDay);
});

test("malformed records and unsafe merge policy fail before generation", () => {
  const mergedNow = fixture();
  mergedNow.milestones[0].status = "MERGED";
  assert.throws(() => validateRecord(mergedNow), /NOW must be actionable/);
  const wrongPolicy = fixture();
  wrongPolicy.approval_policy = "AUTO_MERGE";
  assert.throws(() => validateRecord(wrongPolicy), /prohibited/);
  const repeatedId = fixture();
  repeatedId.milestones[1].id = repeatedId.now_id;
  assert.throws(() => validateRecord(repeatedId), /Duplicate/);
  const invalidSha = fixture();
  invalidSha.milestones[0].sha = "bad";
  assert.throws(() => validateRecord(invalidSha), /commit SHA/);
});

test("feature budget is generated and bounded at five distinct PRs", () => {
  const r = fixture();
  assert.match(renderGeneratedBlock(r, "compact"), /1\/5 PRs recorded/);
  r.feature_delivery.features[0].prs = [1, 2, 3, 4, 5];
  assert.equal(validateRecord(r), r);
  r.feature_delivery.features[0].prs.push(6);
  assert.throws(() => validateRecord(r), /Five-PR feature budget exceeded/);
});

test("feature IDs, ownership, active state and PR uniqueness are validated", () => {
  const r = fixture();
  r.feature_delivery.features.push({ id: "DP-NEXT", title: "Next", state: "PLANNED", prs: [115], notes: "Next work" });
  assert.throws(() => validateRecord(r), /Duplicate or invalid feature PR/);
  r.feature_delivery.features[1].prs = [];
  r.feature_delivery.active_feature_id = "DP-NEXT";
  r.feature_delivery.features[0].state = "PLANNED";
  assert.throws(() => validateRecord(r), /Active feature must have ACTIVE state/);
  r.feature_delivery.features[1].state = "ACTIVE";
  assert.throws(() => validateRecord(r), /NOW must belong to active feature/);
});

test("closed features require an explicit final result", () => {
  const r = fixture();
  r.feature_delivery.features.push({ id: "DP-CLOSED", title: "Old feature", state: "CLOSED", prs: [99], notes: "Partially accepted" });
  assert.throws(() => validateRecord(r), /Closed feature requires/);
  r.feature_delivery.features[1].outcome = "PARTIAL";
  assert.equal(validateRecord(r), r);
  r.feature_delivery.features[1].outcome = "UNVERIFIED";
  assert.throws(() => validateRecord(r), /Closed feature requires/);
  r.feature_delivery.features[1].outcome = "DONE";
  r.feature_delivery.features[0].outcome = "DONE";
  assert.throws(() => validateRecord(r), /Only CLOSED features/);
});
