import { test, expect } from "bun:test";

const BASE_URL = "http://localhost:8080";
const TEST_USER = { user_name: "test", password: "test", name: "Test User" };

let authToken: string;
let stockId: string;
let stockTxId: string;

// Helper function to make API requests
async function apiRequest(method: string, endpoint: string, body?: object) {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  return response.json();
}

// Step 1: Register a new user
test("Register a new user", async () => {
  const response = await apiRequest(
    "POST",
    "/authentication/register",
    TEST_USER
  );
  expect(response).toEqual({ success: true, data: null });
});

// Step 2: Login and store token
test("Login a user", async () => {
  const response = await apiRequest("POST", "/authentication/login", {
    user_name: TEST_USER.user_name,
    password: TEST_USER.password,
  });

  expect(response.success).toBe(true);
  expect(response.data).toHaveProperty("token");

  authToken = response.data.token; // Store token for future requests
});

// Step 3: Add money to wallet
test("Add money to wallet", async () => {
  const response = await apiRequest("POST", "/transaction/addMoneyToWallet", {
    amount: 10000,
  });

  expect(response).toEqual({ success: true, data: null });
});

// Step 4: Create a stock and store stock_id
test("Create a new stock", async () => {
  const response = await apiRequest("POST", "/setup/createStock", {
    stock_name: "Google",
  });

  expect(response.success).toBe(true);
  expect(response.data).toHaveProperty("stock_id");

  stockId = response.data.stock_id; // Store stock_id for future requests
});

// Step 5: Place a stock order
test("Place a stock order", async () => {
  const response = await apiRequest("POST", "/engine/placeStockOrder", {
    stock_id: stockId,
    is_buy: true,
    order_type: "LIMIT",
    quantity: 50,
    price: 150,
  });

  expect(response).toEqual({ success: true, data: null });
});

// Step 6: Retrieve stock transactions and store stock_tx_id
test("Retrieve stock transactions", async () => {
  const response = await apiRequest("GET", "/transaction/getStockTransactions");

  expect(response.success).toBe(true);
  expect(response.data.length).toBeGreaterThan(0);

  stockTxId = response.data[0].stock_tx_id; // Store stock_tx_id for future tests
});

// Step 7: Retrieve stock portfolio
test("Retrieve stock portfolio", async () => {
  const response = await apiRequest("GET", "/transaction/getStockPortfolio");

  expect(response.success).toBe(true);
  expect(response.data.length).toBeGreaterThan(0);
});

// Step 8: Retrieve wallet balance
test("Retrieve wallet balance", async () => {
  const response = await apiRequest("GET", "/transaction/getWalletBalance");

  expect(response.success).toBe(true);
  expect(response.data).toHaveProperty("balance");
});

// Step 9: Retrieve wallet transactions
test("Retrieve wallet transactions", async () => {
  const response = await apiRequest(
    "GET",
    "/transaction/getWalletTransactions"
  );

  expect(response.success).toBe(true);
  expect(response.data.length).toBeGreaterThan(0);
});

// Step 10: Cancel a stock transaction
test("Cancel a stock transaction", async () => {
  const response = await apiRequest("POST", "/engine/cancelStockTransaction", {
    stock_tx_id: stockTxId,
  });

  expect(response).toEqual({ success: true, data: null });
});

// Step 11: Retrieve updated stock transactions
test("Retrieve updated stock transactions", async () => {
  const response = await apiRequest("GET", "/transaction/getStockTransactions");

  expect(response.success).toBe(true);
  expect(response.data.length).toBeGreaterThan(0);
});
