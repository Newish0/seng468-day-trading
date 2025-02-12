import type {
  CancelSellRequest,
  LimitSellOrderRequest,
  MarketBuyRequest,
} from "shared-types/dtos/order-service/orderRequests";

interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  backoffFactor: number;
  jitterFacFn: () => number;
}

export class MatchingEngineService {
  private readonly baseUrl: string;
  private readonly retryConfig: RetryConfig;

  constructor(
    baseUrl: string,
    retryConfig: RetryConfig = {
      maxRetries: 3,
      initialDelayMs: 1000, // 1 sec
      backoffFactor: 2,
      jitterFacFn: () => 0.75 + Math.random() * 0.5,
    }
  ) {
    this.baseUrl = baseUrl;
    this.retryConfig = retryConfig;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private calculateBackoff(attempt: number): number {
    const delay =
      this.retryConfig.initialDelayMs * Math.pow(this.retryConfig.backoffFactor, attempt);

    // Add jitter to prevent thundering herd
    return delay * this.retryConfig.jitterFacFn();
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        const statusCode = (error as any)?.status;

        if (attempt === this.retryConfig.maxRetries) {
          throw lastError;
        }

        const backoffMs = this.calculateBackoff(attempt);
        console.warn(
          `Retry attempt ${attempt + 1}/${
            this.retryConfig.maxRetries
          } after ${backoffMs}ms. Status: ${statusCode}`
        );
        await this.delay(backoffMs);
      }
    }

    throw lastError;
  }

  /**
   * Sends a limit sell order request to the matching engine.
   */
  async placeLimitSellOrder(limitSellRequest: LimitSellOrderRequest) {
    return this.withRetry(async () => {
      const response = await fetch(`${this.baseUrl}/limitSell`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(limitSellRequest),
      });

      if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        (error as any).status = response.status;
        throw error;
      }

      const result = await response.json();

      if (!result || !result.success) {
        throw new Error("Limit sell order failed");
      }

      return result;
    });
  }

  /**
   * Sends a market buy order request to the matching engine.
   */
  async placeMarketBuyOrder(marketBuyRequest: MarketBuyRequest) {
    return this.withRetry(async () => {
      const response = await fetch(`${this.baseUrl}/marketBuy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(marketBuyRequest),
      });

      if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        (error as any).status = response.status;
        throw error;
      }

      const result = await response.json();

      if (!result || !result.success) {
        throw new Error("Market buy order failed");
      }

      return result;
    });
  }

  /**
   * Fetches current stock prices from the matching engine.
   */
  async getStockPrices() {
    return this.withRetry(async () => {
      const response = await fetch(`${this.baseUrl}/stockPrices`);

      if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        (error as any).status = response.status;
        throw error;
      }

      const json = await response.json();
      return json.data;
    });
  }

  /**
   * Sends a cancel sell order request to the matching engine.
   */
  async cancelSellOrder(cancelSellRequest: CancelSellRequest) {
    return this.withRetry(async () => {
      const response = await fetch(`${this.baseUrl}/limitSell`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cancelSellRequest),
      });

      if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        (error as any).status = response.status;
        throw error;
      }

      return response;
    });
  }
}
