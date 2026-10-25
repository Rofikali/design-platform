import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import { spawn } from "node:child_process";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = resolve(fileURLToPath(new URL(".", import.meta.url)));
const repositoryRoot = resolve(scriptDirectory, "../..");
const chrome = process.env.CHROME_BIN || "google-chrome";
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
};

await access(resolve(repositoryRoot, "web/generated/design-wasm/design_wasm.js"));
await access(resolve(repositoryRoot, "web/generated/design-wasm/design_wasm_bg.wasm"));

const server = createServer((request, response) => {
  const pathname = new URL(request.url || "/", "http://127.0.0.1").pathname;
  const relativePath = pathname === "/" ? "web/browser-tests/wasm-smoke.html" : decodeURIComponent(pathname).slice(1);
  const target = resolve(repositoryRoot, relativePath);
  if (target !== repositoryRoot && !target.startsWith(repositoryRoot + sep)) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Content-Type", mimeTypes[extname(target)] || "application/octet-stream");
  const stream = createReadStream(target);
  stream.on("error", () => {
    if (!response.headersSent) response.writeHead(404);
    response.end("Not found");
  });
  stream.pipe(response);
});

await new Promise((resolveListen, rejectListen) => {
  server.once("error", rejectListen);
  server.listen(0, "127.0.0.1", resolveListen);
});

const address = server.address();
if (!address || typeof address === "string") throw new Error("Could not determine smoke-test server port");
const url = `http://127.0.0.1:${address.port}/`;

try {
  const output = await new Promise((resolveRun, rejectRun) => {
    const child = spawn(chrome, [
      "--headless",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--no-first-run",
      "--no-default-browser-check",
      "--virtual-time-budget=5000",
      "--dump-dom",
      url,
    ], { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", chunk => { stdout += chunk; });
    child.stderr.setEncoding("utf8").on("data", chunk => { stderr += chunk; });
    const timeout = setTimeout(() => {
      child.kill("SIGKILL");
      rejectRun(new Error("Chrome timed out during WASM browser smoke test"));
    }, 30_000);
    child.once("error", error => {
      clearTimeout(timeout);
      rejectRun(new Error(`Could not launch Chrome (${chrome}): ${error.message}`));
    });
    child.once("close", code => {
      clearTimeout(timeout);
      if (code !== 0) rejectRun(new Error(`Chrome exited with ${code}: ${stderr.slice(-3000)}`));
      else resolveRun({ stdout, stderr });
    });
  });

  if (!output.stdout.includes('data-status="passed"')) {
    throw new Error(`Browser smoke test did not pass. Browser output:\n${output.stdout.slice(-5000)}\n${output.stderr.slice(-2000)}`);
  }
  process.stdout.write("PASS: real Chrome initialized the generated Rust/WASM module and rejected invalid inputs.\n");
} finally {
  await new Promise(resolveClose => server.close(resolveClose));
}
