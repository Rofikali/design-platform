#!/usr/bin/env node
// Prospective five-opened-PR budget gate; requires no new dependency.
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { validateRecord } from "./sync-milestone-docs.mjs";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const FEATURE_LINE = /^Feature-ID:[ \t]*([A-Z][A-Z0-9-]{2,64})[ \t]*$/;
const SHA = /^[a-f0-9]{40}$/;
const GOVERNANCE_PATHS = new Set([
  "AGENTS.md", "SKILLS.md", "README.md", "next.md",
  ".github/pull_request_template.md", ".github/workflows/ci.yml",
  "docs/engineering/milestone-record.json",
  "scripts/sync-milestone-docs.mjs", "scripts/feature-pr-budget-check.mjs",
  "scripts/tests/sync-milestone-docs.test.mjs",
  "scripts/tests/feature-pr-budget-check.test.mjs",
]);
function requireValid(ok, why) { if (!ok) throw new Error(why); }

export function isGovernanceOnlyPath(path) {
  return GOVERNANCE_PATHS.has(path) || /^docs\/[a-zA-Z0-9/._-]+\.md$/.test(path);
}

export function validatePrEvent(record, event, changedFiles = []) {
  validateRecord(record);
  if (!event?.pull_request) return record;
  const pr = event.pull_request;
  const number = pr.number ?? event.number;
  requireValid(Number.isSafeInteger(number) && number > 0, "Invalid GitHub PR number");
  const body = typeof pr.body === "string" ? pr.body : "";
  const declarations = body.split(/\r?\n/).filter(line => /^Feature-ID\s*:/i.test(line.trim()));
  requireValid(declarations.length === 1, "PR body must have exactly one Feature-ID: ID line");
  const match = FEATURE_LINE.exec(declarations[0]);
  requireValid(Boolean(match), "Malformed Feature-ID: ID declaration");
  const id = match[1];
  if (id === "GOVERNANCE-EXEMPT") {
    requireValid(/^docs\(governance\):/.test(pr.title || ""),
      "Governance exemption requires docs(governance): title and independent review");
    requireValid(Array.isArray(changedFiles) && changedFiles.length > 0 && changedFiles.every(isGovernanceOnlyPath),
      "Governance exemption is limited to approved documentation, CI and governance-test files");
    return record;
  }
  const f = record.feature_delivery.features.find(x => x.id === id);
  requireValid(Boolean(f), "Unregistered feature ID: " + id);
  requireValid(id === record.feature_delivery.active_feature_id && f.state === "ACTIVE",
    "PR must use the currently active feature: " + id);
  requireValid(f.prs.includes(number),
    "Actual GitHub PR #" + number + " missing under feature " + id +
    "; register it in milestone-record.json and regenerate all seven documents");
  return record;
}

export function governanceChangedFiles(baseSha) {
  requireValid(typeof baseSha === "string" && SHA.test(baseSha), "Invalid PR base SHA");
  const result = execFileSync("git", ["diff", "--name-only", "-z", baseSha, "HEAD"],
    { cwd: ROOT, encoding: "utf8" });
  return result.split("\0").filter(Boolean);
}

export function run() {
  const record = JSON.parse(readFileSync(resolve(ROOT, "docs/engineering/milestone-record.json"), "utf8"));
  validateRecord(record);
  if (process.env.GITHUB_EVENT_PATH) {
    const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
    const body = typeof event.pull_request?.body === "string" ? event.pull_request.body : "";
    const exempt = /^Feature-ID:[ \t]*GOVERNANCE-EXEMPT[ \t]*$/m.test(body);
    const paths = event.pull_request && exempt ? governanceChangedFiles(event.pull_request.base?.sha) : [];
    validatePrEvent(record, event, paths);
  }
  console.log("Feature PR budget gate valid (GitHub history must also be reconciled manually).");
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { run(); } catch (e) { console.error("Feature PR budget FAILED: " + e.message); process.exitCode = 1; }
}
