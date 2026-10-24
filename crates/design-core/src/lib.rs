//! Framework-independent, versioned design document model.
//!
//! Coordinates use logical pixels. This crate intentionally contains no browser,
//! filesystem, network, or rendering code so it can later be reused by native
//! services and a WebAssembly adapter.

use serde::{Deserialize, Serialize};
use std::collections::HashSet;

pub const CURRENT_SCHEMA_VERSION: u32 = 1;
pub const MAX_PAGE_DIMENSION: f64 = 10_000.0;
pub const MAX_ELEMENTS: usize = 1_000;
pub const MAX_TEXT_CHARS: usize = 10_000;
const MAX_COORDINATE_ABS: f64 = 100_000.0;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DesignDocument {
    pub schema_version: u32,
    pub page: Page,
    pub elements: Vec<Element>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Page {
    pub width: f64,
    pub height: f64,
    pub background: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Element {
    pub id: String,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub kind: ElementKind,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ElementKind {
    Text {
        text: String,
        font_size: f64,
        color: String,
    },
    Rect {
        color: String,
    },
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ValidationError {
    UnsupportedSchemaVersion,
    InvalidPageDimensions,
    InvalidBackground,
    TooManyElements,
    EmptyOrLongElementId,
    DuplicateElementId,
    InvalidElementGeometry,
    InvalidTextLength,
    InvalidFontSize,
    InvalidColor,
}

impl DesignDocument {
    /// Validate untrusted document data before rendering, storing, or exporting it.
    pub fn validate(&self) -> Result<(), ValidationError> {
        if self.schema_version != CURRENT_SCHEMA_VERSION {
            return Err(ValidationError::UnsupportedSchemaVersion);
        }
        if !valid_dimension(self.page.width) || !valid_dimension(self.page.height) {
            return Err(ValidationError::InvalidPageDimensions);
        }
        if !valid_color(&self.page.background) {
            return Err(ValidationError::InvalidBackground);
        }
        if self.elements.len() > MAX_ELEMENTS {
            return Err(ValidationError::TooManyElements);
        }

        let mut ids = HashSet::with_capacity(self.elements.len());
        for element in &self.elements {
            if element.id.is_empty() || element.id.len() > 128 {
                return Err(ValidationError::EmptyOrLongElementId);
            }
            if !ids.insert(&element.id) {
                return Err(ValidationError::DuplicateElementId);
            }
            if !valid_coordinate(element.x)
                || !valid_coordinate(element.y)
                || !valid_dimension(element.width)
                || !valid_dimension(element.height)
            {
                return Err(ValidationError::InvalidElementGeometry);
            }

            match &element.kind {
                ElementKind::Text {
                    text,
                    font_size,
                    color,
                } => {
                    if text.chars().count() > MAX_TEXT_CHARS {
                        return Err(ValidationError::InvalidTextLength);
                    }
                    if !font_size.is_finite() || !(1.0..=512.0).contains(font_size) {
                        return Err(ValidationError::InvalidFontSize);
                    }
                    if !valid_color(color) {
                        return Err(ValidationError::InvalidColor);
                    }
                }
                ElementKind::Rect { color } => {
                    if !valid_color(color) {
                        return Err(ValidationError::InvalidColor);
                    }
                }
            }
        }
        Ok(())
    }
}

fn valid_dimension(value: f64) -> bool {
    value.is_finite() && value > 0.0 && value <= MAX_PAGE_DIMENSION
}

fn valid_coordinate(value: f64) -> bool {
    value.is_finite() && value.abs() <= MAX_COORDINATE_ABS
}

/// Accept only #RGB or #RRGGBB hexadecimal colors; no CSS expressions or URLs.
fn valid_color(value: &str) -> bool {
    let digits = value.strip_prefix('#').unwrap_or("");
    matches!(digits.len(), 3 | 6) && digits.chars().all(|c| c.is_ascii_hexdigit())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn valid_document() -> DesignDocument {
        DesignDocument {
            schema_version: CURRENT_SCHEMA_VERSION,
            page: Page {
                width: 800.0,
                height: 600.0,
                background: "#fff".into(),
            },
            elements: vec![Element {
                id: "heading-1".into(),
                x: 20.0,
                y: 30.0,
                width: 300.0,
                height: 60.0,
                kind: ElementKind::Text {
                    text: "Hello".into(),
                    font_size: 32.0,
                    color: "#111111".into(),
                },
            }],
        }
    }

    #[test]
    fn accepts_valid_document() {
        assert_eq!(valid_document().validate(), Ok(()));
    }

    #[test]
    fn rejects_unknown_schema_version() {
        let mut document = valid_document();
        document.schema_version = CURRENT_SCHEMA_VERSION + 1;
        assert_eq!(
            document.validate(),
            Err(ValidationError::UnsupportedSchemaVersion)
        );
    }

    #[test]
    fn rejects_duplicate_ids() {
        let mut document = valid_document();
        let mut duplicate = document.elements[0].clone();
        duplicate.x = 50.0;
        document.elements.push(duplicate);
        assert_eq!(
            document.validate(),
            Err(ValidationError::DuplicateElementId)
        );
    }

    #[test]
    fn rejects_non_finite_geometry() {
        let mut document = valid_document();
        document.elements[0].x = f64::NAN;
        assert_eq!(
            document.validate(),
            Err(ValidationError::InvalidElementGeometry)
        );
    }

    #[test]
    fn rejects_css_like_color_values() {
        let mut document = valid_document();
        document.page.background = "url(https://example.invalid)".into();
        assert_eq!(
            document.validate(),
            Err(ValidationError::InvalidBackground)
        );
    }

    #[test]
    fn round_trips_json_document() {
        let document = valid_document();
        let json = serde_json::to_string(&document).expect("serialize");
        let restored: DesignDocument = serde_json::from_str(&json).expect("deserialize");
        assert_eq!(restored, document);
        assert_eq!(restored.validate(), Ok(()));
    }
}
