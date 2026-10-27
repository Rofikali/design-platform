export type TextElement = {
  id: string; type: "text"; text: string; x: number; y: number; width: number; height: number; fontSize: number; color: string;
};
export type RectElement = {
  id: string; type: "rect"; x: number; y: number; width: number; height: number; color: string;
};
export type DesignElement = TextElement | RectElement;
export type PageGeometry = { width: number; height: number; background: string };
export type OutputSizeMm = { width: number; height: number };
export type TemplateMetadata = { id: string; version: number };
export type DesignDocument = {
  schema_version: number;
  page: PageGeometry;
  elements: Array<{
    id: string; x: number; y: number; width: number; height: number;
    kind: { type: "text"; text: string; font_size: number; color: string } | { type: "rect"; color: string };
  }>;
  output_size_mm?: OutputSizeMm;
  template?: TemplateMetadata;
};
export const SCHEMA_VERSION = 2;
export const MAX_ELEMENTS = 1000;
export const MAX_TEXT_CHARS = 10000;
export const MAX_FILE_CHARS = 2_000_000;
export const MAX_PAGE_DIMENSION = 10_000;
export const MAX_PAGE_AREA = 25_000_000;
export const MAX_OUTPUT_DIMENSION_MM = 2_000;
export const MAX_ASPECT_RATIO = 10;
export const PRINT_ASPECT_RATIO_TOLERANCE = 0.01;
export const PAGE_WIDTH = 800;
export const PAGE_HEIGHT = 600;

export function toDocument(source: DesignElement[], page: PageGeometry = { width: PAGE_WIDTH, height: PAGE_HEIGHT, background: "#ffffff" },
  outputSizeMm?: OutputSizeMm, template?: TemplateMetadata): DesignDocument {
  return {
    schema_version: SCHEMA_VERSION,
    page: { ...page },
    elements: source.map((element) => ({
      id: element.id, x: element.x, y: element.y, width: element.width, height: element.height,
      kind: element.type === "text"
        ? { type: "text" as const, text: element.text, font_size: element.fontSize, color: element.color }
        : { type: "rect" as const, color: element.color },
    })),
    ...(outputSizeMm ? { output_size_mm: { ...outputSizeMm } } : {}),
    ...(template ? { template: { ...template } } : {}),
  };
}
function validColor(value: unknown): value is string {
  return typeof value === "string" && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}
export type ParsedDocument = {
  elements: DesignElement[]; width: number; height: number; background: string;
  outputSizeMm?: OutputSizeMm; template?: TemplateMetadata;
};
export function parseDocumentJson(json: string): ParsedDocument {
  if (new TextEncoder().encode(json).byteLength > MAX_FILE_CHARS) throw new Error("The file exceeds the 2 MB limit.");
  let input: unknown;
  try { input = JSON.parse(json) as unknown; } catch { throw new Error("The file is not valid JSON."); }
  return parseDocument(input);
}
export function parseDocument(input: unknown): ParsedDocument {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("The file must contain a JSON document object.");
  const doc = input as Partial<DesignDocument>;
  if (doc.schema_version !== 1 && doc.schema_version !== SCHEMA_VERSION) throw new Error("Unsupported document schema version. This editor supports versions 1 and 2.");
  if (!doc.page || !Number.isFinite(doc.page.width) || !Number.isFinite(doc.page.height) || !validColor(doc.page.background))
    throw new Error("The document must have finite page dimensions and a valid hexadecimal background color.");
  const width = doc.page.width; const height = doc.page.height;
  if (doc.schema_version === 1 && (width !== PAGE_WIDTH || height !== PAGE_HEIGHT))
    throw new Error("Schema version 1 requires an 800 × 600 page.");
  if (width <= 0 || height <= 0 || width > MAX_PAGE_DIMENSION || height > MAX_PAGE_DIMENSION)
    throw new Error("Page width and height must be between 0 and 10,000.");
  if (width * height > MAX_PAGE_AREA) throw new Error("Page area exceeds the 25,000,000-unit limit.");
  const ratio = width / height;
  if (ratio < 1 / MAX_ASPECT_RATIO || ratio > MAX_ASPECT_RATIO) throw new Error("Page aspect ratio must be between 1:10 and 10:1.");
  let outputSizeMm: OutputSizeMm | undefined;
  if (doc.schema_version === SCHEMA_VERSION && doc.output_size_mm !== undefined) {
    const output = doc.output_size_mm;
    if (!output || !Number.isFinite(output.width) || !Number.isFinite(output.height) ||
        output.width <= 0 || output.height <= 0 || output.width > MAX_OUTPUT_DIMENSION_MM || output.height > MAX_OUTPUT_DIMENSION_MM)
      throw new Error("Physical output dimensions must be finite and between 0 and 2,000 mm.");
    const outputRatio = output.width / output.height;
    if (Math.abs(ratio - outputRatio) / ratio > PRINT_ASPECT_RATIO_TOLERANCE)
      throw new Error("Logical page and physical output size aspect ratios do not match within 1%.");
    outputSizeMm = { width: output.width, height: output.height };
  }
  let template: TemplateMetadata | undefined;
  if (doc.schema_version === SCHEMA_VERSION && doc.template !== undefined) {
    const item = doc.template;
    if (!item || typeof item.id !== "string" || item.id.length < 1 || item.id.length > 128 ||
        !Number.isInteger(item.version) || item.version < 1)
      throw new Error("Template metadata requires an ID (1–128 characters) and positive integer version.");
    template = { id: item.id, version: item.version };
  }
  if (!Array.isArray(doc.elements) || doc.elements.length > MAX_ELEMENTS) throw new Error("The document must have at most 1,000 elements.");
  const ids = new Set<string>();
  const parsed = doc.elements.map((item) => {
    if (!item || typeof item !== "object" || typeof item.id !== "string" || item.id.length < 1 || item.id.length > 128)
      throw new Error("An element has an invalid ID.");
    if (ids.has(item.id)) throw new Error("Duplicate element IDs are not allowed.");
    ids.add(item.id);
    const values = [item.x, item.y, item.width, item.height];
    if (!values.every((n) => typeof n === "number" && Number.isFinite(n)) ||
        Math.abs(item.x) > 100000 || Math.abs(item.y) > 100000 ||
        item.width <= 0 || item.height <= 0 || item.width > MAX_PAGE_DIMENSION || item.height > MAX_PAGE_DIMENSION)
      throw new Error("An element has invalid or out-of-range geometry.");
    const kind = item.kind;
    if (!kind || typeof kind !== "object" || !validColor(kind.color)) throw new Error("An element has an invalid color.");
    if (kind.type === "text") {
      if (typeof kind.text !== "string" || [...kind.text].length > MAX_TEXT_CHARS) throw new Error("Text must be 10,000 characters or fewer.");
      if (typeof kind.font_size !== "number" || !Number.isFinite(kind.font_size) || kind.font_size < 1 || kind.font_size > 512)
        throw new Error("Font size must be between 1 and 512.");
      return { id: item.id, type: "text" as const, text: kind.text, x: item.x, y: item.y, width: item.width, height: item.height, fontSize: kind.font_size, color: kind.color };
    }
    if (kind.type === "rect") return { id: item.id, type: "rect" as const, x: item.x, y: item.y, width: item.width, height: item.height, color: kind.color };
    throw new Error("Unsupported element type.");
  });
  return { elements: parsed, width, height, background: doc.page.background, ...(outputSizeMm ? { outputSizeMm } : {}), ...(template ? { template } : {}) };
}
