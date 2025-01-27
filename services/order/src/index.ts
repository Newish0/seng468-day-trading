import { Hono } from "hono";
import orderRoutes from './routes/orderRoutes'

const port =  Bun.env.PORT || 3000
const app = new Hono()

app.route('/', orderRoutes)

Bun.serve({
    fetch: app.fetch,
    port: port
})


console.log(`Order Service running on port: ${port}`)