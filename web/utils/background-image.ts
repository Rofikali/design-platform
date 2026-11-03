import type { BackgroundImage } from "./document";

export const MAX_BACKGROUND_IMAGE_DIMENSION = 4_096;
export const MAX_BACKGROUND_IMAGE_PIXELS = 16_000_000;

type SupportedMime = "image/png" | "image/jpeg" | "image/webp";

function detectRasterMime(bytes: Uint8Array): SupportedMime | null {
  if (bytes.length >= 8 &&
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
      bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 12 &&
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

/**
 * Accept only real PNG/JPEG/WebP raster files. Decode before storing so a
 * renamed or corrupt file cannot become a page background.
 */
export async function prepareBackgroundImage(file: File): Promise<BackgroundImage> {
  if (file.size === 0) throw new Error("Choose a non-empty image file.");
  if (file.size > 1_048_576) throw new Error("Image file exceeds the 1 MiB upload limit.");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = detectRasterMime(bytes);
  if (!mime) throw new Error("Only valid PNG, JPEG and WebP raster images are supported.");

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file.slice(0, file.size, mime));
  } catch {
    throw new Error("The selected image could not be decoded.");
  }

  try {
    if (bitmap.width < 1 || bitmap.height < 1 ||
        bitmap.width > MAX_BACKGROUND_IMAGE_DIMENSION ||
        bitmap.height > MAX_BACKGROUND_IMAGE_DIMENSION ||
        bitmap.width * bitmap.height > MAX_BACKGROUND_IMAGE_PIXELS) {
      throw new Error("Image dimensions exceed the 4,096-pixel edge or 16-million-pixel limit.");
    }
  } finally {
    bitmap.close();
  }

  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const dataUrl = `data:${mime};base64,${btoa(binary)}`;
  if (new TextEncoder().encode(dataUrl).byteLength > 1_048_576) {
    throw new Error("Encoded image exceeds the 1 MiB document limit. Choose a smaller image.");
  }
  return { data_url: dataUrl, fit: "cover" };
}
