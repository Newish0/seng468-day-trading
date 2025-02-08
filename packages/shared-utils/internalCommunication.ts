const internalEndpoints = {
  orderService: {
    host: Bun.env.ORDER_SERVICE_HOST || "http://localhost:3000",
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
    host: Bun.env.MATCHING_ENGINE_HOST || "http://localhost:3001",
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

    const response = await fetch(`${host}${endpoint}`, {
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
  const response = await makeInternalRequest<
    PlaceMarketBuyRequest,
    PlaceMarketBuyResponse
  >({
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
