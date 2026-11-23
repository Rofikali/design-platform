import { MAX_ASPECT_RATIO, MAX_PAGE_AREA, MAX_PAGE_DIMENSION } from "./document";
import { decodeForegroundImageDimensions } from "./foreground-image-decode";

/** Browser-local placement draft; it is not a document element until schema-v6 integration. */
export type ForegroundImagePlacement = Readonly<{
  data_url: string;
  x: number;
  y: number;
  width: number;
  height: number;
  intrinsic_width: number;
  intrinsic_height: number;
}>;

/**
 * Decode and size a validated embedded raster without any network fetch or
 * document mutation. The editor can consume this result only after its
 * schema-versioned image element and validation parity have been implemented.
 */
export async function prepareForegroundImagePlacement(
  source: unknown,
  page: Readonly<{ width: number; height: number }>,
): Promise<ForegroundImagePlacement> {
  if (!page || !Number.isFinite(page.width) || !Number.isFinite(page.height) ||
      page.width <= 0 || page.height <= 0 ||
      page.width > MAX_PAGE_DIMENSION || page.height > MAX_PAGE_DIMENSION ||
      page.width * page.height > MAX_PAGE_AREA ||
      Math.max(page.width / page.height, page.height / page.width) > MAX_ASPECT_RATIO) {
    throw new RangeError("Foreground image placement requires a valid bounded page.");
  }
  if (typeof source !== "string") {
    throw new TypeError("Foreground image source must be an embedded raster data URL.");
  }
  const decoded = await decodeForegroundImageDimensions(source);
  const scale = Math.min(1, page.width * 0.8 / decoded.width, page.height * 0.8 / decoded.height);
  const width = decoded.width * scale;
  const height = decoded.height * scale;
  // Keep aspect ratio unchanged. Impossibly thin inputs cannot form a legal
  // >=1 logical-unit element and must not be silently stretched to fit.
  if (width < 1 || height < 1) {
    throw new RangeError("Foreground image aspect ratio cannot fit the page.");
  }
  return Object.freeze({
    data_url: source,
    x: (page.width - width) / 2,
    y: (page.height - height) / 2,
    width,
    height,
    intrinsic_width: decoded.width,
    intrinsic_height: decoded.height,
  });
}
