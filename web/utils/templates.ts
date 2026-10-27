import {
  parseDocument,
  toDocument,
  type DesignElement,
  type DesignDocument,
} from "~/utils/document";

export type TemplateId = "exam-paper-a4" | "shop-banner-landscape";

export type TemplateDefinition = {
  id: TemplateId;
  name: string;
  description: string;
  page: { width: number; height: number; background: string };
  outputSizeMm: { width: number; height: number };
  elements: DesignElement[];
};

/**
 * Small, versioned starter catalog. Definitions contain only element types the
 * current editor can actually render; richer typography belongs in a later slice.
 */
const templates: readonly TemplateDefinition[] = [
  {
    id: "exam-paper-a4",
    name: "Exam Paper",
    description: "A4 portrait page with a title, subject details, and instructions.",
    page: { width: 794, height: 1123, background: "#ffffff" },
    outputSizeMm: { width: 210, height: 297 },
    elements: [
      { id: "exam-title", type: "text", text: "EXAMINATION", x: 40, y: 36, width: 714, height: 48, fontSize: 30, color: "#172033" },
      { id: "exam-subject", type: "text", text: "Subject: ____________________", x: 40, y: 110, width: 350, height: 32, fontSize: 18, color: "#172033" },
      { id: "exam-class", type: "text", text: "Class: __________", x: 40, y: 154, width: 280, height: 30, fontSize: 16, color: "#172033" },
      { id: "exam-duration", type: "text", text: "Time: __________", x: 430, y: 154, width: 300, height: 30, fontSize: 16, color: "#172033" },
      { id: "exam-instructions", type: "text", text: "Instructions: Answer all questions. Write clearly.", x: 40, y: 220, width: 714, height: 44, fontSize: 16, color: "#334155" },
      { id: "exam-divider", type: "rect", x: 40, y: 94, width: 714, height: 3, color: "#334155" },
    ],
  },
  {
    id: "shop-banner-landscape",
    name: "Shop Banner",
    description: "A landscape banner with a headline, supporting text, and a simple accent shape.",
    page: { width: 1200, height: 500, background: "#fff7ed" },
    outputSizeMm: { width: 300, height: 125 },
    elements: [
      { id: "banner-accent", type: "rect", x: 0, y: 0, width: 1200, height: 18, color: "#ea580c" },
      { id: "banner-title", type: "text", text: "WELCOME TO OUR SHOP", x: 52, y: 100, width: 1090, height: 76, fontSize: 44, color: "#7c2d12" },
      { id: "banner-subtitle", type: "text", text: "Quality products • Friendly service", x: 56, y: 200, width: 1000, height: 54, fontSize: 26, color: "#9a3412" },
      { id: "banner-footer", type: "text", text: "Visit us today", x: 56, y: 340, width: 500, height: 44, fontSize: 22, color: "#7c2d12" },
    ],
  },
];

function cloneTemplate(template: TemplateDefinition): TemplateDefinition {
  return {
    ...template,
    page: { ...template.page },
    outputSizeMm: { ...template.outputSizeMm },
    elements: template.elements.map((element) => ({ ...element })),
  };
}

export function listTemplates(): readonly TemplateDefinition[] {
  return templates.map(cloneTemplate);
}

export function getTemplateDefinition(id: string): TemplateDefinition | undefined {
  const template = templates.find((candidate) => candidate.id === id);
  return template ? cloneTemplate(template) : undefined;
}

/**
 * Return a fresh document each time so editor mutations never modify the catalog.
 * Validation is intentionally run through the same contract used for imported data.
 */
export function createTemplateDocument(id: TemplateId): DesignDocument {
  const template = getTemplateDefinition(id);
  if (!template) throw new Error(`Unknown design template: ${id}`);

  const document = toDocument(
    template.elements,
    template.page,
    template.outputSizeMm,
    { id: template.id, version: 1 },
  );
  parseDocument(document);
  return document;
}
