import { Hono } from "hono";
import { isAddMoneyToWalletRequest } from "shared-types/dtos/user-api/transaction/addMoneyToWallet";
import { getValidator } from "shared-utils";
import stockController from "../controllers/stockController";
import walletController from "../controllers/walletController";

const transactionRoutes = new Hono();

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
transactionRoutes.post(
  "/addMoneyToWallet",
  getValidator(isAddMoneyToWalletRequest),
  walletController.addMoneyToWallet
);

export default transactionRoutes;
