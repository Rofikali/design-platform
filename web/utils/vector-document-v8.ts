/** Staged schema-v8 triangle element; not enabled in the production v5 editor. */
export const VECTOR_SCHEMA_VERSION = 8;
export type TriangleElementV8 = Readonly<{
  id: string; x: number; y: number; width: number; height: number;
  kind: Readonly<{ type: "triangle"; color: string }>;
}>;

function exactRecord(value: unknown, keys: readonly string[]): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value) ||
      Object.keys(value).length !== keys.length ||
      !keys.every(key => Object.prototype.hasOwnProperty.call(value, key))) {
    throw new TypeError("Invalid triangle record");
  }
  return value as Record<string, unknown>;
}

export function parseTriangleElementV8(value: unknown): TriangleElementV8 {
  const e = exactRecord(value, ["id", "x", "y", "width", "height", "kind"]);
  const k = exactRecord(e.kind, ["type", "color"]);
  const { id, x, y, width, height } = e;
  const coordinate = (n: unknown): n is number =>
    typeof n === "number" && Number.isFinite(n) && Math.abs(n) <= 100_000;
  const dimension = (n: unknown): n is number =>
    typeof n === "number" && Number.isFinite(n) && n > 0 && n <= 10_000;
  if (typeof id !== "string" || id.length === 0 ||
      new TextEncoder().encode(id).byteLength > 128 ||
      /[\u0000-\u001f\u007f]/u.test(id) ||
      !coordinate(x) || !coordinate(y) || !dimension(width) || !dimension(height) ||
      k.type !== "triangle" || typeof k.color !== "string" ||
      !/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/u.test(k.color)) {
    throw new TypeError("Invalid triangle element");
  }
  return Object.freeze({ id, x, y, width, height,
    kind: Object.freeze({ type: "triangle" as const, color: k.color }) });
}

/** Staged collection limit; does not change the production document schema. */
export const MAX_VECTOR_TRIANGLES = 1000;

export function parseTriangleCollectionV8(value: unknown): readonly TriangleElementV8[] {
  if (!Array.isArray(value) || value.length > MAX_VECTOR_TRIANGLES) {
    throw new TypeError("Invalid triangle collection");
  }
  const ids = new Set<string>();
  const elements: TriangleElementV8[] = [];
  for (const entry of value) {
    const element = parseTriangleElementV8(entry);
    if (ids.has(element.id)) throw new TypeError("Duplicate triangle id");
    ids.add(element.id);
    elements.push(element);
  }
  return Object.freeze(elements);
}
