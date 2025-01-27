import service from '../services/orderService';
import type { Context } from 'hono';

const controller = {

  placeStockOrder: async (c: Context) => {
    const { stock_id, is_buy, order_type, quantity } = await c.req.json();
    // Note: Only concerned about limit buy and market sell
    if (!stock_id || is_buy === undefined || is_buy === null || !order_type || !quantity || (order_type !== 'LIMIT' || order_type !== 'MARKET' )) {
        return c.json({ success: false, data: { error: 'Missing required parameters' } }, 400); 
    }

    try {
        await service.placeStockOrder(stock_id, is_buy, order_type, quantity);
        return c.json({ success: true, data: null });
      } catch (error) {
        if (error instanceof Error) {
            return c.json({ success: false, data: {error: error.message} });  
        }
          return c.json({ success: false, data: { error: 'An unknown error has occurred' } }, 500);
        }

  }
};

export default controller;


