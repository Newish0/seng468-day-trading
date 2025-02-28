export type LimitSellOrderRequest = {
  stock_id: string;
  stock_name: string;
  quantity: number;
  price: number;
  stock_tx_id: string;
  user_name: string;
};

export type MarketBuyRequest = {
  stock_id: string;
  quantity: number;
  stock_tx_id: string;
  budget: number;
  user_name: string;
};

export type CancelSellRequest = {
  stock_id: string;
  quantity: number;
  price: number;
  stock_tx_id: string;
};

export type CancelSellRequestResponse =
  | {
      success: true;
      data: {
        stock_id: string;
        stock_tx_id: string;
        partially_sold: boolean;
        ori_quantity: number;
        cur_quantity: number;
        sold_quantity: number;
        price: number;
      };
    }
  | {
      success: false;
      data?: null;
    };

// Response from Matching Engine for /stockPrices
export type StockPricesResponse = {
  stock_id: string;
  current_price: number;
};
