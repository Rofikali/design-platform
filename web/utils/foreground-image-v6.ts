import { validateForegroundImageDataUrl } from "./foreground-image";
import type { ForegroundImagePlacement } from "./foreground-image-placement";

/**
 * Proposed schema-v6 image kind. This is a staging contract, NOT wired into
 * document serialization or Rust/WASM until parity and migration are ready.
 */
export type ForegroundImageKindV6 = Readonly<{
  type: "image";
  data_url: string;
  intrinsic_width: number;
  intrinsic_height: number;
}>;

export type ForegroundImageElementV6 = Readonly<{
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind: ForegroundImageKindV6;
}>;

/** Pure boundary for converting a decoded browser placement into a v6 element. */
export function makeForegroundImageElementV6(
  id: unknown,
  placement: ForegroundImagePlacement,
): ForegroundImageElementV6 {
  if (typeof id !== "string" || id.length === 0 ||
      new TextEncoder().encode(id).byteLength > 128) {
    throw new TypeError("Foreground image element ID must contain 1–128 UTF-8 bytes.");
  }
  if (/[\u0000-\u001f\u007f]/u.test(id as string)) {\n    throw new TypeError("Foreground image element ID must not contain control characters.");\n  }\n  if (!placement || typeof placement !== "object") {
    throw new TypeError("Foreground image placement is required.");
  }
  const { x, y, width, height, intrinsic_width, intrinsic_height } = placement;
  if (![x, y, width, height].every(n => typeof n === "number" && Number.isFinite(n)) ||
      Math.abs(x) > 100_000 || Math.abs(y) > 100_000 ||
      width < 1 || height < 1 || width > 10_000 || height > 10_000) {
    throw new RangeError("Foreground image element geometry is invalid.");
  }
  if (![intrinsic_width, intrinsic_height].every(n => Number.isSafeInteger(n) && n >= 1 && n <= 8192) ||
      intrinsic_width * intrinsic_height > 16_000_000) {
    throw new RangeError("Foreground image intrinsic dimensions are invalid.");
  }
  const data_url = validateForegroundImageDataUrl(placement.data_url);
  return Object.freeze({
    id, x, y, width, height,
    kind: Object.freeze({ type: "image" as const, data_url, intrinsic_width, intrinsic_height }),
  });
}

/**
 * Validate a deserialized schema-v6 image element at the trust boundary.
 * Does not decode the raster; callers must also perform browser decode checks.
 * This intentionally does not activate schema v6 in the existing v5 editor.
 */
export function parseForegroundImageElementV6(value: unknown): ForegroundImageElementV6 {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("Foreground image element must be an object.");
  }
  const element = value as Record<string, unknown>;
  const kind = element.kind;
  if (!kind || typeof kind !== "object" || Array.isArray(kind) ||
      (kind as Record<string, unknown>).type !== "image") {
    throw new TypeError("Foreground image element must have image kind.");
  }
  const image = kind as Record<string, unknown>;
  // Never coerce untrusted JSON fields: the shared constructor enforces
  // finite geometry, safe intrinsic dimensions, and the raster signature.
  return makeForegroundImageElementV6(element.id, {
    x: element.x, y: element.y, width: element.width, height: element.height,
    data_url: image.data_url,
    intrinsic_width: image.intrinsic_width,
    intrinsic_height: image.intrinsic_height,
  } as ForegroundImagePlacement);
}
