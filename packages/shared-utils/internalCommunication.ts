import { getEnvVariable } from "./env";
import type { FetchOptions, InternalResponse, Endpoint } from "../shared-types/dtos/index";

const internalEndpoints = {
  orderService: {
    host: getEnvVariable("ORDER_SERVICE_HOST", "http://localhost:3001"),
    placeMarketBuy: {
      path: "/placeMarketBuy",
      requestMethod: "POST",
    },
    placeLimitSell: {
      path: "/placeLimitSell",
      requestMethod: "POST",
    },
    getStockPrices: {
      path: "/getStockPrices",
      requestMethod: "GET",
    },
    cancelStockTransaction: {
      path: "/cancelStockTransaction",
      requestMethod: "POST",
    },
  },
  matchingEngine: {
    host: getEnvVariable("MATCHING_ENGINE_HOST", "http://localhost:3002"),
    stockPrices: {
      path: "/stockPrices",
      requestMethod: "GET",
    },
    marketBuy: {
      path: "/marketBuy",
      requestMethod: "POST",
    },
    limitSell: {
      path: "/limitSell",
      requestMethod: "POST",
    },
    cancelLimitSell: {
      path: "/cancelLimitSell",
      requestMethod: "DELETE",
    },
  },
} as const;

export const makeInternalRequest =
  <TRequest, TResponse>(options: FetchOptions<TRequest>) =>
  async <
    TService extends keyof typeof internalEndpoints,
    TEndpoint extends keyof (typeof internalEndpoints)[TService]
  >(
    serviceName: TService,
    endpointName: TEndpoint
  ): Promise<InternalResponse<TResponse>> => {
    const { headers, body } = options;
    const host = internalEndpoints[serviceName].host;
    const endpoint = internalEndpoints[serviceName][endpointName] as Endpoint;

    try {
      const response = await fetch(`${host}${endpoint.path}`, {
        method: endpoint.requestMethod,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, status: response.status, error };
      }

      const data = (await response.json()) as TResponse;
      return { success: true, status: response.status, data };
    } catch (e) {
      return { success: false, status: 500, error: "Internal server error" };
    }
  };

// SAMPLE USAGE
type PlaceMarketBuyRequest = {
  stock_id: string;
  quantity: number;
};
type PlaceMarketBuyResponse = {
  quantity_bought: number;
};
async function sampleUsage() {
  const response = await makeInternalRequest<PlaceMarketBuyRequest, PlaceMarketBuyResponse>({
    body: {
      stock_id: "AAPL",
      quantity: 10,
    },
  })("orderService", "placeMarketBuy");
  if (!response.success) {
    response.error; // defined
    // response.data; // undefined
    return;
  }
  response.data; // defined
  response.data.quantity_bought; // defined
  // response.error; // undefined
}
