/** Native layout proposal; deliberately not part of persisted v5/v7 documents. */
export type NativeTextLayout = Readonly<{
  alignment: "left" | "center" | "right";
  lineHeight: number;
  letterSpacing: number;
}>;

export const DEFAULT_NATIVE_TEXT_LAYOUT: NativeTextLayout = Object.freeze({
  alignment: "left", lineHeight: 1.25, letterSpacing: 0,
});

export function parseNativeTextLayout(value: unknown): NativeTextLayout {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("Invalid text layout");
  }
  const input = value as Record<string, unknown>;
  if (Object.keys(input).length !== 3 ||
      !["alignment", "lineHeight", "letterSpacing"].every(key => Object.prototype.hasOwnProperty.call(input, key)) ||
      (input.alignment !== "left" && input.alignment !== "center" && input.alignment !== "right") ||
      typeof input.lineHeight !== "number" || !Number.isFinite(input.lineHeight) ||
      input.lineHeight < 1 || input.lineHeight > 3 ||
      typeof input.letterSpacing !== "number" || !Number.isFinite(input.letterSpacing) ||
      input.letterSpacing < -2 || input.letterSpacing > 10) {
    throw new TypeError("Invalid text layout");
  }
  return Object.freeze({
    alignment: input.alignment, lineHeight: input.lineHeight, letterSpacing: input.letterSpacing,
  });
}

/** Use native CSS and SVG attributes rather than implementing a text shaper. */
export function nativeLayoutAttributes(value: unknown) {
  const layout = parseNativeTextLayout(value);
  return {
    css: { textAlign: layout.alignment, lineHeight: String(layout.lineHeight), letterSpacing: `${layout.letterSpacing}px` },
    svg: { textAnchor: layout.alignment === "left" ? "start" : layout.alignment === "center" ? "middle" : "end", letterSpacing: layout.letterSpacing },
  } as const;
}

export function lineAdvance(fontSize: number, layout: NativeTextLayout = DEFAULT_NATIVE_TEXT_LAYOUT): number {
  if (!Number.isFinite(fontSize) || fontSize < 1 || fontSize > 512) throw new RangeError("Invalid font size");
  return fontSize * parseNativeTextLayout(layout).lineHeight;
}
