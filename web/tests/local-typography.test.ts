import { describe, expect, it } from "vitest";
import { DEFAULT_FONT_FAMILY, isLocalFontFamily, localCanvasFont, localFontStack, type LocalFontFamily } from "../utils/local-typography";

describe("local typography contract", () => {
  it("preserves the legacy default and Canvas shorthand", () => {
    expect(DEFAULT_FONT_FAMILY).toBe("sans");
    expect(localFontStack()).toBe("Arial, Helvetica, sans-serif");
    expect(localCanvasFont(32)).toBe("32px Arial, Helvetica, sans-serif");
  });

  it("resolves only the three fixed local stacks", () => {
    expect(localFontStack("serif")).toBe("Georgia, Times New Roman, serif");
    expect(localCanvasFont(12, "monospace")).toBe("12px Courier New, Courier, monospace");
    for (const value of ["sans", "serif", "monospace"]) expect(isLocalFontFamily(value)).toBe(true);
  });

  it("rejects arbitrary CSS, remote font URLs and prototype names", () => {
    for (const value of ["", "Sans", "url(https://example.invalid/font)", "sans; color:red", "__proto__", "constructor", null, {}, 42]) {
      expect(isLocalFontFamily(value)).toBe(false);
      expect(() => localFontStack(value as LocalFontFamily)).toThrow("Unsupported local font family");
    }
  });

  it("enforces the existing document text-size bounds", () => {
    for (const size of [NaN, Infinity, -1, 0, 513]) expect(() => localCanvasFont(size)).toThrow("Invalid font size");
    expect(localCanvasFont(1)).toBe("1px Arial, Helvetica, sans-serif");
    expect(localCanvasFont(512)).toBe("512px Arial, Helvetica, sans-serif");
  });
});

describe("styled canvas font shorthand", () => {
  it("uses fixed safe weights and styles and preserves default syntax", () => {
    expect(localCanvasFont(20, "serif", "bold", "italic")).toBe("italic bold 20px Georgia, Times New Roman, serif");
    expect(localCanvasFont(20, "monospace", "bold")).toBe("bold 20px Courier New, Courier, monospace");
    expect(localCanvasFont(20, "sans", "normal", "normal")).toBe("20px Arial, Helvetica, sans-serif");
    expect(() => localCanvasFont(20, "sans", "900" as "bold")).toThrow();
    expect(() => localCanvasFont(20, "sans", "normal", "url(x)" as "italic")).toThrow();
  });
});
