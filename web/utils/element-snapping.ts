import type { Positioned } from "./element-alignment";

/** Snap a dragged element to page edges or page center when within a logical-pixel tolerance. */
export function snapToPage<T extends Positioned>(
  element: T,
  page: { readonly width: number; readonly height: number },
  tolerance = 6,
): T {
  if (![element.x, element.y, element.width, element.height, page.width, page.height, tolerance].every(Number.isFinite) ||
      element.width <= 0 || element.height <= 0 || page.width <= 0 || page.height <= 0 ||
      element.width > page.width || element.height > page.height || tolerance < 0) {
    throw new RangeError("Invalid snapping geometry");
  }
  const nearest = (position: number, candidates: readonly number[]) => {
    let snapped = position;
    let distance = tolerance;
    for (const candidate of candidates) {
      const delta = Math.abs(position - candidate);
      if (delta <= distance && (delta < distance || snapped === position)) {
        snapped = candidate;
        distance = delta;
      }
    }
    return snapped;
  };
  const x = nearest(element.x, [0, (page.width - element.width) / 2, page.width - element.width]);
  const y = nearest(element.y, [0, (page.height - element.height) / 2, page.height - element.height]);
  return x === element.x && y === element.y ? element : { ...element, x, y };
}
