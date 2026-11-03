# MVP: Shared Editor for Two Templates

## Product goal
Help a user create a clean, reusable design and export it reliably without needing a full professional desktop publishing tool.

## First users and jobs
- Teachers, tutors, or small education providers preparing an exam paper.
- Small shop owners preparing a printable or digital shop banner.

These are hypotheses to validate with real users, not proven market demand.

## MVP user journey
1. Open the app and choose **Exam Paper** or **Shop Banner**.
2. Optionally upload a page background image (PNG/JPEG/WebP) and choose Cover or Contain.
3. Edit text and basic shapes on a canvas; select, move, resize, and style elements.
4. Undo and redo edits.
5. Save the document.
6. Reopen it and confirm the layout and content remain intact.
7. Export to PDF with the intended page dimensions and readable text.

## Required editor capabilities
- Add, select, move, and resize text and basic shapes.
- Edit text content, font family from an approved list, font size, weight, alignment, and color.
- Basic fill, stroke, and background controls.
- Undo/redo for user-visible editing commands.
- Save/reopen with a versioned document format.
- Clear errors for invalid or unsupported input.
- Keyboard-accessible controls for core operations.

## First template requirements

### Exam paper
- Page-oriented layout with configurable title, subject, class/grade, duration, instructions, question text, and marks.
- A4 portrait as the initial preset.
- Printable margins and readable typography.
- No implication that the generated paper is officially approved by any institution.

### Shop banner
- One configurable landscape preset with editable headline, supporting text, and simple shapes.
- Editable background and text colors.
- Explicit export dimensions shown to the user.
- Do not use copyrighted logos or assets without permission.

## Out of scope for this milestone
- Billing, subscriptions, marketplace, team collaboration, real-time multi-user editing.
- Hundreds of templates or a template marketplace.
- Animation, video, complex vector path editing, advanced typography, and arbitrary plugins.
- Native mobile applications.
- Microservices, Kubernetes, Redis, and complex job infrastructure without demonstrated need.
- Ticket, identity-card, or official document workflows that could be mistaken for valid issued documents.

## Acceptance criteria
- Both templates use the same document model and core editing operations.
- A user can create, edit, undo, redo, save, close/reopen, and export both templates.
- Exported PDF page dimensions and key content match the saved document.
- Font availability/fallback behavior is documented and tested.
- Invalid dimensions, excessive content, and unsupported values are rejected safely.
- Automated tests cover document validation, command history, persistence compatibility, and export regressions.
- The project records the exact test commands and results; no test is considered passed without execution.

## Validation before expanding scope
Interview a small number of teachers/tutors and shop owners. Observe whether they can complete the journey without coaching. Track completion rate, time to first export, export failures, repeat use, and willingness to pay. Do not treat sign-ups or compliments alone as proof of product-market fit.
