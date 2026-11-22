<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import EditorCanvas from "~/components/editor/EditorCanvas.vue";
import { clampElementPosition, clampElementSize, nextElementId } from "~/utils/editor-helpers";
import { loadLocalDocument, saveLocalDocument } from "~/utils/local-document-storage";
import { createHistory, recordHistory, redoHistory, undoHistory } from "~/utils/document-history";
import { moveElementLayer } from "~/utils/element-layers";
import { alignToPage, type Alignment } from "~/utils/element-alignment";
import { deleteTableColumn, deleteTableRow, insertTableColumn, insertTableRow, replaceTableCell, tableCellPosition } from "~/utils/table-cells";

import {
  MAX_ELEMENTS,
  MAX_FILE_CHARS,
  MAX_TABLE_CELL_CHARS,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  parseDocumentJson,
  toDocument,
  type BackgroundImage,
  type DesignElement,
} from "~/utils/document";
import { prepareBackgroundImage, validateEmbeddedBackgroundImage } from "~/utils/background-image";
import { validateDocumentJson } from "~/utils/document-validation";
import { createTemplateDocument, listTemplates, type TemplateId } from "~/utils/templates";
import { renderDesignPng } from "~/utils/design-export";

const STORAGE_KEY = "design-platform:document:v1"; // Keep the key so existing v1 autosaves migrate in place.
const pageWidth = ref(PAGE_WIDTH);
const pageHeight = ref(PAGE_HEIGHT);
const pageBackground = ref("#ffffff");
const backgroundImage = ref<BackgroundImage | undefined>();
const outputSizeMm = ref<{ width: number; height: number } | undefined>();
const templateMetadata = ref<{ id: string; version: number } | undefined>();
const templates = listTemplates();
const selectedTemplateId = ref<TemplateId>("exam-paper-a4");
const selectedTemplate = computed(() => templates.find((template) => template.id === selectedTemplateId.value) ?? templates[0]!);
const nextId = ref(3);
const selectedId = ref<string | null>("heading-1");
const statusMessage = ref("Changes are saved in this browser only.");
// Keep the exact unreadable autosave in memory until the user explicitly replaces it.
const invalidSavedDocument = ref<string | null>(null);
const recoveryPending = computed(() => invalidSavedDocument.value !== null);
const elements = ref<DesignElement[]>([
  { id: "heading-1", type: "text", text: "Your design starts here", x: 48, y: 56, width: 500, height: 70, fontSize: 32, color: "#172033" },
  { id: "rect-2", type: "rect", x: 48, y: 160, width: 250, height: 110, color: "#dbeafe" },
]);
const fileInput = ref<HTMLInputElement | null>(null);
const backgroundImageInput = ref<HTMLInputElement | null>(null);
const dragState = ref<{ id: string; pointerId: number; startClientX: number; startClientY: number; originX: number; originY: number } | null>(null);
const resizeState = ref<{ id: string; pointerId: number; startClientX: number; startClientY: number; originWidth: number; originHeight: number } | null>(null);
let historyReady = false;
let historyTimer: ReturnType<typeof setTimeout> | undefined;
let autosaveTimer: ReturnType<typeof setTimeout> | undefined;

const selectedElement = computed(() => elements.value.find((element) => element.id === selectedId.value) ?? null);
const selectedTable = computed(() => {
  const element = selectedElement.value;
  return element?.type === "table" ? element : null;
});
const selectedCellIndex = ref(0);
function selectTableCell(index: number) {
  const table = selectedTable.value;
  if (!table || !Number.isInteger(index) || index < 0 || index >= table.rows * table.columns) return;
  selectedCellIndex.value = index;
}
/** Insert immediately before the selected cell's row; retain the selected column. */
function insertRowBeforeSelection() {
  const table = selectedTable.value;
  if (!table || table.rows >= 20) return;
  try {
    const { row, column } = tableCellPosition(table, selectedCellIndex.value);
    const updated = insertTableRow(table, row);
    elements.value = elements.value.map((element) => element.id === table.id ? updated : element);
    selectedCellIndex.value = row * updated.columns + column;
    statusMessage.value = row === 0 && table.headerRows === 1
      ? "Inserted a new header row; the former header is now a body row."
      : `Inserted row ${row + 1} of ${updated.rows}.`;
  } catch (error) {
    statusMessage.value = error instanceof Error ? error.message : "Could not insert table row.";
  }
}
/** Insert before the selected column and keep the same row selected. */
function insertColumnBeforeSelection() {
  const table = selectedTable.value;
  if (!table || table.columns >= 20) return;
  try {
    const { row, column } = tableCellPosition(table, selectedCellIndex.value);
    const updated = insertTableColumn(table, column);
    elements.value = elements.value.map((element) => element.id === table.id ? updated : element);
    selectedCellIndex.value = row * updated.columns + column;
    statusMessage.value = `Inserted column ${column + 1} of ${updated.columns}.`;
  } catch (error) {
    statusMessage.value = error instanceof Error ? error.message : "Could not insert table column.";
  }
}
/** Delete the selected row without leaving selection outside the surviving table. */
function deleteSelectedTableRow() {
  const table = selectedTable.value;
  if (!table || table.rows <= 1) return;
  try {
    const { row, column } = tableCellPosition(table, selectedCellIndex.value);
    const updated = deleteTableRow(table, row);
    elements.value = elements.value.map((element) => element.id === table.id ? updated : element);
    selectedCellIndex.value = Math.min(row, updated.rows - 1) * updated.columns + column;
    statusMessage.value = `Deleted row ${row + 1}; ${updated.rows} rows remain.`;
  } catch (error) {
    statusMessage.value = error instanceof Error ? error.message : "Could not delete table row.";
  }
}
/** Delete the selected column while retaining the row and clamping the selected column. */
function deleteSelectedTableColumn() {
  const table = selectedTable.value;
  if (!table || table.columns <= 1) return;
  try {
    const { row, column } = tableCellPosition(table, selectedCellIndex.value);
    const updated = deleteTableColumn(table, column);
    elements.value = elements.value.map((element) => element.id === table.id ? updated : element);
    selectedCellIndex.value = row * updated.columns + Math.min(column, updated.columns - 1);
    statusMessage.value = `Deleted column ${column + 1}; ${updated.columns} columns remain.`;
  } catch (error) {
    statusMessage.value = error instanceof Error ? error.message : "Could not delete table column.";
  }
}
const selectedCellText = computed({
  get(): string {
    const table = selectedTable.value;
    if (!table) return "";
    const { row, column } = tableCellPosition(table, selectedCellIndex.value);
    return table.cells[row]?.[column] ?? "";
  },
  set(value: string) {
    const table = selectedTable.value;
    if (!table) return;
    try {
      const { row, column } = tableCellPosition(table, selectedCellIndex.value);
      const updated = replaceTableCell(table, row, column, value);
      elements.value = elements.value.map((element) => element.id === table.id ? updated : element);
    } catch (error) {
      statusMessage.value = error instanceof Error ? error.message : "Invalid table cell edit.";
    }
  },
});
const selectionAnnouncement = ref("");
function announceSelection(id: string | null) {
  const element = elements.value.find((candidate) => candidate.id === id);
  if (!element) {
    selectionAnnouncement.value = "No element selected.";
    return;
  }
  selectionAnnouncement.value = element.type === "text"
    ? `Selected text element: ${element.text.slice(0, 80)}${element.text.length > 80 ? "…" : ""}`
     : element.type === "rect" ? "Selected rectangle element." : element.type === "frame" ? "Selected frame element." : element.type === "grid" ? `Selected grid element with ${element.rows} rows and ${element.columns} columns` : (() => {
      const { row, column } = tableCellPosition(element, selectedCellIndex.value);
      return `Selected table with ${element.rows} rows and ${element.columns} columns. Cell row ${row + 1}, column ${column + 1}.`;
    })();
}
watch(selectedId, () => { selectedCellIndex.value = 0; }, { flush: "sync" });
watch([selectedId, selectedCellIndex, selectedTable], () => announceSelection(selectedId.value), { immediate: true });

function snapshot(): string { return JSON.stringify(toDocument(elements.value, { width: pageWidth.value, height: pageHeight.value, background: pageBackground.value, ...(backgroundImage.value ? { background_image: backgroundImage.value } : {}) }, outputSizeMm.value, templateMetadata.value)); }
const history = ref(createHistory(snapshot()));
const undoStack = computed(() => history.value.undoStack);
const redoStack = computed(() => history.value.redoStack);
function applySnapshot(json: string) {
  const parsed = parseDocumentJson(json);
  elements.value = parsed.elements;
  pageWidth.value = parsed.width;
  pageHeight.value = parsed.height;
  pageBackground.value = parsed.background;
  backgroundImage.value = parsed.backgroundImage;
  outputSizeMm.value = parsed.outputSizeMm;
  templateMetadata.value = parsed.template;
  selectedCellIndex.value = 0;
  selectedId.value = parsed.elements[0]?.id ?? null;
  nextId.value = parsed.elements.length + 1;
  // A loaded document can reuse the same selected ID with different content.
  announceSelection(selectedId.value);
}
function createFromTemplate() {
  try {
    if (historyTimer) clearTimeout(historyTimer);
    historyTimer = undefined;
    const document = createTemplateDocument(selectedTemplateId.value);
    applySnapshot(JSON.stringify(document));
    history.value = createHistory(snapshot());
    statusMessage.value = `Loaded “${selectedTemplate.value.name}”. Edit it below; changes save in this browser.`;
  } catch (error) {
    statusMessage.value = `Could not load template: ${error instanceof Error ? error.message : "unknown error"}`;
  }
}
function addText() {
  if (elements.value.length >= MAX_ELEMENTS) { statusMessage.value = "Element limit reached (1,000)."; return; }
  const generated = nextElementId("text", elements.value, nextId.value);
  const id = generated.id;
  nextId.value = generated.nextNumber;
  elements.value.push({ id, type: "text", text: "New text", x: 80, y: 100 + elements.value.length * 18, width: 240, height: 48, fontSize: 24, color: "#172033" });
  selectedId.value = id;
}
function addRectangle() {
  if (elements.value.length >= MAX_ELEMENTS) { statusMessage.value = "Element limit reached (1,000)."; return; }
  const generated = nextElementId("rect", elements.value, nextId.value);
  const id = generated.id;
  nextId.value = generated.nextNumber;
  elements.value.push({ id, type: "rect", x: 100 + elements.value.length * 12, y: 220 + elements.value.length * 12, width: 180, height: 90, color: "#dbeafe" });
  selectedId.value = id;
}
function addFrame() {
  if (elements.value.length >= MAX_ELEMENTS) { statusMessage.value = "Element limit reached (1,000)."; return; }
  const generated = nextElementId("frame", elements.value, nextId.value);
  nextId.value = generated.nextNumber;
  const id = generated.id;
  elements.value.push({ id, type: "frame", x: 90, y: 120, width: 260, height: 160, strokeColor: "#2563eb", strokeWidth: 2, fillColor: "#ffffff" });
  selectedId.value = id;
}
function addGrid() {
  if (elements.value.length >= MAX_ELEMENTS) { statusMessage.value = "Element limit reached (1,000)."; return; }
  const generated = nextElementId("grid", elements.value, nextId.value);
  nextId.value = generated.nextNumber;
  const id = generated.id;
  elements.value.push({ id, type: "grid", x: 90, y: 120, width: 300, height: 180, rows: 3, columns: 3, strokeColor: "#64748b", strokeWidth: 1 });
  selectedId.value = id;
}
function addTable() {
  if (elements.value.length >= MAX_ELEMENTS) { statusMessage.value = "Element limit reached (1,000)."; return; }
  const generated = nextElementId("table", elements.value, nextId.value);
  nextId.value = generated.nextNumber;
  const width = Math.min(360, pageWidth.value);
  const height = Math.min(180, pageHeight.value);
  elements.value.push({
    id: generated.id, type: "table",
    x: Math.min(80, Math.max(0, pageWidth.value - width)),
    y: Math.min(120, Math.max(0, pageHeight.value - height)),
    width, height, rows: 3, columns: 3,
    cells: Array.from({ length: 3 }, () => ["", "", ""]),
    headerRows: 1, strokeColor: "#334155", strokeWidth: 1, cellPadding: 6,
    fontSize: 16, textColor: "#111827", headerFill: "#dbeafe", cellFill: "#ffffff",
  });
  selectedId.value = generated.id;
  selectedCellIndex.value = 0;
}
function setSelectedStrokeWidth(value: string | number) {
  const element = selectedElement.value;
  if (element?.type !== "frame" && element?.type !== "grid") return;
  const parsed = Number(value);
  element.strokeWidth = Number.isFinite(parsed) ? Math.min(100, Math.max(0.1, parsed)) : 1;
}
function setGridRows(value: string | number) {
  const element = selectedElement.value;
  if (element?.type === "grid") element.rows = Math.min(20, Math.max(1, Math.round(Number(value) || 1)));
}
function setGridColumns(value: string | number) {
  const element = selectedElement.value;
  if (element?.type === "grid") element.columns = Math.min(20, Math.max(1, Math.round(Number(value) || 1)));
}
function reorderSelectedLayer(direction: "forward" | "backward" | "front" | "back") {
  if (!selectedId.value) return;
  const reordered = moveElementLayer(elements.value, selectedId.value, direction);
  if (reordered === elements.value) return;
  elements.value = [...reordered];
  statusMessage.value = direction === "front" ? "Moved selection to front." : direction === "back" ? "Moved selection to back." : direction === "forward" ? "Moved selection one layer forward." : "Moved selection one layer backward.";
}
const selectedLayerIndex = computed(() => elements.value.findIndex(element => element.id === selectedId.value));
/** Page alignment remains a single immutable edit, tracked by the existing history/autosave watcher. */
function alignSelected(alignment: Alignment) {
  const element = selectedElement.value;
  if (!element) return;
  try {
    const aligned = alignToPage(element, { width: pageWidth.value, height: pageHeight.value }, alignment);
    if (aligned === element) {
      statusMessage.value = "Selected element is already at that page alignment.";
      return;
    }
    elements.value = elements.value.map(candidate => candidate.id === element.id ? aligned : candidate);
    statusMessage.value = "Selected element aligned to page.";
  } catch (error) {
    statusMessage.value = error instanceof Error ? error.message : "Could not align selected element.";
  }
}
function moveSelected(dx: number, dy: number) {
  const element = selectedElement.value;
  if (!element) return;
  const position = clampElementPosition(element.x + dx, element.y + dy, element.width, element.height, pageWidth.value, pageHeight.value);
  element.x = position.x;
  element.y = position.y;
}
function setSelectedWidth(value: string | number) {
  const element = selectedElement.value;
  if (!element) return;
  const size = clampElementSize(Number(value), element.height, element.x, element.y, pageWidth.value, pageHeight.value);
  element.width = size.width;
}
function setSelectedHeight(value: string | number) {
  const element = selectedElement.value;
  if (!element) return;
  const size = clampElementSize(element.width, Number(value), element.x, element.y, pageWidth.value, pageHeight.value);
  element.height = size.height;
}
function onResizePointerDown(event: PointerEvent, element: DesignElement) {
  if (event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  selectedId.value = element.id;
  dragState.value = null;
  resizeState.value = {
    id: element.id,
    pointerId: event.pointerId,
    startClientX: event.clientX,
    startClientY: event.clientY,
    originWidth: element.width,
    originHeight: element.height,
  };
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
}
function onElementPointerDown(event: PointerEvent, element: DesignElement) {
  if (event.button !== 0) return;
  event.preventDefault();
  selectedId.value = element.id;
  dragState.value = {
    id: element.id,
    pointerId: event.pointerId,
    startClientX: event.clientX,
    startClientY: event.clientY,
    originX: element.x,
    originY: element.y,
  };
  (event.currentTarget as HTMLButtonElement).setPointerCapture(event.pointerId);
}
function onElementPointerMove(event: PointerEvent) {
  const resize = resizeState.value;
  if (resize && resize.pointerId === event.pointerId) {
    const element = elements.value.find((candidate) => candidate.id === resize.id);
    if (!element) { resizeState.value = null; return; }
    const size = clampElementSize(
      resize.originWidth + event.clientX - resize.startClientX,
      resize.originHeight + event.clientY - resize.startClientY,
      element.x,
      element.y,
      pageWidth.value,
      pageHeight.value,
    );
    element.width = size.width;
    element.height = size.height;
    return;
  }
  const drag = dragState.value;
  if (!drag || drag.pointerId !== event.pointerId) return;
  const element = elements.value.find((candidate) => candidate.id === drag.id);
  if (!element) { dragState.value = null; return; }
  const position = clampElementPosition(
    drag.originX + event.clientX - drag.startClientX,
    drag.originY + event.clientY - drag.startClientY,
    element.width,
    element.height,
    pageWidth.value,
    pageHeight.value,
  );
  element.x = position.x;
  element.y = position.y;
}
function onElementPointerEnd(event: PointerEvent) {
  if (event.type === "pointercancel") {
    const drag = dragState.value;
    if (drag?.pointerId === event.pointerId) {
      const element = elements.value.find((candidate) => candidate.id === drag.id);
      if (element) { element.x = drag.originX; element.y = drag.originY; }
    }
    const resize = resizeState.value;
    if (resize?.pointerId === event.pointerId) {
      const element = elements.value.find((candidate) => candidate.id === resize.id);
      if (element) { element.width = resize.originWidth; element.height = resize.originHeight; }
    }
  }
  if (dragState.value?.pointerId === event.pointerId) dragState.value = null;
  if (resizeState.value?.pointerId === event.pointerId) resizeState.value = null;
}
async function exportJson() {
  try {
    const validation = await validateDocumentJson(snapshot());
    const prettyJson = JSON.stringify(JSON.parse(validation.json) as unknown, null, 2);
    const blob = new Blob([prettyJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "design-platform-document.json";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    statusMessage.value = validation.engine === "wasm"
      ? "JSON design file validated with WebAssembly and downloaded."
      : "JSON design file downloaded using TypeScript fallback validation.";
  } catch (error) {
    statusMessage.value = `Export failed: ${error instanceof Error ? error.message : "invalid document"}`;
  }
}
async function exportPng() {
  statusMessage.value = "Preparing PNG export…";
  try {
    const validation = await validateDocumentJson(snapshot());
    const parsed = parseDocumentJson(validation.json);
    statusMessage.value = "Rendering PNG image…";
    const blob = await renderDesignPng(parsed.elements, parsed.width, parsed.height, parsed.background, 2, parsed.backgroundImage);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "design-platform.png";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    statusMessage.value = `PNG exported at ${parsed.width * 2} × ${parsed.height * 2} pixels.`;
  } catch (error) {
    statusMessage.value = `PNG export failed: ${error instanceof Error ? error.message : "could not render design"}`;
  }
}
function printToPdf() {
  const style = document.createElement("style");
  const size = outputSizeMm.value;
  // CSS pixels are 96 DPI, while the page's physical size is configured in mm.
  // Uniformly fit the logical canvas into the requested physical page without
  // distorting elements or allowing oversized logical canvases to clip.
  const printScale = size
    ? Math.min((size.width * 96 / 25.4) / pageWidth.value, (size.height * 96 / 25.4) / pageHeight.value)
    : 1;
  style.dataset.designPrint = "true";
  style.textContent = `
    @page { size: ${size ? `${size.width}mm ${size.height}mm` : "auto"}; margin: 0; }
    @media print {
      body { margin: 0 !important; background: white !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .app-shell.printing-design .topbar, .app-shell.printing-design .tools-panel { display: none !important; }
      .app-shell.printing-design .workspace { display: block !important; margin: 0 !important; padding: 0 !important; }
      .app-shell.printing-design .canvas-area { border: 0 !important; padding: 0 !important; overflow: visible !important; }
      .app-shell.printing-design .canvas-heading, .app-shell.printing-design .canvas-note { display: none !important; }
      .app-shell.printing-design .canvas-scroller { overflow: visible !important; padding: 0 !important; background: white !important; }
      .app-shell.printing-design .design-page { zoom: ${printScale} !important; margin: 0 !important; box-shadow: none !important; break-inside: avoid; }
      .app-shell.printing-design .design-element:not(.frame):not(.grid) { border-color: transparent !important; outline: none !important; cursor: default !important; }
      .app-shell.printing-design .design-element.frame, .app-shell.printing-design .design-element.grid { outline: none !important; cursor: default !important; }
      .app-shell.printing-design .resize-handle { display: none !important; }
    }`;
  document.head.appendChild(style);
  document.querySelector(".app-shell")?.classList.add("printing-design");
  statusMessage.value = "Print dialog opened. Choose “Save as PDF” to create a PDF file.";
  const cleanup = () => {
    document.querySelector(".app-shell")?.classList.remove("printing-design");
    style.remove();
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
  window.setTimeout(cleanup, 60_000);
}
function downloadRecoveryCopy() {
  const saved = invalidSavedDocument.value;
  if (saved === null) return;
  const blob = new Blob([saved], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "design-platform-recovery-copy.txt";
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  statusMessage.value = "Recovery copy downloaded. The original saved data is still preserved in this browser.";
}
function replaceInvalidAutosaveWithCurrentDesign() {
  if (invalidSavedDocument.value === null) return;
  const result = saveLocalDocument(STORAGE_KEY, snapshot(), MAX_FILE_CHARS);
  if (result.status === "saved") {
    invalidSavedDocument.value = null;
    statusMessage.value = "Saved browser data was explicitly replaced with the current design.";
  } else if (result.status === "too-large") {
    statusMessage.value = "Could not replace saved data: current design exceeds the local save limit.";
  } else {
    statusMessage.value = "Could not replace saved data because browser storage is unavailable. The original remains preserved.";
  }
}
function importJson() { fileInput.value?.click(); }
function chooseBackgroundImage() { backgroundImageInput.value?.click(); }
function removeBackgroundImage() {
  backgroundImage.value = undefined;
  statusMessage.value = "Page background image removed.";
}
async function onBackgroundImageSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  try {
    backgroundImage.value = await prepareBackgroundImage(file);
    statusMessage.value = "Background image added. It is included in local saves and JSON exports.";
  } catch (error) {
    statusMessage.value = `Background image rejected: ${error instanceof Error ? error.message : "invalid image"}`;
  }
}
async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  if (file.size > MAX_FILE_CHARS) { statusMessage.value = "Import rejected: file exceeds the 2 MB limit."; return; }
  try {
    const text = await file.text();
    const validation = await validateDocumentJson(text);
    const parsed = parseDocumentJson(validation.json);
    if (parsed.backgroundImage) await validateEmbeddedBackgroundImage(parsed.backgroundImage);
    if (historyTimer) clearTimeout(historyTimer);
    historyTimer = undefined;
    elements.value = parsed.elements;
    pageWidth.value = parsed.width;
    pageHeight.value = parsed.height;
    pageBackground.value = parsed.background;
    backgroundImage.value = parsed.backgroundImage;
    outputSizeMm.value = parsed.outputSizeMm;
    templateMetadata.value = parsed.template;
    selectedId.value = parsed.elements[0]?.id ?? null;
    nextId.value = parsed.elements.length + 1;
    history.value = createHistory(snapshot());
    statusMessage.value = validation.engine === "wasm"
      ? "Document imported and validated with WebAssembly. It is stored only in this browser."
      : "Document imported with TypeScript fallback validation. It is stored only in this browser.";
  } catch (error) {
    statusMessage.value = `Import failed: ${error instanceof Error ? error.message : "invalid document"}`;
  }
}
function undo() {
  if (historyTimer) clearTimeout(historyTimer);
  historyTimer = undefined;
  const transition = undoHistory(history.value, snapshot());
  history.value = transition.history;
  if (transition.snapshot === null) {
    statusMessage.value = "Nothing to undo.";
    return;
  }
  applySnapshot(transition.snapshot);
  statusMessage.value = "Undo applied.";
}
function redo() {
  if (historyTimer) clearTimeout(historyTimer);
  historyTimer = undefined;
  const transition = redoHistory(history.value, snapshot());
  history.value = transition.history;
  if (transition.status === "recorded-new-changes") {
    statusMessage.value = "New changes recorded; redo cleared.";
    return;
  }
  if (transition.snapshot === null) {
    statusMessage.value = "Nothing to redo.";
    return;
  }
  applySnapshot(transition.snapshot);
  statusMessage.value = "Redo applied.";
}
watch([elements, pageWidth, pageHeight, pageBackground, backgroundImage], () => {
  if (!historyReady) return;
  if (historyTimer) clearTimeout(historyTimer);
  historyTimer = setTimeout(() => {
    const current = snapshot();
    history.value = recordHistory(history.value, current);
  }, 300);
  if (autosaveTimer) clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    if (recoveryPending.value) {
      statusMessage.value = "Autosave paused to protect unreadable saved data. Download a recovery copy or explicitly replace it.";
      return;
    }
    const result = saveLocalDocument(STORAGE_KEY, snapshot(), MAX_FILE_CHARS);
    if (result.status === "saved") {
      statusMessage.value = "Auto-saved locally in this browser.";
    } else if (result.status === "too-large") {
      statusMessage.value = "Local autosave skipped: document is too large.";
    } else {
      statusMessage.value = "Local autosave unavailable (browser storage may be full or disabled).";
    }
  }, 300);
}, { deep: true, flush: "sync" });
onMounted(async () => {
  const result = loadLocalDocument(STORAGE_KEY);
  if (result.status === "loaded") {
    try {
      const saved = parseDocumentJson(result.value);
      if (saved.backgroundImage) await validateEmbeddedBackgroundImage(saved.backgroundImage);
      applySnapshot(result.value);
      statusMessage.value = "Restored the last locally saved design.";
    }
    catch {
      invalidSavedDocument.value = result.value;
      statusMessage.value = "Saved browser data could not be read. Autosave is paused so it is not overwritten; download a recovery copy or explicitly replace it.";
    }
  } else if (result.status === "unavailable") {
    statusMessage.value = "Browser storage is unavailable; use JSON download to keep a copy.";
  }
  history.value = createHistory(snapshot());
  historyReady = true;
});
</script>

<template>
  <main class="app-shell">
    <header class="topbar">
      <div>
        <p class="eyebrow">DESIGN PLATFORM · EARLY PROTOTYPE</p>
        <h1>Make a design</h1>
      </div>
      <span class="status">Local-only prototype</span>
    </header>

    <section class="workspace">
      <aside class="panel tools-panel" aria-label="Design tools">
        <h2>Start from a template</h2>
        <div class="template-controls">
          <label class="field" for="template-choice">
            Template
            <select id="template-choice" v-model="selectedTemplateId">
              <option v-for="template in templates" :key="template.id" :value="template.id">{{ template.name }}</option>
            </select>
          </label>
          <p class="hint">{{ selectedTemplate.description }}</p>
          <p class="hint">Page: {{ selectedTemplate.page.width }} × {{ selectedTemplate.page.height }} · Print size: {{ selectedTemplate.outputSizeMm.width }} × {{ selectedTemplate.outputSizeMm.height }} mm</p>
          <button class="primary" type="button" @click="createFromTemplate">Use template</button>
        </div>
        <hr />
        <h2>Page background</h2>
        <button type="button" @click="chooseBackgroundImage">Upload background image</button>
        <input ref="backgroundImageInput" class="visually-hidden" type="file" accept="image/png,image/jpeg,image/webp" aria-label="Upload page background image" @change="onBackgroundImageSelected" />
        <label v-if="backgroundImage" class="field">
          Image fit
          <select v-model="backgroundImage.fit">
            <option value="cover">Cover (fill page)</option>
            <option value="contain">Contain (show whole image)</option>
          </select>
        </label>
        <button v-if="backgroundImage" type="button" @click="removeBackgroundImage">Remove background image</button>
        <p class="hint">PNG, JPEG or WebP · maximum 1 MiB · maximum 16 megapixels.</p>
        <hr />
        <h2>Elements</h2>
        <button class="primary" type="button" @click="addText">＋ Add text</button>
        <button type="button" @click="addRectangle">＋ Add rectangle</button>
        <button type="button" @click="addFrame">＋ Add frame</button>
        <button type="button" @click="addGrid">＋ Add grid</button>
        <button type="button" @click="addTable">＋ Add table</button>
        <button type="button" @click="exportJson">Download JSON</button>
        <button type="button" @click="exportPng">Download PNG</button>
        <button type="button" @click="printToPdf">Print / Save PDF</button>
        <button type="button" @click="importJson">Open JSON</button>
        <input ref="fileInput" class="visually-hidden" type="file" accept="application/json,.json" aria-label="Import design JSON file" @change="onFileSelected" />
        <div class="history-actions"><button type="button" :disabled="undoStack.length === 0" @click="undo">Undo</button><button type="button" :disabled="redoStack.length === 0" @click="redo">Redo</button></div>
        <p class="hint" role="status">{{ statusMessage }}</p>
        <section v-if="recoveryPending" class="recovery-panel" aria-labelledby="recovery-heading">
          <h3 id="recovery-heading">Saved design needs recovery</h3>
          <p class="hint">This saved data could not be opened. Normal autosave is paused to protect it. Download a copy before replacing it if you may need to recover information.</p>
          <button type="button" @click="downloadRecoveryCopy">Download recovery copy</button>
          <button type="button" class="primary" @click="replaceInvalidAutosaveWithCurrentDesign">Replace saved data with current design</button>
        </section>
        <p class="hint">Select an element on the page to edit it.</p>
        <hr />
        <h2>Selection</h2>
        <fieldset class="layer-controls" aria-label="Element layers">
          <legend>Layer order (back to front)</legend>
          <label class="field" for="layer-selection">Select layer
            <select id="layer-selection" :value="selectedId ?? ''" @change="selectedId = ($event.target as HTMLSelectElement).value || null">
              <option value="">No selection</option>
              <option v-for="(element, index) in elements" :key="element.id" :value="element.id">{{ index + 1 }} of {{ elements.length }} ({{ index === 0 ? "backmost" : index === elements.length - 1 ? "frontmost" : "middle" }}) · {{ element.type }} · {{ element.id }}</option>
            </select>
          </label>
          <div class="history-actions">
            <button type="button" :disabled="selectedLayerIndex <= 0" @click="reorderSelectedLayer('backward')">Send backward</button>
            <button type="button" :disabled="selectedLayerIndex < 0 || selectedLayerIndex >= elements.length - 1" @click="reorderSelectedLayer('forward')">Bring forward</button>
            <button type="button" :disabled="selectedLayerIndex <= 0" @click="reorderSelectedLayer('back')">Send to back</button>
            <button type="button" :disabled="selectedLayerIndex < 0 || selectedLayerIndex >= elements.length - 1" @click="reorderSelectedLayer('front')">Bring to front</button>
          </div>
          <p class="hint">Later items render in front. Changes are included in undo and local autosave.</p>
        </fieldset>
        <template v-if="selectedElement">
          <p class="selected-name" role="status" aria-live="polite" aria-atomic="true">{{ selectionAnnouncement }}</p>
          <fieldset class="layer-controls" aria-label="Align selected element to page">
            <legend>Align to page</legend>
            <div class="history-actions">
              <button type="button" @click="alignSelected('left')">Align left</button>
              <button type="button" @click="alignSelected('center-horizontal')">Center horizontally</button>
              <button type="button" @click="alignSelected('right')">Align right</button>
              <button type="button" @click="alignSelected('top')">Align top</button>
              <button type="button" @click="alignSelected('center-vertical')">Center vertically</button>
              <button type="button" @click="alignSelected('bottom')">Align bottom</button>
            </div>
            <p class="hint">Moves only the selected element. Undo restores its prior position.</p>
          </fieldset>
          <label v-if="selectedElement.type === 'text'" class="field">
            Text
            <textarea v-model="selectedElement.text" rows="4" maxlength="10000" />
          </label>
          <label v-if="selectedElement.type === 'text' || selectedElement.type === 'rect'" class="field">
            Color
            <input v-model="selectedElement.color" type="color" />
          </label>
          <fieldset v-if="selectedElement.type === 'table'" class="table-cell-editor">
            <legend>Table cell editing</legend>
            <label class="field">
              Select table cell
              <select :value="selectedCellIndex" aria-label="Select table cell" @change="selectTableCell(Number(($event.target as HTMLSelectElement).value))">
                <option v-for="index in selectedElement.rows * selectedElement.columns" :key="index" :value="index - 1">
                  Row {{ Math.floor((index - 1) / selectedElement.columns) + 1 }}, column {{ (index - 1) % selectedElement.columns + 1 }}
                </option>
              </select>
            </label>
            <div class="table-cell-actions">
              <button type="button" :disabled="selectedCellIndex === 0" @click="selectTableCell(selectedCellIndex - 1)">Previous cell</button>
              <button type="button" :disabled="selectedCellIndex >= selectedElement.rows * selectedElement.columns - 1" @click="selectTableCell(selectedCellIndex + 1)">Next cell</button>
            </div>
            <div class="table-cell-actions">
              <button type="button" :disabled="selectedElement.rows >= 20" @click="insertRowBeforeSelection">Insert row before selected cell</button>
              <button type="button" :disabled="selectedElement.rows <= 1" @click="deleteSelectedTableRow">Delete selected table row</button>
              <button type="button" :disabled="selectedElement.columns >= 20" @click="insertColumnBeforeSelection">Insert column before selected cell</button>
              <button type="button" :disabled="selectedElement.columns <= 1" @click="deleteSelectedTableColumn">Delete selected table column</button>
            </div>
            <label class="field">
              Cell text — row {{ Math.floor(selectedCellIndex / selectedElement.columns) + 1 }}, column {{ selectedCellIndex % selectedElement.columns + 1 }}
              <textarea :key="selectedElement.id + ':' + selectedCellIndex" v-model="selectedCellText" rows="3" :maxlength="MAX_TABLE_CELL_CHARS" />
            </label>
            <p class="hint">Plain text only, up to 2,000 characters per cell and 20,000 per table. Use the cell selector or Previous/Next buttons; Tab and Shift+Tab move between controls.</p>
          </fieldset>
          <template v-if="selectedElement.type === 'frame' || selectedElement.type === 'grid'">
            <label class="field">
              Stroke color
              <input v-model="selectedElement.strokeColor" type="color" />
            </label>
            <label class="field">
              Stroke width
              <input :value="selectedElement.strokeWidth" type="number" min="0.1" max="100" step="0.1" @change="setSelectedStrokeWidth(($event.target as HTMLInputElement).value)" />
            </label>
          </template>
          <label v-if="selectedElement.type === 'frame'" class="field">
            Fill color
            <input v-model="selectedElement.fillColor" type="color" />
          </label>
          <template v-if="selectedElement.type === 'grid'">
            <label class="field">
              Rows (1–20)
              <input :value="selectedElement.rows" type="number" min="1" max="20" step="1" @change="setGridRows(($event.target as HTMLInputElement).value)" />
            </label>
            <label class="field">
              Columns (1–20)
              <input :value="selectedElement.columns" type="number" min="1" max="20" step="1" @change="setGridColumns(($event.target as HTMLInputElement).value)" />
            </label>
          </template>
          <label v-if="selectedElement.type === 'text'" class="field">
            Font size
            <input v-model.number="selectedElement.fontSize" type="number" min="1" max="512" />
          </label>
          <label class="field">
            Width
            <input
              :value="selectedElement.width"
              type="number"
              min="8"
              :max="pageWidth - selectedElement.x"
              aria-label="Selected element width"
              @change="setSelectedWidth(($event.target as HTMLInputElement).value)"
            />
          </label>
          <label class="field">
            Height
            <input
              :value="selectedElement.height"
              type="number"
              min="8"
              :max="pageHeight - selectedElement.y"
              aria-label="Selected element height"
              @change="setSelectedHeight(($event.target as HTMLInputElement).value)"
            />
          </label>
          <p id="move-controls-label" class="field-label">Move selected element</p>
          <div class="move-grid" role="group" aria-labelledby="move-controls-label">
            <span></span><button type="button" aria-label="Move up" @click="moveSelected(0, -10)">↑</button><span></span>
            <button type="button" aria-label="Move left" @click="moveSelected(-10, 0)">←</button>
            <button type="button" aria-label="Move down" @click="moveSelected(0, 10)">↓</button>
            <button type="button" aria-label="Move right" @click="moveSelected(10, 0)">→</button>
          </div>
        </template>
        <p v-else class="hint">Nothing selected.</p>
      </aside>

      <EditorCanvas
        :elements="elements"
        :selected-id="selectedId"
        :page-width="pageWidth"
        :page-height="pageHeight"
        :page-background="pageBackground"
        :background-image="backgroundImage"
        @select="selectedId = $event"
        @element-pointer-down="onElementPointerDown"
        @element-pointer-move="onElementPointerMove"
        @element-pointer-end="onElementPointerEnd"
        @resize-pointer-down="onResizePointerDown"
      />
    </section>
  </main>
</template>

<style>
:root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #172033; background: #f3f5f9; }
* { box-sizing: border-box; }
body { margin: 0; }
button, input, textarea { font: inherit; }
button { cursor: pointer; }
.app-shell { min-height: 100vh; }
.topbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 22px 28px; background: white; border-bottom: 1px solid #e2e7ef; }
.eyebrow { margin: 0 0 6px; color: #596780; font-size: 11px; font-weight: 750; letter-spacing: .12em; }
h1 { margin: 0; font-size: 24px; }
.status { padding: 7px 10px; border-radius: 999px; background: #fff4d6; color: #805b00; font-size: 12px; font-weight: 650; }
.workspace { display: grid; grid-template-columns: 260px minmax(0, 1fr); gap: 20px; padding: 20px; }
.panel { min-width: 0; border: 1px solid #e1e6ef; border-radius: 14px; background: white; }
.tools-panel { padding: 18px; align-self: start; }
button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible { outline: 3px solid #0b57d0; outline-offset: 2px; }
.tools-panel > button { display: block; width: 100%; margin: 8px 0; padding: 10px 12px; border: 1px solid #d7deea; border-radius: 8px; background: white; text-align: left; color: #172033; }
.tools-panel > button.primary { border-color: #234bd6; background: #234bd6; color: white; }
.visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
.template-controls select { width: 100%; padding: 9px; border: 1px solid #d7deea; border-radius: 7px; background: white; color: #172033; }
.template-controls button { display: block; width: 100%; margin: 8px 0; padding: 10px 12px; border: 1px solid #234bd6; border-radius: 8px; background: #234bd6; color: white; text-align: left; }
.recovery-panel { margin: 14px 0; padding: 12px; border: 1px solid #c58a19; border-radius: 8px; background: #fffaf0; }
.recovery-panel h3 { margin: 0; font-size: 14px; }
.recovery-panel button { display: block; width: 100%; margin-top: 8px; padding: 9px; border: 1px solid #d7deea; border-radius: 7px; background: white; text-align: left; color: #172033; }
.recovery-panel button.primary { border-color: #234bd6; background: #234bd6; color: white; }
.history-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 8px; }
.history-actions button { padding: 8px; border: 1px solid #d7deea; border-radius: 7px; background: white; }
.history-actions button:disabled { cursor: not-allowed; opacity: .45; }
.hint { color: #596780; font-size: 12px; line-height: 1.5; }
hr { margin: 20px 0; border: 0; border-top: 1px solid #e6eaf1; }
.selected-name { color: #52617a; font-size: 12px; }
.field { display: grid; gap: 6px; margin: 14px 0; color: #52617a; font-size: 12px; font-weight: 650; }
.field textarea, .field select, .field input:not([type="color"]) { width: 100%; padding: 9px; border: 1px solid #d7deea; border-radius: 7px; color: #172033; }
.field textarea { resize: vertical; }
.table-cell-editor { margin: 14px 0; padding: 10px; border: 1px solid #d7deea; border-radius: 8px; }
.table-cell-editor legend { padding: 0 5px; font-size: 12px; font-weight: 650; }
.table-cell-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.table-cell-actions button { padding: 8px 5px; border: 1px solid #d7deea; border-radius: 7px; background: white; }
.table-cell-actions button:disabled { opacity: .45; cursor: not-allowed; }
.field input[type="color"] { width: 100%; height: 38px; border: 1px solid #d7deea; border-radius: 7px; background: white; }
.field-label { margin: 16px 0 8px; color: #52617a; font-size: 12px; font-weight: 650; }
.move-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; }
.move-grid button { min-height: 34px; border: 1px solid #d7deea; border-radius: 7px; background: white; }
@media (max-width: 760px) { .topbar { padding: 18px; flex-wrap: wrap; } .status { max-width: 100%; overflow-wrap: anywhere; } .workspace { grid-template-columns: 1fr; padding: 12px; gap: 12px; } .tools-panel { order: 2; } .canvas-area { order: 1; padding: 12px; } }
@media print {
  body { margin: 0; }
  .app-shell.printing-design { min-height: 0; }
}
</style>
