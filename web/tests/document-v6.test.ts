import { describe, expect, it } from "vitest";
import { parseDocument, toDocument } from "../utils/document";
import { parseStagedDocumentV6 } from "../utils/document-v6";
import { makeForegroundImageElementV6 } from "../utils/foreground-image-v6";

const image = makeForegroundImageElementV6("image-1", {
  x: 10, y: 20, width: 80, height: 60,
  intrinsic_width: 80, intrinsic_height: 60,
  data_url: "data:image/png;base64,iVBORw0KGgo=",
});
const rect = { id: "rect-1", type: "rect" as const, x: 1, y: 2, width: 30, height: 40, color: "#ffffff" };
const legacy = toDocument([rect]);
const v6 = () => ({ ...legacy, schema_version: 6, elements: [image, ...legacy.elements] });

describe("staged schema-v6 import boundary", () => {
  it("preserves ordered image and legacy elements without mutating input", () => {
    const input = JSON.parse(JSON.stringify(v6()));
    const before = structuredClone(input);
    const result = parseStagedDocumentV6(input);
    expect(result.elements).toEqual([image, rect]);
    expect(input).toEqual(before);
  });

  it("keeps v5 parser rejecting v6 until production migration is ready", () => {
    expect(() => parseDocument(v6())).toThrow(/Unsupported document schema version/);
    expect(parseDocument(legacy).elements).toEqual([rect]);
  });

  it("rejects duplicate IDs across legacy and image kinds", () => {
    expect(() => parseStagedDocumentV6({
      ...v6(), elements: [{ ...image, id: "rect-1" }, ...legacy.elements],
    })).toThrow(/Duplicate element IDs/);
  });

  it("rejects oversized v6 JSON even when the legacy subset is small", () => {
    const oversized = { ...v6(), unused_metadata: "x".repeat(2_000_001) };
    expect(() => parseStagedDocumentV6(oversized)).toThrow(/2 MB limit/);
  });

  it("rejects cyclic input instead of accepting an unserializable document", () => {
    const cyclic = v6() as ReturnType<typeof v6> & { extra?: unknown };
    cyclic.extra = cyclic;
    expect(() => parseStagedDocumentV6(cyclic)).toThrow(/serializable/);
  });

  it("rejects invalid page geometry and malformed image data", () => {
    expect(() => parseStagedDocumentV6({ ...v6(), page: { ...legacy.page, width: -1 } })).toThrow();
    expect(() => parseStagedDocumentV6({
      ...v6(), elements: [{ ...image, kind: { ...image.kind, intrinsic_width: 0 } }],
    })).toThrow();
  });

  it("rejects unknown kinds and incorrect schema versions", () => {
    expect(() => parseStagedDocumentV6({ ...v6(), schema_version: 5 })).toThrow();
    expect(() => parseStagedDocumentV6({ ...v6(), elements: [{ id: "bad", kind: { type: "script" } }] })).toThrow();
  });
});
