import { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async";
import { v4 as uuidv4 } from "uuid";
import dbPool from "../config/db";
import { APIResponse, HTTPStatus } from "../types/common.types";
import { BrandRow } from "../types/db.types";
import { AppError } from "../utils/app-error";
import BrandModel from "../models/brand.model";

export const createBrand = catchAsync(async (req: Request, res: Response) => {
  const { name } = req.body;

  const createdBrand = await BrandModel.create(dbPool, {
    id: uuidv4(),
    name,
  });

  const response: APIResponse<BrandRow> = {
    success: true,
    message: "Kategori başarıyla oluşturuldu.",
    data: createdBrand,
  };

  return res.status(HTTPStatus.CREATED).json(response);
});

export const updateBrand = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  const existingBrand = await BrandModel.getById(dbPool, id as string);
  if (!existingBrand) {
    throw new AppError("Güncellenecek marka bulunamadı", HTTPStatus.NOT_FOUND);
  }

  const updatedBrand = await BrandModel.update(dbPool, {
    id: id as string,
    name,
  });

  const response: APIResponse<BrandRow> = {
    success: true,
    message: "Kategori başarıyla güncellendi",
    data: updatedBrand,
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const deleteBrand = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingBrand = await BrandModel.getById(dbPool, id as string);
  if (!existingBrand) {
    throw new AppError("Güncellenecek kategori bulunamadı", HTTPStatus.NOT_FOUND);
  }

  await BrandModel.delete(dbPool, id as string);

  const response: APIResponse = {
    success: true,
    message: "Marka başarıyla silindi.",
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const getAllBrands = catchAsync(async (req: Request, res: Response) => {
  const brands = await BrandModel.getAll(dbPool);

  const response: APIResponse<BrandRow[]> = {
    success: true,
    message: "Markalar başarıyla listelendi",
    data: brands,
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const getBrandById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const category = await BrandModel.getById(dbPool, id as string);
  if (!category) {
    throw new AppError("Aranan marka bulunamadı", HTTPStatus.BAD_REQUEST);
  }

  const response: APIResponse<BrandRow> = {
    success: true,
    message: "Marka detayı başarıyla getirildi.",
    data: category,
  };

  return res.status(HTTPStatus.OK).json(response);
});
