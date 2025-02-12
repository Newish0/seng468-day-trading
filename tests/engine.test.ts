import { test, expect, beforeAll } from "bun:test";
import { apiRequest, uniqueUser, withAuth } from "./utils";

let test_user;
let validToken: string = "";
const invalidHeaders = { Authorization: "Bearer invalidToken" };

let googleStockId: string = "";

beforeAll(async () => {
  test_user = uniqueUser();

  // Obtain a valid token
  const loginResponse = await apiRequest("POST", "/authentication/login", {
    user_name: test_user.user_name,
    password: test_user.password,
  });
  validToken = loginResponse.data.token;

  // Create the Google stock if it doesn't exist
  const createStockResponse = await apiRequest(
    "POST",
    "/setup/createStock",
    { stock_name: "Google" },
    withAuth(validToken)
  );

  if (createStockResponse.success) {
    googleStockId = createStockResponse.data.stock_id;
  } else if (createStockResponse.error === "Stock already exists") {
    // If it already exists, assign a fallback value.
    // In a real scenario, you might call a GET endpoint to retrieve the existing stock's ID.
    googleStockId = "existing-google-stock-id";
  }
});

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

test("POST /engine/placeStockOrder places a sell order successfully", async () => {
  const payload = {
    stock_id: googleStockId, // assume googleStockId is defined
    is_buy: false,
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

test("POST /engine/placeStockOrder fails for sell order with missing quantity", async () => {
  const payload = {
    stock_id: googleStockId, // assume googleStockId is defined
    is_buy: false,
    order_type: "MARKET",
    // missing quantity
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

test("POST /engine/placeStockOrder places a partial buy order successfully", async () => {
  const payload = {
    stock_id: googleStockId, // assume googleStockId is defined
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

test("POST /engine/placeStockOrder fails for partial buy order with invalid quantity type", async () => {
  const payload = {
    stock_id: googleStockId, // assume googleStockId is defined
    is_buy: true,
    order_type: "MARKET",
    quantity: "ten", // invalid type: should be a number
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

//
// ----- Failing Tests for /engine/placeStockOrder -----
//

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
