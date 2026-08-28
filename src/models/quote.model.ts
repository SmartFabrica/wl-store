import { Pool, PoolClient } from "pg";
import { CorporateProfileRow, IndividualProfileRow, ProductRow, QuoteItemRow, QuoteRow } from "../types/db.types";

type QuotePayload = Omit<QuoteRow, "quote_number" | "buyer_id" | "created_at" | "updated_at" | "id">;
type QuoteItemPayload = Omit<QuoteItemRow, "quote_id" | "created_at" | "id">;

interface QuoteDTO extends QuotePayload {
  items: QuoteItemPayload[];
}

type QuoteItemProductDetails = Pick<ProductRow, "title" | "mpn">;

export interface QuoteItemWithProduct extends QuoteItemRow, QuoteItemProductDetails {}

type QuoteStatusDTO = Pick<QuoteRow, "id" | "status">;

export interface QuoteDetailDTO extends QuoteRow {
  buyer_name: CorporateProfileRow["company_name"] | IndividualProfileRow["first_name"];
}

export interface QuoteListDTO {
  id: QuoteRow["id"];
  quote_number: QuoteRow["quote_number"];
  created_at: QuoteRow["created_at"];
  status: QuoteRow["status"];
  buyer_name: CorporateProfileRow["company_name"] | IndividualProfileRow["first_name"];
}

const QuoteModel = {
  getBuyerQuotes: async (client: Pool | PoolClient, buyerId: string): Promise<QuoteRow[]> => {
    const sql = "SELECT * FROM quotes WHERE buyer_id = $1 ORDER BY created_at DESC";
    const values = [buyerId];
    const result = await client.query(sql, values);
    return result.rows;
  },
  //TODO: vendor_id ye göre satıcı sayısı çoğaldığında veriler getirilecek.
  getVendorQuotes: async (client: Pool | PoolClient, limit: number): Promise<QuoteListDTO[]> => {
    let sql = `
      SELECT 
        q.id, 
        q.quote_number, 
        q.created_at, 
        q.status,
        COALESCE(cp.company_name, ip.first_name || ' ' || ip.last_name) AS buyer_name 
      FROM quotes q 
        LEFT JOIN corporate_profiles cp ON cp.user_id = q.buyer_id 
        LEFT JOIN individual_profiles ip ON ip.user_id = q.buyer_id 
      ORDER BY created_at DESC
    `;

    const params = [];

    if (Number.isInteger(limit)) {
      params.push(Math.min(limit, 100));
      sql += ` LIMIT $${params.length}`;
    }

    const result = await client.query(sql, params);
    return result.rows;
  },

  findQuoteById: async (client: Pool | PoolClient, quoteId: string): Promise<QuoteRow | null> => {
    const sql = "SELECT * FROM quotes WHERE id=$1 LIMIT 1";
    const values = [quoteId];
    const result = await client.query(sql, values);
    if (result.rowCount === 0) return null;
    return result.rows[0];
  },

  getDetailById: async (client: Pool | PoolClient, quoteId: string): Promise<QuoteDetailDTO | null> => {
    const sql = `
      SELECT 
        q.*,
        COALESCE(cp.company_name, ip.first_name || ' ' || ip.last_name) AS buyer_name 
      FROM quotes q 
        LEFT JOIN corporate_profiles cp ON cp.user_id = q.buyer_id 
        LEFT JOIN individual_profiles ip ON ip.user_id = q.buyer_id 
      WHERE q.id = $1
      ORDER BY created_at DESC
    `;
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
