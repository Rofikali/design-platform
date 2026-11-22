import { describe, expect, it } from "vitest";
import { alignToPage } from "../utils/element-alignment";
import { createHistory, recordHistory, redoHistory, undoHistory } from "../utils/document-history";
import { parseDocumentJson, toDocument, type TextElement } from "../utils/document";

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
  it("keeps the original document unchanged when alignment is already satisfied", () => {
    const source: TextElement = { id: "already-left", type: "text", text: "Title", x: 0, y: 15, width: 120, height: 25, fontSize: 18, color: "#172033" };
    const page = { width: 800, height: 600, background: "#ffffff" };
    const before = JSON.stringify(toDocument([source], page));
    const result = alignToPage(source, page, "left");
    expect(result).toBe(source);
    const after = JSON.stringify(toDocument([result], page));
    expect(after).toBe(before);
    expect(recordHistory(createHistory(before), after)).toEqual(createHistory(before));
  });

  it("preserves schema-v5 export and undo/redo of an aligned element", () => {
    const source: TextElement = { id: "heading", type: "text", text: "Exam", x: 27, y: 18, width: 100, height: 30, fontSize: 20, color: "#172033" };
    const page = { width: 800, height: 600, background: "#ffffff" };
    const before = JSON.stringify(toDocument([source], page));
    const aligned = alignToPage(source, page, "center-horizontal");
    const after = JSON.stringify(toDocument([aligned], page));
    expect(aligned.x).toBe(350);
    expect(source.x).toBe(27);
    expect(parseDocumentJson(after).elements[0]).toEqual(aligned);
    const history = recordHistory(createHistory(before), after);
    const undone = undoHistory(history, after);
    expect(undone.snapshot).toBe(before);
    const redone = redoHistory(undone.history, before);
    expect(redone.snapshot).toBe(after);
  });

});
