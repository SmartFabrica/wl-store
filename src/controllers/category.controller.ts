import { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async.js";
import { v4 as uuidv4 } from "uuid";
import CategoryModel from "../models/category.model.js";
import dbPool from "../config/db.js";
import { APIResponse, HTTPStatus } from "../types/common.types.js";
import { CategoryRow } from "../types/db.types.js";
import { AppError } from "../utils/app-error.js";

export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const { name } = req.body;

  const createdCategory = await CategoryModel.create(dbPool, {
    id: uuidv4(),
    name,
  });

  const response: APIResponse<CategoryRow> = {
    success: true,
    message: "Kategori başarıyla oluşturuldu.",
    data: createdCategory,
  };

  return res.status(HTTPStatus.CREATED).json(response);
});

export const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  const existingCategory = await CategoryModel.getById(dbPool, id as string);
  if (!existingCategory) {
    throw new AppError("Güncellenecek kategori bulunamadı", HTTPStatus.NOT_FOUND);
  }

  const updatedCategory = await CategoryModel.update(dbPool, {
    id: id as string,
    name,
  });

  const response: APIResponse<CategoryRow> = {
    success: true,
    message: "Kategori başarıyla güncellendi",
    data: updatedCategory,
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingCategory = await CategoryModel.getById(dbPool, id as string);
  if (!existingCategory) {
    throw new AppError("Güncellenecek kategori bulunamadı", HTTPStatus.NOT_FOUND);
  }

  await CategoryModel.delete(dbPool, id as string);

  const response: APIResponse = {
    success: true,
    message: "Kategori başarıyla silindi.",
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await CategoryModel.getAll(dbPool);

  const response: APIResponse<CategoryRow[]> = {
    success: true,
    message: "Kategoriler başarıyla listelendi",
    data: categories,
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await CategoryModel.getById(dbPool, id as string);
  if (!category) {
    throw new AppError("Aranan kategori bulunamadı", HTTPStatus.BAD_REQUEST);
  }

  const response: APIResponse<CategoryRow> = {
    success: true,
    message: "Kategori detayı başarıyla getirildi.",
    data: category,
  };

  return res.status(HTTPStatus.OK).json(response);
});
