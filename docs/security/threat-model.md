# Initial Security Threat Model

## Scope
The planned browser editor, saved design documents, uploaded assets, API, and export pipeline. This is an initial threat model, not a completed security audit or certification.

## Assets to protect
- User documents, designs, uploaded images, and account data.
- Authentication credentials and session tokens.
- Service availability and compute/memory budgets.
- Billing and usage records when introduced.
- Proprietary templates and application code.

## Trust boundaries
- Browser to API.
- One user/account to another.
- Uploaded file/document to parser or renderer.
- API to export worker.
- Application to third-party dependencies and storage providers.

## Threats and controls

### Untrusted document structure and render complexity
**Threat:** Imported frame/grid variants contain invalid colors, non-finite or excessive stroke widths, huge row/column counts, duplicate IDs, or geometry that triggers excessive SVG work or inconsistent rendering.

**Current client/core controls:** Schema v4 validation allowlists frame/grid fields, constrains grid rows and columns to 1–20, constrains stroke width to 0.1–100 logical units, validates colors, and retains document-wide element/geometry limits. Rust core and TypeScript fallback must enforce the same contract. Grid rendering is bounded by the row/column caps and produces a deterministic finite number of SVG lines.

**Residual risk:** Browser/WASM validation is defense-in-depth only. Any future API must independently validate the schema and enforce request, CPU, memory and output limits. SVG export must continue to escape values and must not accept arbitrary SVG/HTML from documents.

### Broken access control / IDOR
**Threat:** A user reads, edits, exports, or deletes another user's document by changing an identifier.

**Controls:** Enforce ownership and authorization server-side on every object operation; test cross-account access; use deny-by-default behavior. Opaque IDs are not authorization.

### Malicious files and parser vulnerabilities
**Threat:** Crafted images, fonts, SVG, or documents exploit parsers, load remote resources, or consume excessive resources.

**Current browser controls:** Schema-v3 page backgrounds accept embedded PNG/JPEG/WebP data only. The frontend checks raster signatures, decodes the image, enforces a 4,096-pixel edge limit, a 16-million-pixel decoded-area limit, and a 1 MiB embedded-data limit. SVG and remote image URLs are rejected. JSON import and local restore repeat the browser decode and dimension checks.

**Required future server controls:** Browser checks are bypassable and do not protect a future API. The trusted server must independently inspect bytes, decode in a constrained process, enforce upload/dimension/pixel/decompression/output limits, disallow external references and scripts, keep parsers patched, and use a sandboxed export process.

### Resource exhaustion
**Threat:** Huge dimensions, pathological text, complex vectors, repeated exports, or decompression bombs exhaust CPU, memory, disk, or provider quotas.

**Controls:** Enforce per-operation limits, request timeouts, concurrency limits, quotas, bounded temporary storage, output-size limits, and cancellation. Measure the limits on the smallest intended deployment before launch.

### Script injection / unsafe rendering
**Threat:** User text or SVG becomes executable markup in the editor or export environment.

**Controls:** Treat content as data; never execute user HTML/JavaScript; escape text; generate SVG from a constrained model; sanitize imported SVG or reject it initially; apply a restrictive Content Security Policy where appropriate.

### Data leakage
**Threat:** Logs, error traces, shared temporary directories, backups, or stale assets reveal customer content.

**Controls:** Redact content and secrets from logs; restrict file permissions; use per-job temporary directories; delete temporary data on success, failure, and cancellation; define backup and retention policies; avoid storing data not needed by the product.

### Supply-chain and secrets
**Threat:** Vulnerable dependencies or leaked credentials compromise the system.

**Controls:** Pin and review dependencies, run appropriate dependency/security checks, keep secrets out of source control, scope CI credentials narrowly, and document update ownership.

## Minimum release gates
- Authentication and authorization tests before multi-user persistence is exposed.
- Malformed-file and resource-limit tests before user uploads or public export.
- Export process isolation and cleanup tests before processing untrusted input server-side.
- Dependency and secret scanning configured and reviewed.
- Incident contact, backup/restore expectations, data retention, and deletion behavior documented.

## Residual risks
The proposed controls are not implemented merely because they are documented. Each must be linked to code, tests, operational configuration, or an explicit accepted risk before release.
