import { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async";
import DashboardModel from "../models/dashboard.model";
import dbPool from "../config/db";
import { APIResponse, HTTPStatus } from "../types/common.types";
import { OverviewRow } from "../types/db.types";

export const getStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await DashboardModel.count(dbPool);

  const response: APIResponse<OverviewRow> = {
    success: true,
    message: "İstatistik kayıtları başarıyla getirildi.",
    data: stats,
  };

  return res.status(HTTPStatus.OK).json(response);
});
