import { describe, expect, it } from "vitest";
import { makeForegroundImageElementV6 } from "../utils/foreground-image-v6";

const png = "data:image/png;base64,iVBORw0KGgo=";
const placement = {
  data_url: png, x: 40, y: 50, width: 320, height: 240,
  intrinsic_width: 320, intrinsic_height: 240,
};

describe("staged schema-v6 foreground image contract", () => {
  it("creates an immutable local-only image element without changing the source", () => {
    const before = structuredClone(placement);
    const element = makeForegroundImageElementV6("image-1", placement);
    expect(element).toEqual({
      id: "image-1", x: 40, y: 50, width: 320, height: 240,
      kind: { type: "image", data_url: png, intrinsic_width: 320, intrinsic_height: 240 },
    });
    expect(Object.isFrozen(element)).toBe(true);
    expect(Object.isFrozen(element.kind)).toBe(true);
    expect(placement).toEqual(before);
  });

  it.each(["", "x".repeat(129), "😀".repeat(33), 42, null])(
    "rejects invalid element IDs: %s", id => {
      expect(() => makeForegroundImageElementV6(id, placement)).toThrow();
    },
  );

  it.each([
    { width: 0 }, { height: Infinity }, { x: Number.NaN },
    { y: 100_001 }, { width: 10_001 }, { intrinsic_width: 8193 },
    { intrinsic_height: 0 }, { intrinsic_width: 8000, intrinsic_height: 8000 },
  ])("rejects invalid geometry and intrinsic pixel bounds: %o", patch => {
    expect(() => makeForegroundImageElementV6("image-1", { ...placement, ...patch })).toThrow();
  });

  it.each([
    "https://example.com/a.png",
    "data:image/svg+xml;base64,PHN2Zz4=",
    "data:image/jpeg;base64,iVBORw0KGgo=",
    "data:image/png;base64,!!!!",
  ])("rejects untrusted raster input: %s", data_url => {
    expect(() => makeForegroundImageElementV6("image-1", { ...placement, data_url })).toThrow();
  });
});
