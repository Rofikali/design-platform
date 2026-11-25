import { describe, expect, it } from "vitest";
import { renderDesignSvg } from "../utils/design-export";
import type { DesignElement } from "../utils/document";

const elements: DesignElement[] = [
  { id: "title", type: "text", text: "Shop & <Save>", x: 10, y: 20, width: 180, height: 50, fontSize: 20, color: "#123456" },
  { id: "accent", type: "rect", x: 5, y: 90, width: 80, height: 30, color: "#ff6600" },
];

describe("design export renderer", () => {
  it("creates a self-contained SVG with scaled pixel dimensions and page background", () => {
    const svg = renderDesignSvg(elements, 300, 125, "#ffffff", 2);
    expect(svg).toContain('width="600" height="250" viewBox="0 0 300 125"');
    expect(svg).toContain('fill="#ffffff"');
    expect(svg).toContain('fill="#ff6600"');
    expect(svg).toContain("Shop &amp; &lt;Save&gt;");
    expect(svg).toContain('font-family="Arial, Helvetica, sans-serif"');
  });

  it("renders frame and grid primitives as deterministic SVG geometry", () => {
    const svg = renderDesignSvg([
      { id: "frame", type: "frame", x: 10, y: 20, width: 100, height: 60, strokeColor: "#123456", strokeWidth: 2, fillColor: "#ffffff" },
      { id: "grid", type: "grid", x: 140, y: 20, width: 120, height: 60, rows: 3, columns: 4, strokeColor: "#64748b", strokeWidth: 1 },
    ], 300, 100, "#fff");
    expect(svg).toContain('<rect x="10" y="20" width="100" height="60" fill="#ffffff" stroke="#123456" stroke-width="2"/>');
    expect(svg).toContain('<g fill="none" stroke="#64748b" stroke-width="1">');
    expect(svg.match(/<line /g)?.length).toBe(5);
  });

  it("renders semantic table cells with header styling, clipping, and escaped plain text", () => {
    const table: DesignElement = {
      id: "table", type: "table", x: 10, y: 20, width: 300, height: 100,
      rows: 2, columns: 2, cells: [["Product", "Price"], ["<script>", "₹80"]],
      headerRows: 1, strokeColor: "#334155", strokeWidth: 1, cellPadding: 4,
      fontSize: 12, textColor: "#111827", headerFill: "#dbeafe", cellFill: "#ffffff",
    };
    const svg = renderDesignSvg([table], 400, 200, "#fff");
    expect(svg).toContain('fill="#dbeafe"');
    expect(svg).toContain('fill="#ffffff"');
    expect(svg).toContain('stroke="#334155"');
    expect(svg).toContain("&lt;script&gt;");
    expect(svg).not.toContain("<script>");
    expect(svg).toContain('clipPath id="table-0-cell-0-0"');
  });

  it("wraps text to the element width and escapes user text", () => {
    const svg = renderDesignSvg([
      { id: "text", type: "text", text: "one two three four five", x: 0, y: 0, width: 45, height: 80, fontSize: 12, color: "#000000" },
    ], 100, 100, "#fff");
    expect(svg.match(/<tspan/g)?.length).toBeGreaterThan(1);
    expect(svg).not.toContain("<script");
  });

  it("wraps Unicode text without splitting UTF-16 surrogate pairs", () => {
    const svg = renderDesignSvg([
      { id: "unicode", type: "text", text: "abc😀def", x: 0, y: 0, width: 24, height: 80, fontSize: 10, color: "#000000" },
    ], 100, 100, "#fff");
    expect(svg).toContain(`<tspan x="2" dy="0">abc😀</tspan>`);
    expect(svg).toContain(`<tspan x="2" dy="12.5">def</tspan>`);
    expect(svg).not.toContain("\uFFFD");
  });

  it("keeps grapheme clusters intact when wrapping joined emoji and combining marks", () => {
    const family = "👨‍👩‍👧‍👦";
    const accented = "e\u0301";
    const svg = renderDesignSvg([
      { id: "family", type: "text", text: `A${family}B`, x: 0, y: 0, width: 6, height: 50, fontSize: 10, color: "#000000" },
      { id: "accent", type: "text", text: `${accented}x`, x: 0, y: 50, width: 6, height: 30, fontSize: 10, color: "#000000" },
    ], 100, 100, "#fff");
    expect(svg).toContain(`<tspan x="2" dy="0">A</tspan>`);
    expect(svg).toContain(`<tspan x="2" dy="12.5">${family}</tspan>`);
    expect(svg).toContain(`<tspan x="2" dy="12.5">B</tspan>`);
    expect(svg).toContain(`<tspan x="2" dy="0">${accented}</tspan>`);
    expect(svg).toContain(`<tspan x="2" dy="12.5">x</tspan>`);
    expect(svg).not.toContain("\uFFFD");
  });

  it("clips wrapped text to its element box so it cannot overlap neighboring content", () => {
    const svg = renderDesignSvg([
      { id: "first", type: "text", text: "one two three four five six seven", x: 10, y: 20, width: 50, height: 18, fontSize: 12, color: "#000000" },
      { id: "second", type: "text", text: "another element", x: 70, y: 20, width: 80, height: 30, fontSize: 12, color: "#000000" },
    ], 200, 100, "#ffffff");

    expect(svg).toContain('<clipPath id="text-clip-0"><rect x="10" y="20" width="50" height="18"/></clipPath>');
    expect(svg).toContain('<text clip-path="url(#text-clip-0)"');
    expect(svg).toContain('<clipPath id="text-clip-1"><rect x="70" y="20" width="80" height="30"/></clipPath>');
    expect(svg).toContain('<text clip-path="url(#text-clip-1)"');
  });

  it("uses measured glyph widths when a browser text measurer is supplied", () => {
    const svg = renderDesignSvg([
      { id: "measured", type: "text", text: "WWW iii", x: 0, y: 0, width: 30, height: 60, fontSize: 10, color: "#000000" },
    ], 100, 100, "#fff", 2, (value) => {
      // Simulate proportional font metrics: W is wide, i is narrow.
      return Array.from(value).reduce((sum, character) => sum + (character === "W" ? 10 : character === " " ? 3 : 2), 0);
    });

    expect(svg).toContain("<tspan x=\"2\" dy=\"0\">WWW</tspan>");
    expect(svg).toContain("<tspan x=\"2\" dy=\"12.5\">iii</tspan>");
  });

  it("preserves word spaces while wrapping measured text", () => {
    const svg = renderDesignSvg([
      { id: "words", type: "text", text: "alpha beta gamma", x: 0, y: 0, width: 65, height: 60, fontSize: 10, color: "#000000" },
    ], 100, 100, "#fff", 2, (value) => value.length * 10);

    expect(svg).toContain("<tspan x=\"2\" dy=\"0\">alpha</tspan>");
    expect(svg).toContain("<tspan x=\"2\" dy=\"12.5\">beta</tspan>");
    expect(svg).toContain("<tspan x=\"2\" dy=\"12.5\">gamma</tspan>");
  });

  it("measures long unbroken words with bounded binary-search work", () => {
    let measurements = 0;
    const longWord = "W".repeat(4096);
    const svg = renderDesignSvg([
      { id: "long-word", type: "text", text: longWord, x: 0, y: 0, width: 40, height: 100, fontSize: 10, color: "#000000" },
    ], 100, 100, "#fff", 2, (value) => {
      measurements += 1;
      return value.length * 10;
    });

    expect(svg.match(/<tspan/g)?.length).toBe(1024);
    expect(measurements).toBeLessThan(longWord.length * 2);
    expect(svg).not.toContain("\uFFFD");
  });


  it("renders page backgrounds with the requested cover or contain fit before elements", () => {
    const image = { data_url: "data:image/png;base64,iVBORw0KGgo=", fit: "cover" as const };
    const cover = renderDesignSvg(elements, 300, 125, "#ffffff", 2, undefined, image);
    expect(cover).toContain('preserveAspectRatio="xMidYMid slice"');
    expect(cover.indexOf("<image")).toBeLessThan(cover.indexOf("<rect x="));

    const contain = renderDesignSvg(elements, 300, 125, "#ffffff", 2, undefined, { ...image, fit: "contain" });
    expect(contain).toContain('preserveAspectRatio="xMidYMid meet"');
  });

  it("rejects invalid dimensions and unsupported scale", () => {
    expect(() => renderDesignSvg([], 0, 100, "#fff")).toThrow(/dimensions/);
    expect(() => renderDesignSvg([], 100, 100, "#fff", 5)).toThrow(/scale/);
  });

  it("rejects raster dimensions that could allocate excessive browser memory", () => {
    // The logical page area is within the document limit, but 2x export would
    // allocate 40 million output pixels (roughly 160 MB for one RGBA bitmap).
    expect(() => renderDesignSvg([], 4_000, 2_500, "#fff", 2)).toThrow(/16-million-pixel limit/);
    expect(() => renderDesignSvg([], 9_000, 1_000, "#fff", 2)).toThrow(/16,384-pixel limit/);
    expect(() => renderDesignSvg([], 2_000, 2_000, "#fff", 2)).not.toThrow();
  });
});
