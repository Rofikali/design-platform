//! Small JavaScript boundary for the shared design document core.
use design_core::{migrate_to_current, DesignDocument};
use wasm_bindgen::prelude::*;

const MAX_DOCUMENT_JSON_BYTES: usize = 2_000_000;

/// Migrate supported v1 input, validate the current schema, and return normalized v2 JSON.
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
    fn migrates_v1_to_validated_v2() {
        let result = validate_document_json(V1_DOCUMENT).expect("v1 migrates");
        let parsed: serde_json::Value = serde_json::from_str(&result).expect("output JSON");
        assert_eq!(parsed["schema_version"], 2);
        assert_eq!(parsed["page"]["width"], 800);
        assert!(parsed.get("output_size_mm").is_none());
        assert!(parsed.get("template").is_none());
    }
    #[test]
    fn rejects_unsupported_future_version_in_core_migration() {
        let input = V1_DOCUMENT.replace("\"schema_version\":1", "\"schema_version\":999");
        let document: DesignDocument = serde_json::from_str(&input).expect("valid JSON");
        assert!(migrate_to_current(document).is_err());
    }
}
