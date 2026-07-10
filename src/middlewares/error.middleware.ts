import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error.js";
import { APIResponse } from "../types/common.types.js";

export const errorHandler: ErrorRequestHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  let statusCode = 500;
  let message = "Sistemsel bir hata oluştu";
  let errors: string[] | string | undefined = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  if (statusCode === 500) {
    console.error("💥 Beklenmeyen Sistem Hatası:", err);
  }

  const responseBody: APIResponse = {
    success: false,
    message,
  };

  if (errors) {
    responseBody.errors = errors;
  }

  res.status(statusCode).json(responseBody);
};
