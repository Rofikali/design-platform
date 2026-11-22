import { describe, expect, it } from "vitest";
import { snapToPage } from "../utils/element-snapping";

describe("optional page snapping geometry", () => {
  const page = { width: 800, height: 600 };

  it("snaps near edges and center independently without mutating input", () => {
    const element = Object.freeze({ id: "frame-1", x: 347, y: 4, width: 100, height: 60 });
    expect(snapToPage(element, page)).toEqual({ ...element, x: 350, y: 0 });
    expect(element.x).toBe(347);
  });

  it("preserves identity when outside tolerance or exactly aligned", () => {
    const element = Object.freeze({ x: 100, y: 100, width: 100, height: 60 });
    expect(snapToPage(element, page)).toBe(element);
    const aligned = Object.freeze({ ...element, x: 0 });
    expect(snapToPage(aligned, page)).toBe(aligned);
  });

  it("keeps a clamped drag within the page and does not modify unrelated fields", () => {
    const dragged = Object.freeze({ id: "rect-1", type: "rect", x: 694, y: 538, width: 100, height: 60, color: "#fff" });
    const snapped = snapToPage(dragged, page);
    expect(snapped).toEqual({ ...dragged, x: 700, y: 540 });
    expect(dragged.x).toBe(694);
    expect(dragged.y).toBe(538);
  });

  it("honors zero tolerance and validates untrusted geometry", () => {
    const element = { x: 5, y: 5, width: 100, height: 60 };
    expect(snapToPage(element, page, 0)).toBe(element);
    expect(() => snapToPage(element, page, -1)).toThrow(RangeError);
    expect(() => snapToPage({ ...element, x: NaN }, page)).toThrow(RangeError);
    expect(() => snapToPage({ ...element, width: 900 }, page)).toThrow(RangeError);
  });
});
