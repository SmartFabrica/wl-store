import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { catchAsync } from "../utils/catch-async";
import dbPool from "../config/db";
import { APIResponse, HTTPStatus } from "../types/common.types";
import { CustomerCartItemDetail, CustomerCartResult } from "../types/db.types";
import { AppError } from "../utils/app-error";
import CartModel from "../models/cart.model";
import ProductModel from "../models/product.model";

export const addCustomerCartItem = catchAsync(async (req: Request, res: Response) => {
  console.log("burada");

  const buyerId = req.user?.id;
  if (!buyerId) {
    throw new AppError("Bu işlem için oturum açmanız gerekmektedir", HTTPStatus.UNAUTHORIZED);
  }

  const { productId, quantity } = req.body;

  if (!productId) {
    throw new AppError("Sepete eklenecek ürün bilgisi zorunludur", HTTPStatus.BAD_REQUEST);
  }

  const amount = quantity ?? 1;
  if (!Number.isInteger(amount) || amount < 1) {
    throw new AppError("Ürün adedi 1 veya daha büyük bir tam sayı olmalıdır", HTTPStatus.BAD_REQUEST);
  }

  const client = await dbPool.connect();
  try {
    await client.query("BEGIN");

    const existingProduct = await ProductModel.getById(client, productId as string);
    if (!existingProduct) {
      throw new AppError("Sepete eklenecek ürün bulunamadı", HTTPStatus.NOT_FOUND);
    }

    const cart = (await CartModel.findByBuyerId(client, buyerId)) ?? (await CartModel.create(client, uuidv4(), buyerId));

    const cartItem = await CartModel.upsertItem(client, {
      id: uuidv4(),
      cart_id: cart.id,
      product_id: productId as string,
      quantity: amount,
    });

    await client.query("COMMIT");

    const response: APIResponse<CustomerCartItemDetail> = {
      success: true,
      message: "Ürün sepete eklendi",
      data: cartItem,
    };

    return res.status(HTTPStatus.CREATED).json(response);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});

export const deleteCustomerCartItem = catchAsync(async (req: Request, res: Response) => {
  const buyerId = req.user?.id;
  if (!buyerId) {
    throw new AppError("Bu işlem için oturum açmanız gerekmektedir", HTTPStatus.UNAUTHORIZED);
  }

  const { id } = req.params;

  const existingItem = await CartModel.findItemById(dbPool, buyerId, id as string);
  if (!existingItem) {
    throw new AppError("Sepetten kaldırılacak ürün bulunamadı", HTTPStatus.NOT_FOUND);
  }

  await CartModel.deleteItem(dbPool, buyerId, id as string);

  const response: APIResponse = {
    success: true,
    message: "Ürün sepetten kaldırıldı",
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const getCustomerCart = catchAsync(async (req: Request, res: Response) => {
  const buyerId = req.user?.id;
  if (!buyerId) {
    throw new AppError("Bu işlem için oturum açmanız gerekmektedir", HTTPStatus.UNAUTHORIZED);
  }

  const items = await CartModel.getItemsByBuyerId(dbPool, buyerId);

  const response: APIResponse<CustomerCartResult> = {
    success: true,
    message: "Sepet başarıyla getirildi",
    data: {
      items,
      total_items: items.length,
      total_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
    },
  };

  return res.status(HTTPStatus.OK).json(response);
});
