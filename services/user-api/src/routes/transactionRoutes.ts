import { Hono } from "hono";
import stockController from "../controllers/stockController";
import walletController from "../controllers/walletController";

const transactionRoutes = new Hono();

transactionRoutes.get("/getStockPrices", stockController.getStockPrices);
transactionRoutes.get("/getStockPortfolio", stockController.getStockPortfolio);
transactionRoutes.get(
  "/getStockTransactions",
  stockController.getStockTransactions
);

transactionRoutes.get("/getWalletBalance", walletController.getWalletBalance);
transactionRoutes.get(
  "/getWalletTransactions",
  walletController.getWalletTransactions
);
transactionRoutes.post("/addMoneyToWallet", walletController.addMoneyToWallet);

export default transactionRoutes;
