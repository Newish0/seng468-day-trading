import { Hono } from 'hono';
import controller from '../controllers/orderController'

const orderRoutes = new Hono()

orderRoutes.post('/placeStockOrder', controller.placeStockOrder);

export default orderRoutes;