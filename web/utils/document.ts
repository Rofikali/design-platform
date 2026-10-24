export type TextElement = {
  id: string;
  type: "text";
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  color: string;
};

export type RectElement = {
  id: string;
  type: "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

export type DesignElement = TextElement | RectElement;

export type DesignDocument = {
  schema_version: number;
  page: { width: number; height: number; background: string };
  elements: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    kind:
      | { type: "text"; text: string; font_size: number; color: string }
      | { type: "rect"; color: string };
  }>;
};

export const SCHEMA_VERSION = 1;
export const MAX_ELEMENTS = 1000;
export const MAX_TEXT_CHARS = 10000;
export const MAX_FILE_CHARS = 2_000_000;
export const PAGE_WIDTH = 800;
export const PAGE_HEIGHT = 600;

export function toDocument(source: DesignElement[]): DesignDocument {
  return {
    schema_version: SCHEMA_VERSION,
    page: { width: PAGE_WIDTH, height: PAGE_HEIGHT, background: "#ffffff" },
    elements: source.map((element) => ({
      id: element.id,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      kind: element.type === "text"
        ? { type: "text" as const, text: element.text, font_size: element.fontSize, color: element.color }
        : { type: "rect" as const, color: element.color },
    })),
  };
}

function validColor(value: unknown): value is string {
  return typeof value === "string" && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
}

export function parseDocumentJson(json: string): { elements: DesignElement[]; width: number; height: number } {
  if (json.length > MAX_FILE_CHARS) throw new Error("The file exceeds the 2 MB limit.");
  let input: unknown;
  try {
    input = JSON.parse(json) as unknown;
  } catch {
    throw new Error("The file is not valid JSON.");
  }
  return parseDocument(input);
}

export function parseDocument(input: unknown): { elements: DesignElement[]; width: number; height: number } {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("The file must contain a JSON document object.");
  const doc = input as Partial<DesignDocument>;
  if (doc.schema_version !== SCHEMA_VERSION) throw new Error("Unsupported document schema version. This editor supports version 1.");
  if (!doc.page || !Number.isFinite(doc.page.width) || !Number.isFinite(doc.page.height) ||
      doc.page.width !== PAGE_WIDTH || doc.page.height !== PAGE_HEIGHT ||
      !validColor(doc.page.background)) throw new Error("This editor currently supports an 800 × 600 page and a valid hexadecimal background color.");
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
        item.width <= 0 || item.height <= 0 || item.width > 10000 || item.height > 10000)
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
  return { elements: parsed, width: doc.page.width, height: doc.page.height };
}
