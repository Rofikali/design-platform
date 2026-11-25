//! Staged vector element contract for proposed schema v8; production v5 is unchanged.
use serde::{Deserialize, Serialize};

pub const VECTOR_SCHEMA_VERSION: u32 = 8;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct TriangleElementV8 {
    pub id: String,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub kind: TriangleKind,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case", deny_unknown_fields)]
pub enum TriangleKind {
    Triangle { color: String },
}

impl TriangleElementV8 {
    pub fn validate(&self) -> bool {
        let TriangleKind::Triangle { color } = &self.kind;
        !self.id.is_empty()
            && self.id.len() <= 128
            && !self.id.chars().any(|c| c <= '\u{1f}' || c == '\u{7f}')
            && super::valid_coordinate(self.x)
            && super::valid_coordinate(self.y)
            && super::valid_dimension(self.width)
            && super::valid_dimension(self.height)
            && super::valid_color(color)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn shared_triangle_cases() {
        let cases: serde_json::Value =
            serde_json::from_str(include_str!("../../../fixtures/vector-triangle-v8-cases.json"))
                .unwrap();
        for case in cases.as_array().unwrap() {
            let parsed = serde_json::from_value::<TriangleElementV8>(case["element"].clone());
            assert_eq!(
                parsed.is_ok_and(|element| element.validate()),
                case["valid"].as_bool().unwrap(),
                "{}",
                case["name"]
            );
        }
    }
}
