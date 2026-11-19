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
      typeof value !== "string" || !Number.isInteger(table.rows) || table.rows < 1 || table.rows > 20 ||
      !Number.isInteger(table.columns) || table.columns < 1 || table.columns > 20 ||
      !Number.isInteger(table.headerRows) || (table.headerRows !== 0 && table.headerRows !== 1) ||
      !validTableCellMatrix(table)) throw new Error("Invalid table cell edit.");
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

/** Structural edits must not preserve malformed imported text beyond schema-v5 limits. */
function validTableCellMatrix(table: TableElement): boolean {
  if (!Array.isArray(table.cells) || table.cells.length !== table.rows) return false;
  let totalCodePoints = 0;
  for (const row of table.cells) {
    if (!Array.isArray(row) || row.length !== table.columns) return false;
    for (const cell of row) {
      if (typeof cell !== "string") return false;
      const codePoints = [...cell].length;
      if (codePoints > MAX_TABLE_CELL_CHARS) return false;
      totalCodePoints += codePoints;
      if (totalCodePoints > MAX_TABLE_TEXT_CHARS) return false;
    }
  }
  return true;
}

/** Insert before a row; schema v5 permits at most one header row. If inserting
 * at row zero, the new row becomes the header and the old header moves to body. */
export function insertTableRow(table: TableElement, beforeRow: number): TableElement {
  if (!Number.isInteger(beforeRow) || beforeRow < 0 || beforeRow > table.rows ||
      !Number.isInteger(table.rows) || table.rows < 1 || table.rows >= 20 ||
      !Number.isInteger(table.columns) || table.columns < 1 || table.columns > 20 ||
      !Number.isInteger(table.headerRows) || (table.headerRows !== 0 && table.headerRows !== 1) ||
      !validTableCellMatrix(table)) {
    throw new Error("Invalid table row insertion.");
  }
  const cells = table.cells.map((row) => [...row]);
  cells.splice(beforeRow, 0, Array.from({ length: table.columns }, () => ""));
  return {
    ...table,
    rows: table.rows + 1,
    headerRows: table.headerRows,
    cells,
  };
}

/** Insert an empty column before a boundary without changing existing cell text. */
export function insertTableColumn(table: TableElement, beforeColumn: number): TableElement {
  if (!Number.isInteger(beforeColumn) || beforeColumn < 0 || beforeColumn > table.columns ||
      !Number.isInteger(table.rows) || table.rows < 1 || table.rows > 20 ||
      !Number.isInteger(table.columns) || table.columns < 1 || table.columns >= 20 ||
      !Number.isInteger(table.headerRows) || (table.headerRows !== 0 && table.headerRows !== 1) ||
      !validTableCellMatrix(table)) {
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
      !Number.isInteger(table.headerRows) || (table.headerRows !== 0 && table.headerRows !== 1) ||
      !validTableCellMatrix(table)) {
    throw new Error("Invalid table row deletion.");
  }
  return {
    ...table,
    rows: table.rows - 1,
    headerRows: rowIndex < table.headerRows ? table.headerRows - 1 : table.headerRows,
    cells: table.cells.filter((_, index) => index !== rowIndex).map((row) => [...row]),
  };
}

/** Remove one column, preserving the remaining row-major cells and header rows. */
export function deleteTableColumn(table: TableElement, columnIndex: number): TableElement {
  if (!Number.isInteger(columnIndex) || !Number.isInteger(table.rows) ||
      !Number.isInteger(table.columns) || columnIndex < 0 || columnIndex >= table.columns ||
      table.rows < 1 || table.rows > 20 || table.columns <= 1 || table.columns > 20 ||
      !Number.isInteger(table.headerRows) || (table.headerRows !== 0 && table.headerRows !== 1) ||
      !validTableCellMatrix(table)) {
    throw new Error("Invalid table column deletion.");
  }
  return {
    ...table,
    columns: table.columns - 1,
    cells: table.cells.map((row) => row.filter((_, index) => index !== columnIndex)),
  };
}
