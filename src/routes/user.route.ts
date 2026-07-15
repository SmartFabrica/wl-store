import { Router } from "express";
import { getUsers, reviewUserStatus } from "../controllers/user.controller";

const userRouter = Router();

userRouter.get("/", getUsers);
userRouter.put("/review-user-status", reviewUserStatus);

export default userRouter;
