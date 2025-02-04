import type {
  LimitSellOrderRequest,
  MarketBuyRequest,
  CancelSellRequest,
} from "shared-types/dtos/order-service/orderRequests";

export class MatchingEngineService {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Sends a limit sell order request to the matching engine.
   */
  async placeLimitSellOrder(limitSellRequest: LimitSellOrderRequest) {
    let response;
    try {
      response = await fetch(`${this.baseUrl}/limitSell`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(limitSellRequest),
      });
    } catch (err) {
      throw new Error("Unknown error with limit sell");
    }

    let result;
    try {
      result = await response.json();
    } catch (err) {
      throw new Error("Failed to parse response as JSON");
    }

    if (!result || !result.success) {
      throw new Error("Limit sell order failed");
    }

    return result;
  }

  /**
   * Sends a market buy order request to the matching engine.
   */
  async placeMarketBuyOrder(marketBuyRequest: MarketBuyRequest) {
    let response;
    try {
      response = await fetch(`${this.baseUrl}/marketBuy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(marketBuyRequest),
      });
    } catch (err) {
      throw new Error("Unknown error with market buy");
    }

    let result;
    try {
      result = await response.json();
    } catch (err) {
      throw new Error("Failed to parse response as JSON (Market Buy)");
    }

    if (!result || !result.success) {
      throw new Error("Market sell order failed");
    }

    return result;
  }

  /**
   * Fetches current stock prices from the matching engine.
   */
  async getStockPrices() {
    try {
      const response = await fetch(`${this.baseUrl}/getStockPrices`);

      if (!response.ok) {
        throw new Error("Failed to fetch stock prices");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error("Failed to fetch stock prices");
    }
  }

  /**
   * Sends a cancel sell order request to the matching engine.
   */
  async cancelSellOrder(cancelSellRequest: CancelSellRequest) {
    try {
      const response = await fetch(`${this.baseUrl}/limitSell`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cancelSellRequest),
      });

      return response;
    } catch (error) {
      throw new Error("Error with API request to matching engine");
    }
  }
}


