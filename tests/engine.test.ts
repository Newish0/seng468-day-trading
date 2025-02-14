import { beforeAll, test, expect } from "bun:test";
import { apiRequest, uniqueUser, withAuth } from "./utils";

let walletTestUser, testUser1, testUser2;
let walletToken = "";
let validToken1 = "";
let validToken2 = "";
let googleStockId = "";
const invalidHeaders = { Authorization: "Bearer invalidToken" };

beforeAll(async () => {
  // Create unique users for wallet and transactions
  walletTestUser = uniqueUser();
  testUser1 = uniqueUser();
  testUser2 = uniqueUser();

  // Register users
  await apiRequest("POST", "/authentication/register", walletTestUser);
  await apiRequest("POST", "/authentication/register", testUser1);
  await apiRequest("POST", "/authentication/register", testUser2);

  // Login users
  const walletLogin = await apiRequest("POST", "/authentication/login", {
    user_name: walletTestUser.user_name,
    password: walletTestUser.password,
  });
  walletToken = walletLogin.data.token;

  const login1 = await apiRequest("POST", "/authentication/login", {
    user_name: testUser1.user_name,
    password: testUser1.password,
  });
  validToken1 = login1.data.token;

  const login2 = await apiRequest("POST", "/authentication/login", {
    user_name: testUser2.user_name,
    password: testUser2.password,
  });
  validToken2 = login2.data.token;

  // Fund wallet for testUser2 so transactions can occur
  await apiRequest(
    "POST",
    "/transaction/addMoneyToWallet",
    { amount: 1000 },
    withAuth(validToken2)
  );

  // Create a new stock using testUser1's token
  const stockName = `Stock ${Date.now()}`;
  const stockResponse = await apiRequest(
    "POST",
    "/setup/createStock",
    { stock_name: stockName },
    withAuth(validToken1)
  );
  googleStockId = stockResponse.success ? stockResponse.data.stock_id : "fallback-stock-id";

  // Add stock to testUser1 for selling
  await apiRequest(
    "POST",
    "/setup/addStockToUser",
    { stock_id: googleStockId, quantity: 20 },
    withAuth(validToken1)
  );

  // Create a sell order (LIMIT) for testUser1
  const sellResponse = await apiRequest(
    "POST",
    "/engine/placeStockOrder",
    {
      stock_id: googleStockId,
      is_buy: false,
      order_type: "LIMIT",
      quantity: 5,
      price: 10,
    },
    withAuth(validToken1)
  );
  if (!sellResponse.success) {
    console.error("Failed to place sell order:", sellResponse.data.error);
  }

  // Create a buy order (MARKET) for testUser2 to generate transactions
  const buyResponse = await apiRequest(
    "POST",
    "/engine/placeStockOrder",
    {
      stock_id: googleStockId,
      is_buy: true,
      order_type: "MARKET",
      quantity: 5,
      price: 0, // Price not used for buy market orders
    },
    withAuth(validToken2)
  );
  if (!buyResponse.success) {
    console.error("Failed to place buy order:", buyResponse.data.error);
  }
});

/* =========================
   Transaction Functional Tests
   ========================= */

test("GET /transaction/getStockPrices returns valid stock prices", async () => {
  const response = await apiRequest(
    "GET",
    "/transaction/getStockPrices",
    undefined,
    withAuth(validToken1)
  );
  expect(response.success).toBe(true);
  expect(Array.isArray(response.data)).toBe(true);
  expect(response.data.length).toBeGreaterThan(0);
  response.data.forEach((stock: any) => {
    expect(stock).toHaveProperty("stock_id");
    expect(typeof stock.stock_id).toBe("number");
    expect(stock).toHaveProperty("stock_name");
    expect(typeof stock.stock_name).toBe("string");
    expect(stock).toHaveProperty("current_price");
    expect(typeof stock.current_price).toBe("number");
  });
});

test("GET /transaction/getStockPortfolio returns a valid stock portfolio", async () => {
  const response = await apiRequest(
    "GET",
    "/transaction/getStockPortfolio",
    undefined,
    withAuth(validToken1)
  );
  expect(response.success).toBe(true);
  expect(Array.isArray(response.data)).toBe(true);
  expect(response.data.length).toBeGreaterThan(0);
  response.data.forEach((item: any) => {
    expect(item).toHaveProperty("stock_id");
    expect(typeof item.stock_id).toBe("number");
    expect(item).toHaveProperty("stock_name");
    expect(typeof item.stock_name).toBe("string");
    expect(item).toHaveProperty("quantity_owned");
    expect(typeof item.quantity_owned).toBe("number");
  });
});

test("GET /transaction/getWalletTransactions returns valid wallet transactions", async () => {
  const response = await apiRequest(
    "GET",
    "/transaction/getWalletTransactions",
    undefined,
    withAuth(validToken1)
  );
  expect(response.success).toBe(true);
  expect(Array.isArray(response.data)).toBe(true);
  expect(response.data.length).toBeGreaterThan(0);
  response.data.forEach((tx: any) => {
    expect(tx).toHaveProperty("wallet_tx_id");
    expect(typeof tx.wallet_tx_id).toBe("string");
    expect(tx).toHaveProperty("stock_tx_id");
    expect(typeof tx.stock_tx_id).toBe("string");
    expect(tx).toHaveProperty("is_debit");
    expect(typeof tx.is_debit).toBe("boolean");
    expect(tx).toHaveProperty("amount");
    expect(typeof tx.amount).toBe("number");
    expect(tx).toHaveProperty("time_stamp");
    expect(typeof tx.time_stamp).toBe("string");
  });
});

test("GET /transaction/getStockTransactions returns valid stock transactions", async () => {
  const response = await apiRequest(
    "GET",
    "/transaction/getStockTransactions",
    undefined,
    withAuth(validToken1)
  );
  expect(response.success).toBe(true);
  expect(Array.isArray(response.data)).toBe(true);
  expect(response.data.length).toBeGreaterThan(0);
  response.data.forEach((tx: any) => {
    expect(tx).toHaveProperty("stock_tx_id");
    expect(typeof tx.stock_tx_id).toBe("string");
    expect(tx).toHaveProperty("stock_id");
    expect(typeof tx.stock_id).toBe("number");
    expect(tx).toHaveProperty("wallet_tx_id");
    expect(typeof tx.wallet_tx_id).toBe("string");
    expect(tx).toHaveProperty("order_status");
    expect(typeof tx.order_status).toBe("string");
    expect(tx).toHaveProperty("is_buy");
    expect(typeof tx.is_buy).toBe("boolean");
    expect(tx).toHaveProperty("order_type");
    expect(typeof tx.order_type).toBe("string");
    expect(tx).toHaveProperty("stock_price");
    expect(typeof tx.stock_price).toBe("number");
    expect(tx).toHaveProperty("quantity");
    expect(typeof tx.quantity).toBe("number");
    expect(tx).toHaveProperty("parent_tx_id");
    expect(tx).toHaveProperty("time_stamp");
    expect(typeof tx.time_stamp).toBe("string");
  });
});

/* =========================
   Wallet Functional Tests
   ========================= */

test("GET /transaction/getWalletBalance returns valid wallet balance", async () => {
  const response = await apiRequest(
    "GET",
    "/transaction/getWalletBalance",
    undefined,
    withAuth(walletToken)
  );
  expect(response.success).toBe(true);
  expect(response.data).toHaveProperty("balance");
  expect(typeof response.data.balance).toBe("number");
  expect(response.data.balance).toBe(0);
});

test("POST /transaction/addMoneyToWallet adds money successfully", async () => {
  const addMoneyResp = await apiRequest(
    "POST",
    "/transaction/addMoneyToWallet",
    { amount: 100 },
    withAuth(walletToken)
  );
  expect(addMoneyResp.success).toBe(true);
  expect(addMoneyResp.data).toBeNull();
});

test("GET /transaction/getWalletBalance returns updated balance", async () => {
  const response = await apiRequest(
    "GET",
    "/transaction/getWalletBalance",
    undefined,
    withAuth(walletToken)
  );
  expect(response.success).toBe(true);
  expect(response.data).toHaveProperty("balance");
  expect(typeof response.data.balance).toBe("number");
  expect(response.data.balance).toBe(100);
});

/* =========================
   Failing Tests
   ========================= */

// GET endpoints with invalid token
test("GET /transaction/getStockPrices fails with invalid token", async () => {
  const response = await apiRequest("GET", "/transaction/getStockPrices", undefined, {
    headers: invalidHeaders,
  });
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
});

test("GET /transaction/getWalletBalance fails with invalid token", async () => {
  const response = await apiRequest("GET", "/transaction/getWalletBalance", undefined, {
    headers: invalidHeaders,
  });
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
});

test("GET /transaction/getStockPortfolio fails with invalid token", async () => {
  const response = await apiRequest("GET", "/transaction/getStockPortfolio", undefined, {
    headers: invalidHeaders,
  });
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
});

test("GET /transaction/getWalletTransactions fails with invalid token", async () => {
  const response = await apiRequest("GET", "/transaction/getWalletTransactions", undefined, {
    headers: invalidHeaders,
  });
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
});

test("GET /transaction/getStockTransactions fails with invalid token", async () => {
  const response = await apiRequest("GET", "/transaction/getStockTransactions", undefined, {
    headers: invalidHeaders,
  });
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
});

// POST /transaction/addMoneyToWallet failing tests
test("POST /transaction/addMoneyToWallet fails when 'amount' field is missing", async () => {
  const response = await apiRequest(
    "POST",
    "/transaction/addMoneyToWallet",
    {},
    withAuth(validToken1)
  );
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
});

test("POST /transaction/addMoneyToWallet fails when 'amount' is not a number", async () => {
  const response = await apiRequest(
    "POST",
    "/transaction/addMoneyToWallet",
    { amount: "notANumber" },
    withAuth(validToken1)
  );
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
});

test("POST /transaction/addMoneyToWallet fails with invalid token", async () => {
  const response = await apiRequest(
    "POST",
    "/transaction/addMoneyToWallet",
    { amount: 100 },
    { headers: invalidHeaders }
  );
  expect(response.success).toBe(false);
  expect(response.data).toHaveProperty("error");
});
