import { redisConnection, setupRedisConnection } from "./userApiService";

const service = {
  getAvailableStocks: async () => {
    if (!redisConnection) {
      await setupRedisConnection();
    }
    // Need in the form { stock_id: string, stock_name: string, current_price: number }
    // Where is this info stored?
    return [
      {
        stock_id: "1",
        stock_name: "AAPL",
        current_price: 100,
      },
      {
        stock_id: "2",
        stock_name: "GOOGL",
        current_price: 200,
      },
    ];
  },
};

export default service;
