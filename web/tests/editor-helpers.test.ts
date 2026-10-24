import { describe, expect, it } from "vitest";
import { clampElementPosition, nextElementId } from "../utils/editor-helpers";

describe("nextElementId", () => {
  it("returns the requested sequence number when it is unused", () => {
    expect(nextElementId("text", [{ id: "rect-1" }], 3)).toEqual({
      id: "text-3",
      nextNumber: 4,
    });
  });

  it("skips a colliding ID from an imported document", () => {
    expect(nextElementId("text", [{ id: "text-3" }, { id: "text-4" }], 3)).toEqual({
      id: "text-5",
      nextNumber: 6,
    });
  });

  it("keeps IDs unique across element types and normalizes invalid counters", () => {
    expect(nextElementId("rect", [{ id: "rect-1" }], 0)).toEqual({
      id: "rect-2",
      nextNumber: 3,
    });
  });
});


describe("clampElementPosition", () => {
  it("keeps an element inside the page without changing valid coordinates", () => {
    expect(clampElementPosition(30, 40, 100, 80, 800, 600)).toEqual({ x: 30, y: 40 });
  });

  it("clamps positions at every page edge", () => {
    const { clampElementPosition } = await import("../utils/editor-helpers");
    expect(clampElementPosition(-20, -5, 100, 80, 800, 600)).toEqual({ x: 0, y: 0 });
    expect(clampElementPosition(900, 700, 100, 80, 800, 600)).toEqual({ x: 700, y: 520 });
  });

  it("handles elements larger than the page and non-finite pointer values safely", () => {
    const { clampElementPosition } = await import("../utils/editor-helpers");
    expect(clampElementPosition(Number.NaN, Number.POSITIVE_INFINITY, 900, 700, 800, 600)).toEqual({ x: 0, y: 0 });
  });
});
