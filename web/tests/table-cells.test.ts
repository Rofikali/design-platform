import { describe, expect, it } from "vitest";
import { createHistory, recordHistory, redoHistory, undoHistory } from "../utils/document-history";
import { parseDocumentJson, toDocument, type TableElement } from "../utils/document";
import { renderDesignSvg } from "../utils/design-export";
import { deleteTableColumn, deleteTableRow, insertTableColumn, insertTableRow, replaceTableCell, tableCellPosition } from "../utils/table-cells";

function sampleTable(): TableElement {
  return {
    id: "table-1", type: "table", x: 40, y: 80, width: 340, height: 180,
    rows: 3, columns: 3, cells: [["", "", ""], ["", "", ""], ["", "", ""]],
    headerRows: 1, strokeColor: "#334155", strokeWidth: 1, cellPadding: 6,
    fontSize: 16, textColor: "#111827", headerFill: "#dbeafe", cellFill: "#ffffff",
  };
}

describe("accessible table cell editing domain", () => {
  it("maps row-major coordinates and rejects invalid selections", () => {
    const table = sampleTable();
    expect(tableCellPosition(table, 0)).toEqual({ row: 0, column: 0 });
    expect(tableCellPosition(table, 4)).toEqual({ row: 1, column: 1 });
    expect(tableCellPosition(table, 8)).toEqual({ row: 2, column: 2 });
    for (const index of [-1, 9, 1.5, Number.NaN]) {
      expect(() => tableCellPosition(table, index)).toThrow(/range/);
    }
  });

  it("rejects malformed table dimensions before mapping keyboard cell selection", () => {
    const table = sampleTable();
    for (const dimensions of [
      { rows: 0, columns: 3 },
      { rows: 3, columns: 0 },
      { rows: Number.NaN, columns: 3 },
      { rows: 3, columns: Number.POSITIVE_INFINITY },
      { rows: 1.5, columns: 3 },
      { rows: 3, columns: -1 },
      { rows: 21, columns: 3 },
      { rows: 3, columns: 21 },
    ]) {
      expect(() => tableCellPosition({ ...table, ...dimensions }, 0)).toThrow(/range/);
    }
    expect(tableCellPosition(table, 8)).toEqual({ row: 2, column: 2 });
  });

  it("edits one cell immutably and persists through schema-v5 JSON and escaped SVG", () => {
    const initial = sampleTable();
    const updated = replaceTableCell(initial, 1, 1, "Rice & <dal> ₹80");
    expect(initial.cells[1]![1]).toBe("");
    expect(updated.cells[1]![1]).toBe("Rice & <dal> ₹80");
    expect(updated.cells[0]).toEqual(["", "", ""]);
    const parsed = parseDocumentJson(JSON.stringify(toDocument([updated])));
    expect(parsed.elements[0]).toMatchObject({ type: "table", rows: 3, columns: 3, cells: updated.cells });
    const svg = renderDesignSvg([updated], 800, 600, "#ffffff");
    expect(svg).toMatch(/<tspan[^>]*>Rice &amp;<\/tspan>/);
    expect(svg).toMatch(/<tspan[^>]*>&lt;dal&gt; ₹80<\/tspan>/);
    expect(svg).not.toContain("Rice & <dal>");
  });

  it("supports table cell history undo and redo", () => {
    const initial = JSON.stringify(toDocument([sampleTable()]));
    const edited = JSON.stringify(toDocument([replaceTableCell(sampleTable(), 2, 0, "Marks: 5")]));
    const undo = undoHistory(recordHistory(createHistory(initial), edited), edited);
    expect(parseDocumentJson(undo.snapshot!).elements[0]).toMatchObject({ type: "table", cells: sampleTable().cells });
    const redo = redoHistory(undo.history, undo.snapshot!);
    expect(parseDocumentJson(redo.snapshot!).elements[0]).toMatchObject({ type: "table", cells: [["", "", ""], ["", "", ""], ["Marks: 5", "", ""]] });
  });

  it("rejects malformed source matrices and headers before editing a cell", () => {
    const original = sampleTable();
    const malformed = [
      { ...original, cells: null as unknown as string[][] },
      { ...original, cells: [[null as unknown as string, "", ""], ...original.cells.slice(1)] },
      { ...original, cells: original.cells.slice(0, 2) },
      { ...original, headerRows: 2 },
      { ...original, rows: 0 },
      { ...original, cells: original.cells.map((row) => [...row]) },
    ];
    malformed[5]!.cells[2]![2] = "😀".repeat(2001);
    for (const table of malformed) {
      expect(() => replaceTableCell(table, 0, 0, "Valid")).toThrow(/Invalid table cell edit/);
    }
    expect(original.cells[0]![0]).toBe("");
  });

  it("rejects enormous replacement strings without changing the source or Unicode boundaries", () => {
    const original = sampleTable();
    const huge = "😀".repeat(100_000);
    expect(() => replaceTableCell(original, 1, 1, huge)).toThrow(/2,000/);
    expect(original.cells[1]![1]).toBe("");
    const valid = replaceTableCell(original, 1, 1, "😀".repeat(2000));
    expect(valid.cells[1]![1]).toBe("😀".repeat(2000));
    expect(original.cells[1]![1]).toBe("");
  });

  it("enforces aggregate Unicode code-point budget at the exact boundary", () => {
    const table = sampleTable();
    const full: TableElement = {
      ...table,
      rows: 20,
      columns: 20,
      cells: Array.from({ length: 20 }, () => Array.from({ length: 20 }, () => "😀".repeat(50))),
    };
    const accepted = replaceTableCell(full, 19, 19, "界".repeat(50));
    expect(accepted.cells[19]![19]).toBe("界".repeat(50));
    expect(full.cells[19]![19]).toBe("😀".repeat(50));
    expect(() => replaceTableCell(full, 19, 19, "界".repeat(51))).toThrow(/20,000/);
    expect(() => insertTableColumn(full, 0)).toThrow(/Invalid/);
    expect(parseDocumentJson(JSON.stringify(toDocument([accepted]))).elements[0])
      .toMatchObject({ type: "table", cells: accepted.cells });
  });

  it("rejects a malformed imported matrix above the aggregate limit before replacement", () => {
    const table = sampleTable();
    const malformed: TableElement = {
      ...table,
      rows: 20,
      columns: 20,
      cells: Array.from({ length: 20 }, () => Array.from({ length: 20 }, () => "😀".repeat(50))),
    };
    malformed.cells[0]![0] = "😀".repeat(51);
    expect(() => replaceTableCell(malformed, 0, 0, "safe")).toThrow(/Invalid table cell edit/);
    expect(() => replaceTableCell(malformed, 19, 19, "")).toThrow(/Invalid table cell edit/);
    expect(() => deleteTableRow(malformed, 0)).toThrow(/Invalid table/);
    expect(malformed.cells[0]![0]).toBe("😀".repeat(51));
    expect(malformed.cells[19]![19]).toBe("😀".repeat(50));
  });

  it("enforces code-point, table-total, and index boundaries without mutating the source", () => {
    const table = sampleTable();
    expect(() => replaceTableCell(table, 3, 0, "x")).toThrow(/Invalid/);
    expect(() => replaceTableCell(table, 0, -1, "x")).toThrow(/Invalid/);
    expect(() => replaceTableCell(table, 1, 1, "x".repeat(2001))).toThrow(/2,000/);
    expect(replaceTableCell(table, 1, 1, "😀".repeat(2000)).cells[1]![1]).toBe("😀".repeat(2000));
    const full: TableElement = { ...table, rows: 20, columns: 20, cells: Array.from({ length: 20 }, () => Array(20).fill("x".repeat(50))) };
    expect(() => replaceTableCell(full, 0, 0, "y".repeat(51))).toThrow(/20,000/);
    expect(replaceTableCell(full, 0, 0, "y".repeat(50)).cells[0]![0]).toHaveLength(50);
    expect(full.cells[0]![0]).toBe("x".repeat(50));
  });
});

describe("table row insertion primitive", () => {
  it("inserts an empty row without shifting existing cell values within rows", () => {
    const original = replaceTableCell(sampleTable(), 1, 2, "Original");
    const inserted = insertTableRow(original, 1);
    expect(inserted.rows).toBe(4);
    expect(inserted.cells[1]).toEqual(["", "", ""]);
    expect(inserted.cells[2]![2]).toBe("Original");
    expect(original.rows).toBe(3);
    expect(original.cells[1]![2]).toBe("Original");
    expect(parseDocumentJson(JSON.stringify(toDocument([inserted]))).elements[0])
      .toMatchObject({ type: "table", rows: 4, cells: inserted.cells });
  });

  it("keeps the single-header schema-v5 contract when inserting above the first row", () => {
    const original = replaceTableCell(sampleTable(), 0, 0, "Original header");
    const inserted = insertTableRow(original, 0);
    expect(inserted.headerRows).toBe(1);
    expect(inserted.cells[0]).toEqual(["", "", ""]);
    expect(inserted.cells[1]![0]).toBe("Original header");
    expect(original.cells[0]![0]).toBe("Original header");
    expect(parseDocumentJson(JSON.stringify(toDocument([inserted]))).elements[0])
      .toMatchObject({ type: "table", rows: 4, headerRows: 1, cells: inserted.cells });
    expect(insertTableRow(sampleTable(), 3).headerRows).toBe(1);
    expect(insertTableRow({ ...sampleTable(), headerRows: 0 }, 0).headerRows).toBe(0);
  });

  it("round-trips inserted rows through undo and redo without losing existing text", () => {
    const original = replaceTableCell(sampleTable(), 2, 1, "Preserved");
    const before = JSON.stringify(toDocument([original]));
    const inserted = insertTableRow(original, 2);
    const after = JSON.stringify(toDocument([inserted]));
    const undo = undoHistory(recordHistory(createHistory(before), after), after);
    expect(parseDocumentJson(undo.snapshot!).elements[0]).toMatchObject({
      type: "table", rows: 3, cells: original.cells,
    });
    const redo = redoHistory(undo.history, undo.snapshot!);
    expect(parseDocumentJson(redo.snapshot!).elements[0]).toMatchObject({
      type: "table", rows: 4, cells: inserted.cells,
    });
    expect(inserted.cells[3]![1]).toBe("Preserved");
  });

  it("rejects invalid boundaries and the 20-row ceiling", () => {
    const table = sampleTable();
    for (const index of [-1, 4, 1.5, Number.NaN]) {
      expect(() => insertTableRow(table, index)).toThrow(/Invalid/);
    }
    const full = { ...table, rows: 20, cells: Array.from({ length: 20 }, () => ["", "", ""]) };
    expect(() => insertTableRow(full, 10)).toThrow(/Invalid/);
    expect(() => insertTableRow({ ...table, headerRows: 2 }, 0)).toThrow(/Invalid/);
    expect(() => insertTableRow({ ...table, cells: [null as unknown as string[], ...table.cells.slice(1)] }, 0))
      .toThrow(/Invalid/);
  });
});

describe("table column insertion primitive", () => {
  it("inserts an empty column and preserves source cells, headers, and schema-v5 serialization", () => {
    const original = replaceTableCell(sampleTable(), 1, 1, "Rice & dal");
    const inserted = insertTableColumn(original, 1);
    expect(inserted.columns).toBe(4);
    expect(inserted.rows).toBe(3);
    expect(inserted.headerRows).toBe(1);
    expect(inserted.cells[1]).toEqual(["", "", "Rice & dal", ""]);
    expect(original.cells[1]).toEqual(["", "Rice & dal", ""]);
    expect(parseDocumentJson(JSON.stringify(toDocument([inserted]))).elements[0])
      .toMatchObject({ type: "table", columns: 4, cells: inserted.cells });
  });

  it("supports insertion at both edges and rejects invalid boundaries or a 20-column table", () => {
    const table = replaceTableCell(sampleTable(), 0, 0, "First");
    expect(insertTableColumn(table, 0).cells[0]).toEqual(["", "First", "", ""]);
    expect(insertTableColumn(table, 3).cells[0]).toEqual(["First", "", "", ""]);
    for (const index of [-1, 4, 1.5, Number.NaN, Infinity]) {
      expect(() => insertTableColumn(table, index)).toThrow(/Invalid/);
    }
    const full = { ...table, columns: 20, cells: Array.from({ length: 3 }, () => Array(20).fill("")) };
    expect(() => insertTableColumn(full, 10)).toThrow(/Invalid/);
    expect(full.columns).toBe(20);
    for (const headerRows of [-1, 2, 0.5, Number.NaN]) {
      expect(() => insertTableColumn({ ...table, headerRows }, 1)).toThrow(/Invalid/);
    }
    expect(() => insertTableColumn({ ...table, cells: null as unknown as string[][] }, 1)).toThrow(/Invalid/);
  });
});


describe("table structural mutation rejects malformed cell values", () => {
  it("rejects non-string cells before insertion or deletion, preserving the source", () => {
    const table = sampleTable();
    const malformed: TableElement = {
      ...table,
      cells: table.cells.map((row) => [...row]),
    };
    (malformed.cells[1] as unknown[])[1] = null;
    for (const mutate of [
      (value: TableElement) => insertTableRow(value, 1),
      (value: TableElement) => insertTableColumn(value, 1),
      (value: TableElement) => deleteTableRow(value, 1),
      (value: TableElement) => deleteTableColumn(value, 1),
    ]) {
      expect(() => mutate(malformed)).toThrow(/Invalid table/);
    }
    expect(malformed.cells[1]![1]).toBeNull();
    expect(table.cells[1]![1]).toBe("");
  });
});

describe("table structural mutation enforces schema-v5 text budgets", () => {
  it("rejects very large untrusted Unicode cells before any structural edit", () => {
    const table = sampleTable();
    const huge = { ...table, cells: table.cells.map((row) => [...row]) };
    huge.cells[1]![1] = "😀".repeat(100_000);
    for (const edit of [
      (value: TableElement) => insertTableRow(value, 1),
      (value: TableElement) => insertTableColumn(value, 1),
      (value: TableElement) => deleteTableRow(value, 1),
      (value: TableElement) => deleteTableColumn(value, 1),
      (value: TableElement) => replaceTableCell(value, 0, 0, "ok"),
    ]) {
      expect(() => edit(huge)).toThrow(/Invalid table/);
    }
    expect(huge.cells[1]![1]).toBe("😀".repeat(100_000));
  });

  it("rejects oversized cell text and aggregate text before all four structural edits", () => {
    const original = sampleTable();
    const overCell = { ...original, cells: original.cells.map((row) => [...row]) };
    overCell.cells[0]![0] = "😀".repeat(2001);
    const overTotal = {
      ...original,
      rows: 11,
      columns: 10,
      cells: Array.from({ length: 11 }, () => Array.from({ length: 10 }, () => "x".repeat(200))),
    };
    for (const malformed of [overCell, overTotal]) {
      for (const mutate of [
        (table: TableElement) => insertTableRow(table, 1),
        (table: TableElement) => insertTableColumn(table, 1),
        (table: TableElement) => deleteTableRow(table, 1),
        (table: TableElement) => deleteTableColumn(table, 1),
      ]) {
        expect(() => mutate(malformed)).toThrow(/Invalid table/);
      }
    }
    expect(overCell.cells[0]![0]).toBe("😀".repeat(2001));
    expect(overTotal.cells[0]![0]).toBe("x".repeat(200));
  });
});

describe("table row deletion primitive", () => {
  it("removes a selected row immutably and preserves surviving cell text and schema-v5 serialization", () => {
    const original = replaceTableCell(replaceTableCell(sampleTable(), 0, 1, "Header"), 2, 2, "Keep");
    const deleted = deleteTableRow(original, 1);
    expect(deleted.rows).toBe(2);
    expect(deleted.headerRows).toBe(1);
    expect(deleted.cells).toEqual([original.cells[0], original.cells[2]]);
    expect(original.rows).toBe(3);
    expect(original.cells).toHaveLength(3);
    expect(parseDocumentJson(JSON.stringify(toDocument([deleted]))).elements[0])
      .toMatchObject({ type: "table", rows: 2, cells: deleted.cells });
  });

  it("adjusts header count only when deleting a header row", () => {
    expect(deleteTableRow(sampleTable(), 0).headerRows).toBe(0);
    expect(deleteTableRow(sampleTable(), 2).headerRows).toBe(1);
  });

  it("rejects invalid indices, malformed dimensions and deletion of the final row", () => {
    const table = sampleTable();
    for (const index of [-1, 3, 1.5, Number.NaN, Infinity]) {
      expect(() => deleteTableRow(table, index)).toThrow(/Invalid/);
    }
    expect(() => deleteTableRow({ ...table, rows: 1, cells: [table.cells[0]!] }, 0)).toThrow(/Invalid/);
    expect(() => deleteTableRow({ ...table, cells: [[]] }, 0)).toThrow(/Invalid/);
    expect(() => deleteTableRow({ ...table, headerRows: 2 }, 1)).toThrow(/Invalid/);
    expect(() => deleteTableRow({ ...table, headerRows: -1 }, 1)).toThrow(/Invalid/);
    expect(() => deleteTableRow({ ...table, headerRows: 0.5 }, 1)).toThrow(/Invalid/);
    expect(() => deleteTableRow({ ...table, cells: null as unknown as string[][] }, 1)).toThrow(/Invalid/);
    expect(deleteTableRow({ ...table, headerRows: 0 }, 0).headerRows).toBe(0);
  });

  it("supports undo and redo without changing the original table", () => {
    const original = replaceTableCell(sampleTable(), 2, 0, "Preserved");
    const before = JSON.stringify(toDocument([original]));
    const deleted = deleteTableRow(original, 1);
    const after = JSON.stringify(toDocument([deleted]));
    const undo = undoHistory(recordHistory(createHistory(before), after), after);
    expect(parseDocumentJson(undo.snapshot!).elements[0]).toMatchObject({ rows: 3, cells: original.cells });
    const redo = redoHistory(undo.history, undo.snapshot!);
    expect(parseDocumentJson(redo.snapshot!).elements[0]).toMatchObject({ rows: 2, cells: deleted.cells });
  });
});


describe("table column deletion primitive", () => {
  it("removes a column immutably while preserving row text, headers and schema-v5 JSON", () => {
    const original = replaceTableCell(replaceTableCell(sampleTable(), 0, 0, "Header"), 2, 2, "Keep");
    const deleted = deleteTableColumn(original, 1);
    expect(deleted.columns).toBe(2);
    expect(deleted.rows).toBe(3);
    expect(deleted.headerRows).toBe(1);
    expect(deleted.cells).toEqual([["Header", ""], ["", ""], ["", "Keep"]]);
    expect(original.columns).toBe(3);
    expect(original.cells[2]).toEqual(["", "", "Keep"]);
    expect(parseDocumentJson(JSON.stringify(toDocument([deleted]))).elements[0])
      .toMatchObject({ type: "table", rows: 3, columns: 2, cells: deleted.cells });
  });

  it("handles first and last column boundaries and rejects invalid tables", () => {
    const original = replaceTableCell(sampleTable(), 1, 1, "Middle");
    expect(deleteTableColumn(original, 0).cells[1]).toEqual(["Middle", ""]);
    expect(deleteTableColumn(original, 2).cells[1]).toEqual(["", "Middle"]);
    for (const index of [-1, 3, 1.5, Number.NaN, Infinity]) {
      expect(() => deleteTableColumn(original, index)).toThrow(/Invalid/);
    }
    expect(() => deleteTableColumn({ ...original, columns: 1, cells: [[""], [""], [""]] }, 0)).toThrow(/Invalid/);
    expect(() => deleteTableColumn({ ...original, cells: [[]] }, 0)).toThrow(/Invalid/);
    for (const headerRows of [-1, 2, 0.5, Number.NaN]) {
      expect(() => deleteTableColumn({ ...original, headerRows }, 1)).toThrow(/Invalid/);
    }
    expect(() => deleteTableColumn({ ...original, cells: null as unknown as string[][] }, 1)).toThrow(/Invalid/);
    expect(deleteTableColumn({ ...original, headerRows: 0 }, 1).headerRows).toBe(0);
  });

  it("supports history undo and redo after removing a column", () => {
    const original = replaceTableCell(sampleTable(), 2, 2, "Preserved");
    const before = JSON.stringify(toDocument([original]));
    const deleted = deleteTableColumn(original, 0);
    const after = JSON.stringify(toDocument([deleted]));
    const undo = undoHistory(recordHistory(createHistory(before), after), after);
    expect(parseDocumentJson(undo.snapshot!).elements[0]).toMatchObject({ columns: 3, cells: original.cells });
    const redo = redoHistory(undo.history, undo.snapshot!);
    expect(parseDocumentJson(redo.snapshot!).elements[0]).toMatchObject({ columns: 2, cells: deleted.cells });
  });
});

describe("single-header row deletion contract", () => {
  it("demotes the table to a headerless document when its only header is removed", () => {
    const original = replaceTableCell(replaceTableCell(sampleTable(), 0, 0, "Header"), 1, 0, "Body");
    const removed = deleteTableRow(original, 0);
    expect(removed.headerRows).toBe(0);
    expect(removed.rows).toBe(2);
    expect(removed.cells[0]![0]).toBe("Body");
    expect(original.headerRows).toBe(1);
    expect(original.cells[0]![0]).toBe("Header");
    expect(parseDocumentJson(JSON.stringify(toDocument([removed]))).elements[0]).toMatchObject({
      type: "table", headerRows: 0, rows: 2, cells: removed.cells,
    });
    const before = JSON.stringify(toDocument([original]));
    const after = JSON.stringify(toDocument([removed]));
    const undo = undoHistory(recordHistory(createHistory(before), after), after);
    expect(parseDocumentJson(undo.snapshot!).elements[0]).toMatchObject({
      type: "table", headerRows: 1, rows: 3, cells: original.cells,
    });
    const redo = redoHistory(undo.history, undo.snapshot!);
    expect(parseDocumentJson(redo.snapshot!).elements[0]).toMatchObject({
      type: "table", headerRows: 0, rows: 2, cells: removed.cells,
    });
  });
});

describe("maximum-width table column deletion contract", () => {
  it("removes the last column from a 20-column table without losing Unicode, headers or history", () => {
    const original: TableElement = {
      ...sampleTable(),
      columns: 20,
      cells: Array.from({ length: 3 }, (_, row) =>
        Array.from({ length: 20 }, (_, column) =>
          column === 18 ? (row === 0 ? "Header 界" : "😀 Body " + row) : "")),
    };
    const deleted = deleteTableColumn(original, 19);
    expect(deleted.columns).toBe(19);
    expect(deleted.headerRows).toBe(1);
    expect(deleted.cells[0]![18]).toBe("Header 界");
    expect(deleted.cells[2]![18]).toBe("😀 Body 2");
    expect(original.columns).toBe(20);
    expect(original.cells[2]).toHaveLength(20);
    const before = JSON.stringify(toDocument([original]));
    const after = JSON.stringify(toDocument([deleted]));
    expect(parseDocumentJson(after).elements[0]).toMatchObject({
      type: "table", columns: 19, headerRows: 1, cells: deleted.cells,
    });
    const undo = undoHistory(recordHistory(createHistory(before), after), after);
    expect(parseDocumentJson(undo.snapshot!).elements[0]).toMatchObject({
      type: "table", columns: 20, cells: original.cells,
    });
    const redo = redoHistory(undo.history, undo.snapshot!);
    expect(parseDocumentJson(redo.snapshot!).elements[0]).toMatchObject({
      type: "table", columns: 19, cells: deleted.cells,
    });
  });
});

describe("header insertion history contract", () => {
  it("preserves the old header as body and restores header identity across undo and redo", () => {
    const original = replaceTableCell(replaceTableCell(sampleTable(), 0, 0, "Heading 界"), 1, 0, "Body 😀");
    const inserted = insertTableRow(original, 0);
    expect(inserted.headerRows).toBe(1);
    expect(inserted.rows).toBe(4);
    expect(inserted.cells[0]).toEqual(["", "", ""]);
    expect(inserted.cells[1]![0]).toBe("Heading 界");
    expect(inserted.cells[2]![0]).toBe("Body 😀");
    expect(original.cells[0]![0]).toBe("Heading 界");

    const before = JSON.stringify(toDocument([original]));
    const after = JSON.stringify(toDocument([inserted]));
    expect(parseDocumentJson(after).elements[0]).toMatchObject({
      type: "table", rows: 4, headerRows: 1, cells: inserted.cells,
    });
    const undo = undoHistory(recordHistory(createHistory(before), after), after);
    expect(parseDocumentJson(undo.snapshot!).elements[0]).toMatchObject({
      type: "table", rows: 3, headerRows: 1, cells: original.cells,
    });
    const redo = redoHistory(undo.history, undo.snapshot!);
    expect(parseDocumentJson(redo.snapshot!).elements[0]).toMatchObject({
      type: "table", rows: 4, headerRows: 1, cells: inserted.cells,
    });
  });
});


describe("single-column table deletion safety", () => {
  it("rejects removing the only column without changing schema-v5 content", () => {
    const source: TableElement = {
      ...sampleTable(),
      columns: 1,
      cells: [["Header 😀"], ["Rice ₹80"], ["<literal>"]],
    };
    const before = JSON.stringify(toDocument([source]));
    expect(() => deleteTableColumn(source, 0)).toThrow(/Invalid table column deletion/);
    expect(() => deleteTableColumn(source, -1)).toThrow(/Invalid table column deletion/);
    expect(() => deleteTableColumn(source, 1)).toThrow(/Invalid table column deletion/);
    expect(JSON.stringify(toDocument([source]))).toBe(before);
    expect(parseDocumentJson(before).elements[0]).toMatchObject({
      type: "table", columns: 1, headerRows: 1, cells: source.cells,
    });
  });
});

describe("headerless table row insertion contract", () => {
  it("keeps headerRows zero when inserting before row zero and preserves history", () => {
    const source: TableElement = {
      ...sampleTable(), headerRows: 0,
      cells: [["Body 😀", "", ""], ["Second 界", "", ""], ["Rice ₹80", "", ""]],
    };
    const inserted = insertTableRow(source, 0);
    expect(inserted.headerRows).toBe(0);
    expect(inserted.rows).toBe(4);
    expect(inserted.cells[0]).toEqual(["", "", ""]);
    expect(inserted.cells[1]![0]).toBe("Body 😀");
    expect(source.cells[0]![0]).toBe("Body 😀");
    const before = JSON.stringify(toDocument([source]));
    const after = JSON.stringify(toDocument([inserted]));
    expect(parseDocumentJson(after).elements[0]).toMatchObject({
      type: "table", headerRows: 0, rows: 4, cells: inserted.cells,
    });
    const undo = undoHistory(recordHistory(createHistory(before), after), after);
    expect(parseDocumentJson(undo.snapshot!).elements[0]).toMatchObject({
      headerRows: 0, rows: 3, cells: source.cells,
    });
    const redo = redoHistory(undo.history, undo.snapshot!);
    expect(parseDocumentJson(redo.snapshot!).elements[0]).toMatchObject({
      headerRows: 0, rows: 4, cells: inserted.cells,
    });
  });
});

describe("headerless first-row deletion history contract", () => {
  it("preserves body text, headerless identity, and undo/redo after deleting row zero", () => {
    const source: TableElement = {
      ...sampleTable(), headerRows: 0,
      cells: [["Remove 😀", "", ""], ["Keep 界", "₹80", ""], ["Last <text>", "", ""]],
    };
    const before = JSON.stringify(toDocument([source]));
    const deleted = deleteTableRow(source, 0);
    expect(deleted.rows).toBe(2);
    expect(deleted.headerRows).toBe(0);
    expect(deleted.cells).toEqual([["Keep 界", "₹80", ""], ["Last <text>", "", ""]]);
    expect(JSON.stringify(toDocument([source]))).toBe(before);
    const after = JSON.stringify(toDocument([deleted]));
    expect(parseDocumentJson(after).elements[0]).toMatchObject({
      type: "table", rows: 2, headerRows: 0, cells: deleted.cells,
    });
    const undo = undoHistory(recordHistory(createHistory(before), after), after);
    expect(parseDocumentJson(undo.snapshot!).elements[0]).toMatchObject({
      rows: 3, headerRows: 0, cells: source.cells,
    });
    const redo = redoHistory(undo.history, undo.snapshot!);
    expect(parseDocumentJson(redo.snapshot!).elements[0]).toMatchObject({
      rows: 2, headerRows: 0, cells: deleted.cells,
    });
  });
});


describe("maximum-height table final-row deletion", () => {
  it("preserves Unicode content, schema-v5 and undo/redo at the 20-row boundary", () => {
    const original: TableElement = {
      ...sampleTable(),
      rows: 20,
      cells: Array.from({ length: 20 }, (_, row) =>
        [row === 0 ? "Header 🧾" : `Row ${row} 界`, "", row === 19 ? "Final ₹90" : ""]),
    };
    const before = JSON.stringify(toDocument([original]));
    const updated = deleteTableRow(original, 19);
    expect(updated.rows).toBe(19);
    expect(updated.headerRows).toBe(1);
    expect(updated.cells[0]![0]).toBe("Header 🧾");
    expect(updated.cells[18]![0]).toBe("Row 18 界");
    expect(updated.cells.some(row => row.includes("Final ₹90"))).toBe(false);
    expect(original.rows).toBe(20);
    expect(original.cells[19]![2]).toBe("Final ₹90");
    const after = JSON.stringify(toDocument([updated]));
    expect(parseDocumentJson(after).elements[0]).toMatchObject({
      type: "table", rows: 19, headerRows: 1, cells: updated.cells,
    });
    const undone = undoHistory(recordHistory(createHistory(before), after), after);
    expect(parseDocumentJson(undone.snapshot!).elements[0]).toMatchObject({
      type: "table", rows: 20, cells: original.cells,
    });
    const redone = redoHistory(undone.history, undone.snapshot!);
    expect(parseDocumentJson(redone.snapshot!).elements[0]).toMatchObject({
      type: "table", rows: 19, cells: updated.cells,
    });
  });
});
