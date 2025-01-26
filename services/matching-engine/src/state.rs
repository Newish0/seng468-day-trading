use crate::matching_pq::StockMatchingPriorityQueue;

#[derive(Default)]
pub struct AppState {
    // pub stock_prices: HashMap<String, f64>,
    pub matching_pq: StockMatchingPriorityQueue,
}

impl AppState {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn get_stock_price(&self, stock_id: &str) -> Option<f64> {
        self.matching_pq.peek(stock_id).map(|order| order.price)
    }
}
