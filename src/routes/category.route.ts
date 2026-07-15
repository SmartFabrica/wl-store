import { Router } from "express";
import { createCategory, deleteCategory, getAllCategories, getCategoryById, updateCategory } from "../controllers/category.controller";

const categoryRouter = Router();

categoryRouter.post("/", createCategory);
categoryRouter.put("/:id", updateCategory);
categoryRouter.delete("/:id", deleteCategory);
categoryRouter.get("/", getAllCategories);
categoryRouter.get("/:id", getCategoryById);

export default categoryRouter;
