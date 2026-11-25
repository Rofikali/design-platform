import { isLocalFontFamily, type LocalFontFamily } from "./local-typography";

/** Staged wire contract only; production document schema v5 remains unchanged. */
export type TextStyleV1 = Readonly<{
  font_family: LocalFontFamily;
  font_weight: "normal" | "bold";
  font_style: "normal" | "italic";
}>;

export const DEFAULT_TEXT_STYLE_V1: TextStyleV1 = Object.freeze({
  font_family: "sans",
  font_weight: "normal",
  font_style: "normal",
});

/** Validate a JSON value without coercion, unknown keys or remote CSS. */
export function parseTextStyleV1(value: unknown): TextStyleV1 {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("Invalid text style");
  }
  const style = value as Record<string, unknown>;
  if (Object.keys(style).length !== 3 ||
      !Object.prototype.hasOwnProperty.call(style, "font_family") ||
      !Object.prototype.hasOwnProperty.call(style, "font_weight") ||
      !Object.prototype.hasOwnProperty.call(style, "font_style") ||
      !isLocalFontFamily(style.font_family) ||
      (style.font_weight !== "normal" && style.font_weight !== "bold") ||
      (style.font_style !== "normal" && style.font_style !== "italic")) {
    throw new TypeError("Invalid text style");
  }
  return Object.freeze({
    font_family: style.font_family,
    font_weight: style.font_weight,
    font_style: style.font_style,
  });
}
