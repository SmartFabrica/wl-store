import { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async";
import { v4 as uuidv4 } from "uuid";
import CategoryModel from "../models/category.model";
import dbPool from "../config/db";
import { APIResponse, HTTPStatus } from "../types/common.types";
import { CategoryRow, ProductRow } from "../types/db.types";
import { AppError } from "../utils/app-error";
import ProductModel from "../models/product.model";

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const { brand_id, category_id, description, mpn, title } = req.body;

  const createdProduct = await ProductModel.create(dbPool, {
    id: uuidv4(),
    brand_id,
    category_id,
    description,
    mpn,
    title,
  });

  const response: APIResponse<ProductRow> = {
    success: true,
    message: "Kategori başarıyla oluşturuldu.",
    data: createdProduct,
  };

  return res.status(HTTPStatus.CREATED).json(response);
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { brand_id, category_id, description, mpn, title } = req.body;

  const existingProduct = await ProductModel.getById(dbPool, id as string);
  if (!existingProduct) {
    throw new AppError("Güncellenecek ürün bulunamadı", HTTPStatus.NOT_FOUND);
  }

  const updatedProduct = await ProductModel.update(dbPool, {
    id: id as string,
    brand_id,
    category_id,
    description,
    mpn,
    title,
  });

  const response: APIResponse<ProductRow> = {
    success: true,
    message: "Ürün başarıyla güncellendi",
    data: updatedProduct,
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingProduct = await ProductModel.getById(dbPool, id as string);
  if (!existingProduct) {
    throw new AppError("Güncellenecek ürün bulunamadı", HTTPStatus.NOT_FOUND);
  }

  await ProductModel.delete(dbPool, id as string);

  const response: APIResponse = {
    success: true,
    message: "Ürün başarıyla silindi.",
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const products = await ProductModel.getAll(dbPool);

  const response: APIResponse<ProductRow[]> = {
    success: true,
    message: "Ürünler başarıyla listelendi",
    data: products,
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const getProductById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const product = await ProductModel.getById(dbPool, id as string);
  if (!product) {
    throw new AppError("Aranan ürün bulunamadı", HTTPStatus.NOT_FOUND);
  }

  const response: APIResponse<ProductRow> = {
    success: true,
    message: "ürün detayı başarıyla getirildi.",
    data: product,
  };

  return res.status(HTTPStatus.OK).json(response);
});
