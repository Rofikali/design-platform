/** Pure page-relative alignment. Does not mutate saved element geometry or IDs. */
export type Alignment = "left" | "center-horizontal" | "right" | "top" | "center-vertical" | "bottom";
export type Positioned = { readonly x: number; readonly y: number; readonly width: number; readonly height: number };

export function alignToPage<T extends Positioned>(
  element: T,
  page: { readonly width: number; readonly height: number },
  alignment: Alignment,
): T {
  if (![element.x, element.y, element.width, element.height, page.width, page.height].every(Number.isFinite) ||
      element.width <= 0 || element.height <= 0 || page.width <= 0 || page.height <= 0 ||
      element.width > page.width || element.height > page.height) {
    throw new RangeError("Invalid alignment geometry");
  }
  let x = element.x;
  let y = element.y;
  switch (alignment) {
    case "left": x = 0; break;
    case "center-horizontal": x = (page.width - element.width) / 2; break;
    case "right": x = page.width - element.width; break;
    case "top": y = 0; break;
    case "center-vertical": y = (page.height - element.height) / 2; break;
    case "bottom": y = page.height - element.height; break;
    default: throw new RangeError("Unknown alignment");
  }
  return x === element.x && y === element.y ? element : { ...element, x, y };
}
