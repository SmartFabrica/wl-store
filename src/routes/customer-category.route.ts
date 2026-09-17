import { Router } from "express";
import { getCustomerCategories } from "../controllers/customer-category.controller";

const customerCategoryRouter = Router();

customerCategoryRouter.get("/", getCustomerCategories);

export default customerCategoryRouter;
