import { Router } from "express";
import { getCustomerProducts } from "../controllers/customer-product.controller";

const customerProductRouter = Router();

customerProductRouter.get("/", getCustomerProducts);

export default customerProductRouter;
