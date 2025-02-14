import { beforeAll, expect, test } from "bun:test";
import { apiRequest, createUniqueUser, uniqueUser, withAuth } from "./utils";

let validToken: string = "";
const invalidHeaders = { Authorization: "Bearer invalidToken" };

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
