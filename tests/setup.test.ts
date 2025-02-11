import { test, expect, beforeAll } from "bun:test";
import { apiRequest, TEST_USER } from "./utils";

// Helper to get valid authentication token
let validToken: string = "";
const invalidHeaders = { Authorization: "Bearer invalidToken" };

function withAuth(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

beforeAll(async () => {
  // Login to obtain a valid token for authenticated requests
  const loginResponse = await apiRequest("POST", "/authentication/login", {
    user_name: TEST_USER.user_name,
    password: TEST_USER.password,
  });
  validToken = loginResponse.data.token;
});

//
// Functional Tests
//

test("POST /setup/createStock successfully creates a stock", async () => {
  const payload = { stock_name: "Google" };
  const response = await apiRequest("POST", "/setup/createStock", payload, withAuth(validToken));

  expect(response.success).toBe(true);
  expect(response.data).toHaveProperty("stock_id");
  expect(typeof response.data.stock_id).toBe("string");
});

//
// Failing Tests
//

test("POST /setup/createStock fails with invalid token", async () => {
  const payload = { stock_name: "Google" };
  const response = await apiRequest("POST", "/setup/createStock", payload, {
    headers: invalidHeaders,
  });

  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Unauthorized");
});

test("POST /setup/createStock fails with missing stock_name", async () => {
  // Missing required stock_name field.
  const payload = {};
  const response = await apiRequest("POST", "/setup/createStock", payload, withAuth(validToken));

  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Stock name is required");
});

test("POST /setup/createStock fails with invalid stock_name type", async () => {
  // stock_name should be a string, but a number is provided.
  const payload = { stock_name: 12345 };
  const response = await apiRequest("POST", "/setup/createStock", payload, withAuth(validToken));

  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Invalid stock name");
});
