import type { DesignElement } from "./document";

/**
 * Move one element by exactly one stacking position. Array order is the
 * canonical paint order (last is frontmost) for JSON, SVG and export.
 * No-op requests return the original array so history need not record them.
 */
export function moveElementLayer(
  elements: readonly DesignElement[],
  selectedId: string,
  direction: "forward" | "backward",
): readonly DesignElement[] {
  const index = elements.findIndex((element) => element.id === selectedId);
  if (index === -1) return elements;
  const destination = index + (direction === "forward" ? 1 : -1);
  if (destination < 0 || destination >= elements.length) return elements;

  const reordered = [...elements];
  [reordered[index], reordered[destination]] = [reordered[destination]!, reordered[index]!];
  return reordered;
}
