import { describe, expect, it } from "vitest";
import v1 from "../../fixtures/document-v1.json";
import { editorTextLayouts, editorTextStyles, parseEditorDocumentJson, serializeEditorDocument } from "../utils/editor-typography-document";
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
  it("rejects style bindings in legacy documents instead of silently discarding them", async () => {
    const legacy = JSON.stringify({ ...v1, text_styles: [] });
    expect(() => parseEditorDocumentJson(legacy)).toThrow("Typography styles require schema version 7");
    await expect(validateEditorDocumentJson(legacy)).rejects.toThrow("Typography styles require schema version 7");
  });
});

describe("layout downgrade protection", () => {
  it("rejects layout fields in v5 and v7 rather than losing formatting", async () => {
    const styled = { ...v1, schema_version: 7, text_styles: [{ element_id: "title-1",
      style: { font_family: "sans", font_weight: "normal", font_style: "normal" } }] };
    for (const doc of [{ ...v1, schema_version: 5 }, styled]) {
      const input = JSON.stringify({ ...doc, text_layouts: [] });
      expect(() => parseEditorDocumentJson(input)).toThrow("Advanced text layout");
      await expect(validateEditorDocumentJson(input)).rejects.toThrow("Advanced text layout");
    }
  });
});


describe("editor v8 layout persistence", () => {
  it("preserves v5 and v7 defaults and v8 layout through validation, undo and redo", async () => {
    const parsed = parseEditorDocumentJson(JSON.stringify(v1));
    const page = { width: parsed.width, height: parsed.height, background: parsed.background };
    const before = serializeEditorDocument(parsed.elements, page);
    const text = parsed.elements.find(e => e.type === "text")!;
    if (text.type !== "text") throw new Error("Expected text fixture");
    text.textLayout = { alignment: "center", lineHeight: 2, letterSpacing: 3 };
    const advanced = serializeEditorDocument(parsed.elements, page);
    const doc = JSON.parse(advanced);
    expect(doc.schema_version).toBe(8);
    expect(doc.text_styles[0].style.font_family).toBe("sans");
    const validated = await validateEditorDocumentJson(advanced);
    expect(editorTextLayouts(parseEditorDocumentJson(validated.json).elements)).toEqual(editorTextLayouts(parsed.elements));
    const history = recordHistory(createHistory(before), advanced);
    const undone = undoHistory(history, advanced);
    expect(editorTextLayouts(parseEditorDocumentJson(undone.snapshot!).elements)).toBeUndefined();
    const redone = redoHistory(undone.history, undone.snapshot!);
    expect(editorTextLayouts(parseEditorDocumentJson(redone.snapshot!).elements)).toEqual(editorTextLayouts(parsed.elements));
    text.textLayout = { alignment: "left", lineHeight: 1.25, letterSpacing: 0 };
    expect(serializeEditorDocument(parsed.elements, page)).toBe(before);
    await expect(validateEditorDocumentJson(JSON.stringify({ ...doc, text_layouts: [] }))).rejects.toThrow();
  });
});
