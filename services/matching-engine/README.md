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

### `/marketBuy`

Placing a market buy order.

-   Method: POST
-   Request Body:
    ```ts
    {
        stock_id: string,
        quantity: number,
        stock_tx_id: string,
        budget: number,
        user_name: string
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
        user_name: string
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

### Sale Update

-   Route: `http://order_svc/updateSale`
-   Method: `POST`
-   Request Body:

    ```ts
    {
        stock_id: string,
        sold_quantity: number, // Number of shares sold at this time
        remaining_quantity: number, // Number of shares remaining in the Matching Engine
        price: number, // Price it was sold at; should be the same as the requested price
        stock_tx_id: string, / The original root tx_id
        user_name: string, // the user_name of the user who created the limit sell
    }
    ```

NOTE: the `stock_tx_id` will always be the initial transaction ID. That is, all subsequent partial sells will use the root transaction ID.
