import { Pool, PoolClient } from "pg";
import { ProductRow, QuoteItemRow, QuoteRow } from "../types/db.types";

type QuotePayload = Omit<QuoteRow, "quote_number" | "buyer_id" | "created_at" | "updated_at" | "id">;
type QuoteItemPayload = Omit<QuoteItemRow, "quote_id" | "created_at" | "id">;

interface QuoteDTO extends QuotePayload {
  items: QuoteItemPayload[];
}

type QuoteItemProductDetails = Pick<ProductRow, "title" | "mpn">;

interface QuoteItemWithProduct extends QuoteItemRow, QuoteItemProductDetails {}

type QuoteStatusDTO = Pick<QuoteRow, "id" | "status">;

const QuoteModel = {
  getBuyerQuotes: async (client: Pool | PoolClient, buyerId: string): Promise<QuoteRow[]> => {
    const sql = "SELECT * FROM quotes WHERE buyer_id = $1 ORDER BY created_at DESC";
    const values = [buyerId];
    const result = await client.query(sql, values);
    return result.rows;
  },

  getVendorQuotes: async (client: Pool | PoolClient, vendorId: string): Promise<QuoteRow[]> => {
    const sql = "SELECT * FROM quotes WHERE vendor_id = $2 ORDER BY created_at DESC";
    const values = [vendorId];
    const result = await client.query(sql, values);
    return result.rows;
  },

  findQuoteById: async (client: Pool | PoolClient, quoteId: string): Promise<QuoteRow | null> => {
    const sql = "SELECT * FROM quotes WHERE id=$1 LIMIT 1";
    const values = [quoteId];
    const result = await client.query(sql, values);
    if (result.rowCount === 0) return null;
    return result.rows[0];
  },

  updateQuoteStatus: async (client: Pool | PoolClient, dto: QuoteStatusDTO): Promise<QuoteRow> => {
    const sql = `UPDATE quotes SET status = $1 WHERE id = $2 RETURNING *`;
    const values = [dto.status, dto.id];
    const result = await client.query(sql, values);
    return result.rows[0];
  },

  getQuoteItems: async (client: Pool | PoolClient, quoteId: string): Promise<QuoteItemWithProduct[]> => {
    const sql = `SELECT * FROM quote_items qi JOIN products p ON qi.product_id = p.id WHERE qi.quote_id=$1`;
    const values = [quoteId];
    const result = await client.query(sql, values);
    return result.rows;
  },
};

export default QuoteModel;
