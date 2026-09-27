import { Router } from "express";
import { createCustomerQuote, getCustomerQuotes } from "../controllers/customer-quote.controller";

const customerQuoteRouter = Router();

customerQuoteRouter.get("/", getCustomerQuotes);
customerQuoteRouter.post("/", createCustomerQuote);

export default customerQuoteRouter;
