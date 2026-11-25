//! Staged schema-v8 text layout. Existing v5/v7 editor formats remain unchanged.
use crate::typography_document::{
    normalize_typography_document, TypographyDocument, TYPOGRAPHY_SCHEMA_VERSION,
};
use serde::{Deserialize, Deserializer, Serialize};
use std::collections::{HashMap, HashSet};

pub const TEXT_LAYOUT_SCHEMA_VERSION: u32 = 8;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Alignment {
    Left,
    Center,
    Right,
}

#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct NativeTextLayout {
    pub alignment: Alignment,
    pub line_height: f64,
    pub letter_spacing: f64,
}

impl Default for NativeTextLayout {
    fn default() -> Self {
        Self {
            alignment: Alignment::Left,
            line_height: 1.25,
            letter_spacing: 0.0,
        }
    }
}

impl NativeTextLayout {
    pub fn is_valid(&self) -> bool {
        self.line_height.is_finite()
            && (1.0..=3.0).contains(&self.line_height)
            && self.letter_spacing.is_finite()
            && (-2.0..=10.0).contains(&self.letter_spacing)
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct TextLayoutEntry {
    pub element_id: String,
    pub layout: NativeTextLayout,
}

fn deserialize_layouts<'de, D>(d: D) -> Result<Option<Vec<TextLayoutEntry>>, D::Error>
where
    D: Deserializer<'de>,
{
    Vec::<TextLayoutEntry>::deserialize(d).map(Some)
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct TextLayoutDocument {
    #[serde(flatten)]
    pub typography: TypographyDocument,
    #[serde(
        default,
        deserialize_with = "deserialize_layouts",
        skip_serializing_if = "Option::is_none"
    )]
    pub text_layouts: Option<Vec<TextLayoutEntry>>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TextLayoutError {
    UnsupportedVersion,
    InvalidTypography,
    InvalidLayoutEntries,
}

/// One validated layout per text element; preserve all v7 styles and z-order.
pub fn normalize_text_layout_document(
    mut input: TextLayoutDocument,
) -> Result<TextLayoutDocument, TextLayoutError> {
    match input.typography.document.schema_version {
        1..=5 | TYPOGRAPHY_SCHEMA_VERSION if input.text_layouts.is_none() => {}
        TEXT_LAYOUT_SCHEMA_VERSION if input.text_layouts.is_some() => {
            input.typography.document.schema_version = TYPOGRAPHY_SCHEMA_VERSION;
        }
        1..=5 | TYPOGRAPHY_SCHEMA_VERSION | TEXT_LAYOUT_SCHEMA_VERSION => {
            return Err(TextLayoutError::InvalidLayoutEntries);
        }
        _ => return Err(TextLayoutError::UnsupportedVersion),
    }
    input.typography = normalize_typography_document(input.typography)
        .map_err(|_| TextLayoutError::InvalidTypography)?;
    let styles = input
        .typography
        .text_styles
        .as_ref()
        .ok_or(TextLayoutError::InvalidTypography)?;
    let ids: HashSet<&str> = styles.iter().map(|entry| entry.element_id.as_str()).collect();
    let mut layouts = HashMap::new();
    if let Some(entries) = input.text_layouts.take() {
        if entries.len() != ids.len() {
            return Err(TextLayoutError::InvalidLayoutEntries);
        }
        for entry in entries {
            if !entry.layout.is_valid()
                || !ids.contains(entry.element_id.as_str())
                || layouts.insert(entry.element_id, entry.layout).is_some()
            {
                return Err(TextLayoutError::InvalidLayoutEntries);
            }
        }
    }
    input.text_layouts = Some(
        styles
            .iter()
            .map(|entry| TextLayoutEntry {
                element_id: entry.element_id.clone(),
                layout: layouts.remove(&entry.element_id).unwrap_or_default(),
            })
            .collect(),
    );
    input.typography.document.schema_version = TEXT_LAYOUT_SCHEMA_VERSION;
    Ok(input)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn shared_layout_cases() {
        let cases: serde_json::Value =
            serde_json::from_str(include_str!("../../../fixtures/text-layout-v1-cases.json"))
                .unwrap();
        for entry in cases.as_array().unwrap() {
            let parsed = serde_json::from_value::<NativeTextLayout>(entry["input"].clone());
            assert_eq!(
                parsed.is_ok_and(|layout| layout.is_valid()),
                entry["valid"].as_bool().unwrap(),
                "{}",
                entry["name"]
            );
        }
    }

    #[test]
    fn legacy_and_v8_roundtrip() {
        let input = include_str!("../../../fixtures/document-v1.json");
        let mut doc =
            normalize_text_layout_document(serde_json::from_str(input).unwrap()).unwrap();
        assert_eq!(doc.typography.document.schema_version, 8);
        let entry = &mut doc.text_layouts.as_mut().unwrap()[0];
        assert_eq!(entry.layout, NativeTextLayout::default());
        entry.layout.alignment = Alignment::Center;
        entry.layout.letter_spacing = 3.0;
        let json = serde_json::to_string(&doc).unwrap();
        assert_eq!(
            normalize_text_layout_document(serde_json::from_str(&json).unwrap()).unwrap(),
            doc
        );
        let mut invalid: serde_json::Value = serde_json::from_str(&json).unwrap();
        invalid["text_layouts"][0]["element_id"] = serde_json::json!("missing");
        assert!(normalize_text_layout_document(serde_json::from_value(invalid).unwrap()).is_err());
    }
}
