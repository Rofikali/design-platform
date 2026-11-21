import type { DesignElement } from "./document";

/**
 * Move one element by exactly one stacking position. Array order is the
 * canonical paint order (last is frontmost) for JSON, SVG and export.
 * No-op requests return the original array so history need not record them.
 */
export function moveElementLayer(
  elements: readonly DesignElement[],
  selectedId: string,
  direction: "forward" | "backward" | "front" | "back",
): readonly DesignElement[] {
  const index = elements.findIndex((element) => element.id === selectedId);
  if (index === -1) return elements;
  const destination = direction === "front" ? elements.length - 1 : direction === "back" ? 0 : index + (direction === "forward" ? 1 : -1);
  if (destination < 0 || destination >= elements.length) return elements;

  if (destination === index) return elements;
  const reordered = [...elements];
  const [selected] = reordered.splice(index, 1);
  reordered.splice(destination, 0, selected!);
  return reordered;
}
