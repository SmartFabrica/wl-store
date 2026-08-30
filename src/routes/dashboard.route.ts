import { Router } from "express";
import { getStats } from "../controllers/dashboard.controller";

const dashboardRouter = Router();

dashboardRouter.get("/get-stats", getStats);

export default dashboardRouter;
