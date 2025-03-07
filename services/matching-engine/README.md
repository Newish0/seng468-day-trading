# Matching Engine

## Quicks Start

```bash
cargo run
```

or with hot reload

```bash
cargo watch -x run
```

## Building for release

```bash
cargo build --release
```

## Message Specs As Consumer 
These outlines the message body sent from the Order Placement/Cancellation Service -> M.E. 

The exchange is `order_exchange`.

### Routing Key `order.market_buy.shard_<shard_id>`
```rs
pub struct MarketBuyRequest {
    pub stock_id: String,
    pub quantity: u64,
    pub stock_tx_id: String,
    pub budget: f64,
    pub user_name: String,
}
```

### Routing Key `order.limit_sell.shard_<shard_id>`
```rs
pub struct LimitSellRequest {
    pub stock_id: String,
    pub stock_name: String,
    pub quantity: u64,
    pub price: f64,
    pub stock_tx_id: String,
    pub user_name: String,
}
```


### Routing Key `order.limit_sell_cancellation.shard_<shard_id>`
```rs
pub struct LimitSellCancelRequest {
    pub stock_id: String,
    pub quantity: u64,
    pub price: f64,
    pub stock_tx_id: String,
}
```

## Order Related Message Specs As Producer
These outlines the message body sent from the M.E. -> Order Update Service.

The exchange is `order_update_exchange`.

## Routing Key `order.buy_completed`
```rs
pub struct MarketBuyResponse {
    pub success: bool,
    pub data: MarketBuyData,
}

pub struct MarketBuyData {
    pub stock_id: String,
    pub stock_tx_id: String,
    pub quantity: Option<u64>, // None if success is false
    pub price_total: Option<f64>, // None if success is false
}
```

## Routing Key `order.cancelled`
```rs

pub struct LimitSellCancelResponse {
    pub success: bool,
    pub data: Option<LimitSellCancelData>,
}

pub struct LimitSellCancelData {
    pub stock_id: String,
    pub stock_tx_id: String,
    pub partially_sold: bool,
    pub ori_quantity: u64,
    pub cur_quantity: u64,
    pub sold_quantity: u64,
    pub price: f64,
}
```

### Routing Key `order.sale_update`
```rs
pub struct OrderUpdate {
    pub stock_id: String,
    pub sold_quantity: u64,
    pub remaining_quantity: u64,
    pub price: f64,
    pub stock_tx_id: String,
    pub user_name: String,
}
```

## Stock Price Message Specs As Producer
These outlines the message body sent from the M.E. -> Stock Price Service.

The exchange is `stock_prices_exchange`.

### Routing Key `stock.price.<stock_id>`
```rs
pub struct StockPrice {
    pub stock_id: String,
    pub stock_name: Option<String>, // None/null if stock is no longer available
    pub current_price: Option<f64>, // None/null if stock is no longer available
}