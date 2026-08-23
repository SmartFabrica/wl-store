import { Router } from "express";
import { getQuoteItems, getVendorQuotes, updateQuoteStatus } from "../controllers/quote.controller";

const quoteRouter = Router();

quoteRouter.get("/vendor", getVendorQuotes);
quoteRouter.get("/:quoteId/items", getQuoteItems);
quoteRouter.put("/:id", updateQuoteStatus);

export default quoteRouter;
