import { describe, expect, it } from "vitest";
import cases from "../../fixtures/vector-triangle-v8-cases.json";
import { MAX_ELEMENTS, toDocument } from "../utils/document";
import { parseVectorExtensionV8, MAX_VECTOR_TRIANGLES, parseTriangleCollectionV8, parseTriangleElementV8 } from "../utils/vector-document-v8";

describe("staged triangle element contract", () => {
  for (const entry of cases) {
    it(entry.name, () => {
      if (entry.valid) expect(parseTriangleElementV8(entry.element)).toEqual(entry.element);
      else expect(() => parseTriangleElementV8(entry.element)).toThrow(TypeError);
    });
  }
  it("rejects nonfinite geometry", () => {
    expect(() => parseTriangleElementV8({ ...cases[0]!.element, x: Infinity })).toThrow();
  });
});

describe("staged triangle collection contract", () => {
  const triangle = (id: string) => ({ ...cases[0]!.element, id });
  it("accepts empty and maximum-sized collections", () => {
    expect(parseTriangleCollectionV8([])).toEqual([]);
    const elements = Array.from({ length: MAX_VECTOR_TRIANGLES }, (_, i) => triangle(String(i)));
    expect(parseTriangleCollectionV8(elements)).toEqual(elements);
  });
  it("rejects oversized collections", () => {
    expect(() => parseTriangleCollectionV8(Array.from({ length: MAX_VECTOR_TRIANGLES + 1 }, (_, i) => triangle(String(i))))).toThrow(TypeError);
  });
  it("rejects duplicate identifiers and malformed elements", () => {
    expect(() => parseTriangleCollectionV8([triangle("a"), triangle("a")])).toThrow(TypeError);
    expect(() => parseTriangleCollectionV8([{ ...triangle("a"), width: NaN }])).toThrow(TypeError);
  });
  it("rejects nonarrays and freezes validated results", () => {
    expect(() => parseTriangleCollectionV8({})).toThrow(TypeError);
    const result = parseTriangleCollectionV8([triangle("a")]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result[0])).toBe(true);
    expect(Object.isFrozen(result[0]!.kind)).toBe(true);
  });
});

describe("staged whole-document vector extension", () => {
  const triangle = (id: string) => ({ ...cases[0]!.element, id });
  const base = () => toDocument([{ id: "base", type: "rect", x: 0, y: 0, width: 10, height: 10, color: "#fff" }]);
  it("accepts exactly the combined limit and rejects one extra", () => {
    const triangles = Array.from({ length: MAX_ELEMENTS - 1 }, (_, i) => triangle(String(i)));
    expect(parseVectorExtensionV8(base(), triangles)).toHaveLength(MAX_ELEMENTS - 1);
    expect(() => parseVectorExtensionV8(base(), [...triangles, triangle("extra")])).toThrow(TypeError);
  });
  it("rejects cross-type and intra-vector identifier collisions", () => {
    expect(() => parseVectorExtensionV8(base(), [triangle("base")])).toThrow(TypeError);
    expect(() => parseVectorExtensionV8(base(), [triangle("a"), triangle("a")])).toThrow(TypeError);
  });
  it("rejects invalid base geometry even with an empty extension", () => {
    const doc = base();
    doc.elements[0]!.width = 0;
    expect(() => parseVectorExtensionV8(doc, [])).toThrow();
  });
  it("preserves input documents and returns frozen validated triangles", () => {
    const doc = base();
    const triangles = [triangle("a")];
    const before = JSON.stringify({ doc, triangles });
    const result = parseVectorExtensionV8(doc, triangles);
    expect(result).toEqual(triangles);
    expect(Object.isFrozen(result)).toBe(true);
    expect(JSON.stringify({ doc, triangles })).toBe(before);
  });
});
