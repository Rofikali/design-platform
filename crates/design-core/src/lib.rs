//! Framework-independent, versioned design document model.
//!
//! Coordinates use logical pixels at a 96-units-per-inch reference scale.
//! This crate intentionally contains no browser, filesystem, network, or rendering code.

pub mod foreground_image_v6;
pub mod typography;

use serde::{Deserialize, Serialize};
use std::collections::HashSet;

pub const CURRENT_SCHEMA_VERSION: u32 = 5;
pub const MAX_TABLE_ROWS: u32 = 20;
pub const MAX_TABLE_COLUMNS: u32 = 20;
pub const MAX_TABLE_CELLS: usize = 400;
pub const MAX_TABLE_CELL_CHARS: usize = 2_000;
pub const MAX_TABLE_TEXT_CHARS: usize = 20_000;
pub const MAX_GRID_ROWS: u32 = 20;
pub const MAX_GRID_COLUMNS: u32 = 20;
pub const MAX_STROKE_WIDTH: f64 = 100.0;
pub const MAX_BACKGROUND_IMAGE_DATA_URL_BYTES: usize = 1_048_576;
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
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub background_image: Option<BackgroundImage>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct BackgroundImage {
    pub data_url: String,
    pub fit: BackgroundImageFit,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BackgroundImageFit {
    Cover,
    Contain,
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
    Frame {
        stroke_color: String,
        stroke_width: f64,
        #[serde(default, skip_serializing_if = "Option::is_none")]
        fill_color: Option<String>,
    },
    Grid {
        rows: u32,
        columns: u32,
        stroke_color: String,
        stroke_width: f64,
    },
    Table {
        rows: u32,
        columns: u32,
        cells: Vec<Vec<String>>,
        header_rows: u32,
        stroke_color: String,
        stroke_width: f64,
        cell_padding: f64,
        font_size: f64,
        text_color: String,
        header_fill: String,
        cell_fill: String,
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
    InvalidBackgroundImage,
    TooManyElements,
    EmptyOrLongElementId,
    DuplicateElementId,
    InvalidElementGeometry,
    InvalidTextLength,
    InvalidFontSize,
    InvalidColor,
    InvalidFrameStyle,
    InvalidGridDimensions,
    InvalidTableDimensions,
    InvalidTableMatrix,
    InvalidTableTextLength,
    InvalidTableStyle,
    TableRequiresSchemaV5,
    InvalidStrokeWidth,
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
        if let Some(image) = &self.page.background_image {
            if !valid_background_image_data_url(&image.data_url) {
                return Err(ValidationError::InvalidBackgroundImage);
            }
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
                    if !valid_color(color) {
                        return Err(ValidationError::InvalidColor);
                    }
                }
                ElementKind::Frame {
                    stroke_color,
                    stroke_width,
                    fill_color,
                } => {
                    if !valid_color(stroke_color)
                        || fill_color.as_ref().is_some_and(|color| !valid_color(color))
                    {
                        return Err(ValidationError::InvalidFrameStyle);
                    }
                    if !valid_stroke_width(*stroke_width) {
                        return Err(ValidationError::InvalidStrokeWidth);
                    }
                }
                ElementKind::Grid {
                    rows,
                    columns,
                    stroke_color,
                    stroke_width,
                } => {
                    if !(1..=MAX_GRID_ROWS).contains(rows)
                        || !(1..=MAX_GRID_COLUMNS).contains(columns)
                    {
                        return Err(ValidationError::InvalidGridDimensions);
                    }
                    if !valid_color(stroke_color) {
                        return Err(ValidationError::InvalidColor);
                    }
                    if !valid_stroke_width(*stroke_width) {
                        return Err(ValidationError::InvalidStrokeWidth);
                    }
                }
                ElementKind::Table {
                    rows,
                    columns,
                    cells,
                    header_rows,
                    stroke_color,
                    stroke_width,
                    cell_padding,
                    font_size,
                    text_color,
                    header_fill,
                    cell_fill,
                } => {
                    if !(1..=MAX_TABLE_ROWS).contains(rows)
                        || !(1..=MAX_TABLE_COLUMNS).contains(columns)
                        || *header_rows > 1
                    {
                        return Err(ValidationError::InvalidTableDimensions);
                    }
                    if cells.len() != *rows as usize
                        || cells.iter().any(|row| row.len() != *columns as usize)
                        || cells.len().saturating_mul(*columns as usize) > MAX_TABLE_CELLS
                    {
                        return Err(ValidationError::InvalidTableMatrix);
                    }
                    let mut total_chars = 0usize;
                    for cell in cells.iter().flatten() {
                        let cell_chars = cell.chars().count();
                        if cell_chars > MAX_TABLE_CELL_CHARS {
                            return Err(ValidationError::InvalidTableTextLength);
                        }
                        total_chars = total_chars.saturating_add(cell_chars);
                        if total_chars > MAX_TABLE_TEXT_CHARS {
                            return Err(ValidationError::InvalidTableTextLength);
                        }
                    }
                    if !valid_color(stroke_color)
                        || !valid_color(text_color)
                        || !valid_color(header_fill)
                        || !valid_color(cell_fill)
                        || !valid_stroke_width(*stroke_width)
                        || !cell_padding.is_finite()
                        || !(2.0..=24.0).contains(cell_padding)
                        || !font_size.is_finite()
                        || !(8.0..=96.0).contains(font_size)
                    {
                        return Err(ValidationError::InvalidTableStyle);
                    }
                }
            }
        }
        Ok(())
    }
}

/// Migrate supported schema-v1 through schema-v4 documents to current schema v5 without inventing print intent.
pub fn migrate_to_current(mut document: DesignDocument) -> Result<DesignDocument, ValidationError> {
    if document.schema_version < CURRENT_SCHEMA_VERSION
        && document
            .elements
            .iter()
            .any(|element| matches!(&element.kind, ElementKind::Table { .. }))
    {
        return Err(ValidationError::TableRequiresSchemaV5);
    }

    match document.schema_version {
        1 => {
            if document.page.width != 800.0 || document.page.height != 600.0 {
                return Err(ValidationError::InvalidLegacyPageDimensions);
            }
            document.schema_version = CURRENT_SCHEMA_VERSION;
            document.output_size_mm = None;
            document.template = None;
            document.page.background_image = None;
        }
        2 => {
            document.schema_version = CURRENT_SCHEMA_VERSION;
            document.page.background_image = None;
        }
        3 | 4 => {
            document.schema_version = CURRENT_SCHEMA_VERSION;
        }
        CURRENT_SCHEMA_VERSION => {}
        _ => return Err(ValidationError::UnsupportedSchemaVersion),
    }
    document.validate()?;
    Ok(document)
}

/// Validate a self-contained raster data URL. Browser decoding and pixel limits
/// remain a separate boundary.
fn valid_background_image_data_url(value: &str) -> bool {
    if value.len() > MAX_BACKGROUND_IMAGE_DATA_URL_BYTES {
        return false;
    }
    let payload = if let Some(rest) = value.strip_prefix("data:image/png;base64,") {
        rest
    } else if let Some(rest) = value.strip_prefix("data:image/jpeg;base64,") {
        rest
    } else if let Some(rest) = value.strip_prefix("data:image/webp;base64,") {
        rest
    } else {
        return false;
    };
    if payload.is_empty() || payload.len() % 4 != 0 {
        return false;
    }
    let bytes = payload.as_bytes();
    let mut padding = 0usize;
    if bytes.ends_with(b"=") {
        padding = 1;
        if bytes.len() >= 2 && bytes[bytes.len() - 2] == b'=' {
            padding = 2;
        }
    }
    let content_end = bytes.len() - padding;
    if bytes[..content_end]
        .iter()
        .any(|byte| !byte.is_ascii_alphanumeric() && *byte != b'+' && *byte != b'/')
        || bytes[content_end..].iter().any(|byte| *byte != b'=')
    {
        return false;
    }
    (payload.len() / 4) * 3 > padding
}

fn valid_stroke_width(value: f64) -> bool {
    value.is_finite() && (0.1..=MAX_STROKE_WIDTH).contains(&value)
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
                background_image: None,
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
        assert_eq!(migrated.schema_version, 5);
        assert_eq!(migrated.page.width, 800.0);
        assert_eq!(migrated.page.height, 600.0);
        assert_eq!(migrated.output_size_mm, None);
        assert_eq!(migrated.template, None);
        assert_eq!(migrated.elements.len(), 2);
    }

    #[test]
    fn accepts_shared_schema_v2_a4_fixture_and_migrates_it() {
        let fixture: serde_json::Value =
            serde_json::from_str(include_str!("../../../fixtures/document-v2-a4.json"))
                .expect("v2 fixture");
        let document: DesignDocument = serde_json::from_value(fixture).expect("deserialize v2");
        let migrated = migrate_to_current(document).expect("v2 migrates");
        assert_eq!(migrated.schema_version, 5);
        assert_eq!(migrated.output_size_mm.unwrap().width, 210.0);
    }

    #[test]
    fn accepts_valid_embedded_background_image() {
        let mut document = valid_document();
        document.page.background_image = Some(BackgroundImage {
            data_url: "data:image/png;base64,aGVsbG8=".into(),
            fit: BackgroundImageFit::Cover,
        });
        assert_eq!(document.validate(), Ok(()));
    }

    #[test]
    fn accepts_shared_schema_v3_background_image_fixture() {
        let fixture: serde_json::Value = serde_json::from_str(include_str!(
            "../../../fixtures/document-v3-background-image.json"
        ))
        .expect("v3 fixture");
        let document: DesignDocument = serde_json::from_value(fixture).expect("deserialize v3");
        let migrated = migrate_to_current(document).expect("v3 migrates");
        assert_eq!(migrated.schema_version, 5);
        assert_eq!(
            migrated.page.background_image.unwrap().fit,
            BackgroundImageFit::Cover
        );
    }

    #[test]
    fn rejects_unsupported_or_oversized_background_image_data_urls() {
        let mut document = valid_document();
        for data_url in [
            "https://example.invalid/image.png",
            "data:image/svg+xml;base64,PHN2Zz4=",
            "data:image/png;base64,not base64!",
            "data:image/png;base64,",
        ] {
            document.page.background_image = Some(BackgroundImage {
                data_url: data_url.into(),
                fit: BackgroundImageFit::Contain,
            });
            assert_eq!(
                document.validate(),
                Err(ValidationError::InvalidBackgroundImage)
            );
        }
        document.page.background_image = Some(BackgroundImage {
            data_url: format!(
                "data:image/png;base64,{}",
                "A".repeat(MAX_BACKGROUND_IMAGE_DATA_URL_BYTES)
            ),
            fit: BackgroundImageFit::Cover,
        });
        assert_eq!(
            document.validate(),
            Err(ValidationError::InvalidBackgroundImage)
        );
    }

    #[test]
    fn validates_frame_and_grid_primitives() {
        let mut document = valid_document();
        document.elements = vec![
            Element {
                id: "frame-1".into(),
                x: 10.0,
                y: 20.0,
                width: 300.0,
                height: 200.0,
                kind: ElementKind::Frame {
                    stroke_color: "#123456".into(),
                    stroke_width: 2.0,
                    fill_color: Some("#fff".into()),
                },
            },
            Element {
                id: "grid-1".into(),
                x: 20.0,
                y: 30.0,
                width: 200.0,
                height: 100.0,
                kind: ElementKind::Grid {
                    rows: 3,
                    columns: 4,
                    stroke_color: "#abc".into(),
                    stroke_width: 1.0,
                },
            },
        ];
        assert_eq!(document.validate(), Ok(()));
        let json = serde_json::to_string(&document).expect("serialize");
        let restored: DesignDocument = serde_json::from_str(&json).expect("deserialize");
        assert_eq!(restored, document);
    }

    #[test]
    fn accepts_shared_schema_v4_frames_and_grids_fixture() {
        let fixture: serde_json::Value = serde_json::from_str(include_str!(
            "../../../fixtures/document-v4-frames-grids.json"
        ))
        .expect("v4 fixture");
        let document: DesignDocument = serde_json::from_value(fixture).expect("deserialize v4");
        assert_eq!(document.schema_version, 4);
        let migrated = migrate_to_current(document).expect("v4 migrates to v5");
        assert_eq!(migrated.schema_version, 5);
        assert_eq!(migrated.validate(), Ok(()));
        assert_eq!(migrated.elements.len(), 2);
    }

    #[test]
    fn rejects_invalid_grid_dimensions_and_stroke_width() {
        let mut document = valid_document();
        document.elements[0].kind = ElementKind::Grid {
            rows: 0,
            columns: 2,
            stroke_color: "#000".into(),
            stroke_width: 1.0,
        };
        assert_eq!(
            document.validate(),
            Err(ValidationError::InvalidGridDimensions)
        );
        document.elements[0].kind = ElementKind::Frame {
            stroke_color: "#000".into(),
            stroke_width: f64::NAN,
            fill_color: None,
        };
        assert_eq!(
            document.validate(),
            Err(ValidationError::InvalidStrokeWidth)
        );
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
    #[test]
    fn accepts_shared_schema_v5_table_fixture() {
        let fixture: serde_json::Value = serde_json::from_str(include_str!(
            "../../../fixtures/document-v5-semantic-table.json"
        ))
        .expect("v5 fixture");
        let document: DesignDocument = serde_json::from_value(fixture).expect("deserialize v5");
        assert_eq!(document.schema_version, 5);
        assert_eq!(document.validate(), Ok(()));
        assert!(matches!(
            &document.elements[0].kind,
            ElementKind::Table { .. }
        ));
    }

    #[test]
    fn rejects_table_in_legacy_schema_even_when_table_fields_are_valid() {
        let fixture: serde_json::Value = serde_json::from_str(include_str!(
            "../../../fixtures/document-v5-semantic-table.json"
        ))
        .expect("v5 fixture");
        let mut legacy = fixture;
        legacy["schema_version"] = serde_json::json!(4);
        let document: DesignDocument = serde_json::from_value(legacy).expect("deserialize");
        assert_eq!(
            migrate_to_current(document),
            Err(ValidationError::TableRequiresSchemaV5)
        );
    }

    #[test]
    fn rejects_table_aggregate_text_limit_and_invalid_style() {
        let fixture: serde_json::Value = serde_json::from_str(include_str!(
            "../../../fixtures/document-v5-semantic-table.json"
        ))
        .expect("v5 fixture");

        let mut too_much_text: DesignDocument =
            serde_json::from_value(fixture.clone()).expect("deserialize");
        if let ElementKind::Table { cells, .. } = &mut too_much_text.elements[0].kind {
            cells[0][0] = "x".repeat(MAX_TABLE_TEXT_CHARS + 1);
        }
        assert_eq!(
            too_much_text.validate(),
            Err(ValidationError::InvalidTableTextLength)
        );

        let mut invalid_style: DesignDocument =
            serde_json::from_value(fixture).expect("deserialize");
        if let ElementKind::Table { cell_padding, .. } = &mut invalid_style.elements[0].kind {
            *cell_padding = 25.0;
        }
        assert_eq!(
            invalid_style.validate(),
            Err(ValidationError::InvalidTableStyle)
        );
    }

    #[test]
    fn rejects_ragged_table_matrix_and_excessive_cell_text() {
        let fixture: serde_json::Value = serde_json::from_str(include_str!(
            "../../../fixtures/document-v5-semantic-table.json"
        ))
        .expect("v5 fixture");
        let mut document: DesignDocument =
            serde_json::from_value(fixture.clone()).expect("deserialize");
        if let ElementKind::Table { cells, .. } = &mut document.elements[0].kind {
            cells[0].pop();
        }
        assert_eq!(
            document.validate(),
            Err(ValidationError::InvalidTableMatrix)
        );

        let mut oversized: DesignDocument = serde_json::from_value(fixture).expect("deserialize");
        if let ElementKind::Table { cells, .. } = &mut oversized.elements[0].kind {
            cells[0][0] = "x".repeat(MAX_TABLE_CELL_CHARS + 1);
        }
        assert_eq!(
            oversized.validate(),
            Err(ValidationError::InvalidTableTextLength)
        );
    }
}
