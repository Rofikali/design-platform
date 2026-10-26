//! Framework-independent, versioned design document model.
//!
//! Coordinates use logical pixels at a 96-units-per-inch reference scale.
//! This crate intentionally contains no browser, filesystem, network, or rendering code.

use serde::{Deserialize, Serialize};
use std::collections::HashSet;

pub const CURRENT_SCHEMA_VERSION: u32 = 2;
pub const MAX_PAGE_DIMENSION: f64 = 10_000.0;
pub const MAX_PAGE_AREA: f64 = 25_000_000.0;
pub const MAX_ASPECT_RATIO: f64 = 10.0;
pub const MAX_OUTPUT_DIMENSION_MM: f64 = 2_000.0;
pub const MAX_ELEMENTS: usize = 1_000;
pub const MAX_TEXT_CHARS: usize = 10_000;
const MAX_COORDINATE_ABS: f64 = 100_000.0;
const PRINT_ASPECT_RATIO_TOLERANCE: f64 = 0.01;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DesignDocument {
    pub schema_version: u32,
    pub page: Page,
    pub elements: Vec<Element>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub output_size_mm: Option<OutputSizeMm>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub template: Option<TemplateMetadata>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Page {
    pub width: f64,
    pub height: f64,
    pub background: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct OutputSizeMm {
    pub width: f64,
    pub height: f64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TemplateMetadata {
    pub id: String,
    pub version: u32,
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
    InvalidLegacyPageDimensions,
    InvalidPageDimensions,
    InvalidPageArea,
    InvalidAspectRatio,
    InvalidOutputSize,
    OutputAspectRatioMismatch,
    InvalidTemplateMetadata,
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
    /// Validate only the current schema. Call migrate_to_current before validating imported data.
    pub fn validate(&self) -> Result<(), ValidationError> {
        if self.schema_version != CURRENT_SCHEMA_VERSION {
            return Err(ValidationError::UnsupportedSchemaVersion);
        }
        if !valid_dimension(self.page.width) || !valid_dimension(self.page.height) {
            return Err(ValidationError::InvalidPageDimensions);
        }
        if self.page.width * self.page.height > MAX_PAGE_AREA {
            return Err(ValidationError::InvalidPageArea);
        }
        let ratio = self.page.width / self.page.height;
        if !(1.0 / MAX_ASPECT_RATIO..=MAX_ASPECT_RATIO).contains(&ratio) {
            return Err(ValidationError::InvalidAspectRatio);
        }
        if !valid_color(&self.page.background) {
            return Err(ValidationError::InvalidBackground);
        }
        if let Some(output) = &self.output_size_mm {
            if !valid_output_dimension(output.width) || !valid_output_dimension(output.height) {
                return Err(ValidationError::InvalidOutputSize);
            }
            let output_ratio = output.width / output.height;
            let relative_error = (ratio - output_ratio).abs() / ratio;
            if !relative_error.is_finite() || relative_error > PRINT_ASPECT_RATIO_TOLERANCE {
                return Err(ValidationError::OutputAspectRatioMismatch);
            }
        }
        if let Some(template) = &self.template {
            if template.id.is_empty() || template.id.len() > 128 || template.version == 0 {
                return Err(ValidationError::InvalidTemplateMetadata);
            }
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
                    if !valid_color(color) { return Err(ValidationError::InvalidColor); }
                }
            }
        }
        Ok(())
    }
}

/// Migrate a supported legacy document to schema v2 without inventing print intent.
pub fn migrate_to_current(mut document: DesignDocument) -> Result<DesignDocument, ValidationError> {
    match document.schema_version {
        1 => {
            if document.page.width != 800.0 || document.page.height != 600.0 {
                return Err(ValidationError::InvalidLegacyPageDimensions);
            }
            document.schema_version = CURRENT_SCHEMA_VERSION;
            document.output_size_mm = None;
            document.template = None;
        }
        CURRENT_SCHEMA_VERSION => {}
        _ => return Err(ValidationError::UnsupportedSchemaVersion),
    }
    document.validate()?;
    Ok(document)
}

fn valid_dimension(value: f64) -> bool {
    value.is_finite() && value > 0.0 && value <= MAX_PAGE_DIMENSION
}
fn valid_output_dimension(value: f64) -> bool {
    value.is_finite() && value > 0.0 && value <= MAX_OUTPUT_DIMENSION_MM
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
            output_size_mm: None,
            template: None,
        }
    }

    #[test]
    fn accepts_valid_document() {
        assert_eq!(valid_document().validate(), Ok(()));
    }

    #[test]
    fn rejects_unknown_schema_version() {
        let mut document = valid_document();
        document.schema_version = 999;
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
        assert_eq!(document.validate(), Err(ValidationError::InvalidBackground));
    }

    #[test]
    fn round_trips_json_document() {
        let document = valid_document();
        let json = serde_json::to_string(&document).expect("serialize");
        let restored: DesignDocument = serde_json::from_str(&json).expect("deserialize");
        assert_eq!(restored, document);
        assert_eq!(restored.validate(), Ok(()));
    }

    #[test]
    fn migrates_shared_v1_fixture_without_inventing_print_size() {
        let fixture: serde_json::Value =
            serde_json::from_str(include_str!("../../../fixtures/document-v1.json"))
                .expect("fixture");
        let document: DesignDocument = serde_json::from_value(fixture).expect("deserialize v1");
        let migrated = migrate_to_current(document).expect("migration");
        assert_eq!(migrated.schema_version, 2);
        assert_eq!(migrated.page.width, 800.0);
        assert_eq!(migrated.page.height, 600.0);
        assert_eq!(migrated.output_size_mm, None);
        assert_eq!(migrated.template, None);
        assert_eq!(migrated.elements.len(), 2);
    }

    #[test]
    fn accepts_shared_schema_v2_a4_fixture() {
        let fixture: serde_json::Value =
            serde_json::from_str(include_str!("../../../fixtures/document-v2-a4.json"))
                .expect("v2 fixture");
        let document: DesignDocument = serde_json::from_value(fixture).expect("deserialize v2");
        assert_eq!(document.validate(), Ok(()));
    }

    #[test]
    fn accepts_a4_geometry_and_matching_print_size() {
        let mut document = valid_document();
        document.page.width = 794.0;
        document.page.height = 1123.0;
        document.output_size_mm = Some(OutputSizeMm {
            width: 210.0,
            height: 297.0,
        });
        assert_eq!(document.validate(), Ok(()));
    }

    #[test]
    fn accepts_banner_geometry_and_matching_print_size() {
        let mut document = valid_document();
        document.page.width = 1200.0;
        document.page.height = 600.0;
        document.output_size_mm = Some(OutputSizeMm {
            width: 600.0,
            height: 300.0,
        });
        assert_eq!(document.validate(), Ok(()));
    }

    #[test]
    fn rejects_print_size_aspect_ratio_mismatch() {
        let mut document = valid_document();
        document.output_size_mm = Some(OutputSizeMm {
            width: 210.0,
            height: 297.0,
        });
        assert_eq!(
            document.validate(),
            Err(ValidationError::OutputAspectRatioMismatch)
        );
    }

    #[test]
    fn rejects_page_area_limit() {
        let mut document = valid_document();
        document.page.width = 10_000.0;
        document.page.height = 3_000.0;
        assert_eq!(document.validate(), Err(ValidationError::InvalidPageArea));
    }

    #[test]
    fn rejects_invalid_template_metadata() {
        let mut document = valid_document();
        document.template = Some(TemplateMetadata {
            id: "".into(),
            version: 1,
        });
        assert_eq!(
            document.validate(),
            Err(ValidationError::InvalidTemplateMetadata)
        );
    }
}
