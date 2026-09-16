import { Router } from "express";
import { getCustomerChassis } from "../controllers/customer-brand-model-chassis.controller";

const customerBrandModelChassisRouter = Router();

customerBrandModelChassisRouter.get("/", getCustomerChassis);

export default customerBrandModelChassisRouter;
