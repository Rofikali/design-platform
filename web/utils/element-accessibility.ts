import type { DesignElement } from "./document";

/**
 * Keep canvas selection names accurate for keyboard and screen-reader users.
 * In particular, a semantic Table is not the visual-only Grid primitive.
 */
export function getElementSelectionLabel(element: DesignElement): string {
  switch (element.type) {
    case "text":
      return `Select text element: ${element.text.slice(0, 80)}`;
    case "rect":
      return "Select rectangle element";
    case "frame":
      return "Select frame element";
    case "grid":
      return `Select grid element with ${element.rows} rows and ${element.columns} columns`;
    case "table":
      return `Select table element with ${element.rows} rows and ${element.columns} columns`;
  }
}
