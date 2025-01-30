import { Hono } from "hono";
import setupController from "../controllers/setupController";

const setupRoutes = new Hono();

setupRoutes.post("/createStock", setupController.createStock);

export default setupRoutes;
