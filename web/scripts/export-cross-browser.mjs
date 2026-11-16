import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, firefox, webkit } from "playwright";

const webRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const browsers = [
  ["Chromium", chromium],
  ["Firefox", firefox],
  ["WebKit", webkit],
];
const port = 4179;
const baseUrl = `http://127.0.0.1:${port}`;

function start(command, args) {
  const child = spawn(command, args, {
    cwd: webRoot,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NODE_ENV: "production" },
  });
  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8").on("data", chunk => { stdout += chunk; });
  child.stderr.setEncoding("utf8").on("data", chunk => { stderr += chunk; });
  child.output = () => ({ stdout, stderr });
  return child;
}

async function waitForServer(child) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      const output = child.output();
      throw new Error(`Nuxt preview exited early: ${output.stdout.slice(-2000)} ${output.stderr.slice(-3000)}`);
    }
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {}
    await delay(250);
  }
  throw new Error("Nuxt preview did not become ready");
}

function stop(child) {
  if (child && child.exitCode === null) child.kill("SIGTERM");
}

async function verifyExport(browserName, browserType, template, expectedWidth, expectedHeight) {
  const browser = await browserType.launch({ headless: true });
  try {
    const context = await browser.newContext({ acceptDownloads: true });
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.locator(".design-page").waitFor();
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });

    await page.locator("#template-choice").selectOption(template);
    await page.getByRole("button", { name: "Use template" }).click();
    await page.locator(".design-page").waitFor();
    const downloadPromise = page.waitForEvent("download", { timeout: 30_000 });
    await page.getByRole("button", { name: "Download PNG" }).click();
    const download = await downloadPromise;
    const path = await download.path();
    if (!path) throw new Error("Browser did not provide a downloaded PNG file");
    const { readFile } = await import("node:fs/promises");
    const png = await readFile(path);
    const validSignature = png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const width = png.length >= 24 ? png.readUInt32BE(16) : 0;
    const height = png.length >= 24 ? png.readUInt32BE(20) : 0;
    if (!validSignature || png.toString("ascii", 12, 16) !== "IHDR" ||
        width !== expectedWidth || height !== expectedHeight || png.length < 100) {
      throw new Error(`${browserName} ${template} PNG invalid: ${JSON.stringify({ validSignature, width, height, bytes: png.length })}`);
    }
    const status = await page.locator('[role="status"]').innerText();
    if (!status.includes(`${expectedWidth} × ${expectedHeight} pixels`)) {
      throw new Error(`${browserName} export status mismatch: ${status}`);
    }
    process.stdout.write(`PASS: ${browserName} ${template} PNG ${width}×${height} (${png.length} bytes)\n`);
    await context.close();
  } finally {
    await browser.close();
  }
}

async function main() {
  // Use the package build lifecycle so the prebuild hook generates the
  // Rust/WASM adapter before Nuxt resolves its browser-only module import.
  const build = start("pnpm", ["run", "build"]);
  await new Promise((resolveExit, rejectExit) => {
    build.once("error", rejectExit);
    build.once("close", code => {
      if (code === 0) return resolveExit();
      const output = build.output();
      rejectExit(new Error(
        `Production build failed (${code}). stdout:\\n${output.stdout.slice(-4000)}\\nstderr:\\n${output.stderr.slice(-4000)}`,
      ));
    });
  });
  const preview = start("pnpm", ["exec", "nuxt", "preview", "--host=127.0.0.1", `--port=${port}`]);
  try {
    await waitForServer(preview);
    for (const [name, type] of browsers) {
      await verifyExport(name, type, "shop-banner-landscape", 2400, 1000);
      await verifyExport(name, type, "exam-paper-a4", 1588, 2246);
    }
    process.stdout.write("PASS: PNG export dimensions and downloaded-file integrity verified in Chromium, Firefox, and WebKit for both MVP templates.\n");
  } finally {
    stop(preview);
  }
}

main().catch(error => {
  process.stderr.write(`FAIL: ${error.stack || error.message}\n`);
  process.exitCode = 1;
});
