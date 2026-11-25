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
    // Keep preview descendants in one process group on Unix. Without this,
    // terminating pnpm can leave its Nuxt child running and keep CI alive.
    detached: process.platform !== "win32",
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
  if (!child || child.exitCode !== null) return;
  try {
    if (process.platform !== "win32" && child.pid) {
      process.kill(-child.pid, "SIGTERM");
    } else {
      child.kill("SIGTERM");
    }
  } catch (error) {
    if (error?.code !== "ESRCH") throw error;
  }
}

async function verifyExport(browserName, browser, template, expectedWidth, expectedHeight) {
  const context = await browser.newContext({ acceptDownloads: true });
  try {
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.locator(".design-page").waitFor();
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });

    await page.locator("#template-choice").selectOption(template);
    await page.getByRole("button", { name: "Use template" }).click();
    await page.locator(".design-page").waitFor();
    // Capture live-region announcements from the moment export begins.
    // The autosave watcher can update this same region ~300 ms later;
    // checking only its final text after downloading causes a false failure.
    await page.evaluate(() => {
      const region = document.querySelector('p.hint[role="status"]');
      if (!region) throw new Error("Export status live region not found");
      window.__exportStatusMessages = [region.textContent || ""];
      new MutationObserver(() => {
        window.__exportStatusMessages.push(region.textContent || "");
      }).observe(region, { subtree: true, childList: true, characterData: true });
    });
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
    // The export announcement must have appeared even if a later autosave
    // message replaced it. Check the recorded live-region changes, not a
    // transient final text snapshot.
    const expectedStatus = `PNG exported at ${expectedWidth} × ${expectedHeight} pixels.`;
    await page.waitForFunction(expected =>
      window.__exportStatusMessages?.some(message => message.includes(expected)),
    expectedStatus, { timeout: 15_000 }).catch(async error => {
      const messages = await page.evaluate(() => window.__exportStatusMessages || []);
      throw new Error(`${browserName} ${template} export announcement missing: ${JSON.stringify(messages.slice(-10))}; ${error.message}`);
    });
    process.stdout.write(`PASS: ${browserName} ${template} PNG ${width}×${height} (${png.length} bytes)\n`);
  } finally {
    await context.close();
  }
}

/** Baseline only: visible ink and exact text roundtrip do not prove glyph correctness. */
async function verifyMultilingual(browserName, browser) {
  const context = await browser.newContext({ acceptDownloads: true });
  try {
    const page = await context.newPage();
    const external = [];
    page.on("request", request => {
      const url = new URL(request.url());
      if (["http:", "https:"].includes(url.protocol) && url.origin !== baseUrl) external.push(url.origin);
    });
    const { readFile } = await import("node:fs/promises");
    const fixture = await readFile(resolve(webRoot, "../fixtures/document-v8-multilingual.json"), "utf8");
    const expected = JSON.parse(fixture);
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.locator(".design-page").waitFor();
    await page.evaluate(() => {
      const region = document.querySelector('.tools-panel > p.hint[role="status"]');
      if (!region) throw new Error("Missing status live region");
      window.__multilingualStatuses = [];
      new MutationObserver(() => window.__multilingualStatuses.push(region.textContent || ""))
        .observe(region, { subtree: true, childList: true, characterData: true });
    });
    await page.getByLabel("Import design JSON file").setInputFiles({
      name: "document-v8-multilingual.json", mimeType: "application/json", buffer: Buffer.from(fixture),
    });
    await page.waitForFunction(doc => {
      const saved = JSON.parse(localStorage.getItem("design-platform:document:v1") || "null");
      return saved?.schema_version === 8 && saved.elements.length === doc.elements.length &&
        doc.elements.every(e => saved.elements.find(s => s.id === e.id)?.kind.text === e.kind.text);
    }, expected);
    await page.waitForFunction(() => window.__multilingualStatuses.some(s => s.includes("imported and validated with WebAssembly")));
    for (const item of expected.elements) {
      const text = await page.locator(`[data-element-id="${item.id}"] > span`).textContent();
      if (text !== item.kind.text) throw new Error(`${browserName}: DOM text changed for ${item.id}`);
    }
    const jsonPromise = page.waitForEvent("download", { timeout: 30_000 });
    await page.getByRole("button", { name: "Download JSON" }).click();
    const jsonPath = await (await jsonPromise).path();
    if (!jsonPath) throw new Error("Missing multilingual JSON download");
    const exported = JSON.parse(await readFile(jsonPath, "utf8"));
    if (exported.schema_version !== 8 || expected.elements.some(e =>
      exported.elements.find(s => s.id === e.id)?.kind.text !== e.kind.text) ||
      JSON.stringify(exported.text_styles) !== JSON.stringify(expected.text_styles) ||
      JSON.stringify(exported.text_layouts) !== JSON.stringify(expected.text_layouts)) {
      throw new Error(`${browserName}: multilingual JSON lost text or formatting`);
    }
    const pngPromise = page.waitForEvent("download", { timeout: 30_000 });
    await page.getByRole("button", { name: "Download PNG" }).click();
    const pngPath = await (await pngPromise).path();
    if (!pngPath) throw new Error("Missing multilingual PNG download");
    const png = await readFile(pngPath);
    if (!png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
        png.toString("ascii", 12, 16) !== "IHDR" ||
        png.readUInt32BE(16) !== 1600 || png.readUInt32BE(20) !== 1200) {
      throw new Error(`${browserName}: multilingual PNG dimensions/signature invalid`);
    }
    const ink = await page.evaluate(async ({ encoded, elements }) => {
      const image = new Image();
      image.src = "data:image/png;base64," + encoded;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0);
      return elements.map(e => {
        const data = ctx.getImageData(e.x * 2, e.y * 2, e.width * 2, e.height * 2).data;
        let pixels = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 0 && data[i] < 100 && data[i + 1] < 100 && data[i + 2] < 100) pixels += 1;
        }
        return { id: e.id, pixels };
      });
    }, { encoded: png.toString("base64"), elements: expected.elements });
    if (ink.some(row => row.pixels < 50) || external.length) {
      throw new Error(`${browserName}: missing rendered ink or external requests: ${JSON.stringify({ ink, external })}`);
    }
    process.stdout.write(`PASS: ${browserName} multilingual v8 text/style/layout roundtrip, 1600×1200 PNG ink and local requests only: ${JSON.stringify(ink)}\n`);
  } finally {
    await context.close();
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
      // Reuse one browser process per engine; create an isolated context for
      // each template so localStorage and page state cannot leak between cases.
      const browser = await type.launch({ headless: true });
      try {
        await verifyExport(name, browser, "shop-banner-landscape", 2400, 1000);
        await verifyExport(name, browser, "exam-paper-a4", 1588, 2246);
        await verifyMultilingual(name, browser);
      } finally {
        await browser.close();
      }
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
