import { test, expect } from "bun:test";
import request from "supertest";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// API Endpoints
const API_URL_AUTH = "http://localhost:8080/authentication";
const API_URL_USER = "http://localhost:8080/transaction";
const API_URL_ENGINE = "http://localhost:8080/engine";
const API_URL_SETUP = "http://localhost:8080/setup";

let token = "";
let stockId = "";

test("User Registration", async () => {
  const res = await request(API_URL_AUTH).post("/register").send({
    user_name: "test",
    password: "test",
    name: "Test User",
  });

  expect(res.statusCode).toBeOneOf([201, 400]); // 201 = Success, 400 = Already exists
  expect(res.body).toHaveProperty("success", true);
});

test("User Login", async () => {
  const res = await request(API_URL_AUTH).post("/login").send({
    user_name: "test",
    password: "test",
  });

  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty("success", true);
  expect(res.body.data).toHaveProperty("token");

  token = res.body.data.token;
});

test("Fetch Stock Prices", async () => {
  const res = await request(API_URL_USER)
    .get("/getStockPrices")
    .set("Authorization", `Bearer ${token}`);

  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty("success", true);
  expect(Array.isArray(res.body.data)).toBe(true);
});

test("Fetch Wallet Balance", async () => {
  const res = await request(API_URL_USER)
    .get("/getWalletBalance")
    .set("Authorization", `Bearer ${token}`);

  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty("success", true);
  expect(res.body.data).toHaveProperty("balance");
});

test("Fetch Stock Portfolio", async () => {
  const res = await request(API_URL_USER)
    .get("/getStockPortfolio")
    .set("Authorization", `Bearer ${token}`);

  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty("success", true);
  expect(Array.isArray(res.body.data)).toBe(true);
});

test("Fetch Wallet Transactions", async () => {
  const res = await request(API_URL_USER)
    .get("/getWalletTransactions")
    .set("Authorization", `Bearer ${token}`);

  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty("success", true);
  expect(Array.isArray(res.body.data)).toBe(true);
});

test("Fetch Stock Transactions", async () => {
  const res = await request(API_URL_USER)
    .get("/getStockTransactions")
    .set("Authorization", `Bearer ${token}`);

  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty("success", true);
  expect(Array.isArray(res.body.data)).toBe(true);
});

test("Add Money to Wallet", async () => {
  const res = await request(API_URL_USER)
    .post("/addMoneyToWallet")
    .set("Authorization", `Bearer ${token}`)
    .send({ amount: 100 });

  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty("success", true);
});

test("Create a New Stock", async () => {
  const res = await request(API_URL_SETUP)
    .post("/createStock")
    .send({ stock_name: "Google" });

  expect(res.statusCode).toBe(201);
  expect(res.body).toHaveProperty("success", true);
  expect(res.body.data).toHaveProperty("stock_id");

  stockId = res.body.data.stock_id;
});

test("Place a Stock Order", async () => {
  const res = await request(API_URL_ENGINE)
    .post("/placeStockOrder")
    .set("Authorization", `Bearer ${token}`)
    .send({
      stock_id: stockId,
      is_buy: true,
      order_type: "LIMIT",
      quantity: 100,
      price: 80,
    });

  expect(res.statusCode).toBe(201);
  expect(res.body).toHaveProperty("success", true);
});

test("Cancel a Stock Transaction", async () => {
  const res = await request(API_URL_ENGINE)
    .post("/cancelStockTransaction")
    .set("Authorization", `Bearer ${token}`)
    .send({ stock_tx_id: "62738363a50350b1fbb243a6" });

  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty("success", true);
});
