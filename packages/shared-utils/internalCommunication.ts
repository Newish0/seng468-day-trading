import { getEnvVariable } from "./env";

const internalEndpoints = {
  userApi: {
    host: getEnvVariable("USER_API_HOST", "http://localhost:3000"),
    getStockPrices: {
      path: "/transaction/getStockPrices",
      requestMethod: "GET",
    },
    getStockPortfolio: {
      path: "/transaction/getStockPortfolio",
      requestMethod: "GET",
    },
    getStockTransactions: {
      path: "/transaction/getStockTransactions",
      requestMethod: "GET",
    },
    getWalletBalance: {
      path: "/transaction/getWalletBalance",
      requestMethod: "GET",
    },
    getWalletTransactions: {
      path: "/transaction/getWalletTransactions",
      requestMethod: "GET",
    },
    addMoneyToWallet: {
      path: "/transaction/addMoneyToWallet",
      requestMethod: "POST",
    },
    placeStockOrder: {
      path: "/engine/placeStockOrder",
      requestMethod: "POST",
    },
    cancelStockTransaction: {
      path: "/engine/cancelStockTransaction",
      requestMethod: "POST",
    },
    createStock: {
      path: "/setup/createStock",
      requestMethod: "POST",
    },
  },
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
  auth: {
    host: getEnvVariable("AUTH_HOST", "http://localhost:3003"),
    login: {
      path: "/login",
      requestMethod: "POST",
    },
    register: {
      path: "/register",
      requestMethod: "POST",
    },
  },
} as const;

type FetchOptions<TBody> = {
  headers?: Record<string, string>;
  body: TBody;
};
type Endpoint = {
  path: string;
  requestMethod: "GET" | "POST" | "PUT" | "DELETE";
};
type InternalResponse<T> =
  | {
      success: true;
      status: number;
      data: T;
    }
  | {
      success: false;
      status: number;
      error: string;
    };
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
