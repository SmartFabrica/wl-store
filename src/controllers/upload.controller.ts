import { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async";
import { AppError } from "../utils/app-error";
import { APIResponse, HTTPStatus } from "../types/common.types";
import { NormalizeResult, normalizeCategoryRow, normalizeProductRow, normalizeRow, RowError } from "../utils/upload";
import UploadModel from "../models/upload.model";
import dbPool from "../config/db";

const MAX_ROWS = 10000;
const MAX_REPORTED_ERRORS = 20;

// Gövdeyi doğrular ve satırları normalize eder. Tek bir hatalı satır varsa hiçbir kayıt yüklenmez.
const prepareRows = <T>(rows: unknown, normalize: (raw: unknown, index: number) => NormalizeResult<T>): T[] => {
  if (!Array.isArray(rows)) {
    throw new AppError("rows bir dizi olmalı", HTTPStatus.BAD_REQUEST);
  }

  if (rows.length === 0) {
    throw new AppError("Yüklenecek satır bulunamadı", HTTPStatus.BAD_REQUEST);
  }

  if (rows.length > MAX_ROWS) {
    throw new AppError(`Tek seferde en fazla ${MAX_ROWS} satır yüklenebilir. Gönderilen satır sayısı: ${rows.length}`, HTTPStatus.BAD_REQUEST);
  }

  const clean: T[] = [];
  const errors: RowError[] = [];

  rows.forEach((raw, i) => {
    const result = normalize(raw, i);
    if (result.error) errors.push(result.error);
    else clean.push(result.value);
  });

  if (errors.length > 0) {
    const detail = errors
      .slice(0, MAX_REPORTED_ERRORS)
      .map((error) => `Satır ${error.row}: ${error.reason}`)
      .join(" | ");

    const remaining = errors.length - MAX_REPORTED_ERRORS;
    const suffix = remaining > 0 ? ` | ve ${remaining} satır daha` : "";

    throw new AppError(
      `${errors.length} satır hatalı olduğu için yükleme yapılmadı. Lütfen düzeltip tekrar deneyin. ${detail}${suffix}`,
      HTTPStatus.UNPROCESSABLE_ENTITY,
    );
  }

  return clean;
};

export const importBrandModelChassis = catchAsync(async (req: Request, res: Response) => {
  const { rows } = req.body;

  const clean = prepareRows(rows, normalizeRow);
  const created = await UploadModel.bulkUpsertBrandModelChassis(dbPool, clean);

  const response: APIResponse = {
    success: true,
    message: "Marka, kasa, model başarıyla yüklendi",
    data: {
      processed: clean.length,
      brands_created: created.brands_created,
      models_created: created.models_created,
      chassis_created: created.chassis_created,
    },
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const importCategory = catchAsync(async (req: Request, res: Response) => {
  const { rows } = req.body;

  const clean = prepareRows(rows, normalizeCategoryRow);
  const created = await UploadModel.bulkUpsertCategories(dbPool, clean);

  const response: APIResponse = {
    success: true,
    message: "Kategori başarıyla yüklendi",
    data: {
      processed: clean.length,
      category_created: created.category_created,
    },
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const importProduct = catchAsync(async (req: Request, res: Response) => {
  const { rows } = req.body;

  const clean = prepareRows(rows, normalizeProductRow);
  const created = await UploadModel.bulkUpsertProducts(dbPool, clean);

  const response: APIResponse = {
    success: true,
    message: "Ürün başarıyla yüklendi",
    data: {
      processed: clean.length,
      product_created: created.product_created,
    },
  };

  return res.status(HTTPStatus.OK).json(response);
});
