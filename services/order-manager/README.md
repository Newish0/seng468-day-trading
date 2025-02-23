# order-service

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.45. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

## API Specs

The following routes are from User-API -> Order-Service

### `/placeLimitSell`

Placing a limit sell order.

-   Method: POST
-   Request Body:
    ```ts
    {
        stock_id: string,
        quantity: number,
        price: number, 
        user_name: string, 
    }
    ```
-   Response: (if success)
    ```ts
    {
        success: true,
        data: null
    }

-   Response: (if error)
    ```ts
    {
        success: true,
        data?: {error: <message>}
    }
    ```


### `/placeMarketBuy`

Placing a market buy order.

-   Method: POST
-   Request Body:
    ```ts
    {
        stock_id: string,
        quantity: number,
        user_name: string, 
    }
    ```

-   Response: (if success)
    ```ts
    {
        success: true, 
        data: null
    }

-   Response: (if error)
    ```ts
    {
        success: true,
        data: {error: string}
    }
    ```

### `/cancelStockTransaction`

Cancel a stock transaction

-   Method: POST
-   Request Body:
    ```ts
    {
        stock_tx_id: string,
        user_name: string, 
    }
    ```
-   Response: (if success)
    ```ts
    {
        success: true, 
        data: null
    }

-   Response: (if error)
    ```ts
    {
        success: true,
        data: {error: string}
    }
    ```






