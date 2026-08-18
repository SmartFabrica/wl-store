import { Router } from "express";
import {
  createBrandModelChassis,
  deleteBrandModelChassis,
  getAllBrandModelChassis,
  getBrandModelChassisById,
  getBrandModelChassisByModelId,
  updateBrandModelChassis,
} from "../controllers/brand-model-chassis.controller";

const brandModelChassisRouter = Router();

brandModelChassisRouter.get("/", getAllBrandModelChassis);
brandModelChassisRouter.get("/:modelId/chassis", getBrandModelChassisByModelId);
brandModelChassisRouter.post("/", createBrandModelChassis);
brandModelChassisRouter.put("/:id", updateBrandModelChassis);
brandModelChassisRouter.delete("/:id", deleteBrandModelChassis);
brandModelChassisRouter.get("/:id", getBrandModelChassisById);

export default brandModelChassisRouter;
