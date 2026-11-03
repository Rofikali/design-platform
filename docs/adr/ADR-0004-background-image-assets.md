# ADR-0004: Portable Page Background Image Assets

- **Status:** Proposed for implementation
- **Date:** 2026-11-03
- **Related:** [Issue #85 — page background image workflow](https://github.com/Rofikali/design-platform/issues/85)

## Context

The editor currently stores a solid hexadecimal page background. A Canva-style editor needs a user-uploaded image background that survives local autosave, JSON export/import, and image/PDF export. A remote URL is not portable and creates network, privacy, availability, and export-consistency problems. Arbitrary SVG is an active-content and parser-complexity risk when imported as untrusted document data.

## Decision

### Versioned document contract

- Introduce schema version 3 for the new background-image capability.
- Keep schema-v1 and schema-v2 documents importable through explicit migration to v3.
- Preserve existing page dimensions, solid background color, output-size metadata, template metadata, and foreground elements during migration.
- Add an optional page background-image object containing a self-contained data URL and a fit mode (cover or contain).
- The solid page background color remains the fallback and is visible through transparent pixels and unused space in contain mode.
- Do not infer or fetch remote resources during document parsing, rendering, or export.

### Accepted asset format and limits

- Accept only raster PNG, JPEG, and WebP.
- Reject SVG, GIF, animated formats, HTML, remote URLs, blob URLs, and arbitrary data URL media types.
- Set a strict encoded payload limit of 1 MiB per background image (base64 and data-URL overhead included in document-size accounting).
- Validate the data-URL prefix, MIME allowlist, base64 alphabet/padding, and encoded byte bound in Rust and TypeScript.
- In the browser, decode before accepting an upload or imported asset and enforce maximum decoded width/height and total pixel limits before preview/export.
- Treat MIME metadata as untrusted. Browser decode success and dimensions are required; a filename extension or declared MIME type alone is not evidence of a valid image.
- Keep the total JSON import/document byte limit bounded. Reject rather than silently truncate an asset.

### Rendering behavior

- Canvas preview, SVG/PNG export, and print/PDF must share the same cover/contain geometry and preserve the source aspect ratio.
- Cover scales uniformly until the page is filled and clips overflow to page bounds.
- Contain scales uniformly until the whole image fits and leaves the page background visible in unused space.
- No external network requests are permitted during rendering or export.
- Replacing/removing a background image must not mutate or reorder foreground elements.

### State and user experience

- Background image, fit mode, and solid fallback color are part of the document snapshot and undo/redo history.
- Autosave and JSON export include the asset so a downloaded JSON remains portable.
- Provide labeled upload/replace/remove and fit controls, visible focus, and announced success/error status.
- Do not add server storage, account features, asset libraries, or new infrastructure.

## Security and operational consequences

- Embedded assets increase JSON size and memory use; strict byte and decoded-pixel limits are mandatory.
- Browser decoding is required before rendering imported data, but it does not replace Rust/TypeScript structural validation.
- SVG is intentionally excluded to avoid active content and inconsistent renderer behavior.
- Image decoding and raster export must handle failures without corrupting the current design or autosave.
- WASM remains a validation boundary helper, not a security boundary. Any future API must independently validate and resource-limit documents.

## Validation required before merge

- Rust and TypeScript parity tests for MIME, base64 syntax, size limits, unsupported data URLs, and schema migrations.
- Browser tests for decode/dimension rejection, upload, replace, remove, fit modes, undo/redo, autosave/reopen, JSON round-trip, PNG output, and print output.
- Existing v1/v2 fixtures remain valid and migrate without losing content.
- CI must pass formatting, Rust tests/Clippy, frontend tests/typecheck, WASM smoke, production build, and real Chrome editor smoke.
- Manual accessibility checks remain tracked separately in issue #82; automation or a successful build must not be described as a completed manual audit.

## Non-goals

Shapes, frames, grids, tables, font catalogs, layers, filters, animation, audio, video, collaboration, marketplace, remote asset library, and backend persistence are separate future milestones.
