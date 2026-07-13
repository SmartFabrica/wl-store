import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";
import { HTTPStatus } from "../types/common.types";
import { verifyToken } from "../utils/jwt";

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new AppError("Bu işlem için oturum açmanız gerekmektedir", HTTPStatus.UNAUTHORIZED);
  }

  const decoded = verifyToken(token);

  req.user = {
    id: decoded.userId,
    role: decoded.role,
  };

  next();
};
