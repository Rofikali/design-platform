import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, rmSync, truncateSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { inspectNuxtServerBundle } from "../inspect-nuxt-server-bundle.mjs";

function withBundle(check) {
  const root = mkdtempSync(join(tmpdir(), "nuxt-runtime-audit-"));
  try { check(root); }
  finally { rmSync(root, { recursive: true, force: true }); }
}

test("identifies relevant source signatures and limits output to paths", () => withBundle(root => {
  mkdirSync(join(root, "chunks"));
  writeFileSync(join(root, "index.mjs"), "import p from 'picomatch'; const secret='never-log-this-source';");
  writeFileSync(join(root, "chunks", "engine.js"), "function analyzeRepeatedExtglob() {} const maxExtglobRecursion=3;");
  writeFileSync(join(root, "not-js.txt"), "picomatch");
  const report = inspectNuxtServerBundle(root);
  assert.equal(report.filesScanned, 2);
  assert.equal(report.indicators[0].files.join(","), "index.mjs");
  assert.deepEqual(report.indicators[1].files, ["chunks/engine.js"]);
  assert.deepEqual(report.indicators[2].files, ["chunks/engine.js"]);
  assert.equal(JSON.stringify(report).includes("never-log-this-source"), false);
  assert.match(report.interpretation, /NOT non-reachability proof/);
}));

test("clean text is not misidentified as a safe runtime", () => withBundle(root => {
  writeFileSync(join(root, "app.cjs"), "console.log('hello')");
  const report = inspectNuxtServerBundle(root);
  assert.equal(report.filesScanned, 1);
  assert.equal(report.indicators.every(item => item.files.length === 0), true);
  assert.match(report.interpretation, /NOT exploitability proof/);
}));

test("missing or empty build outputs cause explicit failures", () => withBundle(root => {
  assert.throws(() => inspectNuxtServerBundle(join(root, "missing")), /ENOENT/);
  writeFileSync(join(root, "only.txt"), "picomatch");
  assert.throws(() => inspectNuxtServerBundle(root), /No JavaScript files/);
}));

test("oversized generated JS files fail closed before reading into memory", () => withBundle(root => {
  const file = join(root, "large.mjs");
  writeFileSync(file, "");
  // Sparse file keeps this resource-limit regression fast and inexpensive.
  truncateSync(file, 64 * 1024 * 1024 + 1);
  assert.throws(() => inspectNuxtServerBundle(root), /JavaScript chunk exceeds 64 MiB scan limit: large\.mjs/);
}));

test("aggregate scan budget fails closed before reading another chunk", () => withBundle(root => {
  writeFileSync(join(root, "a.js"), "const first = 1;");
  writeFileSync(join(root, "b.js"), "const second = 2;");
  assert.throws(
    () => inspectNuxtServerBundle(root, 20),
    /Total JavaScript scan limit exceeded before reading: b\\.js/,
  );
  const report = inspectNuxtServerBundle(root, 128);
  assert.equal(report.filesScanned, 2);
  assert.equal(report.bytesScanned, Buffer.byteLength("const first = 1;const second = 2;"));
  assert.throws(() => inspectNuxtServerBundle(root, 0), /Invalid JavaScript scan byte budget/);
}));

test("symlinked content is never followed outside the build output", () => withBundle(root => {
  writeFileSync(join(root, "safe.js"), "export const ok = true;");
  const external = mkdtempSync(join(tmpdir(), "nuxt-runtime-external-"));
  try {
    writeFileSync(join(external, "bad.js"), "picomatch");
    symlinkSync(external, join(root, "external"), "dir");
    const report = inspectNuxtServerBundle(root);
    assert.equal(report.filesScanned, 1);
    assert.equal(report.symlinksSkipped, 1);
    assert.equal(report.indicators.every(item => item.files.length === 0), true);
  } finally {
    rmSync(external, { recursive: true, force: true });
  }
}));
