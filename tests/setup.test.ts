import { beforeAll, expect, test } from "bun:test";
import { apiRequest, createUniqueUser, uniqueUser, withAuth } from "./utils";

let validToken: string = "";
const invalidHeaders = { token: "invalidToken" };

beforeAll(async () => {
  validToken = (await createUniqueUser()).token;
});

//
// Functional Tests
//

test("POST /setup/createStock successfully creates a stock", async () => {
  const payload = { stock_name: `Stock ${Date.now()}` };
  const response = await apiRequest("POST", "/setup/createStock", payload, withAuth(validToken));
  expect(response.success).toBe(true);
  expect(response.data).toHaveProperty("stock_id");
  expect(typeof response.data.stock_id).toBe("string");
});

//
// Failing Tests
//

test("POST /setup/createStock fails with invalid token", async () => {
  const payload = { stock_name: `Stock ${Date.now()}` };
  const response = await apiRequest("POST", "/setup/createStock", payload, {
    headers: invalidHeaders,
  });

  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
});

test("POST /setup/createStock fails with missing stock_name", async () => {
  // Missing required stock_name field.
  const payload = {};
  const response = await apiRequest("POST", "/setup/createStock", payload, withAuth(validToken));

  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
});

test("POST /setup/createStock fails with invalid stock_name type", async () => {
  // stock_name should be a string, but a number is provided.
  const payload = { stock_name: 12345 };
  const response = await apiRequest("POST", "/setup/createStock", payload, withAuth(validToken));

  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
});

//
// Tests for the addStockToUser route
//

// Functional Test: Successfully add stock to user
test("POST /setup/addStockToUser successfully adds stock to user", async () => {
  // First, create a new stock to add
  const stockPayload = { stock_name: `StockToAdd ${Date.now()}` };
  const createStockResponse = await apiRequest(
    "POST",
    "/setup/createStock",
    stockPayload,
    withAuth(validToken)
  );
  expect(createStockResponse.success).toBe(true);
  const stockId = createStockResponse.data.stock_id;
  expect(typeof stockId).toBe("string");

  // Now, add the stock to the user with a specific quantity
  const addPayload = { stock_id: stockId, quantity: 50 };
  const addResponse = await apiRequest(
    "POST",
    "/setup/addStockToUser",
    addPayload,
    withAuth(validToken)
  );

  expect(addResponse.success).toBe(true);
  expect(addResponse.data).toBeNull();
});

// Failing Test: addStockToUser fails with invalid token
test("POST /setup/addStockToUser fails with invalid token", async () => {
  const payload = { stock_id: "some-stock-id", quantity: 50 };
  const response = await apiRequest("POST", "/setup/addStockToUser", payload, {
    headers: invalidHeaders,
  });
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
});

// Failing Test: addStockToUser fails with missing stock_id
test("POST /setup/addStockToUser fails with missing stock_id", async () => {
  const payload = { quantity: 50 };
  const response = await apiRequest("POST", "/setup/addStockToUser", payload, withAuth(validToken));
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
});

// Failing Test: addStockToUser fails with missing quantity
test("POST /setup/addStockToUser fails with missing quantity", async () => {
  const payload = { stock_id: "some-stock-id" };
  const response = await apiRequest("POST", "/setup/addStockToUser", payload, withAuth(validToken));
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
});

// Failing Test: addStockToUser fails with invalid quantity type
test("POST /setup/addStockToUser fails with invalid quantity type", async () => {
  const payload = { stock_id: "some-stock-id", quantity: "fifty" };
  const response = await apiRequest("POST", "/setup/addStockToUser", payload, withAuth(validToken));
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
});

// Failing Test: addStockToUser fails with invalid quantity type
test("POST /setup/addStockToUser fails with invalid quantity type", async () => {
  const payload = { stock_id: "some-stock-id", quantity: -50 };
  const response = await apiRequest("POST", "/setup/addStockToUser", payload, withAuth(validToken));
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
});
