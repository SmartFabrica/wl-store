import { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async";
import dbPool from "../config/db";
import { APIResponse, HTTPStatus } from "../types/common.types";
import { CustomerChassisListItem } from "../types/db.types";
import CustomerBrandModelChassisModel from "../models/customer-brand-model-chassis.model";
import { parseCsvList } from "../utils/query";

export const getCustomerChassis = catchAsync(async (req: Request, res: Response) => {
  const modelNames = parseCsvList(req.query.models);

  const chassis = modelNames ? await CustomerBrandModelChassisModel.getByModelNames(dbPool, modelNames) : [];

  const response: APIResponse<CustomerChassisListItem[]> = {
    success: true,
    message: "Kasalar başarıyla listelendi",
    data: chassis,
  };

  return res.status(HTTPStatus.OK).json(response);
});
