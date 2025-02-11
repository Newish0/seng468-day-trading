import { test, expect, beforeAll } from "bun:test";
import { apiRequest, TEST_USER } from "./utils";

// We'll obtain a valid token to use for tests that check for bad input
let validToken: string = "";
// Define an invalid token header for unauthorized tests
const invalidHeaders = { Authorization: "Bearer invalidToken" };

// A helper to create auth header options with a given token
function withAuth(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

beforeAll(async () => {
  // Login to get a valid token for tests that require proper authentication.
  const loginResponse = await apiRequest("POST", "/authentication/login", {
    user_name: TEST_USER.user_name,
    password: TEST_USER.password,
  });
  validToken = loginResponse.data.token;
});

// ======================================================
// Failing tests for GET endpoints (invalid token)
// ======================================================

test("GET /transaction/getStockPrices fails with invalid token", async () => {
  const response = await apiRequest("GET", "/transaction/getStockPrices", undefined, {
    headers: invalidHeaders,
  });
  // Expect the API to reject the request due to an invalid token.
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Unauthorized");
});

test("GET /transaction/getWalletBalance fails with invalid token", async () => {
  const response = await apiRequest("GET", "/transaction/getWalletBalance", undefined, {
    headers: invalidHeaders,
  });
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Unauthorized");
});

test("GET /transaction/getStockPortfolio fails with invalid token", async () => {
  const response = await apiRequest("GET", "/transaction/getStockPortfolio", undefined, {
    headers: invalidHeaders,
  });
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Unauthorized");
});

test("GET /transaction/getWalletTransactions fails with invalid token", async () => {
  const response = await apiRequest("GET", "/transaction/getWalletTransactions", undefined, {
    headers: invalidHeaders,
  });
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Unauthorized");
});

test("GET /transaction/getStockTransactions fails with invalid token", async () => {
  const response = await apiRequest("GET", "/transaction/getStockTransactions", undefined, {
    headers: invalidHeaders,
  });
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Unauthorized");
});

// ======================================================
// Failing tests for POST /transaction/addMoneyToWallet
// ======================================================

test("POST /transaction/addMoneyToWallet fails when 'amount' field is missing", async () => {
  // Use a valid token but send an empty payload (missing the amount field)
  const response = await apiRequest(
    "POST",
    "/transaction/addMoneyToWallet",
    {},
    withAuth(validToken)
  );
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Amount is required");
});

test("POST /transaction/addMoneyToWallet fails when 'amount' is not a number", async () => {
  // Use a valid token but send an invalid (non-numeric) amount
  const response = await apiRequest(
    "POST",
    "/transaction/addMoneyToWallet",
    { amount: "notANumber" },
    withAuth(validToken)
  );
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Invalid amount");
});

test("POST /transaction/addMoneyToWallet fails with invalid token", async () => {
  // Attempt to add money with a valid payload but an invalid token.
  const response = await apiRequest(
    "POST",
    "/transaction/addMoneyToWallet",
    { amount: 100 },
    { headers: invalidHeaders }
  );
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Unauthorized");
});
