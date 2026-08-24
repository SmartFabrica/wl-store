import { Router } from "express";
import { getQuoteItems, getVendorQuoteById, getVendorQuotes, updateQuoteStatus } from "../controllers/quote.controller";

const quoteRouter = Router();

quoteRouter.get("/vendor", getVendorQuotes);
quoteRouter.get("/vendor/:quoteId", getVendorQuoteById);
quoteRouter.get("/:quoteId/items", getQuoteItems);
quoteRouter.put("/:id", updateQuoteStatus);

export default quoteRouter;
