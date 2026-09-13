import { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async";
import dbPool from "../config/db";
import { APIResponse, HTTPStatus } from "../types/common.types";
import { CustomerProductListItem } from "../types/db.types";
import CustomerProductModel from "../models/customer-product.model";

export const getCustomerProducts = catchAsync(async (req: Request, res: Response) => {
  const { categoryId, modelId, chassisId } = req.query;

  const products = await CustomerProductModel.getAll(dbPool, {
    category_id: categoryId as string | undefined,
    model_id: modelId as string | undefined,
    chassis_id: chassisId as string | undefined,
  });

  const response: APIResponse<CustomerProductListItem[]> = {
    success: true,
    message: "Ürünler başarıyla listelendi",
    data: products,
  };

  return res.status(HTTPStatus.OK).json(response);
});
