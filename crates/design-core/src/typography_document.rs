//! Proposed schema-v7 typography document. Production schema v5 is unchanged.
//! Schema v6 is reserved for the unfinished foreground-image contract.
use crate::{migrate_to_current, typography::TextStyleV1, DesignDocument, ElementKind};
use serde::{Deserialize, Deserializer, Serialize};
use std::collections::{HashMap, HashSet};

pub const TYPOGRAPHY_SCHEMA_VERSION: u32 = 7;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct TextStyleEntry {
    pub element_id: String,
    pub style: TextStyleV1,
}

// Unlike Option's default deserializer, explicit null is not a missing field.
fn deserialize_styles<'de, D>(d: D) -> Result<Option<Vec<TextStyleEntry>>, D::Error>
where
    D: Deserializer<'de>,
{
    Vec::<TextStyleEntry>::deserialize(d).map(Some)
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct TypographyDocument {
    #[serde(flatten)]
    pub document: DesignDocument,
    #[serde(
        default,
        deserialize_with = "deserialize_styles",
        skip_serializing_if = "Option::is_none"
    )]
    pub text_styles: Option<Vec<TextStyleEntry>>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TypographyDocumentError {
    UnsupportedVersion,
    InvalidDocument,
    InvalidStyleEntries,
}

/// Validate the old document contract, then attach exactly one style per text
/// element in z-order. Never interpret unfinished schema-v6 image documents.
pub fn normalize_typography_document(
    mut input: TypographyDocument,
) -> Result<TypographyDocument, TypographyDocumentError> {
    let version = input.document.schema_version;
    match version {
        1..=5 if input.text_styles.is_none() => {}
        TYPOGRAPHY_SCHEMA_VERSION if input.text_styles.is_some() => {
            input.document.schema_version = 5;
        }
        1..=5 | TYPOGRAPHY_SCHEMA_VERSION => {
            return Err(TypographyDocumentError::InvalidStyleEntries);
        }
        _ => return Err(TypographyDocumentError::UnsupportedVersion),
    }
    input.document = migrate_to_current(input.document)
        .map_err(|_| TypographyDocumentError::InvalidDocument)?;
    let text_ids: HashSet<&str> = input
        .document
        .elements
        .iter()
        .filter(|e| matches!(&e.kind, ElementKind::Text { .. }))
        .map(|e| e.id.as_str())
        .collect();
    let mut styles = HashMap::new();
    if let Some(entries) = input.text_styles.take() {
        if entries.len() != text_ids.len() {
            return Err(TypographyDocumentError::InvalidStyleEntries);
        }
        for entry in entries {
            if !text_ids.contains(entry.element_id.as_str())
                || styles.insert(entry.element_id, entry.style).is_some()
            {
                return Err(TypographyDocumentError::InvalidStyleEntries);
            }
        }
    }
    input.text_styles = Some(
        input
            .document
            .elements
            .iter()
            .filter(|e| matches!(&e.kind, ElementKind::Text { .. }))
            .map(|e| TextStyleEntry {
                element_id: e.id.clone(),
                style: styles.remove(&e.id).unwrap_or_default(),
            })
            .collect(),
    );
    input.document.schema_version = TYPOGRAPHY_SCHEMA_VERSION;
    Ok(input)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn legacy_fixtures_preserve_document_and_default_text_styles() {
        for json in [
            include_str!("../../../fixtures/document-v1.json"),
            include_str!("../../../fixtures/document-v2-a4.json"),
            include_str!("../../../fixtures/document-v3-background-image.json"),
            include_str!("../../../fixtures/document-v4-frames-grids.json"),
            include_str!("../../../fixtures/document-v5-semantic-table.json"),
        ] {
            let original: DesignDocument = serde_json::from_str(json).unwrap();
            let mut expected = migrate_to_current(original).unwrap();
            expected.schema_version = TYPOGRAPHY_SCHEMA_VERSION;
            let input = serde_json::from_str(json).unwrap();
            let normalized = normalize_typography_document(input).unwrap();
            assert_eq!(normalized.document, expected);
            for entry in normalized.text_styles.as_ref().unwrap() {
                assert_eq!(entry.style, TextStyleV1::default());
            }
            let roundtrip = serde_json::to_string(&normalized).unwrap();
            assert_eq!(
                normalize_typography_document(serde_json::from_str(&roundtrip).unwrap()).unwrap(),
                normalized
            );
        }
    }

    #[test]
    fn rejects_invalid_version_and_style_targets() {
        let legacy = include_str!("../../../fixtures/document-v1.json");
        let mut doc: serde_json::Value = serde_json::from_str(legacy).unwrap();
        doc["schema_version"] = serde_json::json!(6);
        assert!(normalize_typography_document(serde_json::from_value(doc.clone()).unwrap()).is_err());
        doc["schema_version"] = serde_json::json!(7);
        assert!(normalize_typography_document(serde_json::from_value(doc.clone()).unwrap()).is_err());
        for id in ["rect-2", "missing"] {
            doc["text_styles"] = serde_json::json!([{
                "element_id": id, "style": TextStyleV1::default()
            }]);
            assert!(
                normalize_typography_document(serde_json::from_value(doc.clone()).unwrap()).is_err()
            );
        }
        doc["text_styles"] = serde_json::Value::Null;
        assert!(serde_json::from_value::<TypographyDocument>(doc).is_err());
    }
}
