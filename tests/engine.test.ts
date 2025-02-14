import { test, expect, beforeAll } from "bun:test";
import { apiRequest, createUniqueUser, withAuth } from "./utils";

let sellUser: string;
let buyUser: string;
let stockId: string = "";
const invalidHeaders = { Authorization: "Bearer invalidToken" };

beforeAll(async () => {
  const sellResult = await createUniqueUser();
  sellUser = sellResult.token;

  const buyResult = await createUniqueUser();
  buyUser = buyResult.token;

  stockId = (
    await apiRequest(
      "POST",
      "/setup/createStock",
      { stock_name: `Stock ${Date.now()}` },
      withAuth(sellUser),
      true
    )
  ).data.stock_id;

  await apiRequest(
    "POST",
    "/setup/addStockToUser",
    { stock_id: stockId, quantity: 20 },
    withAuth(sellUser),
    true
  );
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
    withAuth(sellUser)
  );
  expect(response.success).toBe(true);
  expect(response.data).toBeNull();
});

test("POST /engine/placeStockOrder places a market buy order successfully", async () => {
  expect(stockId).toBeDefined();
  const buyPayload = {
    stock_id: stockId,
    is_buy: true,
    order_type: "MARKET",
    quantity: 5,
    price: 0, // TODO, price to be removed
  };
  const response = await apiRequest(
    "POST",
    "/engine/placeStockOrder",
    buyPayload,
    withAuth(buyUser)
  );
  expect(response.success).toBe(true);
  expect(response.data).toBeNull();
});

test("POST /engine/placeStockOrder places a partial market buy order successfully", async () => {
  expect(stockId).toBeDefined();
  const sellPayload = {
    stock_id: stockId,
    is_buy: false,
    order_type: "LIMIT",
    quantity: 5,
    price: 10,
  };
  await apiRequest("POST", "/engine/placeStockOrder", sellPayload, withAuth(sellUser), true);

  const buyPayload = {
    stock_id: stockId,
    is_buy: true,
    order_type: "MARKET",
    quantity: 1,
    price: 0, // TODO, price to be removed
  };
  const response = await apiRequest(
    "POST",
    "/engine/placeStockOrder",
    buyPayload,
    withAuth(buyUser)
  );
  expect(response.success).toBe(true);
  expect(response.data).toBeNull();
});

test("POST /engine/placeStockOrder a partial limit sell order is completed successfully", async () => {
  expect(stockId).toBeDefined();
  const buyPayload = {
    stock_id: stockId,
    is_buy: true,
    order_type: "MARKET",
    quantity: 4,
    price: 0, // TODO, price to be removed
  };
  const response = await apiRequest(
    "POST",
    "/engine/placeStockOrder",
    buyPayload,
    withAuth(buyUser)
  );
  expect(response.success).toBe(true);
  expect(response.data).toBeNull();
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
  const response = await apiRequest("POST", "/engine/placeStockOrder", payload, withAuth(sellUser));
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Quantity is required");
});

test("POST /engine/placeStockOrder places a partial buy order successfully", async () => {
  const payload = {
    stock_id: "dummy-stock-id", // using a dummy id for test purposes
    is_buy: true,
    order_type: "MARKET",
    quantity: 10,
  };
  const response = await apiRequest("POST", "/engine/placeStockOrder", payload, withAuth(buyUser));
  expect(response.success).toBe(true);
  expect(response.data).toBeNull();
});

test("POST /engine/placeStockOrder fails for partial buy order with invalid quantity type", async () => {
  const payload = {
    stock_id: "dummy-stock-id", // using a dummy id for test purposes
    is_buy: true,
    order_type: "MARKET",
    quantity: "ten", // invalid: should be a number
  };
  const response = await apiRequest("POST", "/engine/placeStockOrder", payload, withAuth(buyUser));
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Invalid quantity");
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
  expect(response).toHaveProperty("error", "Unauthorized");
});

test("POST /engine/placeStockOrder fails with missing stock_id", async () => {
  const payload = {
    // stock_id missing
    is_buy: true,
    order_type: "MARKET",
    quantity: 100,
  };
  const response = await apiRequest("POST", "/engine/placeStockOrder", payload, withAuth(buyUser));
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Stock ID is required");
});

test("POST /engine/placeStockOrder fails with invalid price type for sell order", async () => {
  const payload = {
    stock_id: "dummy-stock-id",
    is_buy: false,
    order_type: "LIMIT",
    quantity: 100,
    price: "eighty", // Invalid: price should be a number
  };
  const response = await apiRequest("POST", "/engine/placeStockOrder", payload, withAuth(sellUser));
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Invalid price");
});

test("POST /engine/cancelStockTransaction fails with invalid token", async () => {
  const payload = { stock_tx_id: "62738363a50350b1fbb243a6" };
  const response = await apiRequest("POST", "/engine/cancelStockTransaction", payload, {
    headers: invalidHeaders,
  });
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Unauthorized");
});

test("POST /engine/cancelStockTransaction fails with missing stock_tx_id", async () => {
  const payload = {}; // Missing stock_tx_id.
  const response = await apiRequest(
    "POST",
    "/engine/cancelStockTransaction",
    payload,
    withAuth(sellUser)
  );
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Stock transaction ID is required");
});

test("POST /engine/cancelStockTransaction fails with invalid stock_tx_id type", async () => {
  const payload = { stock_tx_id: 12345 }; // Invalid: expecting a string.
  const response = await apiRequest(
    "POST",
    "/engine/cancelStockTransaction",
    payload,
    withAuth(sellUser)
  );
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Invalid stock transaction ID");
});
