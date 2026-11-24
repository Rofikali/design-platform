//! Small JavaScript boundary for the shared design document core.
use design_core::{migrate_to_current, DesignDocument};
use wasm_bindgen::prelude::*;

const MAX_DOCUMENT_JSON_BYTES: usize = 2_000_000;

/// Migrate supported legacy input, validate the current schema, and return normalized schema-v5 JSON.
#[wasm_bindgen]
pub fn validate_document_json(input: &str) -> Result<String, JsValue> {
    if input.len() > MAX_DOCUMENT_JSON_BYTES {
        return Err(JsValue::from_str(
            "Document JSON exceeds the 2,000,000-byte limit",
        ));
    }
    let document: DesignDocument = serde_json::from_str(input)
        .map_err(|error| JsValue::from_str(&format!("Invalid document JSON: {error}")))?;
    let document = migrate_to_current(document)
        .map_err(|error| JsValue::from_str(&format!("Document validation failed: {error:?}")))?;
    serde_json::to_string(&document)
        .map_err(|error| JsValue::from_str(&format!("Could not serialize document: {error}")))
}

/// Staged schema-v6 raster guard exposed for browser parity testing.
/// This checks the embedded MIME, canonical base64 and signature only; it does
/// not decode the raster or activate schema v6 in the production editor.
#[wasm_bindgen]
pub fn validate_foreground_raster_data_url_v6(input: &str) -> Result<(), JsValue> {
    design_core::foreground_image_v6::validate_raster_data_url(input)
        .map_err(|error| JsValue::from_str(&format!("Invalid foreground raster: {error:?}")))
}

#[cfg(test)]
mod tests {
    use super::*;
    const V1_DOCUMENT: &str = r##"{
      "schema_version":1,
      "page":{"width":800,"height":600,"background":"#ffffff"},
      "elements":[{"id":"heading","x":10,"y":20,"width":300,"height":60,
        "kind":{"type":"text","text":"Exam Paper","font_size":28,"color":"#123456"}}]
    }"##;
    #[test]
    fn staged_foreground_raster_core_matrix_on_native_target() {
        let cases = [
            ("data:image/png;base64,iVBORw0KGgo=", true),
            ("data:image/jpeg;base64,iVBORw0KGgo=", false),
            ("data:image/png;base64,iVBORw0KGgp=", false),
            ("data:image/png;base64,iVBORw0KGgo", false),
            ("data:image/png;base64,!!!!", false),
            ("data:image/png;base64,", false),
            ("data:image/svg+xml;base64,iVBORw0KGgo=", false),
            ("https://example.com/image.png", false),
        ];
        for (input, expected) in cases {
            assert_eq!(
                design_core::foreground_image_v6::validate_raster_data_url(input).is_ok(),
                expected,
                "input: {input:?}"
            );
        }
    }

    #[test]
    fn migrates_v1_to_validated_v5() {
        let result = validate_document_json(V1_DOCUMENT).expect("v1 migrates");
        let parsed: serde_json::Value = serde_json::from_str(&result).expect("output JSON");
        assert_eq!(parsed["schema_version"], 5);
        assert_eq!(parsed["page"]["width"].as_f64(), Some(800.0));
        assert!(parsed.get("output_size_mm").is_none());
        assert!(parsed.get("template").is_none());
    }
    #[test]
    fn validates_shared_schema_v3_background_image_fixture() {
        let input = include_str!("../../../fixtures/document-v3-background-image.json");
        let output = validate_document_json(input).expect("v3 fixture validates");
        let parsed: serde_json::Value = serde_json::from_str(&output).expect("normalized JSON");
        assert_eq!(parsed["schema_version"], 5);
        assert_eq!(parsed["page"]["background_image"]["fit"], "cover");
    }

    #[test]
    fn validates_shared_schema_v5_table_fixture() {
        let input = include_str!("../../../fixtures/document-v5-semantic-table.json");
        let output = validate_document_json(input).expect("v5 table fixture validates");
        let parsed: serde_json::Value = serde_json::from_str(&output).expect("normalized JSON");
        assert_eq!(parsed["schema_version"], 5);
        assert_eq!(parsed["elements"][0]["kind"]["cells"][1][2], "₹80");
    }

    #[test]
    fn rejects_table_data_smuggled_into_schema_v4() {
        let input = include_str!("../../../fixtures/document-v5-semantic-table.json");
        let mut parsed: serde_json::Value = serde_json::from_str(input).expect("fixture JSON");
        parsed["schema_version"] = serde_json::json!(4);
        let document: DesignDocument =
            serde_json::from_value(parsed).expect("deserialize legacy table document");
        assert!(migrate_to_current(document).is_err());
    }

    #[test]
    fn rejects_unsupported_future_version_in_core_migration() {
        let input = V1_DOCUMENT.replace("\"schema_version\":1", "\"schema_version\":999");
        let document: DesignDocument = serde_json::from_str(&input).expect("valid JSON");
        assert!(migrate_to_current(document).is_err());
    }
}
