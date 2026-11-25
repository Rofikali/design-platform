import { MAX_FILE_CHARS, parseDocument, parseDocumentJson, toDocument, type DesignElement, type ParsedDocument, type PageGeometry, type OutputSizeMm, type TemplateMetadata } from "./document";
import { DEFAULT_TEXT_STYLE_V1, parseTextStyleV1 } from "./text-style-v1";
import { normalizeTypographyDocument, TYPOGRAPHY_SCHEMA_VERSION, type TextStyleEntry } from "./typography-document";

/** Keep v5 output for legacy/default-only designs; opt into v7 for styled text. */
export function editorTextStyles(elements: DesignElement[]): TextStyleEntry[] | undefined {
  const text = elements.filter(e => e.type === "text");
  const entries = text.map(e => ({ element_id: e.id, style: e.textStyle ? parseTextStyleV1(e.textStyle) : DEFAULT_TEXT_STYLE_V1 }));
  return entries.some(({ style }) => style.font_family !== "sans" || style.font_weight !== "normal" || style.font_style !== "normal")
    ? entries : undefined;
}

export function serializeEditorDocument(elements: DesignElement[], page: PageGeometry,
  outputSizeMm?: OutputSizeMm, template?: TemplateMetadata): string {
  const legacy = toDocument(elements, page, outputSizeMm, template);
  const styles = editorTextStyles(elements);
  // Snapshot serialization remains non-validating for in-progress geometry edits.
  return JSON.stringify(styles ? { ...legacy, schema_version: TYPOGRAPHY_SCHEMA_VERSION, text_styles: styles } : legacy);
}

export function parseEditorDocumentJson(json: string): ParsedDocument {
  if (new TextEncoder().encode(json).byteLength > MAX_FILE_CHARS) throw new Error("The file exceeds the 2 MB limit.");
  const wire: unknown = JSON.parse(json);
  // Until v8 is activated, never silently discard staged layout bindings.
  if (wire && typeof wire === "object" && Object.prototype.hasOwnProperty.call(wire, "text_layouts")) {
    throw new Error("Advanced text layout is not supported by this editor version.");
  }
  if (!wire || typeof wire !== "object" || (wire as { schema_version?: unknown }).schema_version !== TYPOGRAPHY_SCHEMA_VERSION) {
    if (wire && typeof wire === "object" && Object.prototype.hasOwnProperty.call(wire, "text_styles")) {
      throw new Error("Typography styles require schema version 7.");
    }
    return parseDocumentJson(json);
  }
  const normalized = normalizeTypographyDocument(wire);
  const parsed = parseDocument({ ...normalized, schema_version: 5 });
  const styles = new Map(normalized.text_styles.map(entry => [entry.element_id, entry.style]));
  return { ...parsed, elements: parsed.elements.map(element => element.type === "text"
    ? { ...element, textStyle: styles.get(element.id)! } : element) };
}
