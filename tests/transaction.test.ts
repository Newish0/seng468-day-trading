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

  // Fund the user's wallet so transactions can occur
  await apiRequest("POST", "/transaction/addMoneyToWallet", { amount: 1000 }, withAuth(validToken));

  // Ensure a stock exists (create if necessary)
  const stockResponse = await apiRequest(
    "POST",
    "/setup/createStock",
    { stock_name: `Stock ${Date.now()}` },
    withAuth(validToken)
  );
  const googleStockId = stockResponse.success ? stockResponse.data.stock_id : "fallback-stock-id";

  // Create a stock transaction by placing a buy order (generates stock & wallet transactions)
  await apiRequest(
    "POST",
    "/engine/placeStockOrder",
    {
      stock_id: googleStockId,
      is_buy: true,
      order_type: "MARKET",
      quantity: 10,
    },
    withAuth(validToken)
  );
});

//
// Functional Tests
//

test("GET /transaction/getStockPrices returns valid stock prices", async () => {
  const response = await apiRequest(
    "GET",
    "/transaction/getStockPrices",
    undefined,
    withAuth(validToken)
  );
  console.log(response);
  expect(response.success).toBe(true);
  expect(Array.isArray(response.data)).toBe(true);
  expect(response.data).toBeGreaterThan(0);
  response.data.forEach((stock: any) => {
    expect(stock).toHaveProperty("stock_id");
    expect(typeof stock.stock_id).toBe("number");
    expect(stock).toHaveProperty("stock_name");
    expect(typeof stock.stock_name).toBe("string");
    expect(stock).toHaveProperty("current_price");
    expect(typeof stock.current_price).toBe("number");
  });
});

test("GET /transaction/getWalletBalance returns valid wallet balance", async () => {
  const response = await apiRequest(
    "GET",
    "/transaction/getWalletBalance",
    undefined,
    withAuth(validToken)
  );
  expect(response.success).toBe(true);
  expect(response.data).toHaveProperty("balance");
  expect(typeof response.data.balance).toBe("number");
});

test("GET /transaction/getStockPortfolio returns a valid stock portfolio", async () => {
  const response = await apiRequest(
    "GET",
    "/transaction/getStockPortfolio",
    undefined,
    withAuth(validToken)
  );
  expect(response.success).toBe(true);
  expect(Array.isArray(response.data)).toBe(true);
  expect(response.data).toBeGreaterThan(0);
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
    withAuth(validToken)
  );
  expect(response.success).toBe(true);
  expect(Array.isArray(response.data)).toBe(true);
  expect(response.data).toBeGreaterThan(0);
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
    withAuth(validToken)
  );
  expect(response.success).toBe(true);
  expect(Array.isArray(response.data)).toBe(true);
  expect(response.data).toBeGreaterThan(0);
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
    expect(tx).toHaveProperty("parent_tx_id"); // may be null or string
    expect(tx).toHaveProperty("time_stamp");
    expect(typeof tx.time_stamp).toBe("string");
  });
});

test("POST /transaction/addMoneyToWallet adds money successfully", async () => {
  const response = await apiRequest(
    "POST",
    "/transaction/addMoneyToWallet",
    { amount: 100 },
    withAuth(validToken)
  );
  expect(response.success).toBe(true);
  expect(response.data).toBeNull();
});

//
// Failing Tests
//

// GET endpoints with invalid token
test("GET /transaction/getStockPrices fails with invalid token", async () => {
  const response = await apiRequest("GET", "/transaction/getStockPrices", undefined, {
    headers: invalidHeaders,
  });
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error");
});

test("GET /transaction/getWalletBalance fails with invalid token", async () => {
  const response = await apiRequest("GET", "/transaction/getWalletBalance", undefined, {
    headers: invalidHeaders,
  });
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error");
});

test("GET /transaction/getStockPortfolio fails with invalid token", async () => {
  const response = await apiRequest("GET", "/transaction/getStockPortfolio", undefined, {
    headers: invalidHeaders,
  });
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error");
});

test("GET /transaction/getWalletTransactions fails with invalid token", async () => {
  const response = await apiRequest("GET", "/transaction/getWalletTransactions", undefined, {
    headers: invalidHeaders,
  });
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error");
});

test("GET /transaction/getStockTransactions fails with invalid token", async () => {
  const response = await apiRequest("GET", "/transaction/getStockTransactions", undefined, {
    headers: invalidHeaders,
  });
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error");
});

// POST /transaction/addMoneyToWallet failing tests
test("POST /transaction/addMoneyToWallet fails when 'amount' field is missing", async () => {
  const response = await apiRequest(
    "POST",
    "/transaction/addMoneyToWallet",
    {},
    withAuth(validToken)
  );
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error");
});

test("POST /transaction/addMoneyToWallet fails when 'amount' is not a number", async () => {
  const response = await apiRequest(
    "POST",
    "/transaction/addMoneyToWallet",
    { amount: "notANumber" },
    withAuth(validToken)
  );
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error");
});

test("POST /transaction/addMoneyToWallet fails with invalid token", async () => {
  const response = await apiRequest(
    "POST",
    "/transaction/addMoneyToWallet",
    { amount: 100 },
    { headers: invalidHeaders }
  );
  expect(response.success).toBe(false);
  expect(response).toHaveProperty("error");
});
