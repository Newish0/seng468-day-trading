# user-api

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.0. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

# DOCS

## Project structure

user-api // service root
├── src // Source code
│ ├── controllers // Controllers to handle routes
│ │ ├── engineController.ts
│ │ ├── setupController.ts
│ │ ├── stockController.ts
│ │ ├── walletController.ts
│ ├── routes // Route definitions
│ │ ├── transactionRoutes.ts
│ │ ├── engineRoutes.ts
│ │ ├── setupRoutes.ts
│ ├── services // Service abstractions, database call wrappers
│ │ └── ...TODO
│ └── index.ts // Main entrypoint
├── Dockerfile
└── ...misc. config files

## Routes

/transaction/getStockPrices - Fetches current stock prices

/transaction/getStockPortfolio - Fetches stock portfolio for logged in user

/transaction/getStockTransactions - Fetches all stock transactions for logged in user

/transaction/getWalletBalance - Fetches wallet balance for logged in user

/transaction/getWalletTransactions - Fetches all wallet transactions for logged in user

/transaction/addMoneyToWallet - Add specified amount to wallet of logged in user

/engine/placeStockOrder - Place a buy or sell order for stocks

/engine/cancelStockTransaction - Cancel a pending sell order

/setup/createStock - Creates a new stock in the system

/setup/addStockToUser - Adds the given number of shares of stock to the user 
