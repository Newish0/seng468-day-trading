import { Hono } from 'hono';
import controller from '../controllers/authController'
const authRoutes = new Hono()

authRoutes.post('/register', controller.register);
authRoutes.post('/login', controller.login);

export default authRoutes;