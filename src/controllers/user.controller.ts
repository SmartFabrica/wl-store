import { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async";
import UserModel from "../models/user.model";
import dbPool from "../config/db";
import { APIResponse, HTTPStatus, UserStatus } from "../types/common.types";
import { UserAggregate, UserRow } from "../types/db.types";
import { AppError } from "../utils/app-error";

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const userRows = await UserModel.getAllUsers(dbPool);
  const response: APIResponse<UserAggregate[]> = {
    success: true,
    message: "Tüm kullanıcılar başarıyla listelendi",
    data: userRows,
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const reviewUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status !== UserStatus.APPROVED && status !== UserStatus.REJECTED) {
    throw new AppError("Geçersiz statüs değeri. Sadece approved veya rejected olabilir.", HTTPStatus.BAD_REQUEST);
  }

  const existingUser = await UserModel.findById(dbPool, id as string);
  if (!existingUser) {
    throw new AppError("Kullanıcı bulunamadı", HTTPStatus.NOT_FOUND);
  }

  const updatedUser = await UserModel.updateUserStatus(dbPool, {
    id: id as string,
    status,
  });

  const response: APIResponse<UserRow> = {
    success: true,
    message: "Kullanıcı başvuru durumu güncellendi",
    data: updatedUser,
  };

  return res.status(HTTPStatus.OK).json(response);
});
