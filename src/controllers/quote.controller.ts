import { Request, Response } from "express";
import QuoteModel, { QuoteDetailDTO, QuoteItemWithProduct, QuoteListDTO } from "../models/quote.model";
import dbPool from "../config/db";
import { APIResponse, HTTPStatus } from "../types/common.types";
import { QuoteRow } from "../types/db.types";
import { AppError } from "../utils/app-error";
import { catchAsync } from "../utils/catch-async";

export const getBuyerQuotes = catchAsync(async (req: Request, res: Response) => {
  const buyerId = req.user?.id;
  const quotes = await QuoteModel.getBuyerQuotes(dbPool, buyerId as string);

  const response: APIResponse<QuoteRow[]> = {
    success: true,
    message: "Alıcı için teklifler getirilmiştir",
    data: quotes,
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const getVendorQuotes = catchAsync(async (req: Request, res: Response) => {
  //const vendorId = req.user?.id;
  const { limit } = req.query;

  const quotes = await QuoteModel.getVendorQuotes(dbPool, Number(limit));

  const response: APIResponse<QuoteListDTO[]> = {
    success: true,
    message: "Satıcı için teklifler getirilmiştir.",
    data: quotes,
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const getVendorQuoteById = catchAsync(async (req: Request, res: Response) => {
  const { quoteId } = req.params;

  const quote = await QuoteModel.getDetailById(dbPool, quoteId as string);
  if (!quote) {
    throw new AppError("Aranan teklif bulunamadı", HTTPStatus.BAD_REQUEST);
  }

  const response: APIResponse<QuoteDetailDTO> = {
    success: true,
    message: "Teklif detayı başarıyla getirildi.",
    data: quote,
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const updateQuoteStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const existingQuote = await QuoteModel.findQuoteById(dbPool, id as string);
  if (!existingQuote) {
    throw new AppError("Güncellenecek teklif bulunamadı", HTTPStatus.NOT_FOUND);
  }

  const updatedQuote = await QuoteModel.updateQuoteStatus(dbPool, {
    id: id as string,
    status,
  });

  const response: APIResponse<QuoteRow> = {
    success: true,
    message: "Teklif durumu güncellendi",
    data: updatedQuote,
  };

  return res.status(HTTPStatus.OK).json(response);
});

export const getQuoteItems = catchAsync(async (req, res) => {
  const { quoteId } = req.params;

  const existingQuote = await QuoteModel.findQuoteById(dbPool, quoteId as string);
  if (!existingQuote) {
    throw new AppError("Ürünleri listelenecek teklif bulunamadı", HTTPStatus.NOT_FOUND);
  }

  const quoteItems = await QuoteModel.getQuoteItems(dbPool, quoteId as string);

  const response: APIResponse<QuoteItemWithProduct[]> = {
    success: true,
    message: "Teklif ürünleri getirildi.",
    data: quoteItems,
  };

  return res.status(HTTPStatus.OK).json(response);
});
