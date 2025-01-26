use axum::{
    routing::{delete, get, post},
    Router,
};
use std::sync::Arc;
use tokio::sync::RwLock;

mod handlers;
mod matching_pq;
mod models;
mod state;

use handlers::{cancel_limit_sell, get_stock_prices, limit_sell, market_buy};
use state::AppState;

#[tokio::main]
async fn main() {
    // Initialize application state
    let app_state = Arc::new(RwLock::new(AppState::new()));

    // Build router
    let app = Router::new()
        .route("/stockPrices", get(get_stock_prices))
        .route("/marketBuy", post(market_buy))
        .route("/limitSell", post(limit_sell))
        .route("/limitSell", delete(cancel_limit_sell))
        .with_state(app_state);

    // Run server
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("Matching engine listening on port 3000");
    axum::serve(listener, app).await.unwrap();
}
