import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { catchAsync } from "../utils/catch-async";
import dbPool from "../config/db";
import { APIResponse, HTTPStatus } from "../types/common.types";
import { AppError } from "../utils/app-error";
import QuoteModel, { CustomerQuoteCreateResult, CustomerQuoteListItem } from "../models/quote.model";
import CartModel from "../models/cart.model";

export const getCustomerQuotes = catchAsync(async (req: Request, res: Response) => {
  const buyerId = req.user?.id;
  if (!buyerId) {
    throw new AppError("Bu işlem için oturum açmanız gerekmektedir", HTTPStatus.UNAUTHORIZED);
  }

  const quotes = await QuoteModel.getBuyerQuotes(dbPool, buyerId);

  const response: APIResponse<CustomerQuoteListItem[]> = {
    success: true,
    message: "Teklifleriniz başarıyla listelendi",
    data: quotes,
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const createCustomerQuote = catchAsync(async (req: Request, res: Response) => {
  const buyerId = req.user?.id;
  if (!buyerId) {
    throw new AppError("Bu işlem için oturum açmanız gerekmektedir", HTTPStatus.UNAUTHORIZED);
  }

  const { shipping_address, billing_address, buyer_note } = req.body;

  if (!shipping_address) {
    throw new AppError("Teslimat adresi zorunludur", HTTPStatus.BAD_REQUEST);
  }

  const client = await dbPool.connect();
  try {
    await client.query("BEGIN");

    const quote = await QuoteModel.create(client, {
      id: uuidv4(),
      buyer_id: buyerId,
      shipping_address,
      billing_address,
      buyer_note,
    });

    const items = await QuoteModel.createItemsFromCart(client, quote.id, buyerId);
    if (items.length === 0) {
      throw new AppError("Teklif oluşturmak için sepetinizde ürün bulunmalıdır", HTTPStatus.BAD_REQUEST);
    }

    await CartModel.deleteItemsByBuyerId(client, buyerId);

    await client.query("COMMIT");

    const response: APIResponse<CustomerQuoteCreateResult> = {
      success: true,
      message: "Teklif talebiniz başarıyla oluşturuldu",
      data: { quote, items },
    };

    return res.status(HTTPStatus.CREATED).json(response);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
});
