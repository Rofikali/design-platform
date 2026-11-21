import { describe, expect, it } from "vitest";
import { moveElementLayer } from "../utils/element-layers";
import { parseDocument, toDocument, type DesignElement } from "../utils/document";

const elements: DesignElement[] = [
  { id: "bottom", type: "rect", x: 0, y: 0, width: 50, height: 50, color: "#000000" },
  { id: "middle", type: "text", x: 0, y: 0, width: 50, height: 50, text: "Hi", fontSize: 12, color: "#ffffff" },
  { id: "top", type: "frame", x: 0, y: 0, width: 50, height: 50, strokeColor: "#000000", strokeWidth: 1 },
];

describe("immutable element layering", () => {
  it("moves one step forward without changing the source or element identities", () => {
    const original = structuredClone(elements);
    const moved = moveElementLayer(elements, "bottom", "forward");
    expect(moved.map((element) => element.id)).toEqual(["middle", "bottom", "top"]);
    expect(elements).toEqual(original);
    expect(moved[1]).toBe(elements[0]);
    expect(parseDocument(toDocument([...moved])).elements).toEqual(moved);
  });

  it("moves one step backward and can restore the original stacking order", () => {
    const moved = moveElementLayer(elements, "middle", "backward");
    expect(moved.map((element) => element.id)).toEqual(["middle", "bottom", "top"]);
    expect(moveElementLayer(moved, "middle", "forward")).toEqual(elements);
  });

  it("preserves reference identity for missing selections and edge requests", () => {
    expect(moveElementLayer(elements, "missing", "forward")).toBe(elements);
    expect(moveElementLayer(elements, "bottom", "backward")).toBe(elements);
    expect(moveElementLayer(elements, "top", "forward")).toBe(elements);
    expect(moveElementLayer([], "missing", "backward")).toEqual([]);
  });

  it("moves directly to the front or back while preserving stable identities and schema-v5 JSON", () => {
    const front = moveElementLayer(elements, "bottom", "front");
    expect(front.map((element) => element.id)).toEqual(["middle", "top", "bottom"]);
    expect(front[2]).toBe(elements[0]);
    const back = moveElementLayer(front, "bottom", "back");
    expect(back.map((element) => element.id)).toEqual(["bottom", "middle", "top"]);
    expect(parseDocument(toDocument([...front])).elements).toEqual(front);
    expect(moveElementLayer(front, "bottom", "front")).toBe(front);
    expect(moveElementLayer(elements, "bottom", "back")).toBe(elements);
  });

  it("does not mutate frozen source arrays", () => {
    const frozen = Object.freeze([...elements]);
    const moved = moveElementLayer(frozen, "top", "backward");
    expect(moved.map((element) => element.id)).toEqual(["bottom", "top", "middle"]);
    expect(frozen.map((element) => element.id)).toEqual(["bottom", "middle", "top"]);
  });
});
