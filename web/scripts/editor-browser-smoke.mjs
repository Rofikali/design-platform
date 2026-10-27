import { mkdtemp, mkdir, readFile, readdir, rm, stat } from "node:fs/promises";
import { createServer } from "node:net";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const webRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const repositoryRoot = resolve(webRoot, "..");
const chrome = process.env.CHROME_BIN || "google-chrome";
const fixturePath = resolve(repositoryRoot, "fixtures/document-v1.json");
const wasmJsPath = resolve(webRoot, "generated/design-wasm/design_wasm.js");
const wasmBinaryPath = resolve(webRoot, "generated/design-wasm/design_wasm_bg.wasm");
const timeoutMs = 60_000;

await Promise.all([readFile(wasmJsPath), readFile(wasmBinaryPath)]);

async function freePort() {
  const server = createServer();
  await new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Could not allocate a local port");
  await new Promise(resolveClose => server.close(resolveClose));
  return address.port;
}

async function waitFor(description, check, timeout = timeoutMs) {
  const deadline = Date.now() + timeout;
  let lastError;
  while (Date.now() < deadline) {
    try {
      const value = await check();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await delay(250);
  }
  throw new Error(`Timed out waiting for ${description}${lastError ? `: ${lastError.message}` : ""}`);
}

function startProcess(command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: ["ignore", "pipe", "pipe"],
    detached: process.platform !== "win32",
    ...options,
  });
  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8").on("data", chunk => { stdout += chunk; });
  child.stderr.setEncoding("utf8").on("data", chunk => { stderr += chunk; });
  child.output = () => ({ stdout, stderr });
  return child;
}

function stopProcess(child) {
  if (!child || child.exitCode !== null) return;
  try {
    if (process.platform !== "win32" && child.pid) process.kill(-child.pid, "SIGTERM");
    else child.kill("SIGTERM");
  } catch {}
}

async function waitForSuccessfulExit(child, description, timeout = 120_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline && child.exitCode === null) await delay(250);
  if (child.exitCode === null) {
    stopProcess(child);
    throw new Error(`${description} timed out after ${timeout}ms`);
  }
  if (child.exitCode !== 0) {
    const output = child.output();
    throw new Error(`${description} failed with exit code ${child.exitCode}\\nstdout:\\n${output.stdout.slice(-5000)}\\nstderr:\\n${output.stderr.slice(-5000)}`);
  }
}

function connectCdp(url) {
  return new Promise((resolveConnect, rejectConnect) => {
    const socket = new WebSocket(url);
    const pending = new Map();
    let nextId = 0;
    let closed = false;

    socket.addEventListener("open", () => {
      resolveConnect({
        send(method, params = {}) {
          if (closed) return Promise.reject(new Error("Chrome DevTools connection is closed"));
          const id = ++nextId;
          return new Promise((resolveReply, rejectReply) => {
            pending.set(id, { resolve: resolveReply, reject: rejectReply, method });
            socket.send(JSON.stringify({ id, method, params }));
          });
        },
        close() { closed = true; socket.close(); },
      });
    });
    socket.addEventListener("message", event => {
      let message;
      try { message = JSON.parse(event.data); } catch { return; }
      if (!message.id) return;
      const entry = pending.get(message.id);
      if (!entry) return;
      pending.delete(message.id);
      if (message.error) entry.reject(new Error(`${entry.method}: ${message.error.message}`));
      else entry.resolve(message.result || {});
    });
    socket.addEventListener("error", () => rejectConnect(new Error("Chrome DevTools WebSocket failed")));
    socket.addEventListener("close", () => {
      closed = true;
      for (const entry of pending.values()) entry.reject(new Error("Chrome DevTools connection closed"));
      pending.clear();
    });
  });
}

async function main() {
  const port = await freePort();
  const chromeDebugPort = await freePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const tempRoot = await mkdtemp(resolve(tmpdir(), "design-platform-editor-e2e-"));
  const downloads = resolve(tempRoot, "downloads");
  await mkdir(downloads);
  let nuxt;
  let browser;
  let cdp;

  try {
    // Exercise the built application. Nuxt's Vite dev SSR module loader can
    // reject internal pnpm paths in headless CI, which is unrelated to editor UI.
    const build = startProcess("pnpm", ["exec", "nuxt", "build"], { cwd: webRoot });
    await waitForSuccessfulExit(build, "Nuxt production build");

    nuxt = startProcess("pnpm", ["exec", "nuxt", "preview", "--host=127.0.0.1", `--port=${port}`], {
      cwd: webRoot,
      env: { ...process.env, NODE_ENV: "production" },
    });
    await waitFor("Nuxt production preview", async () => {
      if (nuxt.exitCode !== null) {
        const output = nuxt.output();
        throw new Error(`Nuxt exited early (code ${nuxt.exitCode}): ${output.stdout.slice(-2000)} ${output.stderr.slice(-3000)}`);
      }
      try {
        const response = await fetch(baseUrl);
        return response.ok;
      } catch (error) {
        if (nuxt.exitCode !== null) {
          const output = nuxt.output();
          throw new Error(`Nuxt exited early (code ${nuxt.exitCode}): ${output.stdout.slice(-2000)} ${output.stderr.slice(-3000)}`);
        }
        return null;
      }
    }).catch(error => {
      const output = nuxt?.output?.() ?? { stdout: "", stderr: "" };
      throw new Error(`${error.message}\nNuxt stdout:\n${output.stdout.slice(-5000)}\nNuxt stderr:\n${output.stderr.slice(-5000)}`);
    });

    browser = startProcess(chrome, [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--no-first-run",
      "--no-default-browser-check",
      `--remote-debugging-port=${chromeDebugPort}`,
      "--remote-allow-origins=*",
      `--user-data-dir=${resolve(tempRoot, "chrome-profile")}`,
      baseUrl,
    ]);
    const targets = await waitFor("Chrome page target", async () => {
      const response = await fetch(`http://127.0.0.1:${chromeDebugPort}/json/list`);
      if (!response.ok) return null;
      const pages = await response.json();
      return pages.find(page => page.type === "page" && page.url.startsWith(baseUrl) && page.webSocketDebuggerUrl);
    });
    cdp = await connectCdp(targets.webSocketDebuggerUrl);
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Page.setDownloadBehavior", { behavior: "allow", downloadPath: downloads });

    async function evaluate(expression) {
      const response = await cdp.send("Runtime.evaluate", {
        expression,
        awaitPromise: true,
        returnByValue: true,
        userGesture: true,
      });
      if (response.exceptionDetails) {
        throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
      }
      return response.result?.value;
    }

    async function waitForPage(description, expression, predicate = Boolean) {
      return waitFor(description, async () => {
        const value = await evaluate(expression);
        return predicate(value) ? value : null;
      });
    }

    await waitForPage("editor canvas to mount", "document.querySelector('.design-page') !== null");
    await evaluate("localStorage.clear(); location.reload(); true");
    await waitForPage("fresh editor after reload", "document.querySelector('.design-page')?.innerText || ''", value => value.includes("Your design starts here"));
    // Vue attaches the app instance to its mount container after client
    // startup. Wait for that public-ish runtime marker rather than matching
    // SSR text, which can exist before the event handlers are active.
    await waitForPage("Vue app mount", "Boolean(document.querySelector('#__nuxt')?.__vue_app__)");
    
    // Export must report WASM, not the TypeScript fallback.
    await evaluate("Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('Download JSON'))?.click(); true");
    let exportStatus;
    try {
      exportStatus = await waitForPage(
        "JSON export status",
        "document.querySelector('[role=status]')?.textContent || ''",
        value => value.includes("validated with WebAssembly and downloaded") || value.includes("TypeScript fallback validation") || value.startsWith("Export failed:"),
      );
    } catch (error) {
      const diagnostics = await evaluate("JSON.stringify({ status: document.querySelector('[role=status]')?.textContent || '', buttons: Array.from(document.querySelectorAll('button')).map(button => ({ text: button.textContent.trim(), hasVueComponent: Boolean(button.__vueParentComponent) })), wasmResources: performance.getEntriesByType('resource').map(entry => entry.name).filter(name => name.includes('design_wasm') || name.endsWith('.wasm')) })");
      throw new Error(`JSON export status never reached a terminal state: ${error.message}. Browser diagnostics: ${diagnostics}`);
    }
    if (!exportStatus.includes("validated with WebAssembly and downloaded")) {
      const diagnostics = await evaluate("JSON.stringify({ status: document.querySelector('[role=status]')?.textContent || '', wasmResources: performance.getEntriesByType('resource').map(entry => entry.name).filter(name => name.includes('design_wasm') || name.endsWith('.wasm')) })");
      throw new Error(`JSON export did not use WASM. Browser diagnostics: ${diagnostics}`);
    }
    const exportedPath = await waitFor("downloaded JSON file", async () => {
      const names = await readdir(downloads);
      const name = names.find(item => item === "design-platform-document.json");
      if (!name || names.some(item => item.endsWith(".crdownload"))) return null;
      const path = resolve(downloads, name);
      const info = await stat(path);
      return info.size > 0 ? path : null;
    });
    const exported = JSON.parse(await readFile(exportedPath, "utf8"));
    if (exported.schema_version !== 2 || exported.elements?.length !== 2) {
      throw new Error("Exported file did not contain the expected versioned two-element document");
    }

    // Import the shared valid fixture through the actual file input and UI event handler.
    const fixture = await readFile(fixturePath, "utf8");
    const importExpression = `(() => {
      const input = document.querySelector('input[type="file"]');
      const transfer = new DataTransfer();
      transfer.items.add(new File([${JSON.stringify(fixture)}], "document-v1.json", { type: "application/json" }));
      input.files = transfer.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    })()`;
    await evaluate(importExpression);
    await waitForPage("WASM-backed JSON import", "document.querySelector('[role=status]')?.textContent || ''", value => value.includes("imported and validated with WebAssembly"));
    await waitForPage("imported fixture visible on canvas", "document.querySelector('.design-page')?.innerText || ''", value => value.includes("Exam Paper"));

    // A rejected import must not replace the currently loaded valid document.
    const invalidFixture = JSON.stringify({ ...JSON.parse(fixture), schema_version: 999 });
    const invalidImportExpression = `(() => {
      const input = document.querySelector('input[type="file"]');
      const transfer = new DataTransfer();
      transfer.items.add(new File([${JSON.stringify(invalidFixture)}], "unsupported-schema.json", { type: "application/json" }));
      input.files = transfer.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    })()`;
    await evaluate(invalidImportExpression);
    await waitForPage("invalid import to be rejected", "document.querySelector('[role=status]')?.textContent || ''", value => value.includes("Import failed:"));
    const preserved = await evaluate("document.querySelector('.design-page')?.innerText || ''");
    if (!preserved.includes("Exam Paper")) throw new Error("Invalid import changed the existing canvas document");

    // Exercise core editing controls through the rendered UI. Use accessible
    // labels and visible canvas state rather than Vue internals.
    const fixtureCount = Number.parseInt(await evaluate("document.querySelector('.canvas-heading > span')?.textContent || '0'"), 10);
    await evaluate("Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('＋ Add text'))?.click(); true");
    await waitForPage("new text element", "document.querySelector('textarea')?.value || ''", value => value === "New text");
    await evaluate("Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('＋ Add rectangle'))?.click(); true");
    await waitForPage("rectangle added", "document.querySelector('.canvas-heading > span')?.textContent || ''", value => value.trim() === `${fixtureCount + 2} elements`);

    await evaluate("Array.from(document.querySelectorAll('.design-element')).find(element => element.textContent.includes('New text'))?.click(); true");
    const editTextExpression = `(() => {
      const field = document.querySelector('textarea');
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
      setter.call(field, 'Browser interaction proof');
      field.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    })()`;
    await evaluate(editTextExpression);
    await waitForPage("text edit visible", "document.querySelector('.design-page')?.innerText || ''", value => value.includes("Browser interaction proof"));

    const initialPosition = await evaluate("(() => { const item = Array.from(document.querySelectorAll('.design-element')).find(element => element.textContent.includes('Browser interaction proof')); return { left: parseFloat(item.style.left), top: parseFloat(item.style.top) }; })()");
    await evaluate("(() => { const field = document.querySelector('input[type=color]'); field.value = '#ff0000'; field.dispatchEvent(new Event('input', { bubbles: true })); field.dispatchEvent(new Event('change', { bubbles: true })); const size = document.querySelector('input[type=number]'); size.value = '36'; size.dispatchEvent(new Event('input', { bubbles: true })); size.dispatchEvent(new Event('change', { bubbles: true })); document.querySelector('button[aria-label=\"Move right\"]')?.click(); return true; })()");
    const changed = await evaluate("(() => { const item = Array.from(document.querySelectorAll('.design-element')).find(element => element.textContent.includes('Browser interaction proof')); return { left: parseFloat(item.style.left), color: getComputedStyle(item).color, fontSize: getComputedStyle(item).fontSize }; })()");
    if (changed.left !== initialPosition.left + 10 || changed.color !== "rgb(255, 0, 0)" || changed.fontSize !== "36px") {
      throw new Error(`Text/style/movement controls did not apply expected changes: ${JSON.stringify({ initialPosition, changed })}`);
    }

    // Wait for debounced history, then prove undo/redo and browser-local restore.
    await delay(500);
    await evaluate("Array.from(document.querySelectorAll('button')).find(button => button.textContent.trim() === 'Undo')?.click(); true");
    await waitForPage("undo restores prior text", "document.querySelector('.design-page')?.innerText || ''", value => !value.includes("Browser interaction proof"));
    await evaluate("Array.from(document.querySelectorAll('button')).find(button => button.textContent.trim() === 'Redo')?.click(); true");
    await waitForPage("redo restores edited text", "document.querySelector('.design-page')?.innerText || ''", value => value.includes("Browser interaction proof"));
    await delay(500);
    await evaluate("location.reload(); true");
    await waitForPage("locally saved document restored after reload", "document.querySelector('.design-page')?.innerText || ''", value => value.includes("Browser interaction proof"));
    const restoredCount = await evaluate("document.querySelector('.canvas-heading > span')?.textContent?.trim() || ''");
    if (restoredCount !== `${fixtureCount + 2} elements`) throw new Error(`Autosave did not restore added elements: ${restoredCount}`);

    // Real mouse input through Chrome DevTools exercises actual pointer capture.
    // Widen the viewport so the full 800x600 logical page and its edge handles are reachable.
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });
    await delay(100);
    async function mouse(type, x, y, buttons = 0) {
      await cdp.send("Input.dispatchMouseEvent", {
        type, x, y, button: type === "mouseReleased" ? "left" : "left",
        buttons, clickCount: type === "mousePressed" ? 1 : 0,
      });
    }
    async function selectedTextGeometry() {
      return evaluate("(() => { const element = Array.from(document.querySelectorAll('.design-element')).find(node => node.textContent.includes('Browser interaction proof')); if (!element) throw new Error('Edited text element not found'); const rect = element.getBoundingClientRect(); const page = document.querySelector('.design-page').getBoundingClientRect(); const style = getComputedStyle(element); return { left: parseFloat(style.left), top: parseFloat(style.top), width: parseFloat(style.width), height: parseFloat(style.height), clientLeft: rect.left, clientTop: rect.top, pageLeft: page.left, pageTop: page.top }; })()");
    }

    let geometry = await selectedTextGeometry();
    // Drag by a modest delta and verify the actual pointer-driven position change.
    await mouse("mouseMoved", geometry.clientLeft + 30, geometry.clientTop + 20);
    await mouse("mousePressed", geometry.clientLeft + 30, geometry.clientTop + 20, 1);
    await mouse("mouseMoved", geometry.clientLeft + 70, geometry.clientTop + 50, 1);
    await mouse("mouseReleased", geometry.clientLeft + 70, geometry.clientTop + 50);
    let afterDrag = await selectedTextGeometry();
    if (afterDrag.left !== geometry.left + 40 || afterDrag.top !== geometry.top + 30) {
      throw new Error(`Pointer drag did not apply expected delta: ${JSON.stringify({ before: geometry, after: afterDrag })}`);
    }

    await delay(500);
    await evaluate("Array.from(document.querySelectorAll('button')).find(button => button.textContent.trim() === 'Undo')?.click(); true");
    await waitFor("undo restores pointer drag origin", async () => {
      const value = await selectedTextGeometry();
      return value.left === geometry.left && value.top === geometry.top ? value : null;
    });
    await evaluate("Array.from(document.querySelectorAll('button')).find(button => button.textContent.trim() === 'Redo')?.click(); true");
    await waitFor("redo restores pointer drag result", async () => {
      const value = await selectedTextGeometry();
      return value.left === afterDrag.left && value.top === afterDrag.top ? value : null;
    });
    await evaluate("Array.from(document.querySelectorAll('.design-element')).find(element => element.textContent.includes('Browser interaction proof'))?.click(); true");

    // Resize from the visible bottom-right handle, preserving the top-left anchor.
    const handle = await evaluate("(() => { const element = Array.from(document.querySelectorAll('.design-element')).find(node => node.textContent.includes('Browser interaction proof')); const rect = element.querySelector('.resize-handle').getBoundingClientRect(); return { x: rect.left + Math.min(rect.width / 2, 5), y: rect.top + Math.min(rect.height / 2, 5) }; })()");
    await mouse("mouseMoved", handle.x, handle.y);
    await mouse("mousePressed", handle.x, handle.y, 1);
    await mouse("mouseMoved", handle.x + 40, handle.y + 30, 1);
    await mouse("mouseReleased", handle.x + 40, handle.y + 30);
    const afterResize = await selectedTextGeometry();
    if (afterResize.width !== afterDrag.width + 40 || afterResize.height !== afterDrag.height + 30) {
      throw new Error(`Pointer resize did not apply expected delta: ${JSON.stringify({ afterDrag, afterResize })}`);
    }

    await delay(500);
    await evaluate("Array.from(document.querySelectorAll('button')).find(button => button.textContent.trim() === 'Undo')?.click(); true");
    await waitFor("undo restores pointer resize origin", async () => {
      const value = await selectedTextGeometry();
      return value.width === afterDrag.width && value.height === afterDrag.height ? value : null;
    });
    await evaluate("Array.from(document.querySelectorAll('button')).find(button => button.textContent.trim() === 'Redo')?.click(); true");
    await waitFor("redo restores pointer resize result", async () => {
      const value = await selectedTextGeometry();
      return value.width === afterResize.width && value.height === afterResize.height ? value : null;
    });
    await evaluate("Array.from(document.querySelectorAll('.design-element')).find(element => element.textContent.includes('Browser interaction proof'))?.click(); true");

    // Drag to the maximum legal position using coordinates calculated from the
    // rendered page. The target remains inside the viewport, not beyond the screen.
    const boundaryTarget = await evaluate("(() => { const page = document.querySelector('.design-page').getBoundingClientRect(); const element = Array.from(document.querySelectorAll('.design-element')).find(node => node.textContent.includes('Browser interaction proof')); const style = getComputedStyle(element); const width = parseFloat(style.width); const height = parseFloat(style.height); const left = parseFloat(style.left); const top = parseFloat(style.top); const rect = element.getBoundingClientRect(); return { startX: rect.left + 30, startY: rect.top + 20, targetX: page.left + 800 - width + 30, targetY: page.top + 600 - height + 20, maxLeft: 800 - width, maxTop: 600 - height }; })()");
    await mouse("mouseMoved", boundaryTarget.startX, boundaryTarget.startY);
    await mouse("mousePressed", boundaryTarget.startX, boundaryTarget.startY, 1);
    await mouse("mouseMoved", boundaryTarget.targetX, boundaryTarget.targetY, 1);
    await mouse("mouseReleased", boundaryTarget.targetX, boundaryTarget.targetY);
    const atBoundary = await selectedTextGeometry();
    if (atBoundary.left !== boundaryTarget.maxLeft || atBoundary.top !== boundaryTarget.maxTop ||
        atBoundary.left + atBoundary.width > 800 || atBoundary.top + atBoundary.height > 600) {
      throw new Error(`Drag escaped logical page bounds: ${JSON.stringify({ boundaryTarget, atBoundary })}`);
    }

    // The handle is still visible at the page edge. Attempt to grow beyond both
    // boundaries and assert that the geometry remains bounded.
    const edgeHandle = await evaluate("(() => { const element = Array.from(document.querySelectorAll('.design-element')).find(node => node.textContent.includes('Browser interaction proof')); const rect = element.querySelector('.resize-handle').getBoundingClientRect(); return { x: rect.left + 4, y: rect.top + 4 }; })()");
    await mouse("mouseMoved", edgeHandle.x, edgeHandle.y);
    await mouse("mousePressed", edgeHandle.x, edgeHandle.y, 1);
    await mouse("mouseMoved", edgeHandle.x + 100, edgeHandle.y + 100, 1);
    await mouse("mouseReleased", edgeHandle.x + 100, edgeHandle.y + 100);
    const edgeResize = await selectedTextGeometry();
    if (edgeResize.left + edgeResize.width > 800 || edgeResize.top + edgeResize.height > 600 ||
        edgeResize.width !== atBoundary.width || edgeResize.height !== atBoundary.height) {
      throw new Error(`Resize escaped page bounds: ${JSON.stringify({ atBoundary, edgeResize })}`);
    }

    // Keyboard-accessible movement controls must also remain bounded at the
    // right/bottom edge, even when repeatedly activated.
    await evaluate("(() => { const buttons = Array.from(document.querySelectorAll('button[aria-label]')); const right = buttons.find(button => button.getAttribute('aria-label') === 'Move right'); const down = buttons.find(button => button.getAttribute('aria-label') === 'Move down'); for (let index = 0; index < 20; index += 1) { right.click(); down.click(); } return true; })()");
    const afterKeyboardBoundary = await selectedTextGeometry();
    if (afterKeyboardBoundary.left !== edgeResize.left || afterKeyboardBoundary.top !== edgeResize.top ||
        afterKeyboardBoundary.left + afterKeyboardBoundary.width > 800 ||
        afterKeyboardBoundary.top + afterKeyboardBoundary.height > 600) {
      throw new Error(`Directional movement escaped page bounds: ${JSON.stringify({ edgeResize, afterKeyboardBoundary })}`);
    }

    // Start a new design from the real template picker after the existing editor checks.
    await evaluate(`(() => {
      const select = document.querySelector('#template-choice');
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
      setter.call(select, 'shop-banner-landscape');
      select.dispatchEvent(new Event('change', { bubbles: true }));
      document.querySelector('button') && Array.from(document.querySelectorAll('button')).find(button => button.textContent.trim() === 'Use template')?.click();
      return true;
    })()`);
    await waitForPage("shop banner template on canvas", "document.querySelector('.design-page')?.innerText || ''", value => value.includes("WELCOME TO OUR SHOP"));
    const templateCanvas = await evaluate("(() => { const page = document.querySelector('.design-page'); return { width: page.style.width, height: page.style.height, count: document.querySelector('.canvas-heading > span')?.textContent, details: document.querySelector('.template-controls')?.innerText || '' }; })()");
    if (templateCanvas.width !== "1200px" || templateCanvas.height !== "500px" ||
        !templateCanvas.count.includes("4 elements") ||
        !templateCanvas.details.includes("300 × 125 mm")) {
      throw new Error(`Template picker did not apply expected page and print geometry: ${JSON.stringify(templateCanvas)}`);
    }

    // Verify an actual PNG download, not only the renderer's SVG string.
    // The selected shop-banner template is 1200 × 500 logical units; the UI
    // promises a 2× raster export, so the PNG IHDR must report 2400 × 1000.
    await evaluate("Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('Download PNG'))?.click(); true");
    const pngStatus = await waitForPage(
      "PNG export status",
      "document.querySelector('[role=status]')?.textContent || ''",
      value => value.includes("PNG exported at 2400 × 1000 pixels") || value.startsWith("PNG export failed:"),
    );
    if (!pngStatus.includes("PNG exported at 2400 × 1000 pixels")) {
      throw new Error(`PNG export reported a failure: ${pngStatus}`);
    }
    const pngPath = await waitFor("downloaded PNG file", async () => {
      const names = await readdir(downloads);
      if (names.some(item => item.endsWith(".crdownload"))) return null;
      const name = names.find(item => item === "design-platform.png");
      if (!name) return null;
      const path = resolve(downloads, name);
      const info = await stat(path);
      return info.size > 100 ? path : null;
    });
    const png = await readFile(pngPath);
    const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    if (!png.subarray(0, 8).equals(pngSignature) ||
        png.toString("ascii", 12, 16) !== "IHDR" ||
        png.readUInt32BE(16) !== 2400 ||
        png.readUInt32BE(20) !== 1000) {
      throw new Error(`Downloaded PNG signature or dimensions were invalid: ${JSON.stringify({
        signature: png.subarray(0, 8).toString("hex"),
        chunk: png.toString("ascii", 12, 16),
        width: png.length >= 24 ? png.readUInt32BE(16) : null,
        height: png.length >= 24 ? png.readUInt32BE(20) : null,
        bytes: png.length,
      })}`);
    }

    // Inspect decoded pixels as well as the PNG header. This catches blank or
    // incorrectly colored output that can still have a valid signature/size.
    const pngBase64 = png.toString("base64");
    const pngVisual = await evaluate(`(async () => {
      const image = new Image();
      image.src = "data:image/png;base64,${pngBase64}";
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Could not create pixel inspection canvas");
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const sample = (x, y) => {
        const offset = (y * canvas.width + x) * 4;
        return Array.from(pixels.slice(offset, offset + 4));
      };
      let orangePixels = 0;
      let darkTextPixels = 0;
      let nonBackgroundPixels = 0;
      for (let offset = 0; offset < pixels.length; offset += 4) {
        const red = pixels[offset];
        const green = pixels[offset + 1];
        const blue = pixels[offset + 2];
        const alpha = pixels[offset + 3];
        if (alpha > 0 && red > 200 && green > 40 && green < 120 && blue < 60) orangePixels += 1;
        if (alpha > 0 && red < 175 && green < 105 && blue < 75) darkTextPixels += 1;
        if (alpha > 0 && !(red === 255 && green === 247 && blue === 237)) nonBackgroundPixels += 1;
      }
      return {
        width: canvas.width,
        height: canvas.height,
        accentSample: sample(1200, 10),
        backgroundSample: sample(2390, 990),
        orangePixels,
        darkTextPixels,
        nonBackgroundPixels,
      };
    })()`);
    const expectedPixelContent = pngVisual.width === 2400 &&
      pngVisual.height === 1000 &&
      pngVisual.accentSample[0] === 234 && pngVisual.accentSample[1] === 88 && pngVisual.accentSample[2] === 12 &&
      pngVisual.backgroundSample[0] === 255 && pngVisual.backgroundSample[1] === 247 && pngVisual.backgroundSample[2] === 237 &&
      pngVisual.orangePixels > 30_000 &&
      pngVisual.darkTextPixels > 500 &&
      pngVisual.nonBackgroundPixels > 30_000;
    if (!expectedPixelContent) {
      throw new Error(`PNG pixel content did not match the Shop Banner's expected background, accent, and text: \${JSON.stringify(pngVisual)}`);
    }

    // Verify the second MVP template through the same real PNG export path.
    // A4 logical geometry is 794 × 1123, so the 2× image must be 1588 × 2246.
    await rm(pngPath);
    await evaluate(`(() => {
      const select = document.querySelector('#template-choice');
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
      setter.call(select, 'exam-paper-a4');
      select.dispatchEvent(new Event('change', { bubbles: true }));
      Array.from(document.querySelectorAll('button')).find(button => button.textContent.trim() === 'Use template')?.click();
      return true;
    })()`);
    await waitForPage("exam paper template on canvas", "document.querySelector('.design-page')?.innerText || ''", value => value.includes("EXAMINATION"));
    const examCanvas = await evaluate("(() => { const page = document.querySelector('.design-page'); return { width: page.style.width, height: page.style.height, details: document.querySelector('.template-controls')?.innerText || '' }; })()");
    if (examCanvas.width !== "794px" || examCanvas.height !== "1123px" || !examCanvas.details.includes("210 × 297 mm")) {
      throw new Error(`Exam Paper template did not apply expected page and print geometry: ${JSON.stringify(examCanvas)}`);
    }

    await evaluate("Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('Download PNG'))?.click(); true");
    const examPngStatus = await waitForPage(
      "Exam Paper PNG export status",
      "document.querySelector('[role=status]')?.textContent || ''",
      value => value.includes("PNG exported at 1588 × 2246 pixels") || value.startsWith("PNG export failed:"),
    );
    if (!examPngStatus.includes("PNG exported at 1588 × 2246 pixels")) {
      throw new Error(`Exam Paper PNG export reported a failure: ${examPngStatus}`);
    }
    const examPngPath = await waitFor("downloaded Exam Paper PNG", async () => {
      const names = await readdir(downloads);
      if (names.some(item => item.endsWith(".crdownload"))) return null;
      const name = names.find(item => item === "design-platform.png");
      if (!name) return null;
      const path = resolve(downloads, name);
      const info = await stat(path);
      return info.size > 100 ? path : null;
    });
    const examPng = await readFile(examPngPath);
    if (!examPng.subarray(0, 8).equals(pngSignature) ||
        examPng.toString("ascii", 12, 16) !== "IHDR" ||
        examPng.readUInt32BE(16) !== 1588 ||
        examPng.readUInt32BE(20) !== 2246) {
      throw new Error(`Exam Paper PNG signature or dimensions were invalid: ${JSON.stringify({
        signature: examPng.subarray(0, 8).toString("hex"),
        chunk: examPng.toString("ascii", 12, 16),
        width: examPng.length >= 24 ? examPng.readUInt32BE(16) : null,
        height: examPng.length >= 24 ? examPng.readUInt32BE(20) : null,
        bytes: examPng.length,
      })}`);
    }

    const examPngBase64 = examPng.toString("base64");
    const examPngVisual = await evaluate(`(async () => {
      const image = new Image();
      image.src = "data:image/png;base64,${examPngBase64}";
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Could not create Exam Paper pixel inspection canvas");
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const sample = (x, y) => {
        const offset = (y * canvas.width + x) * 4;
        return Array.from(pixels.slice(offset, offset + 4));
      };
      let darkPixels = 0;
      let titleRegionDarkPixels = 0;
      let nonWhitePixels = 0;
      for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
          const offset = (y * canvas.width + x) * 4;
          const red = pixels[offset];
          const green = pixels[offset + 1];
          const blue = pixels[offset + 2];
          const alpha = pixels[offset + 3];
          const isDark = alpha > 0 && red < 100 && green < 120 && blue < 150;
          if (isDark) {
            darkPixels += 1;
            if (x >= 80 && x < 1500 && y >= 50 && y < 170) titleRegionDarkPixels += 1;
          }
          if (alpha > 0 && !(red === 255 && green === 255 && blue === 255)) nonWhitePixels += 1;
        }
      }
      return {
        width: canvas.width,
        height: canvas.height,
        backgroundSample: sample(1500, 2000),
        dividerSample: sample(160, 190),
        darkPixels,
        titleRegionDarkPixels,
        nonWhitePixels,
      };
    })()`);
    const expectedExamPixelContent = examPngVisual.width === 1588 &&
      examPngVisual.height === 2246 &&
      examPngVisual.backgroundSample[0] === 255 &&
      examPngVisual.backgroundSample[1] === 255 &&
      examPngVisual.backgroundSample[2] === 255 &&
      examPngVisual.dividerSample[0] === 51 &&
      examPngVisual.dividerSample[1] === 65 &&
      examPngVisual.dividerSample[2] === 85 &&
      examPngVisual.darkPixels > 8_000 &&
      examPngVisual.titleRegionDarkPixels > 500 &&
      examPngVisual.nonWhitePixels > 8_000;
    if (!expectedExamPixelContent) {
      throw new Error(`Exam Paper PNG pixels did not match expected white background, divider, and title: ${JSON.stringify(examPngVisual)}`);
    }

    // Restore Shop Banner because the PDF geometry checks below intentionally
    // exercise the landscape 300 × 125 mm output, not the A4 Exam Paper.
    await evaluate(`(() => {
      const select = document.querySelector('#template-choice');
      const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
      setter.call(select, 'shop-banner-landscape');
      select.dispatchEvent(new Event('change', { bubbles: true }));
      Array.from(document.querySelectorAll('button')).find(button => button.textContent.trim() === 'Use template')?.click();
      return true;
    })()`);
    await waitForPage(
      "Shop Banner restored before PDF geometry checks",
      "document.querySelector('.template-controls')?.innerText || ''",
      value => value.includes("300 × 125 mm"),
    );

    // Exercise the real print workflow without opening a native print dialog.
    // Keep the application's injected print stylesheet active, then ask Chrome
    // for the same PDF output through DevTools so CI can inspect its page box.
    await cdp.send("Emulation.setEmulatedMedia", { media: "print" });
    await evaluate("window.print = () => { window.__designPrintIntercepted = true; }; Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('Print / Save PDF'))?.click(); true");
    await waitForPage(
      "print stylesheet to be installed",
      "Boolean(document.querySelector('style[data-design-print]') && document.querySelector('.app-shell')?.classList.contains('printing-design') && window.__designPrintIntercepted)",
    );
    const printGeometry = await evaluate("(() => { const page = document.querySelector('.design-page'); const rect = page.getBoundingClientRect(); return { width: rect.width, height: rect.height, zoom: Number.parseFloat(getComputedStyle(page).zoom), pageWidth: page.style.width, pageHeight: page.style.height }; })()");
    const expectedCssWidth = 300 * 96 / 25.4;
    const expectedCssHeight = 125 * 96 / 25.4;
    if (Math.abs(printGeometry.width - expectedCssWidth) > 1 ||
        Math.abs(printGeometry.height - expectedCssHeight) > 1 ||
        Math.abs(printGeometry.zoom - (expectedCssWidth / 1200)) > 0.002) {
      throw new Error(`Print layout did not fit the logical canvas to 300 × 125 mm: ${JSON.stringify({ printGeometry, expectedCssWidth, expectedCssHeight })}`);
    }

    const pdfResult = await cdp.send("Page.printToPDF", {
      preferCSSPageSize: true,
      printBackground: true,
      displayHeaderFooter: false,
      scale: 1,
    });
    const pdf = Buffer.from(pdfResult.data, "base64");
    const pdfText = pdf.toString("latin1");
    const mediaBoxMatch = pdfText.match(/\/MediaBox\s*\[\s*([+-]?(?:\d+\.?\d*|\.\d+))\s+([+-]?(?:\d+\.?\d*|\.\d+))\s+([+-]?(?:\d+\.?\d*|\.\d+))\s+([+-]?(?:\d+\.?\d*|\.\d+))\s*\]/);
    if (!pdfText.startsWith("%PDF-") || !mediaBoxMatch) {
      throw new Error(`Chrome did not return a readable PDF page box (bytes=${pdf.length})`);
    }
    const mediaBox = mediaBoxMatch.slice(1).map(Number);
    const actualPdfWidth = mediaBox[2] - mediaBox[0];
    const actualPdfHeight = mediaBox[3] - mediaBox[1];
    const expectedPdfWidth = 300 * 72 / 25.4;
    const expectedPdfHeight = 125 * 72 / 25.4;
    const pageCount = (pdfText.match(/\/Type\s*\/Page\b/g) || []).length;
    if (Math.abs(actualPdfWidth - expectedPdfWidth) > 1.5 ||
        Math.abs(actualPdfHeight - expectedPdfHeight) > 1.5 ||
        pageCount !== 1) {
      throw new Error(`PDF page geometry was not one 300 × 125 mm page: ${JSON.stringify({ mediaBox, actualPdfWidth, actualPdfHeight, expectedPdfWidth, expectedPdfHeight, pageCount, bytes: pdf.length })}`);
    }
    await cdp.send("Emulation.setEmulatedMedia", { media: "screen" });

    process.stdout.write("PASS: Chrome covered WASM import/export, invalid-import safety, add/edit/style/move/undo/redo, autosave/restore, pointer drag/resize, page bounds, template creation, actual 2× PNG dimensions and pixel content for both MVP templates, and one-page 300 × 125 mm PDF geometry.\\n");
  } finally {
    cdp?.close();
    stopProcess(browser);
    stopProcess(nuxt);
    await delay(300);
    await rm(tempRoot, { recursive: true, force: true });
  }
}

main().catch(error => {
  process.stderr.write(`FAIL: ${error.stack || error.message}\n`);
  process.exitCode = 1;
});
