import { describe, expect, it } from "vitest";
import { polygonPoints } from "../utils/vector-geometry";

describe("normalized vector geometry", () => {
  it("generates deterministic bounded points", () => {
    for (const spec of [{ kind: "triangle" }, { kind: "polygon", sides: 32 },
      { kind: "star", tips: 16, innerRatio: 0.4 }] as const) {
      const points = polygonPoints(spec);
      expect(points).toEqual(polygonPoints(spec));
      expect(points.length).toBe(spec.kind === "triangle" ? 3 : 32);
      for (const p of points) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(1);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThanOrEqual(1);
      }
    }
  });
  it("alternates star radii", () => {
    const points = polygonPoints({ kind: "star", tips: 5, innerRatio: 0.4 });
    expect(points).toHaveLength(10);
    points.forEach((p, i) => expect(Math.hypot(p.x - 0.5, p.y - 0.5)).toBeCloseTo(i % 2 ? 0.2 : 0.5));
  });
  it.each([2, 33, 3.5, NaN, Infinity])("rejects invalid sides %s", sides => {
    expect(() => polygonPoints({ kind: "polygon", sides })).toThrow(RangeError);
  });
  it.each([0, 1, NaN, Infinity])("rejects invalid radius %s", innerRatio => {
    expect(() => polygonPoints({ kind: "star", tips: 5, innerRatio })).toThrow(RangeError);
  });
  it.each([2, 17, 3.5, NaN, Infinity])("rejects invalid tips %s", tips => {
    expect(() => polygonPoints({ kind: "star", tips, innerRatio: 0.5 })).toThrow(RangeError);
  });
});
