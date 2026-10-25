import { describe, expect, it } from "vitest";
import sharedDocumentFixture from "../../fixtures/document-v1.json";
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
    schema_version: 1,
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
    expect(toDocument(parsed.elements)).toEqual(sharedDocumentFixture);
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
    wrongVersion.schema_version = 2;
    expect(() => parseDocument(wrongVersion)).toThrow(/schema version/);

    const wrongPage = validDocument();
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
