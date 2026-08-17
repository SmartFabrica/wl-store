import { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async";
import { v4 as uuidv4 } from "uuid";
import dbPool from "../config/db";
import { APIResponse, HTTPStatus } from "../types/common.types";
import { BrandModelRow } from "../types/db.types";
import { AppError } from "../utils/app-error";
import BrandModelsModel from "../models/brand-model.model";
import BrandModel from "../models/brand.model";

export const createBrandModel = catchAsync(async (req: Request, res: Response) => {
  const { name, brand_id } = req.body;

  const createdBrandModel = await BrandModelsModel.create(dbPool, {
    id: uuidv4(),
    name,
    brand_id,
  });

  const response: APIResponse<BrandModelRow> = {
    success: true,
    message: "Marka modeli başarıyla oluşturuldu.",
    data: createdBrandModel,
  };

  return res.status(HTTPStatus.CREATED).json(response);
});

export const updateBrandModel = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, brand_id } = req.body;

  const existingBrandModel = await BrandModelsModel.getById(dbPool, id as string);
  if (!existingBrandModel) {
    throw new AppError("Güncellenecek marka modeli bulunamadı", HTTPStatus.NOT_FOUND);
  }

  const updatedBrandModel = await BrandModelsModel.update(dbPool, {
    id: id as string,
    name,
    brand_id,
  });

  const response: APIResponse<BrandModelRow> = {
    success: true,
    message: "Kategori başarıyla güncellendi",
    data: updatedBrandModel,
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const deleteBrandModel = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingBrandModel = await BrandModelsModel.getById(dbPool, id as string);
  if (!existingBrandModel) {
    throw new AppError("Güncellenecek marka modeli bulunamadı", HTTPStatus.NOT_FOUND);
  }

  await BrandModelsModel.delete(dbPool, id as string);

  const response: APIResponse = {
    success: true,
    message: "Marka modeli başarıyla silindi.",
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const getAllBrandModels = catchAsync(async (req: Request, res: Response) => {
  const brands = await BrandModelsModel.getAll(dbPool);

  const response: APIResponse<BrandModelRow[]> = {
    success: true,
    message: "Marka modelleri başarıyla listelendi",
    data: brands,
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const getBrandModelsByBrandId = catchAsync(async (req: Request, res: Response) => {
  const { brandId } = req.params;

  const existingBrand = await BrandModel.getById(dbPool, brandId as string);
  if (!existingBrand) {
    throw new AppError("Güncellenecek marka bulunamadı", HTTPStatus.NOT_FOUND);
  }

  const brandModels = await BrandModelsModel.getByBrandId(dbPool, brandId as string);

  const response: APIResponse<BrandModelRow[]> = {
    success: true,
    message: "Markaya ait marka modelleri başarıyla listelendi",
    data: brandModels,
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const getBrandModelById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const brandModel = await BrandModelsModel.getById(dbPool, id as string);
  if (!brandModel) {
    throw new AppError("Aranan marka modeli bulunamadı", HTTPStatus.NOT_FOUND);
  }

  const response: APIResponse<BrandModelRow> = {
    success: true,
    message: "Marka model detayı başarıyla getirildi.",
    data: brandModel,
  };

  return res.status(HTTPStatus.OK).json(response);
});
