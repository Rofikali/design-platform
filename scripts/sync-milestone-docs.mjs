import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SOURCE = "docs/engineering/milestone-record.json";
export const TARGETS = Object.freeze([
  { path: "AGENTS.md", view: "compact" },
  { path: "SKILLS.md", view: "compact" },
  { path: "README.md", view: "compact" },
  { path: "next.md", view: "detailed" },
  { path: "docs/engineering/decision-status-register.md", view: "detailed" },
  { path: "docs/engineering/agent-continuation-runbook.md", view: "compact" },
  { path: "docs/engineering/hourly-autopilot.md", view: "compact" },
]);
const START = "<!-- milestone-sync:start -->";
const END = "<!-- milestone-sync:end -->";
const STATES = new Set(["PLANNED", "READY", "IN_PROGRESS", "PR_OPEN", "CI_PENDING", "BLOCKED", "MERGED", "RELEASED", "DEFERRED"]);
const SHA = /^[a-f0-9]{40}$/;
const ID = /^[A-Z][A-Z0-9-]{2,64}$/;
const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const fail = message => { throw new Error(message); };
const clean = s => s.replace(/\s+/g, " ").replace(/\|/g, "\\|").trim();

export function validateRecord(r) {
  if (!r || typeof r !== "object" || Array.isArray(r)) fail("Record must be an object");
  if (r.schema_version !== 1 || r.repository !== "Rofikali/design-platform") fail("Unsupported milestone schema/repository");
  if (typeof r.snapshot_date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(r.snapshot_date) ||
      !Number.isFinite(Date.parse(r.snapshot_date + "T00:00:00Z"))) fail("Invalid snapshot_date");
  if (!SHA.test(r.reference_main_sha)) fail("Invalid reference_main_sha");
  if (!["HUMAN_REVIEW_REQUIRED", "OWNER_APPROVED_GATED_MERGE"].includes(r.approval_policy)) {
    fail("Unknown merge authorization policy; unverified automatic merging is prohibited");
  }
  if (!Array.isArray(r.milestones) || r.milestones.length < 1 || r.milestones.length > 100) fail("Invalid milestone list");
  const seen = new Set();
  for (const m of r.milestones) {
    if (!m || typeof m !== "object" || !ID.test(m.id) || seen.has(m.id)) fail("Duplicate or invalid milestone ID");
    seen.add(m.id);
    for (const key of ["title", "summary"]) {
      if (typeof m[key] !== "string" || !m[key].trim() || m[key].length > 280 ||
          /[\r\n<>]/.test(m[key])) fail("Invalid milestone " + key + ": " + m.id);
    }
    if (!STATES.has(m.status)) fail("Unknown milestone status: " + m.id);
    if (m.pr !== undefined && (!Number.isSafeInteger(m.pr) || m.pr < 1)) fail("Invalid PR number: " + m.id);
    if (m.issue !== undefined && (!Number.isSafeInteger(m.issue) || m.issue < 1)) fail("Invalid issue number: " + m.id);
    if (m.sha !== undefined && !SHA.test(m.sha)) fail("Invalid commit SHA: " + m.id);
    if (m.status === "MERGED" && (!m.pr || !m.sha)) fail("Merged milestones require PR and merge SHA: " + m.id);
    if (m.status === "PR_OPEN" && (!m.pr || !m.sha)) fail("PR_OPEN requires PR and exact observed head: " + m.id);
  }
  if (!seen.has(r.now_id) || !Array.isArray(r.next_ids) ||
      r.next_ids.some(id => !seen.has(id) || id === r.now_id) ||
      new Set(r.next_ids).size !== r.next_ids.length) fail("Invalid NOW/NEXT references");
  const now = r.milestones.find(m => m.id === r.now_id);
  if (["MERGED", "RELEASED", "DEFERRED"].includes(now.status)) fail("NOW must be actionable, not completed/deferred");
  return r;
}

function reference(m) {
  const pr = m.pr ? " [PR #" + m.pr + "](https://github.com/Rofikali/design-platform/pull/" + m.pr + ")" : "";
  const issue = m.issue ? " [Issue #" + m.issue + "](https://github.com/Rofikali/design-platform/issues/" + m.issue + ")" : "";
  return pr + issue;
}

export function renderGeneratedBlock(record, view) {
  const r = validateRecord(record);
  if (view !== "compact" && view !== "detailed") fail("Unknown generated view");
  const now = r.milestones.find(m => m.id === r.now_id);
  const next = r.next_ids.map(id => r.milestones.find(m => m.id === id));
  const out = [
    START,
    "<!-- GENERATED from " + SOURCE + " by scripts/sync-milestone-docs.mjs. DO NOT EDIT. -->",
    "### Milestone snapshot (generated: " + r.snapshot_date + ")",
    "",
    "**Reference main:** " + r.reference_main_sha + " (dated snapshot; re-check live GitHub before acting).",
    "",
    "**NOW:** **" + clean(now.id) + " — " + clean(now.title) + "** [" + now.status + "]." + reference(now),
    "",
    "**NEXT:** " + (next.length ? next.map(m => clean(m.id) + " [" + m.status + "]" + reference(m)).join("; ") : "None recorded."),
    "",
    r.approval_policy === "OWNER_APPROVED_GATED_MERGE"
      ? "**Review gate:** Owner-authorized autopilot may review and merge only after all exact-head/integration CI, security, branch protection and required independent-review gates pass. No automatic publishing or deployment."
      : "**Review gate:** A human reviews and manually merges each PR. No automated merges, publishing or deployments.",
  ];
  if (view === "detailed") {
    out.push("", "| Milestone | Status | PR / issue | Verified scope (not a live CI claim) |",
      "| --- | --- | --- | --- |");
    for (const m of r.milestones) {
      out.push("| " + clean(m.id + " — " + m.title) + " | " + m.status +
        " | " + (reference(m).trim() || "—") + " | " + clean(m.summary) + " |");
    }
  }
  out.push("", END);
  return out.join("\n");
}

export function synchronizeDocument(markdown, block) {
  const start = markdown.indexOf(START);
  const end = markdown.indexOf(END);
  if (start < 0 || end < 0 || end <= start ||
      markdown.indexOf(START, start + START.length) !== -1 ||
      markdown.indexOf(END, end + END.length) !== -1) {
    fail("Expected exactly one ordered generated-section marker pair in each document");
  }
  return markdown.slice(0, start) + block + markdown.slice(end + END.length);
}

export function run(check = false) {
  const record = validateRecord(JSON.parse(readFileSync(resolve(root, SOURCE), "utf8")));
  const stale = [];
  for (const target of TARGETS) {
    const path = resolve(root, target.path);
    const existing = readFileSync(path, "utf8");
    const expected = synchronizeDocument(existing, renderGeneratedBlock(record, target.view));
    if (expected !== existing) {
      stale.push(target.path);
      if (!check) writeFileSync(path, expected, "utf8");
    }
  }
  if (check && stale.length) {
    console.error("Stale milestone generated sections:\n" + stale.map(x => " - " + x).join("\n"));
    console.error("Run: node scripts/sync-milestone-docs.mjs");
    process.exitCode = 1;
  } else {
    console.log((check ? "Verified" : "Synchronized") + " " + TARGETS.length + " milestone documents" +
      (stale.length ? " (" + stale.length + " updated)" : " (already current)"));
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length === 1 && args[0] !== "--check")) {
    console.error("Usage: node scripts/sync-milestone-docs.mjs [--check]");
    process.exitCode = 2;
  } else {
    try { run(args[0] === "--check"); }
    catch (error) { console.error(error.message); process.exitCode = 1; }
  }
}
