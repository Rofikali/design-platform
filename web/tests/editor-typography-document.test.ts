import { describe, expect, it } from "vitest";
import v1 from "../../fixtures/document-v1.json";
import { editorTextStyles, parseEditorDocumentJson, serializeEditorDocument } from "../utils/editor-typography-document";
import { createHistory, recordHistory, undoHistory, redoHistory } from "../utils/document-history";
import { validateEditorDocumentJson } from "../utils/document-validation";

describe("editor typography persistence", () => {
  const page = { width: 800, height: 600, background: "#ffffff" };
  it("preserves v5 defaults and round-trips styled v7 through history", async () => {
    const parsed = parseEditorDocumentJson(JSON.stringify(v1));
    const before = serializeEditorDocument(parsed.elements, page);
    expect(JSON.parse(before).schema_version).toBe(5);
    const text = parsed.elements[0]!;
    if (text.type !== "text") throw new Error("Expected text fixture");
    text.textStyle = { font_family: "serif", font_weight: "bold", font_style: "italic" };
    const after = serializeEditorDocument(parsed.elements, page);
    expect(JSON.parse(after).schema_version).toBe(7);
    const validated = await validateEditorDocumentJson(after);
    expect(editorTextStyles(parseEditorDocumentJson(validated.json).elements)).toEqual(editorTextStyles(parsed.elements));
    const history = recordHistory(createHistory(before), after);
    const undone = undoHistory(history, after);
    expect(editorTextStyles(parseEditorDocumentJson(undone.snapshot!).elements)).toBeUndefined();
    const redone = redoHistory(undone.history, undone.snapshot!);
    expect(editorTextStyles(parseEditorDocumentJson(redone.snapshot!).elements)).toEqual(editorTextStyles(parsed.elements));
    text.textStyle = { font_family: "sans", font_weight: "normal", font_style: "normal" };
    expect(serializeEditorDocument(parsed.elements, page)).toBe(before);
  });
});

describe("legacy typography safety", () => {
  it("rejects style bindings in legacy documents instead of silently discarding them", () => {
    expect(() => parseEditorDocumentJson(JSON.stringify({ ...v1, text_styles: [] }))).toThrow("Typography styles require schema version 7");
  });
});
