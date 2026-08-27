import { Router } from "express";
import { deleteUser, getUserById, getUsers, reviewUserStatus } from "../controllers/user.controller";

const userRouter = Router();

userRouter.get("/", getUsers);
userRouter.get("/:id", getUserById);
userRouter.put("/:id/review-user-status", reviewUserStatus);
userRouter.delete("/:id", deleteUser);

export default userRouter;
