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
  });

  it("wraps text to the element width and escapes user text", () => {
    const svg = renderDesignSvg([
      { id: "text", type: "text", text: "one two three four five", x: 0, y: 0, width: 45, height: 80, fontSize: 12, color: "#000000" },
    ], 100, 100, "#fff");
    expect(svg.match(/<tspan/g)?.length).toBeGreaterThan(1);
    expect(svg).not.toContain("<script");
  });

  it("rejects invalid dimensions and unsupported scale", () => {
    expect(() => renderDesignSvg([], 0, 100, "#fff")).toThrow(/dimensions/);
    expect(() => renderDesignSvg([], 100, 100, "#fff", 5)).toThrow(/scale/);
  });
});
