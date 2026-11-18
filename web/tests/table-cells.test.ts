import { describe, expect, it } from "vitest";
import { createHistory, recordHistory, redoHistory, undoHistory } from "../utils/document-history";
import { parseDocumentJson, toDocument, type TableElement } from "../utils/document";
import { renderDesignSvg } from "../utils/design-export";
import { insertTableRow, replaceTableCell, tableCellPosition } from "../utils/table-cells";

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

  it("preserves header semantics when inserting before a header row", () => {
    expect(insertTableRow(sampleTable(), 0).headerRows).toBe(2);
    expect(insertTableRow(sampleTable(), 3).headerRows).toBe(1);
  });

  it("rejects invalid boundaries and the 20-row ceiling", () => {
    const table = sampleTable();
    for (const index of [-1, 4, 1.5, Number.NaN]) {
      expect(() => insertTableRow(table, index)).toThrow(/Invalid/);
    }
    const full = { ...table, rows: 20, cells: Array.from({ length: 20 }, () => ["", "", ""]) };
    expect(() => insertTableRow(full, 10)).toThrow(/Invalid/);
  });
});
