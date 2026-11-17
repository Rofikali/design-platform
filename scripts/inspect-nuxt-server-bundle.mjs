import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const INDICATORS = Object.freeze([
  { label: "picomatch package reference", needle: "picomatch" },
  { label: "repeated extglob analyzer symbol", needle: "analyzeRepeatedExtglob" },
  { label: "extglob recursion option", needle: "maxExtglobRecursion" },
]);

/**
 * Inspect the built Nuxt server output for recognizable library symbols.
 * This is an inventory, NOT a proof of vulnerability or non-reachability:
 * bundlers may rename or inline code, and only a runtime/threat-path audit
 * can establish whether attacker-controlled globs are evaluated.
 */
export function inspectNuxtServerBundle(serverDir) {
  const base = resolve(serverDir);
  if (!lstatSync(base).isDirectory()) throw new Error("Nuxt server output is not a directory");
  const files = [];
  const skippedSymlinks = [];
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const absolute = join(directory, entry.name);
      const relativeName = relative(base, absolute).replaceAll("\\", "/");
      // Never follow symlinks beyond the intended build output.
      if (entry.isSymbolicLink()) {
        skippedSymlinks.push(relativeName);
      } else if (entry.isDirectory()) {
        walk(absolute);
      } else if (entry.isFile() && /\.[cm]?js$/.test(entry.name)) {
        files.push({ absolute, relativeName });
      }
    }
  }
  walk(base);
  if (files.length === 0) throw new Error("No JavaScript files found in Nuxt server output");

  let bytesScanned = 0;
  const indicators = INDICATORS.map(item => ({ name: item.label, files: [] }));
  for (const file of files) {
    const source = readFileSync(file.absolute, "utf8");
    bytesScanned += Buffer.byteLength(source);
    INDICATORS.forEach((item, index) => {
      if (source.includes(item.needle)) indicators[index].files.push(file.relativeName);
    });
  }
  return {
    filesScanned: files.length,
    bytesScanned,
    symlinksSkipped: skippedSymlinks.length,
    indicators,
    interpretation: "Symbol presence is NOT exploitability proof; absence is NOT non-reachability proof.",
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length !== 3) throw new Error("Usage: node scripts/inspect-nuxt-server-bundle.mjs <path-to-.output/server>");
    const result = inspectNuxtServerBundle(process.argv[2]);
    console.log(JSON.stringify(result, null, 2));
    if (result.indicators.some(item => item.files.length > 0)) {
      console.log("Review Nuxt production output and untrusted glob entrypoints; indicators were found.");
    } else {
      console.log("No known symbols found. Bundled/minified code may still be vulnerable; review required.");
    }
    console.log("This informational scan does NOT replace pnpm audit or change the security merge gate.");
  } catch (error) {
    console.error("Nuxt runtime inventory failed: " + error.message);
    process.exitCode = 1;
  }
}
