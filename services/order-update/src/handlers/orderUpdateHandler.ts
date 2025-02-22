import OrderUpdateService from "@/services/orderUpdateService";

export default {
  handleSaleUpdate: async (data: {
    stock_id: string;
    sold_quantity: number;
    remaining_quantity: number;
    price: number;
    stock_tx_id: string;
    user_name: string;
  }) => {
    // TODO: Add payload check? If so, type is Partial<...>

    OrderUpdateService.handleSaleUpdate(data);
  },

  handleBuyCompletion: async (data: {
    success: boolean;
    data?: {
      stock_id: string;
      stock_tx_id: string;
      quantity: number;
      price_total: number;
    };
  }) => {
    // TODO: Add payload check? If so, type is Partial<...>

    if (data.success) {
      OrderUpdateService.handleBuyCompletion(data.data!);
    } else {
      console.error("Failed to buy stock:", data.data);
    }
  },

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
  }) => {
    // TODO: Add payload check? If so, type is Partial<...>

    if (data.success) {
      OrderUpdateService.handleCancellation(data.data!);
    } else {
      console.error("Failed to cancel order:", data.data);
    }
  },
};
