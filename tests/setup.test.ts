import { test, expect, beforeAll } from "bun:test";
import { apiRequest, uniqueUser } from "./utils";

let test_user;
let validToken: string = "";
const invalidHeaders = { Authorization: "Bearer invalidToken" };

function withAuth(token: string) {
  return { headers: { Authorization: `Bearer ${token}` } };
}

beforeAll(async () => {
  test_user = uniqueUser();
  // Register the new user
  await apiRequest("POST", "/authentication/register", test_user);
  // Login to obtain a valid token
  const loginResponse = await apiRequest("POST", "/authentication/login", {
    user_name: test_user.user_name,
    password: test_user.password,
  });
  validToken = loginResponse.data.token;
});

//
// Functional Tests
//

test("POST /setup/createStock successfully creates a stock", async () => {
  const payload = { stock_name: `Stock ${Date.now()}` };
  const response = await apiRequest("POST", "/setup/createStock", payload, withAuth(validToken));
  console.log(response);
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
  expect(response).toHaveProperty("error");
});

test("POST /setup/createStock fails with missing stock_name", async () => {
  // Missing required stock_name field.
  const payload = {};
  const response = await apiRequest("POST", "/setup/createStock", payload, withAuth(validToken));

  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error");
});

test("POST /setup/createStock fails with invalid stock_name type", async () => {
  // stock_name should be a string, but a number is provided.
  const payload = { stock_name: 12345 };
  const response = await apiRequest("POST", "/setup/createStock", payload, withAuth(validToken));

  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error");
});
