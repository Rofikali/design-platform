import { describe, expect, it } from "vitest";
import cases from "../../fixtures/vector-triangle-v8-cases.json";
import { parseTriangleElementV8 } from "../utils/vector-document-v8";

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
