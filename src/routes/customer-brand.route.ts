import { Router } from "express";
import { getCustomerBrands } from "../controllers/customer-brand.controller";

const customerBrandRouter = Router();

customerBrandRouter.get("/", getCustomerBrands);

export default customerBrandRouter;
