import { validateForegroundImageDataUrl } from "./foreground-image";

export const MAX_FOREGROUND_IMAGE_PIXELS = 16_000_000;
export const MAX_FOREGROUND_IMAGE_DIMENSION = 8_192;

export type ForegroundImageDimensions = Readonly<{ width: number; height: number }>;

/**
 * Decode a local raster using the browser image decoder. The data URL guard
 * checks transport size and signature; successful decoding is a separate gate.
 * No network request, canvas readback or persistent object URL is needed.
 *
 * Note: pixel limits are checked after decoding. They are not a decoder-memory
 * sandbox; browsers may allocate memory before rejecting oversized dimensions.
 */
export async function decodeForegroundImageDimensions(source: unknown): Promise<ForegroundImageDimensions> {
  const validated = validateForegroundImageDataUrl(source);
  if (typeof createImageBitmap !== "function") {
    throw new Error("This browser cannot decode foreground raster images.");
  }

  const comma = validated.indexOf(",");
  const mime = validated.slice(5, validated.indexOf(";"));
  const binary = atob(validated.slice(comma + 1));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);

  const bitmap = await createImageBitmap(new Blob([bytes], { type: mime }));
  try {
    const { width, height } = bitmap;
    if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) ||
        width < 1 || height < 1 ||
        width > MAX_FOREGROUND_IMAGE_DIMENSION || height > MAX_FOREGROUND_IMAGE_DIMENSION ||
        width * height > MAX_FOREGROUND_IMAGE_PIXELS) {
      throw new RangeError("Foreground image decoded dimensions exceed supported limits.");
    }
    return { width, height };
  } finally {
    bitmap.close();
  }
}
