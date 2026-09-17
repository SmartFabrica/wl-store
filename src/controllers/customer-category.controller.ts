import { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async";
import dbPool from "../config/db";
import { APIResponse, HTTPStatus } from "../types/common.types";
import { CustomerCategoryListItem } from "../types/db.types";
import CategoryModel from "../models/category.model";

export const getCustomerCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await CategoryModel.getAllForCustomer(dbPool);

  const response: APIResponse<CustomerCategoryListItem[]> = {
    success: true,
    message: "Kategoriler başarıyla listelendi",
    data: categories,
  };

  return res.status(HTTPStatus.OK).json(response);
});
