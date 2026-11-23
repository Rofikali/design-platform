//! Staged schema-v6 foreground raster validation; not yet part of the v5 document model.
//! Browser decode and dimension verification remain mandatory before authoring.
use serde::{Deserialize, Serialize};

pub const MAX_IMAGE_DATA_URL_BYTES: usize = 1_048_576;
pub const MAX_IMAGE_PIXELS: u64 = 16_000_000;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct ForegroundImageV6 {
    pub data_url: String,
    pub intrinsic_width: u32,
    pub intrinsic_height: u32,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ImageValidationError {
    InvalidDimensions,
    InvalidDataUrl,
}

impl ForegroundImageV6 {
    pub fn validate(&self) -> Result<(), ImageValidationError> {
        if self.intrinsic_width == 0
            || self.intrinsic_height == 0
            || self.intrinsic_width > 8192
            || self.intrinsic_height > 8192
            || u64::from(self.intrinsic_width) * u64::from(self.intrinsic_height) > MAX_IMAGE_PIXELS
        {
            return Err(ImageValidationError::InvalidDimensions);
        }
        validate_raster_data_url(&self.data_url)
    }
}

/// Enforces the TypeScript raster guard's bounded MIME, canonical base64 and signature rules.
/// A matching signature is not proof of successful raster decoding.
pub fn validate_raster_data_url(value: &str) -> Result<(), ImageValidationError> {
    if value.len() > MAX_IMAGE_DATA_URL_BYTES {
        return Err(ImageValidationError::InvalidDataUrl);
    }
    let (mime, payload) = if let Some(s) = value.strip_prefix("data:image/png;base64,") {
        ("png", s)
    } else if let Some(s) = value.strip_prefix("data:image/jpeg;base64,") {
        ("jpeg", s)
    } else if let Some(s) = value.strip_prefix("data:image/webp;base64,") {
        ("webp", s)
    } else {
        return Err(ImageValidationError::InvalidDataUrl);
    };
    let bytes = payload.as_bytes();
    if bytes.is_empty() || bytes.len() % 4 != 0 {
        return Err(ImageValidationError::InvalidDataUrl);
    }
    let pad = if bytes.ends_with(b"==") {
        2
    } else if bytes.ends_with(b"=") {
        1
    } else {
        0
    };
    let end = bytes.len() - pad;
    let sextet = |c: u8| -> Option<u8> {
        match c {
            b'A'..=b'Z' => Some(c - b'A'),
            b'a'..=b'z' => Some(c - b'a' + 26),
            b'0'..=b'9' => Some(c - b'0' + 52),
            b'+' => Some(62),
            b'/' => Some(63),
            _ => None,
        }
    };
    if bytes[..end].iter().any(|&b| sextet(b).is_none())
        || bytes[end..].iter().any(|&b| b != b'=')
        || (pad == 2 && (end == 0 || sextet(bytes[end - 1]).unwrap_or(255) & 15 != 0))
        || (pad == 1 && (end == 0 || sextet(bytes[end - 1]).unwrap_or(255) & 3 != 0))
    {
        return Err(ImageValidationError::InvalidDataUrl);
    }
    let mut signature = [0u8; 12];
    let mut count = 0usize;
    let mut bits = 0u32;
    let mut accumulator = 0u32;
    for &byte in bytes[..end].iter().take(16) {
        accumulator = (accumulator << 6) | u32::from(sextet(byte).unwrap_or(0));
        bits += 6;
        if bits >= 8 {
            bits -= 8;
            if count < signature.len() {
                signature[count] = ((accumulator >> bits) & 0xff) as u8;
                count += 1;
            }
        }
    }
    let matches = match mime {
        "png" => count >= 8 && signature[..8] == [137, 80, 78, 71, 13, 10, 26, 10],
        "jpeg" => count >= 3 && signature[..3] == [255, 216, 255],
        "webp" => count >= 12 && &signature[..4] == b"RIFF" && &signature[8..12] == b"WEBP",
        _ => false,
    };
    if matches {
        Ok(())
    } else {
        Err(ImageValidationError::InvalidDataUrl)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    fn png() -> String {
        "data:image/png;base64,iVBORw0KGgo=".to_owned()
    }
    #[test]
    fn accepts_bounded_png_signature() {
        assert_eq!(validate_raster_data_url(&png()), Ok(()));
        assert_eq!(
            ForegroundImageV6 {
                data_url: png(),
                intrinsic_width: 400,
                intrinsic_height: 300
            }
            .validate(),
            Ok(())
        );
    }
    #[test]
    fn rejects_mime_mismatch_and_noncanonical_padding() {
        assert_eq!(
            validate_raster_data_url("data:image/jpeg;base64,iVBORw0KGgo="),
            Err(ImageValidationError::InvalidDataUrl)
        );
        assert_eq!(
            validate_raster_data_url("data:image/png;base64,iVBORw0KGgp="),
            Err(ImageValidationError::InvalidDataUrl)
        );
    }
    #[test]
    fn rejects_bad_dimensions_and_payload_budget() {
        let mut image = ForegroundImageV6 {
            data_url: png(),
            intrinsic_width: 8192,
            intrinsic_height: 8192,
        };
        assert_eq!(
            image.validate(),
            Err(ImageValidationError::InvalidDimensions)
        );
        image.intrinsic_width = 1;
        image.intrinsic_height = 1;
        assert_eq!(image.validate(), Ok(()));
        assert_eq!(
            validate_raster_data_url(&format!(
                "data:image/png;base64,{}",
                "A".repeat(MAX_IMAGE_DATA_URL_BYTES)
            )),
            Err(ImageValidationError::InvalidDataUrl)
        );
    }
    // Mirror the staged TypeScript data-URL boundary cases in
    // web/tests/foreground-image-v6.test.ts until shared WASM fixtures land.
    #[test]
    fn matches_typescript_raster_boundary_cases() {
        let cases = [
            ("data:image/png;base64,iVBORw0KGgo=", true),
            ("data:image/jpeg;base64,iVBORw0KGgo=", false),
            ("data:image/png;base64,iVBORw0KGgp=", false),
            ("data:image/png;base64,iVBORw0KGgo", false),
            ("data:image/png;base64,!!!!", false),
            ("data:image/png;base64,", false),
            ("data:image/svg+xml;base64,iVBORw0KGgo=", false),
            ("https://example.com/image.png", false),
            ("data:image/png;base64,iVBORw0KGgo=\\n", false),
        ];
        for (input, valid) in cases {
            assert_eq!(
                validate_raster_data_url(input).is_ok(),
                valid,
                "input: {input:?}"
            );
        }
    }
}
