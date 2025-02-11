import { test, expect, beforeAll } from "bun:test";
import { apiRequest, TEST_USER } from "./utils";

// Test for placing a stock order successfully
test("POST /engine/placeStockOrder places an order successfully", async () => {
  const payload = {
    stock_id: 1,
    is_buy: true,
    order_type: "LIMIT",
    quantity: 100,
    price: 80,
  };
  const response = await apiRequest("POST", "/engine/placeStockOrder", payload);
  expect(response.success).toBe(true);
  expect(response.data).toBeNull();
});

// Test for canceling a stock transaction successfully
test("POST /engine/cancelStockTransaction cancels a transaction successfully", async () => {
  const payload = { stock_tx_id: "62738363a50350b1fbb243a6" };
  const response = await apiRequest("POST", "/engine/cancelStockTransaction", payload);
  expect(response.success).toBe(true);
  expect(response.data).toBeNull();
});

// Set up a valid token for tests that require authentication.
let validToken: string = "";
const invalidHeaders = { Authorization: "Bearer invalidToken" };

function withAuth(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

beforeAll(async () => {
  // Login to obtain a valid token.
  const loginResponse = await apiRequest("POST", "/authentication/login", {
    user_name: TEST_USER.user_name,
    password: TEST_USER.password,
  });
  validToken = loginResponse.data.token;
});

// ----- Tests for /engine/placeStockOrder -----

test("POST /engine/placeStockOrder fails with invalid token", async () => {
  const payload = {
    stock_id: 1,
    is_buy: true,
    order_type: "LIMIT",
    quantity: 100,
    price: 80,
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
    order_type: "LIMIT",
    quantity: 100,
    price: 80,
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

test("POST /engine/placeStockOrder fails with invalid price type", async () => {
  const payload = {
    stock_id: 1,
    is_buy: true,
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
