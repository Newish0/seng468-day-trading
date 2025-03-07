import OrderUpdateService from "@/services/orderUpdateService";
import logger from "@/utils/logger";

type SalesUpdateData = {
  stock_id: string;
  sold_quantity: number;
  remaining_quantity: number;
  price: number;
  stock_tx_id: string;
  user_name: string;
};

type BuyCompleteData =
  | {
      success: true;
      data: {
        stock_id: string;
        stock_tx_id: string;
        quantity: number;
        price_total: number;
      };
    }
  | {
      success: false;
      data: {
        stock_id: string;
        stock_tx_id: string;
      };
    };

type CancellationData =
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
      data?: undefined;
    };

export default {
  handleSaleUpdate: async (data: SalesUpdateData) => {
    // TODO: Add payload check? If so, type is Partial<...>

    await OrderUpdateService.handleSaleUpdate(data);
  },

  handleBuyCompletion: async (data: BuyCompleteData) => {
    // TODO: Add payload check? If so, type is Partial<...>

    if (data.success) {
      await OrderUpdateService.handleBuyCompletion(data.data);
    } else {
      await OrderUpdateService.handleFailedBuyCompletion(data.data);
    }
  },

  handleCancellation: async (data: CancellationData) => {
    // TODO: Add payload check? If so, type is Partial<...>

    if (data.success) {
      await OrderUpdateService.handleCancellation(data.data);
    } else {
      logger.error("Failed to cancel order:", data.data);
    }
  },
};
