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
    nuxt = startProcess("pnpm", ["exec", "nuxt", "dev", "--host", "127.0.0.1", "--port", String(port)], {
      cwd: webRoot,
    });
    await waitFor("Nuxt dev server", async () => {
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

    // Export must report WASM, not the TypeScript fallback.
    await evaluate("Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('Download JSON'))?.click(); true");
    await waitForPage("WASM-backed JSON export", "document.querySelector('[role=status]')?.textContent || ''", value => value.includes("validated with WebAssembly and downloaded"));
    const exportedPath = await waitFor("downloaded JSON file", async () => {
      const names = await readdir(downloads);
      const name = names.find(item => item === "design-platform-document.json");
      if (!name || names.some(item => item.endsWith(".crdownload"))) return null;
      const path = resolve(downloads, name);
      const info = await stat(path);
      return info.size > 0 ? path : null;
    });
    const exported = JSON.parse(await readFile(exportedPath, "utf8"));
    if (exported.schema_version !== 1 || exported.elements?.length !== 2) {
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

    process.stdout.write("PASS: real Nuxt editor in headless Chrome exported and imported through WASM; invalid import was rejected without replacing the current document.\n");
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
