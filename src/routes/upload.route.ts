import { Router } from "express";
import { importBrandModelChassis, importCategory, importProduct } from "../controllers/upload.controller";

const uploadRouter = Router();

uploadRouter.post("/import-brand-model-chassis", importBrandModelChassis);
uploadRouter.post("/import-category", importCategory);
uploadRouter.post("/import-product", importProduct);

export default uploadRouter;
