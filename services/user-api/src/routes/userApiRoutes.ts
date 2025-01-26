import { Hono } from "hono";
import controller from "../controllers/userApiController.ts";

const userApiRoutes = new Hono();

userApiRoutes.get("/", controller.helloWorld);

export default userApiRoutes;
