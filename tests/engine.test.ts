import { test, expect, beforeAll, afterAll } from "bun:test";
import { apiRequest, createUniqueUser, delay, withAuth } from "./utils";

let sellUserTk: string;
let buyUserTk: string;
let stockId: string = "";
const invalidHeaders = { token: "invalidToken" };

beforeAll(async () => {
  const sellResult = await createUniqueUser();
  sellUserTk = sellResult.token;

  const buyResult = await createUniqueUser();
  buyUserTk = buyResult.token;

  stockId = (
    await apiRequest(
      "POST",
      "/setup/createStock",
      { stock_name: `Stock ${Date.now()}` },
      withAuth(sellUserTk),
      true
    )
  ).data.stock_id;

  await apiRequest(
    "POST",
    "/setup/addStockToUser",
    { stock_id: stockId, quantity: 20 },
    withAuth(sellUserTk),
    true
  );

  // Add money to buy user's wallet
  await apiRequest(
    "POST",
    "/transaction/addMoneyToWallet",
    { amount: 1000 },
    withAuth(buyUserTk),
    true
  );
});

// Clean up: Buy all remaining stocks
afterAll(async () => {
  // Add money to buy user's wallet
  await apiRequest(
    "POST",
    "/transaction/addMoneyToWallet",
    { amount: 1000000 },
    withAuth(buyUserTk),
    true
  );

  for (let i = 0; i < 100; i++) {
    const buyPayload = {
      stock_id: stockId,
      is_buy: true,
      order_type: "MARKET",
      quantity: Math.floor(Math.random() * 4) + 1,
    };

    const response = await apiRequest(
      "POST",
      "/engine/placeStockOrder",
      buyPayload,
      withAuth(buyUserTk)
    );
    if (!response.success) break;
  }
});

test("POST /engine/placeStockOrder places a limit sell order successfully", async () => {
  expect(stockId).toBeDefined();
  const sellPayload = {
    stock_id: stockId,
    is_buy: false,
    order_type: "LIMIT",
    quantity: 5,
    price: 10,
  };
  const response = await apiRequest(
    "POST",
    "/engine/placeStockOrder",
    sellPayload,
    withAuth(sellUserTk)
  );
  expect(response.success).toBe(true);
  expect(response.data).toBeNull();

  await delay(200); // Wait for the transaction to be processed

  // Verify that the order was placed successfully
  const txResponse = await apiRequest(
    "GET",
    "/transaction/getStockTransactions",
    undefined,
    withAuth(sellUserTk)
  );
  expect(txResponse.success).toBe(true);
  expect(Array.isArray(txResponse.data)).toBe(true);

  const tx = txResponse.data.find(
    (tx: any) =>
      tx.stock_id === stockId &&
      tx.order_type === "LIMIT" &&
      tx.is_buy === false &&
      tx.quantity === 5 &&
      tx.stock_price === 10 &&
      tx.order_status === "IN_PROGRESS"
  );
  expect(tx).toBeDefined();
  expect(tx.is_buy).toBe(false);
});

test("POST /engine/placeStockOrder places a market buy order successfully", async () => {
  expect(stockId).toBeDefined();
  const buyPayload = {
    stock_id: stockId,
    is_buy: true,
    order_type: "MARKET",
    quantity: 5,
  };
  const response = await apiRequest(
    "POST",
    "/engine/placeStockOrder",
    buyPayload,
    withAuth(buyUserTk)
  );
  expect(response.success).toBe(true);
  expect(response.data).toBeNull();

  await delay(200); // Wait for the transaction to be processed

  // Verify that the order was placed successfully
  const txResponse = await apiRequest(
    "GET",
    "/transaction/getStockTransactions",
    undefined,
    withAuth(buyUserTk)
  );
  expect(txResponse.success).toBe(true);
  expect(Array.isArray(txResponse.data)).toBe(true);

  const tx = txResponse.data.find(
    (tx: any) =>
      tx.stock_id === stockId &&
      tx.order_type === "MARKET" &&
      tx.is_buy === true &&
      tx.quantity === 5 &&
      tx.order_status === "COMPLETED"
  );
  expect(tx).toBeDefined();
});

test("POST /engine/placeStockOrder places a partial market buy order successfully", async () => {
  expect(stockId).toBeDefined();
  const sellPayload = {
    stock_id: stockId,
    is_buy: false,
    order_type: "LIMIT",
    quantity: 6,
    price: 10,
  };
  await apiRequest("POST", "/engine/placeStockOrder", sellPayload, withAuth(sellUserTk), true);

  await delay(200); // Wait for the transaction to be processed

  const buyPayload = {
    stock_id: stockId,
    is_buy: true,
    order_type: "MARKET",
    quantity: 1,
  };
  const response = await apiRequest(
    "POST",
    "/engine/placeStockOrder",
    buyPayload,
    withAuth(buyUserTk)
  );
  expect(response.success).toBe(true);
  expect(response.data).toBeNull();

  await delay(200); // Wait for the transaction to be processed

  // Verify that a partial transaction was generated for the sell order
  const txResponse = await apiRequest(
    "GET",
    "/transaction/getStockTransactions",
    undefined,
    withAuth(sellUserTk)
  );
  expect(txResponse.success).toBe(true);
  expect(Array.isArray(txResponse.data)).toBe(true);

  // Check root transaction
  const rootTx = txResponse.data.find(
    (tx: any) =>
      tx.stock_id === stockId &&
      tx.order_type === "LIMIT" &&
      tx.order_status === "PARTIALLY_COMPLETED" &&
      tx.quantity === 6 &&
      tx.is_buy === false &&
      tx.parent_stock_tx_id === null
  );
  expect(rootTx).toBeDefined();

  // Check partial transaction
  const partialTx = txResponse.data.find((tx: any) => tx.parent_stock_tx_id === rootTx.stock_tx_id);
  expect(partialTx).toBeDefined();
  expect(partialTx.quantity).toBe(1);
  expect(partialTx.order_status).toBe("COMPLETED");
  expect(partialTx.is_buy).toBe(false);
  expect(partialTx.order_type).toBe("LIMIT");
});

test("POST /engine/placeStockOrder a partial limit sell order is completed successfully", async () => {
  expect(stockId).toBeDefined();
  const buyPayload = {
    stock_id: stockId,
    is_buy: true,
    order_type: "MARKET",
    quantity: 5,
  };
  const response = await apiRequest(
    "POST",
    "/engine/placeStockOrder",
    buyPayload,
    withAuth(buyUserTk)
  );
  expect(response.success).toBe(true);
  expect(response.data).toBeNull();

  await delay(200); // Wait for the transaction to be processed

  // Verify that a partial transaction was generated for the sell order and parent is completed
  const txResponse = await apiRequest(
    "GET",
    "/transaction/getStockTransactions",
    undefined,
    withAuth(sellUserTk)
  );
  expect(txResponse.success).toBe(true);
  expect(Array.isArray(txResponse.data)).toBe(true);

  // Check root transaction
  const rootTx = txResponse.data.find(
    (tx: any) =>
      tx.stock_id === stockId &&
      tx.order_type === "LIMIT" &&
      tx.order_status === "COMPLETED" &&
      tx.quantity === 6 &&
      tx.is_buy === false &&
      tx.parent_stock_tx_id === null
  );
  expect(rootTx).toBeDefined();

  // Check partial transaction
  const partialTx = txResponse.data
    .toSorted((a: any, b: any) => b.time_stamp - a.time_stamp)
    .findLast((tx: any) => tx.parent_stock_tx_id === rootTx.stock_tx_id);
  expect(partialTx).toBeDefined();
  expect(partialTx.quantity).toBe(5);
  expect(partialTx.order_status).toBe("COMPLETED");
  expect(partialTx.is_buy).toBe(false);
  expect(partialTx.order_type).toBe("LIMIT");
});

test("POST /engine/cancelStockTransaction cancels a pending sell order", async () => {
  const sellPayload = {
    stock_id: stockId,
    is_buy: false,
    order_type: "LIMIT",
    quantity: 2,
    price: 100,
  };

  const sellOrderResponse = await apiRequest(
    "POST",
    "/engine/placeStockOrder",
    sellPayload,
    withAuth(sellUserTk)
  );
  expect(sellOrderResponse.success).toBe(true);

  await delay(200); // Wait for the transaction to be processed

  const txResponse = await apiRequest(
    "GET",
    "/transaction/getStockTransactions",
    undefined,
    withAuth(sellUserTk)
  );
  expect(txResponse.success).toBe(true);
  expect(Array.isArray(txResponse.data)).toBe(true);

  const pendingTx = txResponse.data.find(
    (tx) => tx.stock_id === stockId && tx.is_buy === false && tx.order_status === "IN_PROGRESS"
  );
  expect(pendingTx).toBeDefined();

  const cancelPayload = { stock_tx_id: pendingTx.stock_tx_id };
  const cancelResponse = await apiRequest(
    "POST",
    "/engine/cancelStockTransaction",
    cancelPayload,
    withAuth(sellUserTk)
  );
  expect(cancelResponse.success).toBe(true);
  expect(cancelResponse.data).toBeNull();
});

test("POST /engine/cancelStockTransaction a partially completed sell order is cancelled", async () => {
  const sellResult = await createUniqueUser();
  const sellUserTk = sellResult.token;

  const buyResult = await createUniqueUser();
  const buyUserTk = buyResult.token;

  const stockId = (
    await apiRequest(
      "POST",
      "/setup/createStock",
      { stock_name: `Stock ${Date.now()}` },
      withAuth(sellUserTk),
      true
    )
  ).data.stock_id;

  await apiRequest(
    "POST",
    "/setup/addStockToUser",
    { stock_id: stockId, quantity: 20 },
    withAuth(sellUserTk),
    true
  );

  // Add money to buy user's wallet
  await apiRequest(
    "POST",
    "/transaction/addMoneyToWallet",
    { amount: 1000 },
    withAuth(buyUserTk),
    true
  );

  // Check currently owned quantity
  const portfolioResponse = await apiRequest(
    "GET",
    "/transaction/getStockPortfolio",
    undefined,
    withAuth(sellUserTk)
  );
  expect(portfolioResponse.success).toBe(true);
  expect(Array.isArray(portfolioResponse.data)).toBe(true);

  const ownedStock = portfolioResponse.data.find((portfolio) => portfolio.stock_id === stockId);
  const ownedQty = ownedStock.quantity_owned;

  const qtyToSell = 2;
  const sellPayload = {
    stock_id: stockId,
    is_buy: false,
    order_type: "LIMIT",
    quantity: qtyToSell,
    price: 100,
  };

  const sellOrderResponse = await apiRequest(
    "POST",
    "/engine/placeStockOrder",
    sellPayload,
    withAuth(sellUserTk)
  );
  expect(sellOrderResponse.success).toBe(true);

  await delay(200); // Wait for the transaction to be processed

  const actuallySoldQty = 1;
  const buyOnePayload = {
    stock_id: stockId,
    is_buy: true,
    order_type: "MARKET",
    quantity: actuallySoldQty,
  };
  const buyOneOrderResponse = await apiRequest(
    "POST",
    "/engine/placeStockOrder",
    buyOnePayload,
    withAuth(buyUserTk)
  );
  expect(buyOneOrderResponse.success).toBe(true);

  await delay(200); // Wait for the transaction to be processed

  const txResponse = await apiRequest(
    "GET",
    "/transaction/getStockTransactions",
    undefined,
    withAuth(sellUserTk)
  );
  expect(txResponse.success).toBe(true);
  expect(Array.isArray(txResponse.data)).toBe(true);

  const partiallyCompletedTx = txResponse.data.find(
    (tx) =>
      tx.stock_id === stockId && tx.is_buy === false && tx.order_status === "PARTIALLY_COMPLETED"
  );
  expect(partiallyCompletedTx).toBeDefined();

  const cancelPayload = { stock_tx_id: partiallyCompletedTx.stock_tx_id };
  const cancelResponse = await apiRequest(
    "POST",
    "/engine/cancelStockTransaction",
    cancelPayload,
    withAuth(sellUserTk)
  );
  expect(cancelResponse.success).toBe(true);
  expect(cancelResponse.data).toBeNull();

  await delay(200); // Wait for the transaction to be processed

  // Check currently owned quantity
  const newPortfolioResponse = await apiRequest(
    "GET",
    "/transaction/getStockPortfolio",
    undefined,
    withAuth(sellUserTk)
  );
  expect(newPortfolioResponse.success).toBe(true);
  expect(Array.isArray(newPortfolioResponse.data)).toBe(true);

  const updatedOwnedStock = newPortfolioResponse.data.find(
    (portfolio) => portfolio.stock_id === stockId
  );

  const updatedQuantity = updatedOwnedStock.quantity_owned;

  expect(updatedQuantity).toBe(ownedQty - actuallySoldQty);
});

/* =========================================
   Failing Tests for Engine Routes
   ========================================= */

test("POST /engine/placeStockOrder fails for sell order with missing quantity", async () => {
  const payload = {
    stock_id: "dummy-stock-id", // using a dummy id for this test
    is_buy: false,
    order_type: "LIMIT",
    price: 150,
    // missing quantity
  };
  const response = await apiRequest(
    "POST",
    "/engine/placeStockOrder",
    payload,
    withAuth(sellUserTk)
  );
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
  expect(response.data.error).toBeTypeOf("string");
});

test("POST /engine/placeStockOrder fails for a partial buy order with invalid stock_id", async () => {
  const payload = {
    stock_id: "dummy-stock-id", // using a dummy id for test purposes
    is_buy: true,
    order_type: "MARKET",
    quantity: 10,
  };
  const response = await apiRequest(
    "POST",
    "/engine/placeStockOrder",
    payload,
    withAuth(buyUserTk)
  );

  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
  expect(response.data.error).toBeTypeOf("string");
});

test("POST /engine/placeStockOrder fails for partial buy order with invalid quantity type", async () => {
  const payload = {
    stock_id: "dummy-stock-id", // using a dummy id for test purposes
    is_buy: true,
    order_type: "MARKET",
    quantity: "ten", // invalid: should be a number
  };
  const response = await apiRequest(
    "POST",
    "/engine/placeStockOrder",
    payload,
    withAuth(buyUserTk)
  );
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
  expect(response.data.error).toBeTypeOf("string");
});

test("POST /engine/placeStockOrder fails with invalid token", async () => {
  const payload = {
    stock_id: "dummy-stock-id",
    is_buy: true,
    order_type: "MARKET",
    quantity: 100,
  };
  const response = await apiRequest("POST", "/engine/placeStockOrder", payload, {
    headers: invalidHeaders,
  });
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
  expect(response.data.error).toBeTypeOf("string");
});

test("POST /engine/placeStockOrder fails with missing stock_id", async () => {
  const payload = {
    // stock_id missing
    is_buy: true,
    order_type: "MARKET",
    quantity: 100,
  };
  const response = await apiRequest(
    "POST",
    "/engine/placeStockOrder",
    payload,
    withAuth(buyUserTk)
  );
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
  expect(response.data.error).toBeTypeOf("string");
});

test("POST /engine/placeStockOrder fails with invalid price type for sell order", async () => {
  const payload = {
    stock_id: "dummy-stock-id",
    is_buy: false,
    order_type: "LIMIT",
    quantity: 100,
    price: "eighty", // Invalid: price should be a number
  };
  const response = await apiRequest(
    "POST",
    "/engine/placeStockOrder",
    payload,
    withAuth(sellUserTk)
  );
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
  expect(response.data.error).toBeTypeOf("string");
});

test("POST /engine/cancelStockTransaction fails with invalid token", async () => {
  const payload = { stock_tx_id: "62738363a50350b1fbb243a6" };
  const response = await apiRequest("POST", "/engine/cancelStockTransaction", payload, {
    headers: invalidHeaders,
  });
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
  expect(response.data.error).toBeTypeOf("string");
});

test("POST /engine/cancelStockTransaction fails with missing stock_tx_id", async () => {
  const payload = {}; // Missing stock_tx_id.
  const response = await apiRequest(
    "POST",
    "/engine/cancelStockTransaction",
    payload,
    withAuth(sellUserTk)
  );
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
  expect(response.data.error).toBeTypeOf("string");
});

test("POST /engine/cancelStockTransaction fails with invalid stock_tx_id type", async () => {
  const payload = { stock_tx_id: 12345 }; // Invalid: expecting a string.
  const response = await apiRequest(
    "POST",
    "/engine/cancelStockTransaction",
    payload,
    withAuth(sellUserTk)
  );
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
  expect(response.data.error).toBeTypeOf("string");
});
