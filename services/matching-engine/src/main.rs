use axum::{
    routing::{delete, get, post},
    Router,
};
use dotenvy::dotenv;
use std::{env, sync::Arc};
use tokio::sync::RwLock;

mod handlers;
mod matching_pq;
mod models;
mod order_service;
mod state;

use handlers::{cancel_limit_sell, get_stock_prices, limit_sell, market_buy};
use state::AppState;

#[tokio::main]
async fn main() {
    // Load environment variables from Docker or environment directly
    dotenv().ok(); // This will load the .env file if it exists (optional)

    // Initialize application state
    let app_state = Arc::new(RwLock::new(AppState::new()));

    // Build router
    let app = Router::new()
        .route("/stockPrices", get(get_stock_prices))
        .route("/marketBuy", post(market_buy))
        .route("/limitSell", post(limit_sell))
        .route("/limitSell", delete(cancel_limit_sell))
        .with_state(app_state);

    let port: String = env::var("PORT").unwrap_or("3000".to_string());
    let server_endpoint = format!("0.0.0.0:{port}");

    // Run server
    let listener = tokio::net::TcpListener::bind(server_endpoint.clone())
        .await
        .unwrap();
    println!("Matching engine listening on {server_endpoint}");
    axum::serve(listener, app).await.unwrap();
}
