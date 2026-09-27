import { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async";
import { APIResponse, HTTPStatus, UserRole } from "../types/common.types";
import { AppError } from "../utils/app-error";
import dbPool from "../config/db";
import UserModel from "../models/user.model";
import { comparePassword } from "../utils/password";
import { PublicUserRow } from "../types/db.types";
import { generateToken } from "../utils/jwt";

export const adminLogin = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("E-posta ve şifre alanları zorunludur.", HTTPStatus.BAD_REQUEST);
  }

  const admin = await UserModel.findByEmailAndRole(dbPool, email, UserRole.ADMIN);

  if (!admin) {
    throw new AppError("Giriş bilgileri hatalı veya geçersiz.", HTTPStatus.UNAUTHORIZED);
  }

  const isPasswordMatch = await comparePassword(password, admin.password_hash);
  if (!isPasswordMatch) {
    throw new AppError("Giriş bilgileri hatalı veya geçersiz.", HTTPStatus.UNAUTHORIZED);
  }

  const token = generateToken({
    role: admin.role,
    userId: admin.id,
  });

  const { password_hash, ...publicUser } = admin;

  const response: APIResponse<{ token: string; user: PublicUserRow }> = {
    success: true,
    message: "Giriş işlemi başarıyla gerçekleştirildi.",
    data: {
      token,
      user: publicUser,
    },
  };

  return res.status(HTTPStatus.OK).json(response);
});
