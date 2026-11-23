import { parseDocument, MAX_FILE_CHARS, type ParsedDocument, type DesignElement, type PageGeometry, type OutputSizeMm, type TemplateMetadata, toDocument } from "./document";
import { parseForegroundImageElementV6, type ForegroundImageElementV6 } from "./foreground-image-v6";

/**
 * Staged schema-v6 import boundary. Does not activate v6 in the production
 * editor: existing v1-v5 parsing stays on its established code path.
 * Legacy elements are validated by the current v5 parser, not reimplemented.
 */
export type ParsedDocumentV6 = Omit<ParsedDocument, "elements"> & {
  elements: Array<DesignElement | ForegroundImageElementV6>;
};

export function parseStagedDocumentV6(input: unknown): ParsedDocumentV6 {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Schema-v6 document must be an object.");
  }
  // Enforce the portable JSON budget across image and legacy elements together.
  // Delegating only the legacy subset to v5 would otherwise miss image bytes.
  let serialized: string;
  try { serialized = JSON.stringify(input); } catch { throw new Error("Schema-v6 document must be serializable."); }
  if (new TextEncoder().encode(serialized).byteLength > MAX_FILE_CHARS) {
    throw new Error("The file exceeds the 2 MB limit.");
  }
  const document = input as Record<string, unknown>;
  if (document.schema_version !== 6 || !Array.isArray(document.elements)) {
    throw new Error("Schema-v6 document requires version 6 and an elements array.");
  }
  const images = new Map<number, ForegroundImageElementV6>();
  const legacy: unknown[] = [];
  for (const [index, item] of document.elements.entries()) {
    if (item && typeof item === "object" && !Array.isArray(item) &&
        (item as { kind?: { type?: unknown } }).kind?.type === "image") {
      images.set(index, parseForegroundImageElementV6(item));
    } else {
      legacy.push(item);
    }
  }
  // Validate page, metadata and legacy element kinds through the existing v5
  // boundary. This also retains all existing size, color and geometry limits.
  const parsed = parseDocument({ ...document, schema_version: 5, elements: legacy });
  const ids = new Set(parsed.elements.map(element => element.id));
  for (const image of images.values()) {
    if (ids.has(image.id)) throw new Error("Duplicate element IDs are not allowed.");
    ids.add(image.id);
  }
  if (document.elements.length > 1000) {
    throw new Error("The document must have at most 1,000 elements.");
  }
  let legacyIndex = 0;
  return {
    ...parsed,
    elements: document.elements.map((_: unknown, index: number) =>
      images.get(index) ?? parsed.elements[legacyIndex++]!),
  };
}

/**
 * Stage a portable v6 JSON document without changing production v5 exports.
 * The legacy serializer remains authoritative for all existing element kinds;
 * images are inserted at their original z-order positions. Validate the final
 * combined document to enforce the shared size, ID and geometry budgets.
 */
export function toStagedDocumentV6(
  elements: ReadonlyArray<DesignElement | ForegroundImageElementV6>,
  page?: PageGeometry,
  outputSizeMm?: OutputSizeMm,
  template?: TemplateMetadata,
): Record<string, unknown> {
  const isImage = (element: DesignElement | ForegroundImageElementV6): element is ForegroundImageElementV6 =>
    "kind" in element && element.kind?.type === "image";
  const legacy = elements.filter((element): element is DesignElement => !isImage(element));
  const v5 = toDocument(legacy, page, outputSizeMm, template);
  let legacyIndex = 0;
  const combined = elements.map(element =>
    isImage(element)
      ? parseForegroundImageElementV6(element)
      : v5.elements[legacyIndex++]!,
  );
  const document = { ...v5, schema_version: 6, elements: combined };
  parseStagedDocumentV6(document);
  return document;
}
