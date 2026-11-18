import { describe, expect, it } from "vitest";
import { getElementSelectionLabel } from "../utils/element-accessibility";
import type { DesignElement } from "../utils/document";

const base = { id: "selected", x: 10, y: 20, width: 120, height: 60 };

describe("accessible canvas selection labels", () => {
  it("announces a semantic Table as a table rather than a visual Grid", () => {
    const table: DesignElement = {
      ...base, type: "table", rows: 2, columns: 3,
      cells: [["Name", "Item", "Cost"], ["A", "B", "C"]], headerRows: 1,
      strokeColor: "#000000", strokeWidth: 1, cellPadding: 4,
      fontSize: 12, textColor: "#000000", headerFill: "#ffffff", cellFill: "#ffffff",
    };
    expect(getElementSelectionLabel(table)).toBe("Select table element with 2 rows and 3 columns");
    expect(getElementSelectionLabel(table)).not.toMatch(/grid element/);
  });

  it("preserves the distinct visual Grid label", () => {
    const grid: DesignElement = {
      ...base, type: "grid", rows: 4, columns: 5, strokeColor: "#000000", strokeWidth: 1,
    };
    expect(getElementSelectionLabel(grid)).toBe("Select grid element with 4 rows and 5 columns");
  });

  it("preserves text, rectangle and frame selection labels", () => {
    const text: DesignElement = {
      ...base, type: "text", text: "A".repeat(100), fontSize: 16, color: "#000000",
    };
    const rectangle: DesignElement = { ...base, type: "rect", color: "#ffffff" };
    const frame: DesignElement = {
      ...base, type: "frame", strokeColor: "#000000", strokeWidth: 1,
    };
    expect(getElementSelectionLabel(text)).toBe(`Select text element: ${"A".repeat(80)}`);
    expect(getElementSelectionLabel(rectangle)).toBe("Select rectangle element");
    expect(getElementSelectionLabel(frame)).toBe("Select frame element");
  });
});
