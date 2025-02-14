import { test, expect, beforeAll } from "bun:test";
import { apiRequest, uniqueUser } from "./utils";

let test_user;
let authToken: string = "";

beforeAll(() => {
  test_user = uniqueUser();
});

// ✅ Test 1: Register a new user
test("Register a new user", async () => {
  const response = await apiRequest("POST", "/authentication/register", test_user);
  expect(response).toEqual({ success: true, data: null });
});

// ✅ Test 2: Login and store token
test("Login a user", async () => {
  const response = await apiRequest("POST", "/authentication/login", test_user);

  expect(response.success).toBe(true);
  expect(response.data).toHaveProperty("token");

  authToken = response.data.token; // Store token for future use
});

// ✅ Test 3: Ensure token is not empty
test("Verify login token is valid", async () => {
  expect(authToken).toBeDefined();
  expect(typeof authToken).toBe("string"); // Confirm it's a string
  expect(authToken.length).toBeGreaterThan(10); // Ensure token is long enough to be valid
});

test("Fail to register an already existing user", async () => {
  // Attempt to register the same user again.
  const response = await apiRequest("POST", "/authentication/register", test_user);

  // We expect the API to fail the registration.
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
});

test("Fail to login with incorrect password", async () => {
  const response = await apiRequest("POST", "/authentication/login", {
    user_name: test_user.user_name,
    password: "wrongPassword",
  });

  // We expect login to fail with an invalid password.
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
});

test("Fail to login with a non-existent user", async () => {
  const response = await apiRequest("POST", "/authentication/login", {
    user_name: "nonexistentuser",
    password: "anyPassword",
  });

  // We expect the API to indicate that the user was not found.
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
});

test("Fail to register with missing password field", async () => {
  // Missing the required password field.
  const incompleteUser = { user_name: "userWithoutPassword" };
  const response = await apiRequest("POST", "/authentication/register", incompleteUser);

  // We expect registration to fail because the password is missing.
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
});

test("Fail to login with missing credentials", async () => {
  const response = await apiRequest("POST", "/authentication/login", {});

  // We expect login to fail when credentials are missing.
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
});
