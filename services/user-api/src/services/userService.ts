import { redisConnection, setupRedisConnection } from "./userApiService";

const service = {
  getUserFromId: async (userId: string) => {
    if (!redisConnection) {
      await setupRedisConnection();
    }
    /*
    let user: User;
    try {
      user = await userRepository
        .search()
        .where("id")
        .equals(userId)
        .returnFirstOrThrow(); // Is this a function?
      return user;
    } catch (e) {
      throw new Error("User not found");
    }
    */
    const user = {
      id: userId,
      name: "John Doe",
      email: "something@email.com",
      portfolio: [
        {
          id: "1",
          name: "AAPL",
          quantity: 10,
        },
        {
          id: "2",
          name: "GOOGL",
          quantity: 5,
        },
      ],
      stockTransactions: [
        {
          stock_tx_id: "1",
          stock_id: "1",
          wallet_tx_id: "1",
          order_status: "FILLED",
          is_buy: true,
          order_type: "MARKET",
          stock_price: 100,
          quantity: 10,
          parent_tx_id: "1",
          time_stamp: "2021-01-01T00:00:00Z",
        },
        {
          stock_tx_id: "2",
          stock_id: "2",
          wallet_tx_id: "2",
          order_status: "FILLED",
          is_buy: false,
          order_type: "LIMIT",
          stock_price: 200,
          quantity: 5,
          parent_tx_id: "2",
          time_stamp: "2021-01-01T00:00:00Z",
        },
      ],
      walletTransactions: [
        {
          wallet_tx_id: "1",
          stock_tx_id: "1",
          is_debit: false,
          amount: 1000,
          time_stamp: "2021-01-01T00:00:00Z",
        },
        {
          wallet_tx_id: "2",
          stock_tx_id: "2",
          is_debit: true,
          amount: 1000,
          time_stamp: "2021-01-01T00:00:00Z",
        },
      ],
      walletBalance: 1000,
    };
    return user;
  },
};

export default service;
