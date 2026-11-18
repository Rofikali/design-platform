import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const POLICY_PATH = resolve(root, "docs/security/temporary-picomatch-exception.json");
const EXPECTED_ID = "GHSA-fc5q-39xc-vjpf";
const VALID_SEVERITIES = new Set(["info", "low", "moderate", "high", "critical"]);

function fail(reason) { throw new Error("Security audit NOT approved: " + reason); }

export function validateException(policy, today = new Date().toISOString().slice(0, 10), environment = "development") {
  if (!policy || typeof policy !== "object" || Array.isArray(policy) ||
      policy.schema_version !== 1 || policy.decision !== "TEMPORARY_NONPRODUCTION_RISK_ACCEPTANCE" ||
      policy.advisory !== EXPECTED_ID || policy.cve !== "CVE-2026-112366" || policy.package !== "picomatch" ||
      policy.owner_approval_date !== "2026-11-18" || policy.expires_on !== "2026-12-02" ||
      policy.production_release_authorized !== false ||
      policy.scope !== "Development and CI only; no production deployments or customer data" ||
      policy.tracking_issue !== "https://github.com/Rofikali/design-platform/issues/118") {
    fail("missing or modified owner-approved exception policy");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today) || today < policy.owner_approval_date || today > policy.expires_on) {
    fail("exception expired or not yet active (allowed through " + policy.expires_on + " UTC)");
  }
  if (environment === "production" || environment === "release") {
    fail("production/release requires a clean, unwaived security audit");
  }
  return policy;
}

function advisoryId(a) {
  if (typeof a.github_advisory_id === "string") return a.github_advisory_id;
  if (typeof a.url === "string") return a.url.match(/\bGHSA-[a-z0-9-]+\b/i)?.[0] ?? null;
  return null;
}

export function evaluateAudit(rawReport, policy, today, environment) {
  validateException(policy, today, environment);
  if (!rawReport || typeof rawReport !== "object" || Array.isArray(rawReport) ||
      !rawReport.advisories || typeof rawReport.advisories !== "object" || Array.isArray(rawReport.advisories)) {
    fail("malformed or missing pnpm audit advisories; cannot infer a clean audit");
  }
  const advisories = Object.values(rawReport.advisories);
  const waived = [];
  const blocking = [];
  for (const a of advisories) {
    if (!a || typeof a !== "object" || Array.isArray(a) ||
        !VALID_SEVERITIES.has(a.severity)) fail("unrecognized advisory or severity");
    if (a.severity !== "high" && a.severity !== "critical") continue;
    const id = advisoryId(a);
    const moduleName = a.module_name;
    if (id === policy.advisory && moduleName === policy.package && a.severity === "high") {
      if (typeof a.patched_versions === "string" &&
          a.patched_versions !== "<0.0.0" && a.patched_versions !== "") {
        fail("upstream patch now indicated (" + a.patched_versions + "); remove exception and upgrade");
      }
      waived.push({ id, package: moduleName });
    } else {
      blocking.push({ id: id ?? "unidentified", package: moduleName ?? "unknown", severity: a.severity });
    }
  }
  if (blocking.length) fail("unaccepted high/critical advisories: " + JSON.stringify(blocking));
  if (!waived.length) fail("tracked advisory no longer reported; remove exception and restore strict audit");
  return { waived, expires: policy.expires_on };
}

export function runAudit() {
  const policy = JSON.parse(readFileSync(POLICY_PATH, "utf8"));
  const today = new Date().toISOString().slice(0, 10);
  const environment = process.env.DEPLOYMENT_ENV || (process.env.GITHUB_EVENT_NAME === "release" ? "release" : "development");
  validateException(policy, today, environment);
  const result = spawnSync("pnpm", ["audit", "--prod", "--audit-level", "high", "--json"], {
    cwd: resolve(root, "web"), encoding: "utf8", timeout: 90_000, maxBuffer: 8 * 1024 * 1024,
  });
  if (result.error || result.status !== 1) {
    fail("raw pnpm audit did not return an expected vulnerability exit status (status=" + result.status + ", error=" + (result.error?.message || "none") + ")");
  }
  let report;
  try { report = JSON.parse(result.stdout); }
  catch { fail("pnpm audit did not return valid JSON; registry or command may have failed"); }
  const decision = evaluateAudit(report, policy, today, environment);
  console.warn("TEMPORARY SECURITY EXCEPTION, NOT A CLEAN AUDIT: " + policy.advisory + " (" + policy.package + ")");
  console.warn("Owner accepted nonproduction risk through " + decision.expires + " UTC only; " + decision.waived.length + " matching finding(s).");
  console.warn("The original pnpm audit EXITED 1. Other high/critical findings remain blocking. Production release is NOT authorized.");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { runAudit(); }
  catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; }
}
