import { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async";
import { v4 as uuidv4 } from "uuid";
import dbPool from "../config/db";
import { APIResponse, HTTPStatus } from "../types/common.types";
import { BrandModelChassisRow } from "../types/db.types";
import { AppError } from "../utils/app-error";
import BrandModelsModel from "../models/brand-model.model";
import BrandModelChassisModel from "../models/brand-model-chassis.model";

export const createBrandModelChassis = catchAsync(async (req: Request, res: Response) => {
  const { name, model_id } = req.body;

  const createdBrandChassis = await BrandModelChassisModel.create(dbPool, {
    id: uuidv4(),
    name,
    model_id,
  });

  const response: APIResponse<BrandModelChassisRow> = {
    success: true,
    message: "Marka model kasası başarıyla oluşturuldu.",
    data: createdBrandChassis,
  };

  return res.status(HTTPStatus.CREATED).json(response);
});

export const updateBrandModelChassis = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, model_id } = req.body;

  const existingBrandModelChassis = await BrandModelChassisModel.getById(dbPool, id as string);
  if (!existingBrandModelChassis) {
    throw new AppError("Güncellenecek marka model kasası bulunamadı", HTTPStatus.NOT_FOUND);
  }

  const updatedBrandModelChassis = await BrandModelChassisModel.update(dbPool, {
    id: id as string,
    name,
    model_id,
  });

  const response: APIResponse<BrandModelChassisRow> = {
    success: true,
    message: "Marka model kasası başarıyla güncellendi",
    data: updatedBrandModelChassis,
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const deleteBrandModelChassis = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingBrandModelChassis = await BrandModelChassisModel.getById(dbPool, id as string);
  if (!existingBrandModelChassis) {
    throw new AppError("Silinecek marka model kasası bulunamadı", HTTPStatus.NOT_FOUND);
  }

  await BrandModelChassisModel.delete(dbPool, id as string);

  const response: APIResponse = {
    success: true,
    message: "Marka model kasası başarıyla silindi.",
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const getAllBrandModelChassis = catchAsync(async (req: Request, res: Response) => {
  const brandModelChassis = await BrandModelChassisModel.getAll(dbPool);

  const response: APIResponse<BrandModelChassisRow[]> = {
    success: true,
    message: "Marka model kasaları başarıyla listelendi",
    data: brandModelChassis,
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const getBrandModelChassisByModelId = catchAsync(async (req: Request, res: Response) => {
  const { modelId } = req.params;

  const existingBrandModel = await BrandModelsModel.getById(dbPool, modelId as string);
  if (!existingBrandModel) {
    throw new AppError("Kasaya ait marka modeli bulunamadı", HTTPStatus.NOT_FOUND);
  }

  const brandModelChassis = await BrandModelChassisModel.getByModelId(dbPool, modelId as string);

  const response: APIResponse<BrandModelChassisRow[]> = {
    success: true,
    message: "Modele ait kasalar başarıyla listelendi",
    data: brandModelChassis,
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const getBrandModelChassisById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingBrandModelChassis = await BrandModelChassisModel.getById(dbPool, id as string);
  if (!existingBrandModelChassis) {
    throw new AppError("Aranan marka model kasası bulunamadı", HTTPStatus.NOT_FOUND);
  }

  const response: APIResponse<BrandModelChassisRow> = {
    success: true,
    message: "Marka model detayı başarıyla getirildi.",
    data: existingBrandModelChassis,
  };

  return res.status(HTTPStatus.OK).json(response);
});
