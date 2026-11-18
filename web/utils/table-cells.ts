import { MAX_TABLE_CELL_CHARS, MAX_TABLE_TEXT_CHARS, type TableElement } from "./document";

export function tableCellPosition(table: Pick<TableElement, "rows" | "columns">, index: number) {
  if (!Number.isInteger(index) || index < 0 || index >= table.rows * table.columns) {
    throw new Error("Selected table cell is out of range.");
  }
  return { row: Math.floor(index / table.columns), column: index % table.columns };
}

/** Table cells are owned by their table; editing never adds free-floating text elements. */
export function replaceTableCell(table: TableElement, row: number, column: number, value: string): TableElement {
  if (!Number.isInteger(row) || !Number.isInteger(column) ||
      row < 0 || row >= table.rows || column < 0 || column >= table.columns ||
      typeof value !== "string") throw new Error("Invalid table cell edit.");
  const cellLength = [...value].length;
  if (cellLength > MAX_TABLE_CELL_CHARS) throw new Error("A table cell cannot exceed 2,000 characters.");
  let textLength = cellLength;
  for (let r = 0; r < table.rows; r++) {
    for (let c = 0; c < table.columns; c++) {
      if (r !== row || c !== column) textLength += [...table.cells[r]![c]!].length;
    }
  }
  if (textLength > MAX_TABLE_TEXT_CHARS) throw new Error("A table cannot exceed 20,000 text characters.");
  return {
    ...table,
    cells: table.cells.map((cells, r) => r === row
      ? cells.map((cell, c) => c === column ? value : cell)
      : cells),
  };
}
