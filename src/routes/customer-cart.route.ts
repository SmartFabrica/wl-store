import { Router } from "express";
import { addCustomerCartItem, deleteCustomerCartItem, getCustomerCart } from "../controllers/customer-cart.controller";

const customerCartRouter = Router();

customerCartRouter.get("/", getCustomerCart);
customerCartRouter.post("/items", addCustomerCartItem);
customerCartRouter.delete("/items/:id", deleteCustomerCartItem);

export default customerCartRouter;
