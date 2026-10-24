export type ElementId = { id: string };

/**
 * Find an unused ID for a new editor element.
 *
 * Imported documents can contain IDs that do not match the editor's sequence,
 * so element count alone is not a safe way to choose the next ID.
 */
export function nextElementId(
  prefix: "text" | "rect",
  elements: readonly ElementId[],
  nextNumber: number,
): { id: string; nextNumber: number } {
  const existingIds = new Set(elements.map((element) => element.id));
  let candidate = Math.max(1, Math.floor(nextNumber));

  while (existingIds.has(`${prefix}-${candidate}`)) {
    candidate += 1;
  }

  return { id: `${prefix}-${candidate}`, nextNumber: candidate + 1 };
}


export type ElementPosition = { x: number; y: number };

/**
 * Keep an element fully inside the logical page bounds.
 * Inputs are normalized so accidental non-finite pointer values cannot poison document state.
 */
export function clampElementPosition(
  x: number,
  y: number,
  width: number,
  height: number,
  pageWidth: number,
  pageHeight: number,
): ElementPosition {
  const safeWidth = Number.isFinite(width) ? Math.max(0, Math.min(width, pageWidth)) : 0;
  const safeHeight = Number.isFinite(height) ? Math.max(0, Math.min(height, pageHeight)) : 0;
  const safeX = Number.isFinite(x) ? x : 0;
  const safeY = Number.isFinite(y) ? y : 0;

  return {
    x: Math.max(0, Math.min(pageWidth - safeWidth, safeX)),
    y: Math.max(0, Math.min(pageHeight - safeHeight, safeY)),
  };
}
