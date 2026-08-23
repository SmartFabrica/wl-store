import { Pool, PoolClient } from "pg";
import { ProductDetail, ProductRow } from "../types/db.types";

type ProductDTO = Omit<ProductRow, "created_at" | "updated_at">;

const ProductModel = {
  create: async (client: Pool | PoolClient, dto: ProductDTO): Promise<ProductRow> => {
    const sql = `
        INSERT INTO products (id, brand_id, category_id, title, mpn, description, specs, price, price_visible)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
    `;

    const values = [dto.id, dto.brand_id, dto.category_id, dto.title, dto.mpn, dto.description, dto.specs, dto.price, dto.price_visible];
    const response = await client.query(sql, values);
    return response.rows[0];
  },

  update: async (client: Pool | PoolClient, dto: ProductDTO): Promise<ProductRow> => {
    const sql = `
        UPDATE products 
      SET 
        brand_id = $2,
        category_id = $3,
        title = $4,
        mpn = $5,
        description = $6,
        specs = $7,
        price = $8,
        price_visible = $9
      WHERE id = $1
      RETURNING *
    `;

    const values = [dto.id, dto.brand_id, dto.category_id, dto.title, dto.mpn, dto.description, dto.specs, dto.price, dto.price_visible];
    const result = await client.query(sql, values);
    return result.rows[0];
  },

  getById: async (client: Pool | PoolClient, id: string): Promise<ProductRow | null> => {
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

  getAll: async (client: Pool | PoolClient): Promise<ProductRow[]> => {
    const sql = `
        SELECT * FROM products ORDER BY created_at DESC 
    `;
    const result = await client.query(sql);
    return result.rows;
  },

  delete: async (client: Pool | PoolClient, id: string): Promise<void> => {
    const sql = `
        DELETE FROM products WHERE id=$1
    `;

    const values = [id];
    await client.query(sql, values);
  },

  getDetailById: async (client: Pool | PoolClient, id: string): Promise<ProductDetail | null> => {
    const sql = `
        SELECT
          p.*,
          COALESCE(
            (SELECT json_agg(
                json_build_object(
                  'id', pc.id,
                  'model_id', pc.model_id,
                  'chassis_id', pc.chassis_id
                ) ORDER BY pc.model_id, pc.chassis_id
              )
             FROM product_compatibility pc
             WHERE pc.product_id = p.id),
            '[]'::json
          ) AS compat
        FROM products p
        WHERE p.id = $1
    `;

    const values = [id];
    const result = await client.query(sql, values);
    if (result.rowCount === 0) return null;
    return result.rows[0];
  },
};

export default ProductModel;
