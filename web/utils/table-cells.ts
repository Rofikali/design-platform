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

/** Insert an empty row before the given boundary, preserving existing cell coordinates. */
export function insertTableRow(table: TableElement, beforeRow: number): TableElement {
  if (!Number.isInteger(beforeRow) || beforeRow < 0 || beforeRow > table.rows ||
      !Number.isInteger(table.rows) || table.rows < 1 || table.rows >= 20 ||
      !Number.isInteger(table.columns) || table.columns < 1 || table.columns > 20 ||
      table.cells.length !== table.rows ||
      table.cells.some((row) => row.length !== table.columns)) {
    throw new Error("Invalid table row insertion.");
  }
  const cells = table.cells.map((row) => [...row]);
  cells.splice(beforeRow, 0, Array.from({ length: table.columns }, () => ""));
  return {
    ...table,
    rows: table.rows + 1,
    headerRows: beforeRow < table.headerRows ? table.headerRows + 1 : table.headerRows,
    cells,
  };
}

/** Insert an empty column before a boundary without changing existing cell text. */
export function insertTableColumn(table: TableElement, beforeColumn: number): TableElement {
  if (!Number.isInteger(beforeColumn) || beforeColumn < 0 || beforeColumn > table.columns ||
      !Number.isInteger(table.rows) || table.rows < 1 || table.rows > 20 ||
      !Number.isInteger(table.columns) || table.columns < 1 || table.columns >= 20 ||
      table.cells.length !== table.rows ||
      table.cells.some((row) => !Array.isArray(row) || row.length !== table.columns)) {
    throw new Error("Invalid table column insertion.");
  }
  return {
    ...table,
    columns: table.columns + 1,
    cells: table.cells.map((row) => {
      const cells = [...row];
      cells.splice(beforeColumn, 0, "");
      return cells;
    }),
  };
}

/** Remove one row, retaining at least one row and preserving remaining cell values. */
export function deleteTableRow(table: TableElement, rowIndex: number): TableElement {
  if (!Number.isInteger(rowIndex) || !Number.isInteger(table.rows) ||
      !Number.isInteger(table.columns) || rowIndex < 0 || rowIndex >= table.rows ||
      table.rows <= 1 || table.rows > 20 || table.columns < 1 || table.columns > 20 ||
      table.cells.length !== table.rows ||
      table.cells.some((row) => !Array.isArray(row) || row.length !== table.columns)) {
    throw new Error("Invalid table row deletion.");
  }
  return {
    ...table,
    rows: table.rows - 1,
    headerRows: rowIndex < table.headerRows ? table.headerRows - 1 : table.headerRows,
    cells: table.cells.filter((_, index) => index !== rowIndex).map((row) => [...row]),
  };
}
