export default {
  handleSaleUpdate: async (data: {
    stock_id: string;
    sold_quantity: number;
    remaining_quantity: number;
    price: number;
    stock_tx_id: string;
    user_name: string;
  }) => {},

  handleBuyCompletion: async (data: {
    success: boolean;
    data?: {
      stock_id: string;
      stock_tx_id: string;
      quantity: number;
      price_total: number;
    };
  }) => {},

  handleCancellation: async (data: {
    success: boolean;
    data?: {
      stock_id: string;
      stock_tx_id: string;
      partially_sold: boolean;
      ori_quantity: number;
      cur_quantity: number;
      sold_quantity: number;
      price: number;
    };
  }) => {},
};
