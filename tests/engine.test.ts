import { test, expect, beforeAll } from "bun:test";
import { apiRequest, uniqueUser, withAuth } from "./utils";

let validToken;
let test_user;
let googleStockId;
const invalidHeaders = { Authorization: "Bearer invalidToken" };

beforeAll(async () => {
  test_user = uniqueUser();

  await apiRequest("POST", "/authentication/register", test_user);

  const loginResponse1 = await apiRequest("POST", "/authentication/login", {
    user_name: test_user.user_name,
    password: test_user.password,
  });
  validToken = loginResponse1.data.token;

  const stockname = `Stock ${Date.now()}`;

  const createStockResponse = await apiRequest(
    "POST",
    "/setup/createStock",
    { stock_name: stockname },
    withAuth(validToken)
  );

  if (createStockResponse.success) {
    googleStockId = createStockResponse.data.stock_id;
  } else {
    console.error("Could not create stock");
  }

  await apiRequest(
    "POST",
    "/setup/addStockToUser",
    { stock_id: googleStockId, quantity: 20 },
    withAuth(validToken)
  );
});

// Functional Tests

test("POST /engine/placeStockOrder places a limit sell order successfully", async () => {
  const sellPayload = {
    stock_id: googleStockId,
    is_buy: false,
    order_type: "LIMIT",
    quantity: 10,
    price: 150,
  };

  const sellResponse = await apiRequest(
    "POST",
    "/engine/placeStockOrder",
    sellPayload,
    withAuth(validToken)
  );

  expect(sellResponse.success).toBe(true);
  expect(sellResponse.data).toBeNull();
});

test("POST /engine/placeStockOrder places a market buy order successfully", async () => {
  const buyPayload = {
    stock_id: googleStockId,
    is_buy: true,
    order_type: "MARKET",
    quantity: 1,
    price: 0, // TODO price should not be defined here.
  };
  const buyResponse = await apiRequest(
    "POST",
    "/engine/placeStockOrder",
    buyPayload,
    withAuth(validToken)
  );

  console.log(buyPayload, buyResponse);
  expect(buyResponse.success).toBe(true);
  expect(buyResponse.data).toBeNull();
});

// Test for canceling a stock transaction successfully
// (Assumes a valid stock transaction ID exists; in a real test, create one then cancel it)
test("POST /engine/cancelStockTransaction cancels a transaction successfully", async () => {
  const payload = { stock_tx_id: "62738363a50350b1fbb243a6" };
  const cancelResponse = await apiRequest(
    "POST",
    "/engine/cancelStockTransaction",
    payload,
    withAuth(validToken)
  );
  expect(cancelResponse.success).toBe(true);
  expect(cancelResponse.data).toBeNull();
});

// Sell order failing when quantity is missing (sell orders require quantity)
test("POST /engine/placeStockOrder fails for sell order with missing quantity", async () => {
  const payload = {
    stock_id: googleStockId,
    is_buy: false,
    order_type: "LIMIT",
    // quantity is missing
    price: 150,
  };
  const response = await apiRequest(
    "POST",
    "/engine/placeStockOrder",
    payload,
    withAuth(validToken)
  );
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Quantity is required");
});

// Partial buy order (buy orders are MARKET orders and do not include a price)
test("POST /engine/placeStockOrder places a partial buy order successfully", async () => {
  const payload = {
    stock_id: googleStockId,
    is_buy: true,
    order_type: "MARKET",
    quantity: 10,
  };
  const response = await apiRequest(
    "POST",
    "/engine/placeStockOrder",
    payload,
    withAuth(validToken)
  );
  expect(response.success).toBe(true);
  expect(response.data).toBeNull();
});

// Partial buy order failing with invalid quantity type
test("POST /engine/placeStockOrder fails for partial buy order with invalid quantity type", async () => {
  const payload = {
    stock_id: googleStockId,
    is_buy: true,
    order_type: "MARKET",
    quantity: "ten", // invalid: should be a number
  };
  const response = await apiRequest(
    "POST",
    "/engine/placeStockOrder",
    payload,
    withAuth(validToken)
  );
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Invalid quantity");
});

// ----- Failing Tests for /engine/placeStockOrder -----

test("POST /engine/placeStockOrder fails with invalid token", async () => {
  const payload = {
    stock_id: googleStockId,
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
    // stock_id is missing
    is_buy: true,
    order_type: "MARKET",
    quantity: 100,
  };
  const response = await apiRequest(
    "POST",
    "/engine/placeStockOrder",
    payload,
    withAuth(validToken)
  );
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Stock ID is required");
});

// For sell orders, test invalid price type (price must be a number)
test("POST /engine/placeStockOrder fails with invalid price type for sell order", async () => {
  const payload = {
    stock_id: googleStockId,
    is_buy: false,
    order_type: "LIMIT",
    quantity: 100,
    price: "eighty", // Invalid: price should be a number.
  };
  const response = await apiRequest(
    "POST",
    "/engine/placeStockOrder",
    payload,
    withAuth(validToken)
  );
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Invalid price");
});

// ----- Tests for /engine/cancelStockTransaction -----

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
    withAuth(validToken)
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
    withAuth(validToken)
  );
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Invalid stock transaction ID");
});
