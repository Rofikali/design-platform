export type PolygonSpec =
  | { kind: "triangle" }
  | { kind: "polygon"; sides: number }
  | { kind: "star"; tips: number; innerRatio: number };

export interface VectorPoint { readonly x: number; readonly y: number }

/** Pure normalized geometry; not an imported document validator or SVG parser. */
export function polygonPoints(spec: PolygonSpec): readonly VectorPoint[] {
  let count: number;
  let inner = 1;
  switch (spec.kind) {
    case "triangle": count = 3; break;
    case "polygon":
      if (!Number.isInteger(spec.sides) || spec.sides < 3 || spec.sides > 32)
        throw new RangeError("Polygon sides must be an integer from 3 to 32");
      count = spec.sides;
      break;
    case "star":
      if (!Number.isInteger(spec.tips) || spec.tips < 3 || spec.tips > 16 ||
          !Number.isFinite(spec.innerRatio) || spec.innerRatio < 0.1 || spec.innerRatio > 0.9)
        throw new RangeError("Invalid star geometry");
      count = spec.tips * 2;
      inner = spec.innerRatio;
      break;
    default: throw new RangeError("Unsupported polygon kind");
  }
  return Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI / 2 + i * 2 * Math.PI / count;
    const radius = spec.kind === "star" && i % 2 === 1 ? inner / 2 : 0.5;
    return { x: 0.5 + radius * Math.cos(angle), y: 0.5 + radius * Math.sin(angle) };
  });
}
