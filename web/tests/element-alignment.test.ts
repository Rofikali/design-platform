import { describe, expect, it } from "vitest";
import { alignToPage } from "../utils/element-alignment";

describe("page-relative immutable alignment", () => {
  it("preserves identity fields and original frozen geometry", () => {
    const source = Object.freeze({ id: "text-1", type: "text", x: 12, y: 17, width: 20, height: 10 });
    const page = { width: 100, height: 80 };
    expect(alignToPage(source, page, "left")).toEqual({ ...source, x: 0 });
    expect(alignToPage(source, page, "center-horizontal")).toEqual({ ...source, x: 40 });
    expect(alignToPage(source, page, "right")).toEqual({ ...source, x: 80 });
    expect(alignToPage(source, page, "top")).toEqual({ ...source, y: 0 });
    expect(alignToPage(source, page, "center-vertical")).toEqual({ ...source, y: 35 });
    expect(alignToPage(source, page, "bottom")).toEqual({ ...source, y: 70 });
    expect(source.x).toBe(12);
    expect(source.y).toBe(17);
  });

  it("preserves reference on no-op and rejects invalid geometry", () => {
    const source = Object.freeze({ id: "frame-1", x: 0, y: 10, width: 20, height: 20 });
    expect(alignToPage(source, { width: 100, height: 80 }, "left")).toBe(source);
    expect(() => alignToPage(source, { width: 10, height: 80 }, "right")).toThrow(RangeError);
    expect(() => alignToPage({ ...source, x: NaN }, { width: 100, height: 80 }, "top")).toThrow(RangeError);
    expect(() => alignToPage(source, { width: 100, height: 80 }, "diagonal" as never)).toThrow(RangeError);
  });
});
