use crate::matching_pq::StockMatchingPriorityQueue;

#[derive(Default)]
pub struct AppState {
    pub matching_pq: StockMatchingPriorityQueue,
}

impl AppState {
    pub fn new() -> Self {
        Self::default()
    }
}
