import { Router } from "express";
import { adminLogin } from "../controllers/admin-auth.controller";

const adminAuthRouter = Router();

adminAuthRouter.post("/login", adminLogin);

export default adminAuthRouter;
