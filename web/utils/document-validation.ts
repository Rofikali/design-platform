import {
  MAX_FILE_CHARS,
  parseDocumentJson,
  toDocument,
} from "./document";
import type { DesignDocument } from "./document";

export type DocumentValidationEngine = "wasm" | "typescript";

export type DocumentValidationResult = {
  json: string;
  engine: DocumentValidationEngine;
};

type WasmValidator = (json: string) => string;

let wasmValidatorPromise: Promise<WasmValidator | null> | undefined;

async function loadWasmValidator(): Promise<WasmValidator | null> {
  // The adapter is browser-only. SSR and test environments use the safe TS path.
  if (typeof window === "undefined") return null;

  try {
    const wasm = await import("../generated/design-wasm/design_wasm.js");
    await wasm.default();
    return (json: string) => wasm.validate_document_json(json);
  } catch {
    // A missing or unsupported WASM runtime must not make basic editing unusable.
    return null;
  }
}

/**
 * Validate imported/exported JSON at a coarse-grained boundary.
 *
 * WASM validation errors are intentionally propagated; only module loading or
 * initialization failure triggers the existing TypeScript validator fallback.
 */
export async function validateDocumentJson(json: string): Promise<DocumentValidationResult> {
  const byteLength = new TextEncoder().encode(json).byteLength;
  if (byteLength > MAX_FILE_CHARS) {
    throw new Error("The file exceeds the 2 MB limit.");
  }

  wasmValidatorPromise ??= loadWasmValidator();
  const wasmValidator = await wasmValidatorPromise;

  if (wasmValidator) {
    return { json: wasmValidator(json), engine: "wasm" };
  }

  const parsed = parseDocumentJson(json);
  const document: DesignDocument = toDocument(parsed.elements, { width: parsed.width, height: parsed.height, background: parsed.background, ...(parsed.backgroundImage ? { background_image: parsed.backgroundImage } : {}) }, parsed.outputSizeMm, parsed.template);
  return { json: JSON.stringify(document), engine: "typescript" };
}

/** Version-aware editor boundary: retain the existing v5 path; validate v7 separately. */
let typographyWasmPromise: Promise<WasmValidator | null> | undefined;
async function loadTypographyWasm(): Promise<WasmValidator | null> {
  if (typeof window === "undefined") return null;
  try {
    const wasm = await import("../generated/design-wasm/design_wasm.js");
    await wasm.default();
    return typeof wasm.normalize_typography_document_json === "function"
      ? (json: string) => wasm.normalize_typography_document_json(json) : null;
  } catch { return null; }
}
export async function validateEditorDocumentJson(json: string): Promise<DocumentValidationResult> {
  if (new TextEncoder().encode(json).byteLength > MAX_FILE_CHARS) throw new Error("The file exceeds the 2 MB limit.");
  const wire: unknown = JSON.parse(json);
  if (!wire || typeof wire !== "object" || (wire as { schema_version?: unknown }).schema_version !== 7) {
    return validateDocumentJson(json);
  }
  const { normalizeTypographyDocument } = await import("./typography-document");
  const normalized = JSON.stringify(normalizeTypographyDocument(wire));
  typographyWasmPromise ??= loadTypographyWasm();
  const validator = await typographyWasmPromise;
  // Propagate validation errors; fallback only on unavailable initialization.
  return validator ? { json: validator(normalized), engine: "wasm" }
    : { json: normalized, engine: "typescript" };
}
