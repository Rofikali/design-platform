use design_core::DesignDocument;
use serde::Deserialize;
use serde_json::Value;

#[derive(Deserialize)]
struct ValidationCases {
    schema_version: u32,
    cases: Vec<ValidationCase>,
}

#[derive(Deserialize)]
struct ValidationCase {
    name: String,
    valid: bool,
    document: Value,
}

#[test]
fn shared_validation_cases_match_rust_core_expectations() {
    let fixture: ValidationCases =
        serde_json::from_str(include_str!("../../../fixtures/validation-cases-v1.json"))
            .expect("shared validation cases should be valid JSON");

    assert_eq!(fixture.schema_version, 1);
    assert!(!fixture.cases.is_empty());

    for case in fixture.cases {
        let result = serde_json::from_value::<DesignDocument>(case.document)
            .map_err(|_| ())
            .and_then(|document| document.validate().map_err(|_| ()));
        assert_eq!(
            result.is_ok(),
            case.valid,
            "unexpected Rust validation outcome for case: {}",
            case.name
        );
    }
}
