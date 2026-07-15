import { Pool } from "pg";
import { ProductRow } from "../types/db.types";

type ProductDTO = Omit<ProductRow, "created_at" | "updated_at">;

const ProductModel = {
  create: async (client: Pool, dto: ProductDTO): Promise<ProductRow> => {
    const sql = `
        INSERT INTO products (id, brand_id, category_id, title, mpn, description)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;

    const values = [dto.id, dto.brand_id, dto.category_id, dto.title, dto.mpn, dto.description];
    const response = await client.query(sql, values);
    return response.rows[0];
  },

  update: async (client: Pool, dto: ProductDTO): Promise<ProductRow> => {
    const sql = `
        UPDATE products 
      SET 
        brand_id = $2,
        category_id = $3,
        title = $4,
        mpn = $5,
        description = $6
      WHERE id = $1
      RETURNING *
    `;

    const values = [dto.id, dto.brand_id, dto.category_id, dto.title, dto.mpn, dto.description];
    const result = await client.query(sql, values);
    return result.rows[0];
  },

  getById: async (client: Pool, id: string): Promise<ProductRow | null> => {
    const sql = `
        SELECT * 
        FROM products 
        WHERE id = $1
    `;
    const values = [id];
    const result = await client.query(sql, values);
    if (result.rowCount === 0) return null;
    return result.rows[0];
  },

  getAll: async (client: Pool): Promise<ProductRow[]> => {
    const sql = `
        SELECT * FROM products ORDER BY created_at DESC 
    `;
    const result = await client.query(sql);
    return result.rows;
  },

  delete: async (client: Pool, id: string): Promise<void> => {
    const sql = `
        DELETE FROM products WHERE id=$1
    `;

    const values = [id];
    await client.query(sql, values);
  },
};

export default ProductModel;
