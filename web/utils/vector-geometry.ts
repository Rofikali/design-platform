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

export type PrimitiveSpec =
  | { kind: "line" }
  | { kind: "arrow"; headLength: number; headWidth: number }
  | { kind: "ellipse" }
  | { kind: "rounded-rectangle"; radius: number };

/** Closed outlines except line; normalized coordinates, bounded fixed allocation.
 * Radius is relative to the unit box, not a physical pixel radius.
 */
export function primitivePoints(spec: PrimitiveSpec): readonly VectorPoint[] {
  switch (spec.kind) {
    case "line": return [{ x: 0, y: 0.5 }, { x: 1, y: 0.5 }];
    case "arrow": {
      const { headLength, headWidth } = spec;
      if (!Number.isFinite(headLength) || headLength < 0.1 || headLength > 0.5 ||
          !Number.isFinite(headWidth) || headWidth < 0.2 || headWidth > 1)
        throw new RangeError("Invalid arrow geometry");
      const neck = 1 - headLength;
      const shaft = headWidth / 4;
      return [{ x: 0, y: 0.5 - shaft }, { x: neck, y: 0.5 - shaft },
        { x: neck, y: 0.5 - headWidth / 2 }, { x: 1, y: 0.5 },
        { x: neck, y: 0.5 + headWidth / 2 }, { x: neck, y: 0.5 + shaft },
        { x: 0, y: 0.5 + shaft }];
    }
    case "ellipse": return polygonPoints({ kind: "polygon", sides: 32 });
    case "rounded-rectangle": {
      const r = spec.radius;
      if (!Number.isFinite(r) || r < 0 || r > 0.5)
        throw new RangeError("Invalid corner radius");
      if (r === 0) return [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }];
      const centers = [[1-r,r],[1-r,1-r],[r,1-r],[r,r]] as const;
      return centers.flatMap(([x,y], corner) => Array.from({length: 9}, (_, i) => {
        const angle = -Math.PI / 2 + corner * Math.PI / 2 + i * Math.PI / 16;
        return { x: Math.max(0, Math.min(1, x + r * Math.cos(angle))),
          y: Math.max(0, Math.min(1, y + r * Math.sin(angle))) };
      }));
    }
    default: throw new RangeError("Unsupported primitive kind");
  }
}
