import test from "node:test";
import assert from "node:assert/strict";
import { evaluateAudit, validateException } from "../temporary-security-audit.mjs";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const policyPath = fileURLToPath(new URL("../../docs/security/temporary-picomatch-exception.json", import.meta.url));
const policy = JSON.parse(readFileSync(policyPath, "utf8"));
const today = "2026-11-18";
const affected = {
  severity: "high", module_name: "picomatch",
  url: "https://github.com/advisories/GHSA-fc5q-39xc-vjpf",
  patched_versions: "<0.0.0",
};

function report(...advisories) {
  return { advisories: Object.fromEntries(advisories.map((advisory, index) => [index + 1, advisory])) };
}

test("only the exact owner-approved high picomatch advisory is accepted temporarily", () => {
  const result = evaluateAudit(report(affected), policy, today, "development");
  assert.equal(result.waived.length, 1);
  assert.equal(result.expires, "2026-12-02");
});

test("an unrelated high or any critical advisory blocks CI", () => {
  assert.throws(() => evaluateAudit(report(affected, { ...affected, url: "https://github.com/advisories/GHSA-test-1234-5678" }), policy, today), /unaccepted high\/critical/);
  assert.throws(() => evaluateAudit(report({ ...affected, severity: "critical" }), policy, today), /unaccepted high\/critical/);
  assert.throws(() => evaluateAudit(report({ ...affected, module_name: "other-package" }), policy, today), /unaccepted high\/critical/);
});

test("an expired exception or production/release is always denied", () => {
  assert.throws(() => evaluateAudit(report(affected), policy, "2026-12-03"), /exception expired/);
  assert.throws(() => evaluateAudit(report(affected), policy, today, "production"), /production\/release/);
  assert.throws(() => evaluateAudit(report(affected), policy, today, "release"), /production\/release/);
});

test("tampered exception details fail closed", () => {
  assert.throws(() => validateException({ ...policy, expires_on: "2030-01-01" }, today), /modified owner-approved/);
  assert.throws(() => validateException({ ...policy, production_release_authorized: true }, today), /modified owner-approved/);
});

test("missing or malformed audit response never counts as a pass", () => {
  assert.throws(() => evaluateAudit({}, policy, today), /malformed or missing/);
  assert.throws(() => evaluateAudit(report(), policy, today), /tracked advisory no longer reported/);
  assert.throws(() => evaluateAudit(report({ ...affected, severity: "oops" }), policy, today), /unrecognized advisory/);
});

test("published patch range must force removal of the waiver", () => {
  assert.throws(() => evaluateAudit(report({ ...affected, patched_versions: ">=4.0.8" }), policy, today), /upstream patch now indicated/);
});
