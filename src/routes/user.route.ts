import { Router } from "express";
import { getUserById, getUsers, reviewUserStatus } from "../controllers/user.controller";

const userRouter = Router();

userRouter.get("/", getUsers);
userRouter.get("/:id", getUserById);
userRouter.put("/review-user-status", reviewUserStatus);

export default userRouter;
