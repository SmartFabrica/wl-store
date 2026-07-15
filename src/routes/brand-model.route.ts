import { Router } from "express";
import { createBrandModel, deleteBrandModel, getAllBrandModels, getBrandModelById, updateBrandModel } from "../controllers/brand-model.controller";

const brandModelRouter = Router();

brandModelRouter.get("/", getAllBrandModels);
brandModelRouter.post("/", createBrandModel);
brandModelRouter.put("/:id", updateBrandModel);
brandModelRouter.delete("/:id", deleteBrandModel);
brandModelRouter.get("/:id", getBrandModelById);

export default brandModelRouter;
