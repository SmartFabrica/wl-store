import { Router } from "express";
import { addCustomerCartItem, getCustomerCart } from "../controllers/customer-cart.controller";

const customerCartRouter = Router();

customerCartRouter.get("/", getCustomerCart);
customerCartRouter.post("/items", addCustomerCartItem);

export default customerCartRouter;
