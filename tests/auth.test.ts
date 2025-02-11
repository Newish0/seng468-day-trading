import { test, expect } from "bun:test";
import { apiRequest, TEST_USER } from "./utils";

let authToken: string = "";

// ✅ Test 1: Register a new user
test("Register a new user", async () => {
  const response = await apiRequest("POST", "/authentication/register", TEST_USER);

  expect(response).toEqual({ success: true, data: null });
});

// ✅ Test 2: Login and store token
test("Login a user", async () => {
  const response = await apiRequest("POST", "/authentication/login", {
    user_name: TEST_USER.user_name,
    password: TEST_USER.password,
  });

  expect(response.success).toBe(true);
  expect(response.data).toHaveProperty("token");

  authToken = response.data.token; // Store token for future use
});

// ✅ Test 3: Ensure token is not empty
test("Verify login token is valid", async () => {
  expect(authToken).toBeDefined();
  expect(authToken.length).toBeGreaterThan(10); // Ensure token is long enough to be valid
});

// Ensure the test user is registered first (if not already registered)
await apiRequest("POST", "/authentication/register", TEST_USER);

test("Fail to register an already existing user", async () => {
  // Attempt to register the same user again.
  const response = await apiRequest("POST", "/authentication/register", TEST_USER);

  // We expect the API to fail the registration.
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "User already exists");
});

test("Fail to login with incorrect password", async () => {
  const response = await apiRequest("POST", "/authentication/login", {
    user_name: TEST_USER.user_name,
    password: "wrongPassword",
  });

  // We expect login to fail with an invalid password.
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Invalid credentials");
});

test("Fail to login with a non-existent user", async () => {
  const response = await apiRequest("POST", "/authentication/login", {
    user_name: "nonexistentuser",
    password: "anyPassword",
  });

  // We expect the API to indicate that the user was not found.
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "User not found");
});

test("Fail to register with missing password field", async () => {
  // Missing the required password field.
  const incompleteUser = { user_name: "userWithoutPassword" };
  const response = await apiRequest("POST", "/authentication/register", incompleteUser);

  // We expect registration to fail because the password is missing.
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Password is required");
});

test("Fail to login with missing credentials", async () => {
  const response = await apiRequest("POST", "/authentication/login", {});

  // We expect login to fail when credentials are missing.
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error", "Missing credentials");
});
