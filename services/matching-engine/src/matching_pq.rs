use std::cmp::{Ordering, Reverse};
use std::collections::{BinaryHeap, HashMap};

#[derive(Debug, Clone, PartialEq)]
pub struct SellOrder {
    pub stock_id: String,
    pub stock_name: String,
    pub stock_tx_id: String,
    pub partially_sold: bool,
    pub ori_quantity: u64,
    pub cur_quantity: u64,
    pub price: f64,
    pub user_name: String, 
}

impl Eq for SellOrder {}

impl Ord for SellOrder {
    fn cmp(&self, other: &Self) -> Ordering {
        self.price.total_cmp(&other.price)
    }
}

impl PartialOrd for SellOrder {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

pub struct StockMatchingPriorityQueue {
    stock_queues: HashMap<String, BinaryHeap<Reverse<SellOrder>>>,
}

/* Makes it so we can use default() to init in AppState */
impl Default for StockMatchingPriorityQueue {
    fn default() -> Self {
        Self::new()
    }
}

impl StockMatchingPriorityQueue {
    pub fn new() -> Self {
        StockMatchingPriorityQueue {
            stock_queues: HashMap::new(),
        }
    }

    pub fn get_stock_queue(&self, stock_id: &str) -> Option<&BinaryHeap<Reverse<SellOrder>>> {
        self.stock_queues.get(stock_id)
    }

    pub fn insert(&mut self, order: SellOrder) {
        self.stock_queues
            .entry(order.stock_id.clone())
            .or_insert(BinaryHeap::new())
            .push(Reverse(order));
    }

    pub fn pop(&mut self, stock_id: &str) -> Option<SellOrder> {
        self.stock_queues
            .get_mut(stock_id)
            .and_then(|queue| queue.pop())
            .map(|Reverse(order)| order)
    }

    pub fn peek(&self, stock_id: &str) -> Option<&SellOrder> {
        self.stock_queues
            .get(stock_id)
            .and_then(|queue| queue.peek())
            .map(|Reverse(order)| order)
    }

    pub fn len(&self, stock_id: &str) -> usize {
        self.stock_queues
            .get(stock_id)
            .map_or(0, |queue| queue.len())
    }

    pub fn get_all_orders(&self, stock_id: &str) -> Vec<&SellOrder> {
        self.stock_queues
            .get(stock_id)
            .map(|queue| queue.iter().map(|Reverse(order)| order).collect())
            .unwrap_or_default()
    }

    pub fn get_all_stocks(&self) -> Vec<String> {
        self.stock_queues.keys().cloned().collect()
    }

    pub fn clear(&mut self, stock_id: &str) {
        if let Some(queue) = self.stock_queues.get_mut(stock_id) {
            queue.clear();
        }
    }

    pub fn remove_stock(&mut self, stock_id: &str) {
        self.stock_queues.remove(stock_id);
    }

    /* TODO: Removal is O(nlog(n)) due to rebuilding. This is one spot we can optimize later.  */
    pub fn remove_order(&mut self, stock_id: &str, stock_tx_id: &str) -> Option<SellOrder> {
        if let Some(queue) = self.stock_queues.get_mut(stock_id) {
            // Find the order and remove it
            let mut temp_queue = BinaryHeap::new();
            let mut removed_order = None;

            while let Some(Reverse(order)) = queue.pop() {
                if order.stock_tx_id == stock_tx_id {
                    removed_order = Some(order);
                } else {
                    temp_queue.push(Reverse(order));
                }
            }

            // Replace the original queue with our filtered queue
            *queue = temp_queue;
            removed_order
        } else {
            None
        }
    }
}
