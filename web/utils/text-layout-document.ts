import { MAX_FILE_CHARS } from "./document";
import { DEFAULT_NATIVE_TEXT_LAYOUT, parseNativeTextLayout, type NativeTextLayout } from "./native-text-layout";
import { normalizeTypographyDocument, type TypographyDocument } from "./typography-document";

/** Staged v8. The live editor continues to read/write v5 and v7. */
export const TEXT_LAYOUT_SCHEMA_VERSION = 8;
export type TextLayoutEntry = Readonly<{ element_id: string; layout: NativeTextLayout }>;
export type TextLayoutDocument = TypographyDocument & { text_layouts: TextLayoutEntry[] };

function checkBudget(value: unknown): void {
  if (new TextEncoder().encode(JSON.stringify(value)).byteLength > MAX_FILE_CHARS) {
    throw new Error("The file exceeds the 2 MB limit.");
  }
}

/** Compose the existing v7 validator, preserving styles and all page metadata. */
export function normalizeTextLayoutDocument(input: unknown): TextLayoutDocument {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Invalid layout document");
  checkBudget(input);
  const wire = input as Record<string, unknown>;
  const version = wire.schema_version;
  const hasLayout = Object.prototype.hasOwnProperty.call(wire, "text_layouts");
  const legacy = version === 1 || version === 2 || version === 3 || version === 4 || version === 5 || version === 7;
  if ((!legacy && version !== TEXT_LAYOUT_SCHEMA_VERSION) ||
      (legacy && hasLayout) || (!legacy && !Array.isArray(wire.text_layouts))) {
    throw new Error("Invalid layout schema or entries");
  }
  const typography = normalizeTypographyDocument({ ...wire, schema_version: legacy ? version : 7 });
  const ids = new Set(typography.text_styles.map(entry => entry.element_id));
  const layouts = new Map<string, NativeTextLayout>();
  if (!legacy) {
    const entries = wire.text_layouts as unknown[];
    if (entries.length !== ids.size) throw new Error("Invalid layout entries");
    for (const entry of entries) {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new Error("Invalid layout entry");
      const item = entry as Record<string, unknown>;
      if (Object.keys(item).length !== 2 ||
          !Object.prototype.hasOwnProperty.call(item, "element_id") ||
          !Object.prototype.hasOwnProperty.call(item, "layout") ||
          typeof item.element_id !== "string" || !ids.has(item.element_id) || layouts.has(item.element_id)) {
        throw new Error("Invalid layout entry");
      }
      layouts.set(item.element_id, parseNativeTextLayout(item.layout));
    }
  }
  const normalized: TextLayoutDocument = {
    ...typography,
    schema_version: TEXT_LAYOUT_SCHEMA_VERSION,
    text_layouts: typography.text_styles.map(({ element_id }) => ({
      element_id, layout: layouts.get(element_id) ?? DEFAULT_NATIVE_TEXT_LAYOUT,
    })),
  };
  checkBudget(normalized);
  return normalized;
}
