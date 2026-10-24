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
