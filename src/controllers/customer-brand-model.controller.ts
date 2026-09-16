import { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async";
import dbPool from "../config/db";
import { APIResponse, HTTPStatus } from "../types/common.types";
import { CustomerBrandModelListItem } from "../types/db.types";
import CustomerBrandModelModel from "../models/customer-brand-model.model";
import { parseCsvList } from "../utils/query";

export const getCustomerBrandModels = catchAsync(async (req: Request, res: Response) => {
  const brandNames = parseCsvList(req.query.brands);

  const models = brandNames ? await CustomerBrandModelModel.getByBrandNames(dbPool, brandNames) : [];

  const response: APIResponse<CustomerBrandModelListItem[]> = {
    success: true,
    message: "Modeller başarıyla listelendi",
    data: models,
  };

  return res.status(HTTPStatus.OK).json(response);
});
