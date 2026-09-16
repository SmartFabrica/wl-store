import { Router } from "express";
import { getCustomerBrandModels } from "../controllers/customer-brand-model.controller";

const customerBrandModelRouter = Router();

customerBrandModelRouter.get("/", getCustomerBrandModels);

export default customerBrandModelRouter;
