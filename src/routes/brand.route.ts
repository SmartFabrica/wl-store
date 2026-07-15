import { Router } from "express";
import { createBrand, deleteBrand, getAllBrands, getBrandById, updateBrand } from "../controllers/brand.controller";

const brandRouter = Router();

brandRouter.post("/", createBrand);
brandRouter.put("/:id", updateBrand);
brandRouter.delete("/:id", deleteBrand);
brandRouter.get("/", getAllBrands);
brandRouter.get("/:id", getBrandById);

export default brandRouter;
