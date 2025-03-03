use axum::{
    Json,
    body::Body,
    extract::Request,
    http::StatusCode,
    middleware::Next,
    response::{IntoResponse, Response},
};
use jsonwebtoken::errors::ErrorKind;
use jsonwebtoken::{DecodingKey, Validation, decode};
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Debug, Serialize, Deserialize, Clone)] // Added Clone derive
pub struct Claims {
    pub username: String,
    pub name: String,
    pub exp: usize,
}

pub async fn jwt_middleware(
    mut req: Request<Body>,
    next: Next,
) -> Result<Response, (StatusCode, Json<serde_json::Value>)> {
    // Extract token from the "token" header.
    let token_header = req.headers().get("token").and_then(|hv| hv.to_str().ok());
    if token_header.is_none() {
        return Ok((
            StatusCode::UNAUTHORIZED,
            Json(json!({
                "success": false,
                "data": { "error": "Token not included" }
            })),
        )
            .into_response());
    }
    let token = token_header.unwrap();

    // Use JWT_SECRET environment variable, defaulting to "secret" if not set.
    let secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "secret".to_string());
    let validation = Validation::default();

    // Verify the token.
    match decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_ref()),
        &validation,
    ) {
        Ok(token_data) => {
            // Insert claims into request extensions for later use.
            req.extensions_mut().insert(token_data.claims);
            Ok(next.run(req).await)
        }
        Err(err) => {
            let resp_text = match *err.kind() {
                ErrorKind::InvalidToken => "Invalid token included",
                ErrorKind::ExpiredSignature => "Token expired",
                _ => "Unauthorized",
            };
            Ok((
                StatusCode::UNAUTHORIZED,
                Json(json!({
                    "success": false,
                    "data": { "error": resp_text }
                })),
            )
                .into_response())
        }
    }
}
