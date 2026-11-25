import { MAX_FILE_CHARS, parseDocument, toDocument, type DesignDocument } from "./document";
import { DEFAULT_TEXT_STYLE_V1, parseTextStyleV1, type TextStyleV1 } from "./text-style-v1";

/** Proposed wire contract only. v6 remains reserved for foreground images. */
export const TYPOGRAPHY_SCHEMA_VERSION = 7;
export type TextStyleEntry = Readonly<{ element_id: string; style: TextStyleV1 }>;
export type TypographyDocument = DesignDocument & { text_styles: TextStyleEntry[] };

function checkBudget(value: unknown): void {
  if (new TextEncoder().encode(JSON.stringify(value)).byteLength > MAX_FILE_CHARS) {
    throw new Error("The file exceeds the 2 MB limit.");
  }
}

/** Normalize v1–v5 or the proposed v7; never silently downgrade v6 images. */
export function normalizeTypographyDocument(input: unknown): TypographyDocument {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Invalid typography document");
  }
  checkBudget(input);
  const wire = input as Record<string, unknown>;
  const version = wire.schema_version;
  const legacy = version === 1 || version === 2 || version === 3 || version === 4 || version === 5;
  const hasStyles = Object.prototype.hasOwnProperty.call(wire, "text_styles");
  if ((!legacy && version !== TYPOGRAPHY_SCHEMA_VERSION) ||
      (legacy && hasStyles) || (!legacy && !Array.isArray(wire.text_styles))) {
    throw new Error("Invalid typography schema or style entries");
  }

  // Keep the established geometry, table, metadata, migration and ID checks.
  const parsed = parseDocument({ ...wire, schema_version: legacy ? version : 5 });
  const document = toDocument(parsed.elements, {
    width: parsed.width, height: parsed.height, background: parsed.background,
    ...(parsed.backgroundImage ? { background_image: parsed.backgroundImage } : {}),
  }, parsed.outputSizeMm, parsed.template);
  const textIds = new Set(parsed.elements.filter(e => e.type === "text").map(e => e.id));
  const styles = new Map<string, TextStyleV1>();
  if (!legacy) {
    const entries = wire.text_styles as unknown[];
    if (entries.length !== textIds.size) throw new Error("Invalid typography style entries");
    for (const entry of entries) {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        throw new Error("Invalid typography style entry");
      }
      const item = entry as Record<string, unknown>;
      if (Object.keys(item).length !== 2 ||
          !Object.prototype.hasOwnProperty.call(item, "element_id") ||
          !Object.prototype.hasOwnProperty.call(item, "style") ||
          typeof item.element_id !== "string" || !textIds.has(item.element_id) ||
          styles.has(item.element_id)) {
        throw new Error("Invalid typography style entry");
      }
      styles.set(item.element_id, parseTextStyleV1(item.style));
    }
  }
  const normalized: TypographyDocument = {
    ...document,
    schema_version: TYPOGRAPHY_SCHEMA_VERSION,
    text_styles: [...textIds].map(element_id => ({
      element_id, style: styles.get(element_id) ?? DEFAULT_TEXT_STYLE_V1,
    })),
  };
  checkBudget(normalized);
  return normalized;
}
