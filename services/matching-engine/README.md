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

## API Specs

The API endpoints are intentionally named slight different from the endpoints that will be exposed to the client to differentiate between them. These internal API endpoints are meant to be used by the Order Service (and maybe the Main User API for `/stockPrices`).

### `/stockPrices`

-   Method: GET
-   Request Body: None
-   Response:
    ```ts
    {
        success: boolean,
        data?: ({
            stock_id: string,
            current_price: number,
        })[]
    }
    ```

### `/markerBuy`

Placing a market buy order.

-   Method: POST
-   Request Body:
    ```ts
    {
        stock_id: string,
        quantity: number,
        stock_tx_id: string,
        budget: number, 
    }
    ```
-   Response:
    ```ts
    {
        success: boolean,
        data?: {
            stock_id: string,
            stock_tx_id: string,
            quantity: number,
            price_total: number,
        }
    }
    ```

### `/limitSell`

Placing a limit sell order.

-   Method: POST
-   Request Body:
    ```ts
    {
        stock_id: string,
        quantity: number,
        price: number,
        stock_tx_id: string,
    }
    ```
-   Response:
    ```ts
    {
        success: boolean,
    }
    ```

Cancelling a limit sell order.

-   Method: DELETE
-   Request Body:
    ```ts
    {
        stock_id: string,
        quantity: number,
        price: number,
        stock_tx_id: string,
    }
    ```
-   Response:
    ```ts
    {
        success: boolean,
        data?: {
            stock_id: string,
            stock_tx_id: string,
            partially_sold: boolean,
            ori_quantity: number,
            cur_quantity: number,
            sold_quantity: number,
            price: number,
        }
    }
    ```

## Expected API Specs of the Order Service

### Partial Sell Update

-   Route: `http://order_svc/partialSell`
-   Method: `POST`
-   Request Body:
    ```ts
    {
        stock_id: string,
        quantity: number, // Number of shares sold for this new transaction
        price: number, // Price it was sold at; should be the same as the requested price
        stock_tx_id: string, // The original root tx_id
    }
    ```

NOTE: the `stock_tx_id` will always be the initial transaction ID. That is, all subsequent partial sells will use the root transaction ID.

### Complete Sell Update

-   Route: `http://order_svc/completeSell`
-   Method: `POST`
-   Request Body:
    ```ts
    {
        stock_id: string,
        quantity: number, // total number of shares sold; should be the same as the requested number
        price: number, // Price it was sold at; should be the same as the requested price
        stock_tx_id: string, // The original root tx_id
    }
    ```

### Example Interaction between the Matching Engine & Order Service

Original limit sell order to `http://matching_engine/limitSell`

> Order Service --> Matching Engine

```ts
{
      stock_id: "GOOG",
      quantity: 100,
      price: 42.0,
      stock_tx_id: "f001",
}
```

First partial sell to `http://order_svc/partialSell`

> Matching Engine --> Order Service

```ts
{
      stock_id: "GOOG",
      quantity: 11,
      price: 42.0,
      stock_tx_id: "f001",
}
```

Second partial sell to `http://order_svc/partialSell`

> Matching Engine --> Order Service

```ts
{
      stock_id: "GOOG",
      quantity: 69,
      price: 42.0,
      stock_tx_id: "f001",
}
```

Third partial sell to `http://order_svc/partialSell`

> Matching Engine --> Order Service

```ts
{
      stock_id: "GOOG",
      quantity: 20,
      price: 42.0,
      stock_tx_id: "f001",
}
```

Complete the sell order via `http://order_svc/completeSell`

> Matching Engine --> Order Service

```ts
{
      stock_id: "GOOG",
      quantity: 100,
      price: 42.0,
      stock_tx_id: "f001",
}
```

The quantity across the partial sells should add up to the original sell of 100.
