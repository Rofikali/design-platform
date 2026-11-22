/** Validate an embedded foreground raster before it enters document authoring. 
 * This is a format/size guard, not proof that the image decodes successfully.
 */
export const MAX_FOREGROUND_IMAGE_DATA_URL_BYTES = 1_048_576;

export function validateForegroundImageDataUrl(value: unknown): string {
  if (typeof value !== "string" || new TextEncoder().encode(value).byteLength > MAX_FOREGROUND_IMAGE_DATA_URL_BYTES) {
    throw new RangeError("Foreground image must be an embedded raster no larger than 1 MiB.");
  }
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match || match[2]!.length % 4 !== 0 ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(match[2]!)) {
    throw new TypeError("Foreground image must use valid base64 PNG, JPEG or WebP data.");
  }
  // Reject non-canonical pad bits so one binary payload has one portable representation.
  const encoded = match[2]!;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  if ((encoded.endsWith("==") && (alphabet.indexOf(encoded[encoded.length - 3]!) & 15) !== 0) ||
      (encoded.endsWith("=") && !encoded.endsWith("==") && (alphabet.indexOf(encoded[encoded.length - 2]!) & 3) !== 0)) {
    throw new TypeError("Foreground image base64 padding bits must be canonical.");
  }
  return value;
}
