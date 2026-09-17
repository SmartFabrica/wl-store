import { Router } from "express";
import { getCustomerProductDetail, getCustomerProducts } from "../controllers/customer-product.controller";

const customerProductRouter = Router();

customerProductRouter.get("/", getCustomerProducts);
customerProductRouter.get("/:id", getCustomerProductDetail);

export default customerProductRouter;
