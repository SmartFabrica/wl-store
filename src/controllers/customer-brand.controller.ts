import { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async";
import dbPool from "../config/db";
import { APIResponse, HTTPStatus } from "../types/common.types";
import { CustomerBrandListItem } from "../types/db.types";
import CustomerBrandModel from "../models/customer-brand.model";

export const getCustomerBrands = catchAsync(async (req: Request, res: Response) => {
  const brands = await CustomerBrandModel.getAll(dbPool);

  const response: APIResponse<CustomerBrandListItem[]> = {
    success: true,
    message: "Markalar başarıyla listelendi",
    data: brands,
  };

  return res.status(HTTPStatus.OK).json(response);
});
