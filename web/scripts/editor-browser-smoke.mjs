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

    async function comparePngToReference(pngBytes, referenceName, expectedWidth, expectedHeight) {
      const referenceSvg = await readFile(resolve(webRoot, "tests/visual-references", referenceName), "utf8");
      const pngBase64 = pngBytes.toString("base64");
      const referenceBase64 = Buffer.from(referenceSvg, "utf8").toString("base64");
      const comparison = await evaluate(`(async () => {
        const loadImage = async (source) => {
          const image = new Image();
          image.src = source;
          await image.decode();
          return image;
        };
        const [actual, reference] = await Promise.all([
          loadImage("data:image/png;base64,${pngBase64}"),
          loadImage("data:image/svg+xml;base64,${referenceBase64}"),
        ]);
        if (actual.naturalWidth !== ${expectedWidth} || actual.naturalHeight !== ${expectedHeight} ||
            reference.naturalWidth !== ${expectedWidth} || reference.naturalHeight !== ${expectedHeight}) {
          throw new Error("Reference image dimensions do not match the expected export dimensions");
        }
        const canvas = document.createElement("canvas");
        canvas.width = ${expectedWidth};
        canvas.height = ${expectedHeight};
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) throw new Error("Could not create reference comparison canvas");
        context.drawImage(actual, 0, 0);
        const actualPixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(reference, 0, 0);
        const referencePixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let differingPixels = 0;
        let totalChannelDelta = 0;
        let maximumChannelDelta = 0;
        for (let offset = 0; offset < actualPixels.length; offset += 4) {
          let pixelDelta = 0;
          for (let channel = 0; channel < 4; channel += 1) {
            const delta = Math.abs(actualPixels[offset + channel] - referencePixels[offset + channel]);
            pixelDelta = Math.max(pixelDelta, delta);
            totalChannelDelta += delta;
            maximumChannelDelta = Math.max(maximumChannelDelta, delta);
          }
          if (pixelDelta > 8) differingPixels += 1;
        }
        const totalPixels = canvas.width * canvas.height;
        return {
          width: canvas.width,
          height: canvas.height,
          differingPixels,
          differingRatio: differingPixels / totalPixels,
          meanChannelDelta: totalChannelDelta / actualPixels.length,
          maximumChannelDelta,
        };
      })()`);
      if (comparison.differingRatio > 0.002 || comparison.meanChannelDelta > 0.25) {
        throw new Error(`PNG export differs from the ${referenceName} visual reference: ${JSON.stringify(comparison)}`);
      }
      process.stdout.write(`PASS: ${referenceName} PNG reference comparison ${JSON.stringify(comparison)}\\n`);
      return comparison;
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

    // Malformed autosaves must not be silently overwritten by later edits.
    const malformedAutosave = "{ this is not valid JSON";
    await evaluate(`localStorage.setItem('design-platform:document:v1', ${JSON.stringify(malformedAutosave)}); location.reload(); true`);
    await waitForPage("recovery warning for malformed autosave", "document.querySelector('#recovery-heading')?.textContent || ''", value => value.includes("needs recovery"));
    await waitForPage("recovery actions visible", "Array.from(document.querySelectorAll('button')).some(button => button.textContent.includes('Replace saved data with current design'))");
    const recoveryEdit = "Edit while recovery is pending";
    await evaluate("document.querySelector('.tools-panel textarea')?.focus(); true");
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Control", code: "ControlLeft", modifiers: 2 });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "a", code: "KeyA", modifiers: 2 });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "a", code: "KeyA", modifiers: 2 });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Control", code: "ControlLeft" });
    await cdp.send("Input.insertText", { text: recoveryEdit });
    await delay(700);
    const preservedAutosave = await evaluate("localStorage.getItem('design-platform:document:v1')");
    if (preservedAutosave !== malformedAutosave) {
      throw new Error("Editing while recovery is pending overwrote the original malformed autosave");
    }
    // Simulate a quota/security write failure. Recovery must remain pending and
    // the original invalid bytes must remain available for a later retry.
    await evaluate("window.__originalStorageSetItem ??= Storage.prototype.setItem; Storage.prototype.setItem = function() { throw new DOMException('quota exceeded', 'QuotaExceededError'); }; true");
    await evaluate("Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('Replace saved data with current design'))?.click(); true");
    await waitForPage("recovery remains available after failed storage write", "document.querySelector('#recovery-heading')?.textContent || ''", value => value.includes("needs recovery"));
    const preservedAfterWriteFailure = await evaluate("localStorage.getItem('design-platform:document:v1')");
    if (preservedAfterWriteFailure !== malformedAutosave) {
      throw new Error("A failed recovery write changed or lost the original malformed autosave");
    }
    await evaluate("Storage.prototype.setItem = window.__originalStorageSetItem; delete window.__originalStorageSetItem; true");

    await evaluate("Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('Replace saved data with current design'))?.click(); true");
    await waitFor("explicit recovery replacement to save current design", async () => {
      const saved = await evaluate("localStorage.getItem('design-platform:document:v1')");
      return saved && saved !== malformedAutosave && saved.includes(recoveryEdit) ? saved : null;
    });
    await evaluate("location.reload(); true");
    await waitForPage("explicitly recovered design to restore", "document.querySelector('.design-page')?.innerText || ''", value => value.includes(recoveryEdit));
    await evaluate("localStorage.clear(); location.reload(); true");
    await waitForPage("fresh editor after recovery regression", "document.querySelector('.design-page')?.innerText || ''", value => value.includes("Your design starts here"));
    await waitForPage("Vue app mount after recovery regression", "Boolean(document.querySelector('#__nuxt')?.__vue_app__)");

    // Prove that a real edit is autosaved and survives a browser reload.
    // This protects the persistence watcher, not just the isolated storage helper.
    const autosaveProbe = "Autosave survives reload";
    await evaluate("document.querySelector('.tools-panel textarea')?.focus(); true");
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Control", code: "ControlLeft", modifiers: 2 });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "a", code: "KeyA", modifiers: 2 });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "a", code: "KeyA", modifiers: 2 });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Control", code: "ControlLeft" });
    await cdp.send("Input.insertText", { text: autosaveProbe });
    await waitFor("edited document to be autosaved", async () => {
      const saved = await evaluate("localStorage.getItem('design-platform:document:v1')");
      return saved && saved.includes(autosaveProbe) ? saved : null;
    });
        await evaluate("location.reload(); true");
    await waitForPage(
      "autosaved text to be restored after reload",
      "document.querySelector('.design-page')?.innerText || ''",
      value => value.includes("Autosave survives reload"),
    );
    // Reset to a clean baseline for the remaining starter-design export checks.
    await evaluate("localStorage.clear(); location.reload(); true");
    await waitForPage("clean starter design after persistence test", "document.querySelector('.design-page')?.innerText || ''", value => value.includes("Your design starts here"));
    await waitForPage("Vue app remount after persistence reset", "Boolean(document.querySelector('#__nuxt')?.__vue_app__)");

    // Audit the rendered control names and named canvas group in the real browser.
    // This is a targeted regression check, not a replacement for screen-reader testing.
    const accessibilityStructure = await evaluate(`(() => {
      const controls = Array.from(document.querySelectorAll('input, select, textarea'));
      const unnamedControls = controls.filter((control) => {
        if (control.type === 'hidden') return false;
        const id = control.id;
        const hasExplicitLabel = id && Array.from(document.querySelectorAll('label')).some(label => label.htmlFor === id);
        const hasWrappingLabel = Boolean(control.closest('label'));
        return !hasExplicitLabel && !hasWrappingLabel && !control.getAttribute('aria-label') && !control.getAttribute('aria-labelledby');
      }).map(control => ({ tag: control.tagName, type: control.type || '', id: control.id || '' }));
      const buttonsWithoutNames = Array.from(document.querySelectorAll('button')).filter(button =>
        !button.getAttribute('aria-label') && !button.getAttribute('aria-labelledby') && !button.innerText.trim()
      ).map(button => button.outerHTML.slice(0, 160));
      const page = document.querySelector('.design-page');
      const moveGroup = document.querySelector('.move-grid');
      const moveGroupLabel = moveGroup?.getAttribute('aria-labelledby') || '';
      return {
        unnamedControls,
        buttonsWithoutNames,
        canvasRole: page?.getAttribute('role') || '',
        canvasLabel: page?.getAttribute('aria-label') || '',
        moveGroupRole: moveGroup?.getAttribute('role') || '',
        moveGroupLabel: moveGroupLabel && document.getElementById(moveGroupLabel)?.textContent?.trim() || '',
      };
    })()`);
    if (accessibilityStructure.unnamedControls.length || accessibilityStructure.buttonsWithoutNames.length ||
        accessibilityStructure.canvasRole !== 'group' || accessibilityStructure.canvasLabel !== 'Editable design page' ||
        accessibilityStructure.moveGroupRole !== 'group' || accessibilityStructure.moveGroupLabel !== 'Move selected element') {
      throw new Error(`Rendered accessibility structure is incomplete: ${JSON.stringify(accessibilityStructure)}`);
    }

    // Keep the small muted labels above the WCAG AA 4.5:1 normal-text
    // contrast threshold on their current white surfaces. This is a targeted
    // regression check for these known surfaces, not a full-page contrast audit.
    const mutedTextContrast = await evaluate(`(() => {
      const nodes = [
        document.querySelector('.hint'),
        document.querySelector('.canvas-heading p'),
        document.querySelector('.canvas-note'),
      ].filter(Boolean);
      const luminance = (channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      };
      const luminanceOf = (value) => {
        // Computed CSS colors are not guaranteed to serialize as rgb()/rgba();
        // newer browsers may return color(srgb ...), oklab(), or other CSS Color 4
        // forms. Let the browser's own canvas color parser normalize them to sRGB.
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) throw new Error('Could not create canvas context for CSS color parsing');
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = value;
        context.fillRect(0, 0, 1, 1);
        const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
        canvas.width = 0;
        canvas.height = 0;
        const channels = [red, green, blue].map(luminance);
        return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
      };
      const contrast = (foreground, background) => {
        const first = luminanceOf(foreground);
        const second = luminanceOf(background);
        return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
      };
      return nodes.map((node) => {
        const style = getComputedStyle(node);
        const background = 'rgb(255, 255, 255)';
        return { selector: node.className || node.tagName.toLowerCase(), color: style.color, contrast: contrast(style.color, background) };
      });
    })()`);
    const failingContrast = mutedTextContrast.filter(item => item.contrast < 4.5);
    if (mutedTextContrast.length !== 3 || failingContrast.length) {
      throw new Error(`Muted text contrast fell below 4.5:1 on white: ${JSON.stringify(mutedTextContrast)}`);
    }

    
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
    if (exported.schema_version !== 4 || exported.elements?.length !== 2) {
      throw new Error("Exported file did not contain the expected versioned two-element document");
    }

    // Import the shared valid fixture through the actual file input and UI event handler.
    const fixture = await readFile(fixturePath, "utf8");
    const importExpression = `(() => {
      const input = document.querySelector('input[aria-label="Import design JSON file"]');
      const transfer = new DataTransfer();
      transfer.items.add(new File([${JSON.stringify(fixture)}], "document-v1.json", { type: "application/json" }));
      input.files = transfer.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    })()`;
    await evaluate(importExpression);
    await waitForPage("WASM-backed JSON import", "document.querySelector('[role=status]')?.textContent || ''", value => value.includes("imported and validated with WebAssembly"));
    await waitForPage("imported fixture visible on canvas", "document.querySelector('.design-page')?.innerText || ''", value => value.includes("Exam Paper"));
    await waitForPage("fixture import autosave", "document.querySelector('[role=status]')?.textContent || ''", value => value.includes("Auto-saved locally in this browser"));

    // Upload a real raster fixture and verify the page image and fit control.
    const backgroundImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR4nGP8z8DAwMDAxMDAwMDAAAANHQEDasKb6QAAAABJRU5ErkJggg==";
    await evaluate(`(() => {
      const input = document.querySelector('input[aria-label="Upload page background image"]');
      const bytes = Uint8Array.from(atob("${backgroundImageBase64}"), character => character.charCodeAt(0));
      const transfer = new DataTransfer();
      transfer.items.add(new File([bytes], "background.png", { type: "image/png" }));
      input.files = transfer.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    })()`);
    try {
      await waitFor("background image to render", () => evaluate("Boolean(document.querySelector('.page-background-image')?.getAttribute('src')?.startsWith('data:image/png;base64,'))"));
    } catch (error) {
      const diagnostics = await evaluate("JSON.stringify({ status: document.querySelector('[role=status]')?.textContent || '', backgroundImage: Boolean(document.querySelector('.page-background-image')), fileInputs: document.querySelectorAll('input[type=file]').length })");
      throw new Error(`Background image did not render: ${error.message}. Browser diagnostics: ${diagnostics}`);
    }
    const backgroundVisible = await evaluate("Boolean(document.querySelector('.page-background-image')?.getAttribute('src')?.startsWith('data:image/png;base64,'))");
    if (!backgroundVisible) throw new Error("Uploaded page background was not rendered");
    await evaluate(`(() => {
      const select = Array.from(document.querySelectorAll('label')).find(label => label.textContent.includes('Image fit'))?.querySelector('select');
      if (!select) throw new Error("Background image fit control was not rendered");
      select.value = "contain";
      select.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    })()`);
    const fitMode = await evaluate("document.querySelector('.page-background-image') ? getComputedStyle(document.querySelector('.page-background-image')).objectFit : ''");
    if (fitMode !== "contain") throw new Error(`Background image fit mode was not applied: ${fitMode}`);
    await waitForPage("background image autosave", "document.querySelector('[role=status]')?.textContent || ''", value => value.includes("Auto-saved locally in this browser"));
    const savedBackgroundFit = await evaluate("JSON.parse(localStorage.getItem('design-platform:document:v1') || 'null')?.page?.background_image?.fit || ''");
    if (savedBackgroundFit !== "contain") throw new Error(`Background image or fit mode was not preserved in local autosave: ${savedBackgroundFit}`);

    // A rejected import must not replace the currently loaded valid document.
    const invalidFixture = JSON.stringify({ ...JSON.parse(fixture), schema_version: 999 });
    const invalidImportExpression = `(() => {
      const input = document.querySelector('input[aria-label="Import design JSON file"]');
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

    // Keyboard users need a visible focus indicator and must be able to invoke
    // the same core actions without pointer input. Walk the real Tab order until
    // the Add text button is focused, rather than forcing focus programmatically.
    await evaluate("document.activeElement?.blur(); true");
    let keyboardAccessibility = null;
    for (let tab = 0; tab < 30; tab += 1) {
      await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
      await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 });
      keyboardAccessibility = await evaluate("(() => { const button = Array.from(document.querySelectorAll('button')).find(item => item.textContent.includes('＋ Add text')); const style = button ? getComputedStyle(button) : null; return { focused: document.activeElement === button, outlineStyle: style?.outlineStyle, outlineWidth: style?.outlineWidth, label: Array.from(document.querySelectorAll('.design-element')).find(item => item.textContent.includes('Exam Paper'))?.getAttribute('aria-label') || '' }; })()");
      if (keyboardAccessibility.focused) break;
    }
    if (!keyboardAccessibility?.focused || keyboardAccessibility.outlineStyle === 'none' || keyboardAccessibility.outlineWidth !== '3px') {
      throw new Error(`Keyboard navigation did not reach Add text with a visible focus indicator: ${JSON.stringify(keyboardAccessibility)}`);
    }
    // Space activates a focused native button on key release. Use the browser's
    // real keyboard input path rather than element.click() or synthetic DOM events.
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: " ", code: "Space", windowsVirtualKeyCode: 32, nativeVirtualKeyCode: 32 });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: " ", code: "Space", windowsVirtualKeyCode: 32, nativeVirtualKeyCode: 32 });
    try {
      await waitForPage("keyboard activation adds text", "document.querySelector('.canvas-heading > span')?.textContent || ''", value => value.trim() === "3 elements", 5_000);
    } catch (error) {
      const diagnostics = await evaluate("JSON.stringify({ activeTag: document.activeElement?.tagName || '', activeText: document.activeElement?.textContent?.trim() || '', activeLabel: document.activeElement?.getAttribute('aria-label') || '', count: document.querySelector('.canvas-heading > span')?.textContent || '', button: Array.from(document.querySelectorAll('button')).find(item => item.textContent.includes('＋ Add text'))?.outerHTML || '' })");
      throw new Error(`Keyboard activation did not add text: ${error.message}. Browser diagnostics: ${diagnostics}`);
    }
    const keyboardElementLabel = await evaluate("Array.from(document.querySelectorAll('.design-element')).find(item => item.textContent.includes('Exam Paper'))?.getAttribute('aria-label') || ''");
    if (!keyboardElementLabel.includes('Exam Paper')) throw new Error(`Canvas element accessible name omits its text: ${keyboardElementLabel}`);

    // Exercise core editing controls through the rendered UI. Use accessible
    // labels and visible canvas state rather than Vue internals.
    const fixtureCount = Number.parseInt(await evaluate("document.querySelector('.canvas-heading > span')?.textContent || '0'"), 10);
    await evaluate("Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('＋ Add text'))?.click(); true");
    await waitForPage("new text element", "document.querySelector('textarea')?.value || ''", value => value === "New text");
    await evaluate("Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('＋ Add rectangle'))?.click(); true");
    await waitForPage("rectangle added", "document.querySelector('.canvas-heading > span')?.textContent || ''", value => value.trim() === `${fixtureCount + 2} elements`);

    await evaluate("Array.from(document.querySelectorAll('.design-element')).find(element => element.textContent.includes('New text'))?.click(); true");
    const selectionStatus = await waitFor("selected element announcement", async () => {
      const status = await evaluate(`(() => {
        const node = document.querySelector('.selected-name');
        return { text: node?.textContent?.trim() || "", role: node?.getAttribute("role") || "", live: node?.getAttribute("aria-live") || "", atomic: node?.getAttribute("aria-atomic") || "" };
      })()`);
      return status.role === "status" && status.live === "polite" && status.atomic === "true" && status.text.includes("New text") ? status : null;
    }, 5_000);
    if (!selectionStatus) throw new Error("Selecting an element did not expose a polite, descriptive selection announcement.");
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

    const sizeControls = await evaluate(`(() => {
      const width = document.querySelector('input[aria-label="Selected element width"]');
      const height = document.querySelector('input[aria-label="Selected element height"]');
      return {
        width: width?.value || "",
        height: height?.value || "",
        widthMin: width?.min || "",
        heightMin: height?.min || "",
      };
    })()`);
    if (!Number(sizeControls.width) || !Number(sizeControls.height) || sizeControls.widthMin !== "8" || sizeControls.heightMin !== "8") {
      throw new Error(`Selected element size controls do not expose the actual minimum geometry size: ${JSON.stringify(sizeControls)}`);
    }
    const beforeKeyboardResize = await selectedTextGeometry();
    const tabUntilFocused = async (description, focusedExpression, maxTabs = 50) => {
      for (let tab = 0; tab < maxTabs; tab += 1) {
        await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
        await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
        if (await evaluate(focusedExpression)) return;
      }
      const focus = await evaluate("JSON.stringify({ tag: document.activeElement?.tagName || '', label: document.activeElement?.getAttribute('aria-label') || '', text: document.activeElement?.textContent?.trim() || '' })");
      throw new Error(`Keyboard Tab order did not reach ${description}. Current focus: ${focus}`);
    };
    // Reach the width field through the browser's actual Tab order; do not call
    // focus() or select() in page JavaScript.
    await tabUntilFocused(
      "Selected element width",
      "document.activeElement?.getAttribute('aria-label') === 'Selected element width'",
    );
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Control", code: "ControlLeft", windowsVirtualKeyCode: 17 });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "a", code: "KeyA", windowsVirtualKeyCode: 65 });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "a", code: "KeyA", windowsVirtualKeyCode: 65 });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Control", code: "ControlLeft", windowsVirtualKeyCode: 17 });
    await cdp.send("Input.insertText", { text: String(beforeKeyboardResize.width + 15) });
    // Tab away to commit the native number input through its real change/blur path.
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab", windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9 });
    const afterKeyboardResize = await waitFor("keyboard width edit", async () => {
      const value = await selectedTextGeometry();
      return value.width === beforeKeyboardResize.width + 15 ? value : null;
    }, 5_000);
    if (afterKeyboardResize.width !== beforeKeyboardResize.width + 15) {
      throw new Error(`Keyboard width control did not resize the selected element: ${JSON.stringify({ beforeKeyboardResize, afterKeyboardResize })}`);
    }

    // Undo/redo are also keyboard-only: traverse the native Tab order and
    // activate the focused controls with Space, never element.click().
    await delay(500);
    await tabUntilFocused(
      "Undo button",
      "document.activeElement === Array.from(document.querySelectorAll('button')).find(button => button.textContent.trim() === 'Undo')",
    );
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: " ", code: "Space", windowsVirtualKeyCode: 32, nativeVirtualKeyCode: 32 });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: " ", code: "Space", windowsVirtualKeyCode: 32, nativeVirtualKeyCode: 32 });
    await waitForPage("keyboard undo restores prior text", "document.querySelector('.design-page')?.innerText || ''", value => !value.includes("Browser interaction proof"));
    await tabUntilFocused(
      "Redo button",
      "document.activeElement === Array.from(document.querySelectorAll('button')).find(button => button.textContent.trim() === 'Redo')",
    );
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: " ", code: "Space", windowsVirtualKeyCode: 32, nativeVirtualKeyCode: 32 });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: " ", code: "Space", windowsVirtualKeyCode: 32, nativeVirtualKeyCode: 32 });
    await waitForPage("keyboard redo restores edited text", "document.querySelector('.design-page')?.innerText || ''", value => value.includes("Browser interaction proof"));
    await delay(500);
    await evaluate("location.reload(); true");
    await waitForPage("locally saved document restored after reload", "document.querySelector('.design-page')?.innerText || ''", value => value.includes("Browser interaction proof"));
    const restoredCount = await evaluate("document.querySelector('.canvas-heading > span')?.textContent?.trim() || ''");
    if (restoredCount !== `${fixtureCount + 2} elements`) throw new Error(`Autosave did not restore added elements: ${restoredCount}`);

    // Real mouse input through Chrome DevTools exercises actual pointer capture.
    // Widen the viewport so the full 800x600 logical page and its edge handles are reachable.
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1600, height: 1000, deviceScaleFactor: 1, mobile: false });
    // Keyboard focus can scroll the document to the focused toolbar control.
    // Reset scroll after changing the viewport so pointer coordinates are stable.
    await evaluate("window.scrollTo(0, 0); true");
    await delay(100);
    async function mouse(type, x, y, buttons = 0) {
      await cdp.send("Input.dispatchMouseEvent", {
        type, x, y, button: type === "mouseReleased" ? "left" : "left",
        buttons, clickCount: type === "mousePressed" ? 1 : 0,
      });
    }
    async function clickButtonContaining(text) {
      const rect = await evaluate(`(() => {
        const button = Array.from(document.querySelectorAll("button")).find(node => node.textContent.includes(${JSON.stringify(text)}));
        if (!button) throw new Error("Button not found: " + ${JSON.stringify(text)});
        const rect = button.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) throw new Error("Button is not visible: " + ${JSON.stringify(text)});
        return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
      })()`);
      await mouse("mouseMoved", rect.x, rect.y);
      await mouse("mousePressed", rect.x, rect.y, 1);
      await mouse("mouseReleased", rect.x, rect.y);
    }
    async function selectedTextGeometry() {
      return evaluate("(() => { const element = Array.from(document.querySelectorAll('.design-element')).find(node => node.textContent.includes('Browser interaction proof')); if (!element) throw new Error('Edited text element not found'); const rect = element.getBoundingClientRect(); const page = document.querySelector('.design-page').getBoundingClientRect(); const style = getComputedStyle(element); return { left: parseFloat(style.left), top: parseFloat(style.top), width: parseFloat(style.width), height: parseFloat(style.height), clientLeft: rect.left, clientTop: rect.top, pageLeft: page.left, pageTop: page.top }; })()");
    }

    await evaluate("Array.from(document.querySelectorAll('.design-element')).find(element => element.textContent.includes('Browser interaction proof'))?.scrollIntoView({ block: 'center', inline: 'center' }); true");
    let geometry = await selectedTextGeometry();
    // Other canvas elements can overlap this element. Find an exposed point
    // inside its actual rendered bounds rather than assuming the top-left area
    // is unobstructed; keep the test on the real mouse/pointer input path.
    const dragStart = await evaluate(`(() => {
      const element = Array.from(document.querySelectorAll('.design-element')).find(node => node.textContent.includes('Browser interaction proof'));
      if (!element) throw new Error('Edited text element not found');
      const rect = element.getBoundingClientRect();
      const candidates = [];
      for (const yFraction of [0.25, 0.5, 0.75]) {
        for (const xFraction of [0.15, 0.35, 0.55, 0.75, 0.9]) {
          const x = rect.left + rect.width * xFraction;
          const y = rect.top + rect.height * yFraction;
          const hit = document.elementFromPoint(x, y);
          if (hit && (hit === element || element.contains(hit))) candidates.push({ x, y });
        }
      }
      return candidates[0] || null;
    })()`);
    if (!dragStart) throw new Error(`No unobstructed pointer drag point found inside the target element: ${JSON.stringify(geometry)}`);
    // Drag by a modest delta and verify the actual pointer-driven position change.
    await mouse("mouseMoved", dragStart.x, dragStart.y);
    await mouse("mousePressed", dragStart.x, dragStart.y, 1);
    await mouse("mouseMoved", dragStart.x + 40, dragStart.y + 30, 1);
    await mouse("mouseReleased", dragStart.x + 40, dragStart.y + 30);
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
    const boundaryTarget = await evaluate(`(() => {
      const page = document.querySelector('.design-page').getBoundingClientRect();
      const element = Array.from(document.querySelectorAll('.design-element')).find(node => node.textContent.includes('Browser interaction proof'));
      const style = getComputedStyle(element);
      const width = parseFloat(style.width);
      const height = parseFloat(style.height);
      const left = parseFloat(style.left);
      const top = parseFloat(style.top);
      const rect = element.getBoundingClientRect();
      let start = null;
      for (const yFraction of [0.25, 0.5, 0.75]) {
        for (const xFraction of [0.15, 0.35, 0.55, 0.75, 0.9]) {
          const x = rect.left + rect.width * xFraction;
          const y = rect.top + rect.height * yFraction;
          const hit = document.elementFromPoint(x, y);
          if (hit && (hit === element || element.contains(hit))) { start = { x, y }; break; }
        }
        if (start) break;
      }
      if (!start) return null;
      const maxLeft = 800 - width;
      const maxTop = 600 - height;
      return {
        startX: start.x, startY: start.y,
        targetX: page.left + maxLeft + (start.x - rect.left),
        targetY: page.top + maxTop + (start.y - rect.top),
        maxLeft, maxTop
      };
    })()`);
    if (!boundaryTarget) throw new Error("No unobstructed point found for boundary drag");
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

    // Frames and grids are first-class editable elements with bounded controls.
    await evaluate("Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('＋ Add frame'))?.click(); true");
    await waitForPage("frame added", "document.querySelector('.design-element.frame')?.getAttribute('aria-label') || ''", value => value.includes("frame element"));
    const frameStyle = await evaluate("(() => { const frame = document.querySelector('.design-element.frame'); return { border: frame ? getComputedStyle(frame).borderTopWidth : '', fill: frame ? getComputedStyle(frame).backgroundColor : '' }; })()");
    if (frameStyle.border !== "2px") throw new Error("Frame default stroke was not rendered: " + JSON.stringify(frameStyle));

    await evaluate("Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('＋ Add grid'))?.click(); true");
    await waitForPage("grid added", "document.querySelector('.design-element.grid')?.getAttribute('aria-label') || ''", value => value.includes("3 rows and 3 columns"));
    const setNumberField = async (label, value) => evaluate(`(() => {
      const field = Array.from(document.querySelectorAll('label.field')).find(node => node.textContent.includes(${JSON.stringify(label)}));
      const input = field?.querySelector('input');
      if (!input) throw new Error("Missing grid property input: " + ${JSON.stringify(label)});
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
      setter.call(input, ${JSON.stringify(String(value))});
      input.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    })()`);
    await setNumberField("Stroke width", 3.5);
    await setNumberField("Rows (1–20)", 4);
    await setNumberField("Columns (1–20)", 5);
    const configuredGrid = await evaluate("(() => { const grid = document.querySelector('.design-element.grid'); const fields = Array.from(document.querySelectorAll('label.field')); return { label: grid?.getAttribute('aria-label') || '', backgroundSize: grid ? getComputedStyle(grid).backgroundSize : '', backgroundImage: grid ? getComputedStyle(grid).backgroundImage : '', rows: fields.find(node => node.textContent.includes('Rows'))?.querySelector('input')?.value, columns: fields.find(node => node.textContent.includes('Columns'))?.querySelector('input')?.value }; })()");
    if (!configuredGrid.label.includes("4 rows and 5 columns") || configuredGrid.rows !== "4" || configuredGrid.columns !== "5" || !configuredGrid.backgroundImage.includes("3.5px")) {
      throw new Error("Grid controls did not apply the selected structure and stroke width: " + JSON.stringify(configuredGrid));
    }
    await waitFor("schema-v4 frame/grid autosave", async () => {
      const saved = await evaluate("localStorage.getItem('design-platform:document:v1')");
      if (!saved) return null;
      const doc = JSON.parse(saved);
      return doc.schema_version === 4 && doc.elements.some(item => item.kind.type === "frame") &&
        doc.elements.some(item => item.kind.type === "grid" && item.kind.rows === 4 && item.kind.columns === 5) ? saved : null;
    });
    await evaluate("location.reload(); true");
    await waitForPage("frame and grid restore after reload", "document.querySelectorAll('.design-element.frame').length + ':' + document.querySelectorAll('.design-element.grid').length", value => value === "1:1");
    const restoredGrid = await evaluate("(() => { const grid = document.querySelector('.design-element.grid'); return grid?.getAttribute('aria-label') || ''; })()");
    if (!restoredGrid.includes("4 rows and 5 columns")) throw new Error("Saved grid structure did not survive reload: " + restoredGrid);

    // Export the persisted frame/grid document through the actual browser PNG path.
    await clickButtonContaining("Download PNG");
    let frameGridPngStatus;
    try {
      frameGridPngStatus = await waitForPage(
        "frame/grid PNG export status",
        "document.querySelector('aside.tools-panel')?.querySelector('p[role=status]')?.textContent || ''",
        value => value.includes("PNG exported at 1600 × 1200 pixels") || value.startsWith("PNG export failed:"),
      );
    } catch (error) {
      const diagnostics = await evaluate("JSON.stringify({ status: document.querySelector('aside.tools-panel')?.querySelector('p[role=status]')?.textContent || null, allStatuses: Array.from(document.querySelectorAll('[role=status]')).map(node => ({ text: node.textContent, className: node.className, parent: node.parentElement?.className })), toolsText: document.querySelector('aside.tools-panel')?.innerText || null, pngButtons: Array.from(document.querySelectorAll('button')).filter(button => button.textContent.includes('Download PNG')).map(button => ({ text: button.textContent, disabled: button.disabled, rect: (() => { const r = button.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; })() })) })");
      throw new Error(`Frame/grid PNG export status diagnostic: ${diagnostics}; ${error instanceof Error ? error.message : String(error)}`);
    }
    if (!frameGridPngStatus.includes("PNG exported at 1600 × 1200 pixels")) {
      throw new Error("Frame/grid PNG export failed: " + frameGridPngStatus);
    }
    const frameGridPngPath = await waitFor("downloaded frame/grid PNG", async () => {
      const names = await readdir(downloads);
      if (names.some(item => item.endsWith(".crdownload"))) return null;
      const name = names.find(item => item === "design-platform.png");
      if (!name) return null;
      const path = resolve(downloads, name);
      const info = await stat(path);
      return info.size > 100 ? path : null;
    });
    const frameGridPng = await readFile(frameGridPngPath);
    if (!frameGridPng.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
        frameGridPng.toString("ascii", 12, 16) !== "IHDR" ||
        frameGridPng.readUInt32BE(16) !== 1600 || frameGridPng.readUInt32BE(20) !== 1200) {
      throw new Error("Frame/grid PNG signature or dimensions were invalid.");
    }
    await rm(frameGridPngPath);

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
    await clickButtonContaining("Download PNG");
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

    await comparePngToReference(png, "shop-banner.svg", 2400, 1000);

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
      let titleRegionDarkPixels = 0;
      let subtitleRegionDarkPixels = 0;
      let footerRegionDarkPixels = 0;
      let nonBackgroundPixels = 0;
      for (let offset = 0; offset < pixels.length; offset += 4) {
        const red = pixels[offset];
        const green = pixels[offset + 1];
        const blue = pixels[offset + 2];
        const alpha = pixels[offset + 3];
        const pixelIndex = offset / 4;
        const x = pixelIndex % canvas.width;
        const y = Math.floor(pixelIndex / canvas.width);
        if (alpha > 0 && red > 200 && green > 40 && green < 120 && blue < 60) orangePixels += 1;
        if (alpha > 0 && red < 175 && green < 105 && blue < 75) {
          darkTextPixels += 1;
          if (x >= 80 && x < 2300 && y >= 180 && y < 360) titleRegionDarkPixels += 1;
          if (x >= 80 && x < 2200 && y >= 390 && y < 540) subtitleRegionDarkPixels += 1;
          if (x >= 80 && x < 1100 && y >= 660 && y < 800) footerRegionDarkPixels += 1;
        }
        if (alpha > 0 && !(red === 255 && green === 247 && blue === 237)) nonBackgroundPixels += 1;
      }
      const result = {
        width: canvas.width,
        height: canvas.height,
        accentSample: sample(1200, 10),
        accentLeftEdge: sample(0, 10),
        accentRightEdge: sample(2399, 10),
        backgroundSample: sample(2390, 990),
        orangePixels,
        darkTextPixels,
        titleRegionDarkPixels,
        subtitleRegionDarkPixels,
        footerRegionDarkPixels,
        nonBackgroundPixels,
      };
      // Release the decoded image and backing store before exporting the next
      // template; the smoke test intentionally exercises two large PNGs.
      canvas.width = 0;
      canvas.height = 0;
      image.src = "";
      return result;
    })()`);
    const expectedPixelContent = pngVisual.width === 2400 &&
      pngVisual.height === 1000 &&
      pngVisual.accentSample[0] === 234 && pngVisual.accentSample[1] === 88 && pngVisual.accentSample[2] === 12 &&
      pngVisual.accentLeftEdge[0] === 234 && pngVisual.accentLeftEdge[1] === 88 && pngVisual.accentLeftEdge[2] === 12 &&
      pngVisual.accentRightEdge[0] === 234 && pngVisual.accentRightEdge[1] === 88 && pngVisual.accentRightEdge[2] === 12 &&
      pngVisual.backgroundSample[0] === 255 && pngVisual.backgroundSample[1] === 247 && pngVisual.backgroundSample[2] === 237 &&
      pngVisual.orangePixels > 30_000 &&
      pngVisual.darkTextPixels > 500 &&
      pngVisual.titleRegionDarkPixels > 500 &&
      pngVisual.subtitleRegionDarkPixels > 250 &&
      pngVisual.footerRegionDarkPixels > 100 &&
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

    await clickButtonContaining("Download PNG");
    let examPngStatus;
    try {
      examPngStatus = await waitForPage(
        "Exam Paper PNG export status",
        "document.querySelector('[role=status]')?.textContent || ''",
        value => value.includes("PNG exported at 1588 × 2246 pixels") || value.startsWith("PNG export failed:"),
      );
    } catch (error) {
      const diagnostics = await evaluate(`JSON.stringify({
        status: document.querySelector('[role=status]')?.textContent || '',
        page: (() => { const page = document.querySelector('.design-page'); return page ? { width: page.style.width, height: page.style.height, text: page.innerText.slice(0, 300) } : null; })(),
        button: Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('Download PNG'))?.outerHTML || null,
        template: document.querySelector('.template-controls')?.innerText || '',
      })`);
      throw new Error(`Exam Paper PNG status timed out: ${error.message}. Browser diagnostics: ${diagnostics}`);
    }
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

    await comparePngToReference(examPng, "exam-paper.svg", 1588, 2246);
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
      let subjectRegionDarkPixels = 0;
      let classTimeRegionDarkPixels = 0;
      let instructionsRegionDarkPixels = 0;
      let dividerRegionPixels = 0;
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
            if (x >= 80 && x < 1000 && y >= 60 && y < 150) titleRegionDarkPixels += 1;
            if (x >= 80 && x < 800 && y >= 220 && y < 300) subjectRegionDarkPixels += 1;
            if (x >= 80 && x < 1500 && y >= 300 && y < 400) classTimeRegionDarkPixels += 1;
            if (x >= 80 && x < 1500 && y >= 430 && y < 550) instructionsRegionDarkPixels += 1;
          }
          if (alpha > 0 && red === 51 && green === 65 && blue === 85 &&
              x >= 80 && x < 1510 && y >= 188 && y < 195) dividerRegionPixels += 1;
          if (alpha > 0 && !(red === 255 && green === 255 && blue === 255)) nonWhitePixels += 1;
        }
      }
      const result = {
        width: canvas.width,
        height: canvas.height,
        backgroundSample: sample(1500, 2000),
        dividerSample: sample(160, 190),
        darkPixels,
        titleRegionDarkPixels,
        subjectRegionDarkPixels,
        classTimeRegionDarkPixels,
        instructionsRegionDarkPixels,
        dividerRegionPixels,
        nonWhitePixels,
      };
      // Release the decoded image and backing store after sampling this export.
      canvas.width = 0;
      canvas.height = 0;
      image.src = "";
      return result;
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
      examPngVisual.subjectRegionDarkPixels > 100 &&
      examPngVisual.classTimeRegionDarkPixels > 150 &&
      examPngVisual.instructionsRegionDarkPixels > 200 &&
      examPngVisual.dividerRegionPixels > 7_000 &&
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

    process.stdout.write("PASS: Chrome covered WASM import/export, invalid-import safety, keyboard Tab/Space editing and undo/redo, add/edit/style/move, autosave/restore, pointer drag/resize, page bounds, template creation, actual 2× PNG dimensions and pixel content for both MVP templates, and one-page 300 × 125 mm PDF geometry.\\n");
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
