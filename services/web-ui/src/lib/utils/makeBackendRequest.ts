import type { Endpoint, FetchOptions, InternalResponse } from "shared-types/dtos";

// Define your endpoints
const backendEndpoints = {
  userApi: {
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
  auth: {
    login: {
      path: "/authentication/login",
      requestMethod: "POST",
    },
    register: {
      path: "/authentication/register",
      requestMethod: "POST",
    },
  },
} as const;

/**
 * A generic function for making internal API requests.
 *
 * @param options - Options for the request including headers and body.
 * @returns A function that takes a service and endpoint name, and returns the typed response.
 */
export const makeBackendRequest =
  <TRequest, TResponse>(options: FetchOptions<TRequest>) =>
  async <
    TService extends keyof typeof backendEndpoints,
    TEndpoint extends keyof (typeof backendEndpoints)[TService]
  >(
    serviceName: TService,
    endpointName: TEndpoint
  ): Promise<TResponse | { success: false; status: number; error: string }> => {
    const host = window.location.origin;
    const endpoint = backendEndpoints[serviceName][endpointName] as Endpoint;

    try {
      const response = await fetch(`${host}${endpoint.path}`, {
        method: endpoint.requestMethod,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { success: false, status: response.status, error: errorText };
      }

      const data = (await response.json()) as TResponse;
      return data;
    } catch (e) {
      console.error("Backend request error:", e);
      return { success: false, status: 500, error: "Backend server error" };
    }
  };
