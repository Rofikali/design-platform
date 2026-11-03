# Manual Accessibility Audit — Editor MVP

## Purpose and evidence rule

This worksheet records hands-on accessibility verification that automated tests cannot establish. **Do not mark a check Pass until it has been performed with the listed browser/assistive technology and the observed result has been recorded.** A CI pass is not a substitute for this audit.

Issue: [#82 — Complete manual accessibility audit for the editor MVP](https://github.com/Rofikali/design-platform/issues/82)

## Test environment

Complete before testing:

| Field | Value |
|---|---|
| Test date (YYYY-MM-DD) | Not recorded |
| Application commit / release | Not recorded |
| OS and version | Not recorded |
| Browser and version | Not recorded |
| Screen reader and version | Not recorded / not used |
| Viewport size | Not recorded |
| Tester | Not recorded |

Recommended combinations:
- Windows: NVDA with Firefox or Chrome.
- macOS: VoiceOver with Safari.
- Keyboard-only pass in at least one supported desktop browser.

## Result vocabulary

Use **Pass**, **Fail**, **Blocked**, or **Not run**. Keep the default as **Not run** until evidence exists. For each failure, record a reproducible step and open/link a defect.

## Keyboard-only workflow

Use only keyboard input (Tab, Shift+Tab, Enter, Space, arrow keys, and documented browser shortcuts). Do not use a mouse or touch.

| Check | Expected result | Status | Actual result / evidence |
|---|---|---|---|
| Reach template selector and choose each template | Focus is visible; selector has a useful name; chosen template can be applied with keyboard | Not run | |
| Use template | New template loads; focus remains predictable | Not run | |
| Add text and rectangle | Both actions are reachable and activate with keyboard | Not run | |
| Navigate to canvas elements | Each element is reachable; accessible name identifies element type/content; selected state is conveyed | Not run | |
| Edit selected text, color, font size, width, height | Inputs have labels; values can be changed without pointer | Not run | |
| Move selected element using movement controls | Each direction is named and operable; movement remains within page bounds | Not run | |
| Undo and redo | Controls are reachable; disabled state is understandable; operation result is announced | Not run | |
| Import JSON | File picker can be opened; valid import succeeds; rejected import preserves current document | Not run | |
| Export JSON, PNG, and print/PDF | Each action is keyboard-operable and result/status is announced | Not run | |
| Focus order and recovery | Order follows the workflow; no lost focus, unexpected jump, or keyboard trap | Not run | |

Record any browser-native file picker or print dialog behavior separately if it differs by platform.

## Screen-reader review

For each selected combination, read the interface from the start and complete the workflow above.

| Check | Expected result | Status | Actual announcement / evidence |
|---|---|---|---|
| Page landmarks and headings | Main content, tool panel, canvas, and headings are discoverable | Not run | |
| Canvas group | “Editable design page” (or equivalent meaningful name) is announced as a group | Not run | |
| Element buttons | Element type/content and selected/pressed state are announced | Not run | |
| Selection changes | New selection is announced once, without noisy repetition | Not run | |
| Text/style/geometry controls | Labels, values, and relevant constraints are understandable | Not run | |
| Move controls | Group name and each direction are announced | Not run | |
| Import/export/status | Success and failure outcomes are announced; errors are actionable | Not run | |
| Recovery panel | Problem, preservation behavior, and recovery actions are discoverable | Not run | |
| Disabled undo/redo | Disabled state is announced and not presented as actionable | Not run | |

## Zoom, reflow, focus, and contrast

| Check | Expected result | Status | Actual result / evidence |
|---|---|---|---|
| Browser zoom at 200% | Critical controls remain available; no content/action is clipped or lost | Not run | |
| Narrow viewport (record width) | Tools and canvas remain usable; page can be reached by scrolling | Not run | |
| Focus indicator | Every keyboard-focused control has a clearly visible indicator | Not run | |
| Text contrast | Normal text ≥ 4.5:1; large text ≥ 3:1, unless documented exception applies | Not run | |
| Control boundaries and focus indicators | Non-text contrast ≥ 3:1 against adjacent colors where required | Not run | |
| Selected element outline | Selection is perceivable without relying only on color | Not run | |
| Color picker / color meaning | Color is not the only means of conveying state or information | Not run | |

For contrast, record foreground/background colors, measured ratio, tool, and affected selector/element. Automated checks currently cover only selected known text surfaces; they are not a full-page contrast audit.

## Findings log

| ID | Severity | Environment | Reproduction steps | Expected | Actual | Evidence / issue |
|---|---|---|---|---|---|---|
| A11Y-001 | — | — | — | — | No findings recorded yet | — |

## Sign-off

- [ ] Keyboard-only critical workflow completed.
- [ ] Screen-reader workflow completed on at least one supported combination.
- [ ] 200% zoom and narrow viewport checked.
- [ ] Contrast measurements recorded.
- [ ] Critical/high findings fixed or explicitly accepted with owner and rationale.
- [ ] Results and evidence linked from issue #82.
- [ ] README and testing strategy accurately reflect the audit outcome.

**Audit status: Not run.** This is a prepared worksheet, not evidence of completed manual testing.
