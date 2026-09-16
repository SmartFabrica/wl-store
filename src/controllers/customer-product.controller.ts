import { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async";
import dbPool from "../config/db";
import { APIResponse, CustomerProductSort, HTTPStatus } from "../types/common.types";
import { CustomerProductListResult } from "../types/db.types";
import CustomerProductModel from "../models/customer-product.model";
import { AppError } from "../utils/app-error";
import { parseCsvList, parseText } from "../utils/query";

const SORT_VALUES = Object.values(CustomerProductSort);

const parseSort = (value: unknown): CustomerProductSort | undefined => {
  const sort = parseText(value);
  if (!sort) return undefined;

  if (!SORT_VALUES.includes(sort as CustomerProductSort)) {
    throw new AppError(`Geçersiz sıralama değeri. Kabul edilenler: ${SORT_VALUES.join(", ")}`, HTTPStatus.BAD_REQUEST);
  }

  return sort as CustomerProductSort;
};

export const getCustomerProducts = catchAsync(async (req: Request, res: Response) => {
  const { q, category, brands, models, chassis, inStock, sort } = req.query;

  if (inStock !== undefined) {
    throw new AppError("Stok bilgisi sistemde tutulmadığı için inStock filtresi desteklenmiyor.", HTTPStatus.BAD_REQUEST);
  }

  const products = await CustomerProductModel.getAll(dbPool, {
    q: parseText(q),
    category_names: parseCsvList(category),
    brand_names: parseCsvList(brands),
    model_names: parseCsvList(models),
    chassis_names: parseCsvList(chassis),
    sort: parseSort(sort),
  });

  const response: APIResponse<CustomerProductListResult> = {
    success: true,
    message: "Ürünler başarıyla listelendi",
    data: products,
  };

  return res.status(HTTPStatus.OK).json(response);
});
