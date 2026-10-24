import { describe, expect, it } from "vitest";
import { nextElementId } from "../utils/editor-helpers";

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
