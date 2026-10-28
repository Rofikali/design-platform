import type { DesignElement } from "./document";

function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

function wrapText(text: string, maxCharacters: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    if (paragraph.length === 0) { lines.push(""); continue; }
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      if (line && Array.from(line).length + Array.from(word).length + 1 > maxCharacters) {
        lines.push(line);
        line = "";
      }
      line = line ? line + " " + word : word;
      let lineCharacters = Array.from(line);
      while (lineCharacters.length > maxCharacters) {
        lines.push(lineCharacters.slice(0, maxCharacters).join(""));
        lineCharacters = lineCharacters.slice(maxCharacters);
      }
      line = lineCharacters.join("");
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
): string {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1 || width > 10_000 || height > 10_000) {
    throw new Error("Invalid export page dimensions.");
  }
  if (!Number.isFinite(scale) || scale < 1 || scale > 4) throw new Error("Export scale must be between 1 and 4.");
  const shapes = elements.map((element, elementIndex) => {
    if (element.type === "rect") {
      return `<rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" fill="${escapeXml(element.color)}"/>`;
    }
    const fontSize = element.fontSize;
    const maxCharacters = Math.max(1, Math.floor(element.width / Math.max(fontSize * 0.58, 1)));
    const lines = wrapText(element.text, maxCharacters);
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
  const svg = renderDesignSvg(elements, width, height, background, scale);
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("PNG export is unavailable because the canvas could not be created.");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("PNG encoding failed.")), "image/png");
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
