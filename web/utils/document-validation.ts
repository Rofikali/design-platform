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
  const document: DesignDocument = toDocument(parsed.elements);
  return { json: JSON.stringify(document), engine: "typescript" };
}
