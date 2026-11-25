//! Staged text-style contract. Not part of the production schema-v5 document.
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum LocalFontFamily {
    Sans,
    Serif,
    Monospace,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum LocalFontWeight {
    Normal,
    Bold,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum LocalFontStyle {
    Normal,
    Italic,
}

/// A deliberately closed wire object; no arbitrary CSS or remote font sources.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct TextStyleV1 {
    pub font_family: LocalFontFamily,
    pub font_weight: LocalFontWeight,
    pub font_style: LocalFontStyle,
}

impl Default for TextStyleV1 {
    fn default() -> Self {
        Self {
            font_family: LocalFontFamily::Sans,
            font_weight: LocalFontWeight::Normal,
            font_style: LocalFontStyle::Normal,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn shared_text_style_fixture_matrix() {
        let cases: serde_json::Value =
            serde_json::from_str(include_str!("../../../fixtures/text-style-v1-cases.json"))
                .expect("fixture JSON");
        for case in cases.as_array().expect("case array") {
            let result = serde_json::from_value::<TextStyleV1>(case["input"].clone());
            assert_eq!(
                result.is_ok(),
                case["valid"].as_bool().expect("valid boolean"),
                "case: {}",
                case["name"]
            );
            if let Ok(style) = result {
                assert_eq!(serde_json::to_value(style).unwrap(), case["input"]);
            }
        }
    }

    #[test]
    fn default_preserves_legacy_font() {
        assert_eq!(
            serde_json::to_value(TextStyleV1::default()).unwrap(),
            serde_json::json!({
                "font_family": "sans",
                "font_weight": "normal",
                "font_style": "normal"
            })
        );
    }
}
