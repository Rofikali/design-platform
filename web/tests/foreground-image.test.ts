import { describe, expect, it } from "vitest";
import { MAX_FOREGROUND_IMAGE_DATA_URL_BYTES, validateForegroundImageDataUrl } from "../utils/foreground-image";

describe("foreground raster resource guard", () => {
  it("accepts supported embedded raster formats without changing the source", () => {
    for (const mime of ["png", "jpeg", "webp"]) {
      const source = `data:image/${mime};base64,AAAA`;
      expect(validateForegroundImageDataUrl(source)).toBe(source);
    }
  });

  it("rejects remote references, active content, invalid base64 and untrusted types", () => {
    for (const source of ["https://example.com/photo.png", "data:image/svg+xml;base64,AAAA",
      "data:image/png;base64,AA=A", "data:image/png;base64,AAA", "data:image/png;base64,AAAA\n", null, {}]) {
      expect(() => validateForegroundImageDataUrl(source)).toThrow();
    }
  });

  it("enforces the encoded byte budget at the boundary", () => {
    const prefix = "data:image/png;base64,";
    const allowed = prefix + "A".repeat(Math.floor((MAX_FOREGROUND_IMAGE_DATA_URL_BYTES - prefix.length) / 4) * 4);
    expect(validateForegroundImageDataUrl(allowed)).toBe(allowed);
    expect(() => validateForegroundImageDataUrl(allowed + "AAAA")).toThrow(RangeError);
  });
});
