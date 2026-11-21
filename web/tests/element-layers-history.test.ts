import { describe, expect, it } from "vitest";
import { createHistory, recordHistory, redoHistory, undoHistory } from "../utils/document-history";
import { moveElementLayer } from "../utils/element-layers";
import { parseDocument, toDocument, type DesignElement } from "../utils/document";

const initial: DesignElement[] = [
  { id: "background", type: "rect", x: 0, y: 0, width: 100, height: 100, color: "#ffffff" },
  { id: "heading", type: "text", x: 10, y: 10, width: 80, height: 30, text: "Heading", fontSize: 16, color: "#000000" },
  { id: "border", type: "frame", x: 0, y: 0, width: 100, height: 100, strokeColor: "#000000", strokeWidth: 1 },
];

const snapshot = (elements: DesignElement[]) => JSON.stringify(toDocument(elements));
const ids = (serialized: string) => parseDocument(JSON.parse(serialized)).elements.map((element) => element.id);

describe("layer ordering document-history acceptance", () => {
  it("undoes and redoes a direct front move without losing schema-v5 content", () => {
    const before = snapshot(initial);
    const reordered = moveElementLayer(initial, "background", "front");
    const after = snapshot([...reordered]);
    const recorded = recordHistory(createHistory(before), after);
    expect(ids(after)).toEqual(["heading", "border", "background"]);
    expect(ids(before)).toEqual(["background", "heading", "border"]);
    const undone = undoHistory(recorded, after);
    expect(undone.status).toBe("applied");
    expect(undone.snapshot).toBe(before);
    const redone = redoHistory(undone.history, before);
    expect(redone.status).toBe("applied");
    expect(redone.snapshot).toBe(after);
    expect(initial.map((element) => element.id)).toEqual(["background", "heading", "border"]);
  });

  it("does not create a history entry for a boundary no-op", () => {
    const before = snapshot(initial);
    const unchanged = moveElementLayer(initial, "background", "back");
    expect(unchanged).toBe(initial);
    const history = createHistory(before);
    expect(recordHistory(history, snapshot([...unchanged]))).toBe(history);
  });

  it("invalidates redo when a new layer command branches after undo", () => {
    const before = snapshot(initial);
    const first = snapshot([...moveElementLayer(initial, "background", "front")]);
    const recorded = recordHistory(createHistory(before), first);
    const undone = undoHistory(recorded, first);
    const alternate = snapshot([...moveElementLayer(initial, "heading", "front")]);
    const branched = recordHistory(undone.history, alternate);
    expect(branched.redoStack).toEqual([]);
    expect(redoHistory(branched, alternate).status).toBe("empty");
  });
});
