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

pub const MAX_VECTOR_TRIANGLES: usize = 1000;

/// Validate the staged collection before accepting it into a document.
pub fn validate_triangle_collection_v8(elements: &[TriangleElementV8]) -> bool {
    if elements.len() > MAX_VECTOR_TRIANGLES {
        return false;
    }
    let mut ids = std::collections::HashSet::with_capacity(elements.len());
    elements.iter().all(|element| element.validate() && ids.insert(element.id.as_str()))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn collection_bounds_and_identity() {
        let make = |i: usize| TriangleElementV8 {
            id: i.to_string(), x: 0.0, y: 0.0, width: 1.0, height: 1.0,
            kind: TriangleKind::Triangle { color: "#fff".into() },
        };
        assert!(validate_triangle_collection_v8(&[]));
        let mut elements: Vec<_> = (0..MAX_VECTOR_TRIANGLES).map(make).collect();
        assert!(validate_triangle_collection_v8(&elements));
        elements.push(make(MAX_VECTOR_TRIANGLES));
        assert!(!validate_triangle_collection_v8(&elements));
        elements.pop();
        elements[1].id = elements[0].id.clone();
        assert!(!validate_triangle_collection_v8(&elements));
        elements[1] = make(1);
        elements[1].width = f64::NAN;
        assert!(!validate_triangle_collection_v8(&elements));
    }

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
