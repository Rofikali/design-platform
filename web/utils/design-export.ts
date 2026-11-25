import type { BackgroundImage, DesignElement } from "./document";
import { localCanvasFont, localFontStack } from "./local-typography";
import { DEFAULT_NATIVE_TEXT_LAYOUT, lineAdvance, nativeLayoutAttributes, parseNativeTextLayout, type NativeTextLayout, measureNativeTextWidth } from "./native-text-layout";
import type { TextLayoutEntry } from "./text-layout-document";

import { DEFAULT_TEXT_STYLE_V1, parseTextStyleV1, type TextStyleV1 } from "./text-style-v1";
import type { TextStyleEntry } from "./typography-document";

type TextWidthMeasurer = (text: string, fontSize: number, style: TextStyleV1, layout: NativeTextLayout) => number;

function validateExportLayouts(elements: DesignElement[], entries?: ReadonlyArray<TextLayoutEntry>): Map<string, NativeTextLayout> {
  const layouts = new Map<string, NativeTextLayout>();
  if (entries === undefined) return layouts;
  const ids = new Set(elements.filter(element => element.type === "text").map(element => element.id));
  if (!Array.isArray(entries) || entries.length !== ids.size) throw new Error("Invalid export text layouts");
  for (const entry of entries) {
    if (!entry || typeof entry !== "object" || Object.keys(entry).length !== 2 ||
        !Object.prototype.hasOwnProperty.call(entry, "element_id") ||
        !Object.prototype.hasOwnProperty.call(entry, "layout") ||
        !ids.has(entry.element_id) || layouts.has(entry.element_id)) {
      throw new Error("Invalid export text layouts");
    }
    layouts.set(entry.element_id, parseNativeTextLayout(entry.layout));
  }
  return layouts;
}

/** Optional staged typography input; legacy exports omit it entirely. */
function validateExportStyles(elements: DesignElement[], entries?: ReadonlyArray<TextStyleEntry>): Map<string, TextStyleV1> {
  const styles = new Map<string, TextStyleV1>();
  if (entries === undefined) return styles;
  const ids = new Set(elements.filter(element => element.type === "text").map(element => element.id));
  if (!Array.isArray(entries) || entries.length !== ids.size) throw new Error("Invalid export text styles");
  for (const entry of entries) {
    if (!entry || typeof entry !== "object" || !ids.has(entry.element_id) || styles.has(entry.element_id)) {
      throw new Error("Invalid export text styles");
    }
    styles.set(entry.element_id, parseTextStyleV1(entry.style));
  }
  return styles;
}

function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number,
  measureText?: TextWidthMeasurer,
  style: TextStyleV1 = DEFAULT_TEXT_STYLE_V1,
  layout: NativeTextLayout = DEFAULT_NATIVE_TEXT_LAYOUT,
): string[] {
  const lines: string[] = [];
  // A grapheme can contain multiple code points (for example, a family emoji
  // joined with zero-width joiners or a letter plus a combining accent).
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  const splitGraphemes = (value: string) => Array.from(segmenter.segment(value), part => part.segment);
  // Keep a deterministic approximation for pure unit tests and non-browser callers.
  // PNG export supplies Canvas measureText so real exports wrap by rendered width.
  // Nonzero spacing needs actual native metrics; do not silently invent
  // per-grapheme widths for shaped Indic text or other complex scripts.
  if (!measureText && layout.letterSpacing !== 0) {
    throw new Error("Letter spacing requires native text measurement.");
  }
  const widthOf = (value: string) => measureText
    ? measureText(value, fontSize, style, layout)
    : splitGraphemes(value).length * fontSize * 0.58;

  for (const paragraph of text.split("\n")) {
    if (paragraph.length === 0) {
      lines.push("");
      continue;
    }

    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      const candidate = line ? line + " " + word : word;
      if (line && widthOf(candidate) <= maxWidth) {
        line = candidate;
        continue;
      }
      if (line) {
        lines.push(line);
        line = "";
      }

      // Avoid repeatedly measuring every growing prefix of a long unbroken
      // word. Try the whole word once, then binary-search the largest grapheme
      // chunk that fits. This keeps very wide text boxes from causing quadratic
      // text-measurement work.
      if (widthOf(word) <= maxWidth) {
        line = word;
        continue;
      }
      const graphemes = splitGraphemes(word);
      let offset = 0;
      while (offset < graphemes.length) {
        // Exponentially find a small search window, then binary-search it.
        // This avoids scanning the entire remaining suffix for every line.
        let step = 1;
        let best = offset;
        let high = graphemes.length;
        while (offset + step <= graphemes.length) {
          const end = offset + step;
          const candidate = graphemes.slice(offset, end).join("");
          if (widthOf(candidate) <= maxWidth) {
            best = end;
            step *= 2;
          } else {
            high = end - 1;
            break;
          }
        }
        if (offset + step > graphemes.length && best < graphemes.length) {
          const candidate = graphemes.slice(offset).join("");
          if (widthOf(candidate) <= maxWidth) best = graphemes.length;
          else high = graphemes.length - 1;
        }
        let low = best + 1;
        while (low <= high) {
          const middle = Math.floor((low + high) / 2);
          const candidate = graphemes.slice(offset, middle).join("");
          if (widthOf(candidate) <= maxWidth) {
            best = middle;
            low = middle + 1;
          } else {
            high = middle - 1;
          }
        }
        // Keep one grapheme even when that glyph itself exceeds the box.
        if (best <= offset) best = offset + 1;
        const chunk = graphemes.slice(offset, best).join("");
        offset = best;
        // Keep the final chunk as the current line so following words retain
        // their normal separating whitespace.
        if (offset < graphemes.length) lines.push(chunk);
        else line = chunk;
      }
    }
    lines.push(line);
  }
  return lines;
}

/** Render the supported editor primitives to a self-contained SVG. */
export function renderDesignSvg(
  elements: DesignElement[],
  width: number,
  height: number,
  background: string,
  scale = 2,
  measureText?: TextWidthMeasurer,
  backgroundImage?: BackgroundImage,
  textStyles?: ReadonlyArray<TextStyleEntry>,
  textLayouts?: ReadonlyArray<TextLayoutEntry>,
): string {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1 || width > 10_000 || height > 10_000) {
    throw new Error("Invalid export page dimensions.");
  }
  if (!Number.isFinite(scale) || scale < 1 || scale > 4) throw new Error("Export scale must be between 1 and 4.");
  // A valid logical document can still expand into an unsafe raster allocation.
  // Bound both dimensions and total output pixels before building/decoding SVG.
  const outputWidth = Math.ceil(width * scale);
  const outputHeight = Math.ceil(height * scale);
  if (outputWidth > 16_384 || outputHeight > 16_384) {
    throw new Error("PNG export dimensions exceed the 16,384-pixel limit.");
  }
  if (outputWidth * outputHeight > 16_000_000) {
    throw new Error("PNG export exceeds the 16-million-pixel limit. Reduce the page size or export scale.");
  }
  const styles = validateExportStyles(elements, textStyles);
  const layouts = validateExportLayouts(elements, textLayouts);
  const shapes = elements.map((element, elementIndex) => {
    if (element.type === "rect") {
      return `<rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" fill="${escapeXml(element.color)}"/>`;
    }
    if (element.type === "frame") {
      const fill = element.fillColor ? escapeXml(element.fillColor) : "none";
      return `<rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" fill="${fill}" stroke="${escapeXml(element.strokeColor)}" stroke-width="${element.strokeWidth}"/>`;
    }
    if (element.type === "grid") {
      const lines: string[] = [];
      for (let row = 1; row < element.rows; row += 1) {
        const y = element.y + element.height * row / element.rows;
        lines.push(`<line x1="${element.x}" y1="${y}" x2="${element.x + element.width}" y2="${y}"/>`);
      }
      for (let column = 1; column < element.columns; column += 1) {
        const x = element.x + element.width * column / element.columns;
        lines.push(`<line x1="${x}" y1="${element.y}" x2="${x}" y2="${element.y + element.height}"/>`);
      }
      return `<g fill="none" stroke="${escapeXml(element.strokeColor)}" stroke-width="${element.strokeWidth}"><rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}"/>${lines.join("")}</g>`;
    }
    if (element.type === "table") {
      const cellWidth = element.width / element.columns;
      const cellHeight = element.height / element.rows;
      const cellFills: string[] = [];
      const cellText: string[] = [];
      for (let row = 0; row < element.rows; row += 1) {
        for (let column = 0; column < element.columns; column += 1) {
          const x = element.x + column * cellWidth;
          const y = element.y + row * cellHeight;
          const cell = element.cells[row]![column]!;
          const clipId = `table-${elementIndex}-cell-${row}-${column}`;
          const textX = x + element.cellPadding;
          const textY = y + element.cellPadding + element.fontSize;
          const textWidth = Math.max(0, cellWidth - element.cellPadding * 2);
          const lines = wrapText(cell, textWidth, element.fontSize, measureText);
          const fill = escapeXml(row < element.headerRows ? element.headerFill : element.cellFill);
          cellFills.push(`<rect x="${x}" y="${y}" width="${cellWidth}" height="${cellHeight}" fill="${fill}"/>`);
          cellText.push(`<defs><clipPath id="${clipId}"><rect x="${textX}" y="${y + element.cellPadding}" width="${textWidth}" height="${Math.max(0, cellHeight - element.cellPadding * 2)}"/></clipPath></defs><text clip-path="url(#${clipId})" x="${textX}" y="${textY}" fill="${escapeXml(element.textColor)}" font-family="${localFontStack()}" font-size="${element.fontSize}">${lines.map((line, lineIndex) => `<tspan x="${textX}" dy="${lineIndex === 0 ? 0 : lineAdvance(element.fontSize)}">${escapeXml(line)}</tspan>`).join("")}</text>`);
        }
      }
      const lines: string[] = [];
      for (let row = 1; row < element.rows; row += 1) {
        const y = element.y + row * cellHeight;
        lines.push(`<line x1="${element.x}" y1="${y}" x2="${element.x + element.width}" y2="${y}"/>`);
      }
      for (let column = 1; column < element.columns; column += 1) {
        const x = element.x + column * cellWidth;
        lines.push(`<line x1="${x}" y1="${element.y}" x2="${x}" y2="${element.y + element.height}"/>`);
      }
      const border = `<g fill="none" stroke="${escapeXml(element.strokeColor)}" stroke-width="${element.strokeWidth}"><rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}"/>${lines.join("")}</g>`;
      return cellFills.join("") + border + cellText.join("");
    }
    const fontSize = element.fontSize;
    const style = styles.get(element.id) ?? DEFAULT_TEXT_STYLE_V1;
    const layout = layouts.get(element.id) ?? DEFAULT_NATIVE_TEXT_LAYOUT;
    const attrs = nativeLayoutAttributes(layout).svg;
    // Retain the historical left inset and wrap width for default documents.
    const textX = layout.alignment === "center" ? element.x + element.width / 2
      : layout.alignment === "right" ? element.x + Math.max(0, element.width - 2) : element.x + 2;
    const wrapWidth = layout.alignment === "left" && layout.letterSpacing === 0
      ? element.width : Math.max(0, element.width - 4);
    const lines = wrapText(element.text, wrapWidth, fontSize, measureText, style, layout);
    const advance = lineAdvance(fontSize, layout);
    const anchor = attrs.textAnchor === "start" ? "" : ` text-anchor="${attrs.textAnchor}"`;
    const spacing = attrs.letterSpacing === 0 ? "" : ` letter-spacing="${attrs.letterSpacing}"`;
    // Omit normal attributes to preserve byte-for-byte legacy SVG output.
    const weight = style.font_weight === "bold" ? ' font-weight="bold"' : "";
    const italic = style.font_style === "italic" ? ' font-style="italic"' : "";
    // The editor element's box is its layout contract. Without clipping, wrapped
    // lines can paint over neighboring elements or outside the page.
    const clipId = `text-clip-${elementIndex}`;
    const clip = `<defs><clipPath id="${clipId}"><rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}"/></clipPath></defs>`;
    const text = `<text clip-path="url(#${clipId})" x="${textX}" y="${element.y + fontSize}" fill="${escapeXml(element.color)}" font-family="${localFontStack(style.font_family)}" font-size="${fontSize}"${weight}${italic}${anchor}${spacing}>${lines.map((line, index) => `<tspan x="${textX}" dy="${index === 0 ? 0 : advance}">${escapeXml(line)}</tspan>`).join("")}</text>`;
    return clip + text;
  }).join("");
  const image = backgroundImage
    ? `<image href="${escapeXml(backgroundImage.data_url)}" x="0" y="0" width="${width}" height="${height}" preserveAspectRatio="${backgroundImage.fit === "cover" ? "xMidYMid slice" : "xMidYMid meet"}"/>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${escapeXml(background)}"/>${image}${shapes}</svg>`;
}

export async function renderDesignPng(
  elements: DesignElement[],
  width: number,
  height: number,
  background: string,
  scale = 2,
  backgroundImage?: BackgroundImage,
  textStyles?: ReadonlyArray<TextStyleEntry>,
  textLayouts?: ReadonlyArray<TextLayoutEntry>,
): Promise<Blob> {
  // Measure with the same font family used by the SVG. Character-count wrapping
  // is only an approximation: "WWW" and "iii" have very different rendered widths.
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("PNG export is unavailable because the canvas could not be created.");
  const svg = renderDesignSvg(
    elements,
    width,
    height,
    background,
    scale,
    (text, fontSize, style, layout) => {
      context.font = localCanvasFont(fontSize, style.font_family, style.font_weight, style.font_style);
      return measureNativeTextWidth(context, text, layout);
    },
    backgroundImage,
    textStyles,
    textLayouts,
  );
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const exportContext = canvas.getContext("2d");
    if (!exportContext) throw new Error("PNG export is unavailable because the canvas could not be created.");
    exportContext.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("PNG encoding failed.")), "image/png");
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
