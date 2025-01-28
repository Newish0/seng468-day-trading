const service = {
  // Helper function
  placeLimitSellOrder: async (stock_id: string, quantity: number, price: number) => {
    const limitSellRequest = {
      stock_id,
      quantity,
      price,
      stock_tx_id: "placeholder", // generate a unique transaction id for order
    };

    const response = await fetch("http://matching-engine:3000/limitSell", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(limitSellRequest),
    });

    const result = await response.json();

    if (result.success) {
      return { success: true, data: null };
    } else {
      throw new Error("Limit sell order failed.");
    }
  },

  // Helper function
  placeMarketBuyOrder: async (stock_id: string, quantity: number) => {
    const marketBuyRequest = {
      stock_id,
      quantity,
      stock_tx_id: "placeholder", // generate a unique transaction ID for order
    };

    const response = await fetch("http://matching-engine:3000/marketBuy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(marketBuyRequest),
    });

    const result = await response.json();

    if (result.success) {
      // store in DB + wallet transactions/deductions, etc here
      return { success: true, data: null };
    } else {
      throw new Error("Market buy order failed.");
    }
  },

  placeStockOrder: async (stock_id: string, is_buy: string, order_type: string, quantity: number, price: number) => {
    if (!is_buy && order_type === "LIMIT") {
      return await service.placeLimitSellOrder(stock_id, quantity, price);
    } else if (is_buy && order_type === "MARKET") {
      return await service.placeMarketBuyOrder(stock_id, quantity);
    } else {
      throw new Error("Invalid order parameters.");
    }
  },

  getStockPrices: async () => {
    try {
      const response = await fetch("http://matching-engine:3000/getStockPrices");

      if (!response.ok) {
        throw new Error("Failed to fetch stock prices");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error("Failed to fetch stock prices");
    }
  },


  cancelStockTransaction: async (stock_tx_id: string) => {},

  partialSell: async (stock_id: string, quantity: number, price: number, stock_tx_id: string) => {},

  completeSell: async (stock_id: string, quantity: number, price: number, stock_tx_id: string) => {},
};

export default service;
