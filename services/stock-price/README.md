# Stock Price Service

Implements `/stockPrices` and consumes from `stock_prices_exchange` to update list of stock prices in memory.

When consuming a message which does not have `stock_name` or `current_price`, then it will remove the stock from the price list.

## Running the Service

1. Ensure you have Rust and Cargo installed.
2. Run the service:
   ```
   cargo run
   ```
   or with hot reload

   ```bash
   cargo watch -x run
   ```

### Starting RabbitMQ with Docker

Start the RabbitMQ container with:
```
docker run -d --rm --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management
```

## Building for release

  ```bash
  cargo build --release
  ```

Ensure RabbitMQ is running before starting the service.

## Testing

1. With rabbitmq and stock price service running, go to rabbitmq dashboard at `http://localhost:15672/`
2. Sign in with user=`guest`, password=`guest`
3. Go to `http://localhost:15672/#/exchanges/%2F/stock_prices_exchange` to publish stock price message

### Sample stock price message

**Routing key**

`stock.price.appl`

**Message payload**

```
{
  "stock_name": "Apple",
  "stock_id": "appl",
  "current_price": 1234
}
```