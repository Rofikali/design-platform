//! Small, explicit JavaScript boundary for the shared design document core.
//!
//! Keep this adapter thin: document rules live in `design-core`; browser UI,
//! storage, and rendering remain outside the Rust domain crate.

use design_core::DesignDocument;
use wasm_bindgen::prelude::*;

/// Validate a versioned JSON document using the shared Rust domain rules.
///
/// Returns the same JSON structure in canonical serde field order when valid.
/// Invalid JSON and invalid documents return a JavaScript Error to the caller.
/// This API intentionally accepts a string to avoid exposing Rust structs or
/// large object graphs directly across the WASM boundary.
#[wasm_bindgen]
pub fn validate_document_json(input: &str) -> Result<String, JsValue> {
    let document: DesignDocument = serde_json::from_str(input)
        .map_err(|error| JsValue::from_str(&format!("Invalid document JSON: {error}")))?;

    document
        .validate()
        .map_err(|error| JsValue::from_str(&format!("Document validation failed: {error:?}")))?;

    serde_json::to_string(&document)
        .map_err(|error| JsValue::from_str(&format!("Could not serialize document: {error}")))
}

#[cfg(test)]
mod tests {
    use super::*;

    const VALID_DOCUMENT: &str = r##"{
        "schema_version": 1,
        "page": {"width": 800, "height": 600, "background": "#ffffff"},
        "elements": [{
            "id": "heading",
            "x": 10, "y": 20, "width": 300, "height": 60,
            "kind": {"type": "text", "text": "Exam Paper", "font_size": 28, "color": "#123456"}
        }]
    }"##;

    #[test]
    fn returns_a_validated_versioned_document() {
        let result = validate_document_json(VALID_DOCUMENT).expect("valid document");
        let parsed: serde_json::Value = serde_json::from_str(&result).expect("valid output JSON");
        assert_eq!(parsed["schema_version"], 1);
        assert_eq!(parsed["elements"][0]["kind"]["type"], "text");
    }
}
