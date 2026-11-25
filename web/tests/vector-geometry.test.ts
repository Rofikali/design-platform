import { describe, expect, it } from "vitest";
import { polygonPoints, primitivePoints } from "../utils/vector-geometry";

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

describe("bounded primitive outlines", () => {
  it("keeps all coordinates finite and normalized", () => {
    for (const spec of [{kind:"line"}, {kind:"ellipse"}, {kind:"arrow",headLength:0.5,headWidth:1},
      {kind:"rounded-rectangle",radius:0}, {kind:"rounded-rectangle",radius:0.5}] as const) {
      const points = primitivePoints(spec);
      expect(points).toEqual(primitivePoints(spec));
      expect(points.length).toBeLessThanOrEqual(36);
      for (const p of points) for (const n of [p.x,p.y]) {
        expect(Number.isFinite(n)).toBe(true);
        expect(n).toBeGreaterThanOrEqual(0);
        expect(n).toBeLessThanOrEqual(1);
      }
    }
  });
  it("preserves line endpoints and arrow tip", () => {
    expect(primitivePoints({kind:"line"})).toEqual([{x:0,y:0.5},{x:1,y:0.5}]);
    expect(primitivePoints({kind:"arrow",headLength:0.2,headWidth:0.6})).toContainEqual({x:1,y:0.5});
  });
  it.each([-1,0.51,NaN,Infinity])("rejects invalid radius %s", radius => {
    expect(() => primitivePoints({kind:"rounded-rectangle",radius})).toThrow(RangeError);
  });
  it.each([0,0.51,NaN,Infinity])("rejects invalid arrow length %s", headLength => {
    expect(() => primitivePoints({kind:"arrow",headLength,headWidth:0.5})).toThrow(RangeError);
  });
  it.each([0,1.01,NaN,Infinity])("rejects invalid arrow width %s", headWidth => {
    expect(() => primitivePoints({kind:"arrow",headLength:0.2,headWidth})).toThrow(RangeError);
  });
});
