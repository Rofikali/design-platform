import { describe, expect, it } from "vitest";
import { MAX_FOREGROUND_IMAGE_DATA_URL_BYTES, validateForegroundImageDataUrl } from "../utils/foreground-image";

const headers = {
  png: [137, 80, 78, 71, 13, 10, 26, 10],
  jpeg: [255, 216, 255, 224],
  webp: [82, 73, 70, 70, 16, 0, 0, 0, 87, 69, 66, 80],
} as const;

function resource(mime: keyof typeof headers, bytes: readonly number[] = headers[mime]): string {
  return `data:image/${mime};base64,${btoa(String.fromCharCode(...bytes))}`;
}

describe("foreground raster resource guard", () => {
  it("accepts supported matching raster signatures without changing the source", () => {
    for (const mime of ["png", "jpeg", "webp"] as const) {
      const source = resource(mime);
      expect(validateForegroundImageDataUrl(source)).toBe(source);
    }
  });

  it("rejects MIME spoofing, truncated signatures, remote references and active content", () => {
    for (const source of [
      resource("png", headers.jpeg), resource("jpeg", headers.png),
      resource("webp", [82, 73, 70, 70]), resource("png", [137, 80]),
      "https://example.com/photo.png", "data:image/svg+xml;base64,AAAA",
      "data:image/png;base64,AA=A", "data:image/png;base64,AAA",
      "data:image/png;base64,AAAA\n", null, {},
    ]) {
      expect(() => validateForegroundImageDataUrl(source)).toThrow();
    }
  });

  it("rejects noncanonical base64 pad bits even with a valid raster prefix", () => {
    const valid = resource("png");
    expect(validateForegroundImageDataUrl(valid)).toBe(valid);
    // A one-byte trailing group is encoded with two padding characters.
    const padded = resource("png", [...headers.png, 0, 0]);
    expect(validateForegroundImageDataUrl(padded)).toBe(padded);
    expect(() => validateForegroundImageDataUrl(padded.replace(/A==$/, "B=="))).toThrow(TypeError);
  });

  it("enforces the encoded byte budget at the boundary", () => {
    const prefix = "data:image/png;base64,";
    const encodedLength = Math.floor((MAX_FOREGROUND_IMAGE_DATA_URL_BYTES - prefix.length) / 4) * 4;
    const decodedLength = (encodedLength / 4) * 3;
    // Encode one complete byte stream: concatenating padded Base64 fragments is invalid.
    const allowed = prefix + btoa(String.fromCharCode(...headers.png) + "\0".repeat(decodedLength - headers.png.length));
    expect(validateForegroundImageDataUrl(allowed)).toBe(allowed);
    expect(() => validateForegroundImageDataUrl(allowed + "AAAA")).toThrow(RangeError);
  });
});
