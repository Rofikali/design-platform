import type { DesignElement } from "./document";

type TextWidthMeasurer = (text: string, fontSize: number) => number;

function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number,
  measureText?: TextWidthMeasurer,
): string[] {
  const lines: string[] = [];
  // A grapheme can contain multiple code points (for example, a family emoji
  // joined with zero-width joiners or a letter plus a combining accent).
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  const splitGraphemes = (value: string) => Array.from(segmenter.segment(value), part => part.segment);
  // Keep a deterministic approximation for pure unit tests and non-browser callers.
  // PNG export supplies Canvas measureText so real exports wrap by rendered width.
  const widthOf = (value: string) => measureText
    ? measureText(value, fontSize)
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
  const shapes = elements.map((element, elementIndex) => {
    if (element.type === "rect") {
      return `<rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" fill="${escapeXml(element.color)}"/>`;
    }
    const fontSize = element.fontSize;
    const lines = wrapText(element.text, element.width, fontSize, measureText);
    // The editor element's box is its layout contract. Without clipping, wrapped
    // lines can paint over neighboring elements or outside the page.
    const clipId = `text-clip-${elementIndex}`;
    const clip = `<defs><clipPath id="${clipId}"><rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}"/></clipPath></defs>`;
    const text = `<text clip-path="url(#${clipId})" x="${element.x + 2}" y="${element.y + fontSize}" fill="${escapeXml(element.color)}" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}">${lines.map((line, index) => `<tspan x="${element.x + 2}" dy="${index === 0 ? 0 : fontSize * 1.25}">${escapeXml(line)}</tspan>`).join("")}</text>`;
    return clip + text;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width * scale}" height="${height * scale}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${escapeXml(background)}"/>${shapes}</svg>`;
}

export async function renderDesignPng(
  elements: DesignElement[],
  width: number,
  height: number,
  background: string,
  scale = 2,
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
    (text, fontSize) => {
      context.font = `${fontSize}px Arial, Helvetica, sans-serif`;
      return context.measureText(text).width;
    },
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
