import { describe, expect, it } from "vitest";
import sharedDocumentFixture from "../../fixtures/document-v1.json";
import schemaV2Fixture from "../../fixtures/document-v2-a4.json";
import schemaV3BackgroundFixture from "../../fixtures/document-v3-background-image.json";
import schemaV4FramesGridsFixture from "../../fixtures/document-v4-frames-grids.json";
import {
  MAX_ELEMENTS,
  MAX_FILE_CHARS,
  MAX_TEXT_CHARS,
  PAGE_HEIGHT,
  PAGE_WIDTH,
  parseDocument,
  parseDocumentJson,
  toDocument,
  type DesignDocument,
  type DesignElement,
} from "../utils/document";

function validDocument(): DesignDocument {
  return {
    schema_version: 4,
    page: { width: PAGE_WIDTH, height: PAGE_HEIGHT, background: "#ffffff" },
    elements: [
      {
        id: "title-1",
        x: 10,
        y: 20,
        width: 300,
        height: 60,
        kind: { type: "text", text: "Exam Paper", font_size: 28, color: "#123456" },
      },
      {
        id: "rect-2",
        x: 50,
        y: 100,
        width: 200,
        height: 80,
        kind: { type: "rect", color: "#abc" },
      },
    ],
  };
}

describe("document parsing and validation", () => {
  it("accepts the shared version-1 contract fixture", () => {
    const parsed = parseDocument(sharedDocumentFixture);
    expect(parsed.width).toBe(PAGE_WIDTH);
    expect(parsed.height).toBe(PAGE_HEIGHT);
    expect(parsed.elements).toHaveLength(2);
    expect(toDocument(parsed.elements)).toMatchObject({ schema_version: 4, page: sharedDocumentFixture.page, elements: sharedDocumentFixture.elements });
  });

  it("does not preserve schema-v2 metadata smuggled into a schema-v1 document", () => {
    const legacy = {
      ...sharedDocumentFixture,
      output_size_mm: { width: 210, height: 297 },
      template: { id: "unexpected", version: 1 },
    };
    const parsed = parseDocument(legacy);
    expect(parsed.outputSizeMm).toBeUndefined();
    expect(parsed.template).toBeUndefined();
  });

  it("accepts the shared schema-v2 A4 fixture including physical output metadata", () => {
    const parsed = parseDocument(schemaV2Fixture);
    expect(parsed.width).toBe(794);
    expect(parsed.height).toBe(1123);
    expect(parsed.outputSizeMm).toEqual({ width: 210, height: 297 });
    expect(parsed.template).toEqual({ id: "exam-paper-a4", version: 1 });
  });

  it("accepts schema-v3 background image documents after v4 upgrade", () => {
    const parsed = parseDocument(schemaV3BackgroundFixture);
    expect(parsed.backgroundImage?.fit).toBe("cover");
    expect(parsed.elements).toHaveLength(1);
  });

  it("accepts the shared schema-v4 frame and grid fixture", () => {
    const parsed = parseDocument(schemaV4FramesGridsFixture);
    expect(parsed.elements).toEqual([
      { id: "frame-1", type: "frame", x: 24, y: 32, width: 300, height: 180, strokeColor: "#2563eb", strokeWidth: 2, fillColor: "#ffffff" },
      { id: "grid-1", type: "grid", x: 360, y: 32, width: 240, height: 180, rows: 3, columns: 4, strokeColor: "#64748b", strokeWidth: 1 },
    ]);
    expect(toDocument(parsed.elements).schema_version).toBe(4);
  });

  it("rejects invalid frame and grid styles", () => {
    const invalidFrame = schemaV4FramesGridsFixture as unknown as DesignDocument;
    const badFrame = structuredClone(invalidFrame);
    badFrame.elements[0]!.kind = { type: "frame", stroke_color: "#fff", stroke_width: 101 } as never;
    expect(() => parseDocument(badFrame)).toThrow(/stroke width/);
    const badGrid = structuredClone(invalidFrame);
    badGrid.elements[1]!.kind = { type: "grid", rows: 21, columns: 2, stroke_color: "#fff", stroke_width: 1 } as never;
    expect(() => parseDocument(badGrid)).toThrow(/rows and columns/);
  });

  it("accepts portable schema-v3 PNG backgrounds and preserves fit mode", () => {
    const document = validDocument();
    document.page.background_image = {
      data_url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jZl8AAAAASUVORK5CYII=",
      fit: "cover",
    };
    const parsed = parseDocument(document);
    expect(parsed.backgroundImage).toEqual(document.page.background_image);
    const serialized = toDocument(parsed.elements, {
      width: parsed.width, height: parsed.height, background: parsed.background,
      background_image: parsed.backgroundImage,
    });
    expect(parseDocument(serialized).backgroundImage).toEqual(document.page.background_image);
  });

  it("rejects remote, SVG, malformed base64 and oversized background assets", () => {
    const invalidValues = [
      "https://example.invalid/background.png",
      "data:image/svg+xml;base64,PHN2Zz4=",
      "data:image/png;base64,not base64!",
      "data:image/png;base64,",
      "data:image/png;base64," + "A".repeat(1_048_560),
    ];
    for (const data_url of invalidValues) {
      const document = validDocument();
      document.page.background_image = { data_url, fit: "contain" };
      expect(() => parseDocument(document)).toThrow(/Background image/);
    }
  });
  it("accepts valid text and rectangle elements and converts them to editor elements", () => {
    const parsed = parseDocument(validDocument());
    expect(parsed.width).toBe(PAGE_WIDTH);
    expect(parsed.height).toBe(PAGE_HEIGHT);
    expect(parsed.elements).toEqual([
      { id: "title-1", type: "text", text: "Exam Paper", x: 10, y: 20, width: 300, height: 60, fontSize: 28, color: "#123456" },
      { id: "rect-2", type: "rect", x: 50, y: 100, width: 200, height: 80, color: "#abc" },
    ]);
  });

  it("round-trips editor elements through the versioned document format", () => {
    const elements: DesignElement[] = parseDocument(validDocument()).elements;
    expect(parseDocument(toDocument(elements)).elements).toEqual(elements);
  });

  it("rejects a non-object document and invalid JSON", () => {
    expect(() => parseDocument(null)).toThrow(/JSON document object/);
    expect(() => parseDocumentJson("{broken")).toThrow(/valid JSON/);
    expect(() => parseDocumentJson("[]")).toThrow(/JSON document object/);
  });

  it("rejects unknown schema versions and unsupported page dimensions", () => {
    const wrongVersion = validDocument();
    wrongVersion.schema_version = 999;
    expect(() => parseDocument(wrongVersion)).toThrow(/schema version/);

    const wrongPage = validDocument();
    wrongPage.schema_version = 1;
    wrongPage.page.width = 1000;
    expect(() => parseDocument(wrongPage)).toThrow(/800 × 600/);
  });

  it("rejects duplicate, empty, and oversized element IDs", () => {
    const duplicate = validDocument();
    duplicate.elements[1]!.id = duplicate.elements[0]!.id;
    expect(() => parseDocument(duplicate)).toThrow(/Duplicate element IDs/);

    const empty = validDocument();
    empty.elements[0]!.id = "";
    expect(() => parseDocument(empty)).toThrow(/invalid ID/);

    const long = validDocument();
    long.elements[0]!.id = "x".repeat(129);
    expect(() => parseDocument(long)).toThrow(/invalid ID/);
  });

  it("enforces the Rust UTF-8 byte limit for element and template IDs", () => {
    const oversizedElementId = validDocument();
    oversizedElementId.elements[0]!.id = "😀".repeat(33);
    expect(() => parseDocument(oversizedElementId)).toThrow(/invalid ID/);

    const oversizedTemplateId = validDocument();
    oversizedTemplateId.template = { id: "😀".repeat(33), version: 1 };
    expect(() => parseDocument(oversizedTemplateId)).toThrow(/Template metadata/);
  });

  it("rejects invalid geometry including non-finite values", () => {
    const zeroWidth = validDocument();
    zeroWidth.elements[0]!.width = 0;
    expect(() => parseDocument(zeroWidth)).toThrow(/geometry/);

    const hugeCoordinate = validDocument();
    hugeCoordinate.elements[0]!.x = 100001;
    expect(() => parseDocument(hugeCoordinate)).toThrow(/geometry/);

    const nonFinite = validDocument();
    nonFinite.elements[0]!.x = Number.POSITIVE_INFINITY;
    expect(() => parseDocument(nonFinite)).toThrow(/geometry/);
  });

  it("rejects unsupported colors and element types", () => {
    const badColor = validDocument();
    badColor.elements[0]!.kind.color = "url(javascript:alert(1))";
    expect(() => parseDocument(badColor)).toThrow(/invalid color/);

    const badType = validDocument();
    badType.elements[0]!.kind = { type: "image", color: "#fff" } as never;
    expect(() => parseDocument(badType)).toThrow(/Unsupported element type/);
  });

  it("enforces text and font-size limits", () => {
    const tooMuchText = validDocument();
    tooMuchText.elements[0]!.kind = {
      type: "text",
      text: "x".repeat(MAX_TEXT_CHARS + 1),
      font_size: 12,
      color: "#000",
    };
    expect(() => parseDocument(tooMuchText)).toThrow(/10,000 characters/);

    const badFont = validDocument();
    badFont.elements[0]!.kind = { type: "text", text: "x", font_size: 513, color: "#000" };
    expect(() => parseDocument(badFont)).toThrow(/Font size/);
  });

  it("allows the maximum element count but rejects one extra", () => {
    const doc = validDocument();
    const element = doc.elements[1]!;
    doc.elements = Array.from({ length: MAX_ELEMENTS }, (_, index) => ({ ...element, id: `rect-${index}` }));
    expect(parseDocument(doc).elements).toHaveLength(MAX_ELEMENTS);
    doc.elements.push({ ...element, id: "one-too-many" });
    expect(() => parseDocument(doc)).toThrow(/at most 1,000 elements/);
  });

  it("rejects JSON input over the character limit before parsing", () => {
    expect(() => parseDocumentJson(" ".repeat(MAX_FILE_CHARS + 1))).toThrow(/2 MB limit/);
  });
});
