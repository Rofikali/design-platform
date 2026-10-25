import { describe, expect, it } from "vitest";
import {
  createHistory,
  redoHistory,
  recordHistory,
  undoHistory,
} from "../utils/document-history";

describe("document history", () => {
  it("supports a normal undo/redo cycle", () => {
    const initial = createHistory("A");
    const edited = recordHistory(initial, "B");

    const undone = undoHistory(edited, "B");
    expect(undone).toMatchObject({ snapshot: "A", status: "applied" });
    expect(undone.history.undoStack).toEqual([]);
    expect(undone.history.redoStack).toEqual(["B"]);

    const redone = redoHistory(undone.history, "A");
    expect(redone).toMatchObject({ snapshot: "B", status: "applied" });
    expect(redone.history.undoStack).toEqual(["A"]);
    expect(redone.history.redoStack).toEqual([]);
  });

  it("undoes a change that has not yet passed the debounce window", () => {
    const history = createHistory("stable");
    const result = undoHistory(history, "pending");

    expect(result).toMatchObject({ snapshot: "stable", status: "applied" });
    expect(result.history.redoStack).toEqual(["pending"]);
    expect(result.history.stableSnapshot).toBe("stable");
  });

  it("retains only the configured number of undo snapshots", () => {
    let history = createHistory("A", 2);
    history = recordHistory(history, "B");
    history = recordHistory(history, "C");
    history = recordHistory(history, "D");

    expect(history.undoStack).toEqual(["B", "C"]);
    expect(history.stableSnapshot).toBe("D");
  });

  it("clears redo history when a new edit branches from an undone state", () => {
    const firstEdit = recordHistory(createHistory("A"), "B");
    const undone = undoHistory(firstEdit, "B");
    expect(undone.history.redoStack).toEqual(["B"]);

    const branch = recordHistory(undone.history, "C");
    expect(branch.undoStack).toEqual(["A"]);
    expect(branch.redoStack).toEqual([]);
    expect(branch.stableSnapshot).toBe("C");
  });

  it("does not create entries for unchanged snapshots and handles empty history", () => {
    const history = createHistory("A");
    expect(recordHistory(history, "A")).toBe(history);
    expect(undoHistory(history, "A")).toMatchObject({
      snapshot: null,
      status: "empty",
    });
    expect(redoHistory(history, "A")).toMatchObject({
      snapshot: null,
      status: "empty",
    });
  });

  it("normalizes invalid and fractional history limits", () => {
    expect(createHistory("A", Number.NaN).limit).toBe(50);
    expect(createHistory("A", Number.POSITIVE_INFINITY).limit).toBe(50);
    expect(createHistory("A", -4).limit).toBe(0);
    expect(createHistory("A", 2.9).limit).toBe(2);
  });

  it("records an unexpected edit before a redo attempt and clears the redo branch", () => {
    const edited = recordHistory(createHistory("A"), "B");
    const undone = undoHistory(edited, "B");
    const result = redoHistory(undone.history, "C");

    expect(result).toMatchObject({ snapshot: null, status: "recorded-new-changes" });
    expect(result.history.stableSnapshot).toBe("C");
    expect(result.history.redoStack).toEqual([]);
    expect(result.history.undoStack).toEqual(["A"]);
  });
});
