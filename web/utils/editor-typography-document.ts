import { MAX_FILE_CHARS, parseDocument, parseDocumentJson, toDocument, type DesignElement, type ParsedDocument, type PageGeometry, type OutputSizeMm, type TemplateMetadata } from "./document";
import { DEFAULT_TEXT_STYLE_V1, parseTextStyleV1 } from "./text-style-v1";
import { normalizeTypographyDocument, TYPOGRAPHY_SCHEMA_VERSION, type TextStyleEntry } from "./typography-document";
import { normalizeTextLayoutDocument, TEXT_LAYOUT_SCHEMA_VERSION, type TextLayoutEntry } from "./text-layout-document";
import { DEFAULT_NATIVE_TEXT_LAYOUT, parseNativeTextLayout } from "./native-text-layout";

/** Keep v5 for default-only designs, v7 for styles, and v8 for nondefault layouts. */
export function editorTextStyles(elements: DesignElement[]): TextStyleEntry[] | undefined {
  const text = elements.filter(e => e.type === "text");
  const entries = text.map(e => ({ element_id: e.id, style: e.textStyle ? parseTextStyleV1(e.textStyle) : DEFAULT_TEXT_STYLE_V1 }));
  return entries.some(({ style }) => style.font_family !== "sans" || style.font_weight !== "normal" || style.font_style !== "normal")
    ? entries : undefined;
}

/** A complete binding list when any text element uses advanced layout. */
export function editorTextLayouts(elements: DesignElement[]): TextLayoutEntry[] | undefined {
  const entries = elements.filter(e => e.type === "text").map(e => ({
    element_id: e.id, layout: e.textLayout ? parseNativeTextLayout(e.textLayout) : DEFAULT_NATIVE_TEXT_LAYOUT,
  }));
  return entries.some(({ layout }) => layout.alignment !== "left" || layout.lineHeight !== 1.25 || layout.letterSpacing !== 0)
    ? entries : undefined;
}

export function serializeEditorDocument(elements: DesignElement[], page: PageGeometry,
  outputSizeMm?: OutputSizeMm, template?: TemplateMetadata): string {
  const legacy = toDocument(elements, page, outputSizeMm, template);
  const styles = editorTextStyles(elements);
  const layouts = editorTextLayouts(elements);
  if (layouts) {
    const completeStyles = styles ?? layouts.map(({ element_id }) => ({ element_id, style: DEFAULT_TEXT_STYLE_V1 }));
    return JSON.stringify({ ...legacy, schema_version: TEXT_LAYOUT_SCHEMA_VERSION,
      text_styles: completeStyles, text_layouts: layouts });
  }
  // Snapshot serialization remains non-validating for in-progress geometry edits.
  return JSON.stringify(styles ? { ...legacy, schema_version: TYPOGRAPHY_SCHEMA_VERSION, text_styles: styles } : legacy);
}

export function parseEditorDocumentJson(json: string): ParsedDocument {
  if (new TextEncoder().encode(json).byteLength > MAX_FILE_CHARS) throw new Error("The file exceeds the 2 MB limit.");
  const wire: unknown = JSON.parse(json);
  if (wire && typeof wire === "object" && (wire as { schema_version?: unknown }).schema_version === TEXT_LAYOUT_SCHEMA_VERSION) {
    const normalized = normalizeTextLayoutDocument(wire);
    const parsed = parseDocument({ ...normalized, schema_version: 5 });
    const styles = new Map(normalized.text_styles.map(entry => [entry.element_id, entry.style]));
    const layouts = new Map(normalized.text_layouts.map(entry => [entry.element_id, entry.layout]));
    return { ...parsed, elements: parsed.elements.map(element => element.type === "text"
      ? { ...element, textStyle: styles.get(element.id)!, textLayout: layouts.get(element.id)! } : element) };
  }
  if (wire && typeof wire === "object" && Object.prototype.hasOwnProperty.call(wire, "text_layouts")) {
    throw new Error("Advanced text layout requires schema version 8.");
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
