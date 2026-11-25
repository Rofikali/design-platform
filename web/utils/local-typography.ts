/** Closed, browser-local typography tokens. No font download or user CSS. */
export const DEFAULT_FONT_FAMILY = "sans" as const;
export type LocalFontFamily = "sans" | "serif" | "monospace";

export function isLocalFontFamily(value: unknown): value is LocalFontFamily {
  return value === "sans" || value === "serif" || value === "monospace";
}

/** Map only validated tokens to fixed CSS/SVG-safe fallback stacks. */
export function localFontStack(family: LocalFontFamily = DEFAULT_FONT_FAMILY): string {
  switch (family) {
    case "sans": return "Arial, Helvetica, sans-serif";
    case "serif": return "Georgia, Times New Roman, serif";
    case "monospace": return "Courier New, Courier, monospace";
    default: throw new Error("Unsupported local font family");
  }
}

/** Preserve the legacy normal-weight Canvas shorthand exactly. */
export function localCanvasFont(
  size: number,
  family: LocalFontFamily = DEFAULT_FONT_FAMILY,
  weight: "normal" | "bold" = "normal",
  style: "normal" | "italic" = "normal",
): string {
  if (!Number.isFinite(size) || size < 1 || size > 512) {
    throw new Error("Invalid font size");
  }
  if ((weight !== "normal" && weight !== "bold") || (style !== "normal" && style !== "italic")) {
    throw new Error("Unsupported local font weight or style");
  }
  const prefix = (style === "italic" ? "italic " : "") + (weight === "bold" ? "bold " : "");
  return `${prefix}${size}px ${localFontStack(family)}`;
}
