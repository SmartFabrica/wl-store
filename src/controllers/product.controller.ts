import { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async";
import { v4 as uuidv4 } from "uuid";
import dbPool from "../config/db";
import { APIResponse, HTTPStatus } from "../types/common.types";
import { ProductDetail, ProductRow } from "../types/db.types";
import { AppError } from "../utils/app-error";
import ProductModel from "../models/product.model";
import ProductCompatibilityModel from "../models/product-compatibility.model";

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const { brand_id, category_id, compat, description, mpn, price, specs, title, visible } = req.body;

  const client = await dbPool.connect();
  try {
    await client.query("BEGIN");
    const productId = uuidv4();
    const createdProduct = await ProductModel.create(client, {
      id: productId,
      brand_id,
      category_id,
      description,
      mpn,
      title,
      price: String(price),
      price_visible: visible ?? null,
      specs: specs ? JSON.stringify(specs) : null,
    });

    await ProductCompatibilityModel.bulkCreate(client, productId, compat ?? []);

    await client.query("COMMIT");
    const response: APIResponse<ProductRow> = {
      success: true,
      message: "Ürün başarıyla oluşturuldu.",
      data: createdProduct,
    };

    return res.status(HTTPStatus.CREATED).json(response);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { brand_id, category_id, description, mpn, title, price, visible, specs, compat } = req.body;

  const client = await dbPool.connect();
  try {
    await client.query("BEGIN");

    const existingProduct = await ProductModel.getById(client, id as string);
    if (!existingProduct) {
      throw new AppError("Güncellenecek ürün bulunamadı", HTTPStatus.NOT_FOUND);
    }

    if (compat !== undefined) {
      await ProductCompatibilityModel.deleteByProductId(client, id as string);
      await ProductCompatibilityModel.bulkCreate(client, id as string, compat ?? []);
    }

    const updatedProduct = await ProductModel.update(client, {
      id: id as string,
      brand_id,
      category_id,
      description,
      mpn,
      title,
      price: String(price),
      price_visible: visible ?? null,
      specs: specs ? JSON.stringify(specs) : null,
    });

    await client.query("COMMIT");

    const response: APIResponse<ProductRow> = {
      success: true,
      message: "Ürün başarıyla güncellendi",
      data: updatedProduct,
    };
    return res.status(HTTPStatus.OK).json(response);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingProduct = await ProductModel.getById(dbPool, id as string);
  if (!existingProduct) {
    throw new AppError("Silinecek ürün bulunamadı", HTTPStatus.NOT_FOUND);
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

  const product = await ProductModel.getDetailById(dbPool, id as string);
  if (!product) {
    throw new AppError("Aranan ürün bulunamadı", HTTPStatus.NOT_FOUND);
  }

  const response: APIResponse<ProductDetail> = {
    success: true,
    message: "ürün detayı başarıyla getirildi.",
    data: product,
  };

  return res.status(HTTPStatus.OK).json(response);
});
