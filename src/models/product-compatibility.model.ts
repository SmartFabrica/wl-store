import { Pool, PoolClient } from "pg";
import { ProductCompatibilityRow } from "../types/db.types";

type ProductCompatibilityDTO = Omit<ProductCompatibilityRow, "created_at" | "product_id" | "id">;

const ProductCompatibilityModel = {
  bulkCreate: async (client: Pool | PoolClient, productId: string, dto: ProductCompatibilityDTO[]): Promise<ProductCompatibilityRow[]> => {
    if (dto.length === 0) return [];

    const sql = `
            INSERT INTO product_compatibility (id, product_id, model_id, chassis_id)
            SELECT gen_random_uuid()::text, $2, x.model_id, x.chassis_id
            FROM jsonb_to_recordset($1::jsonb) AS x(model_id text, chassis_id text)
            RETURNING *
        `;

    const values = [JSON.stringify(dto), productId];
    const result = await client.query(sql, values);
    return result.rows;
  },
  deleteByProductId: async (client: Pool | PoolClient, productId: string): Promise<void> => {
    const sql = `DELETE FROM product_compatibility WHERE product_id=$1`;
    const values = [productId];
    await client.query(sql, values);
  },
};

export default ProductCompatibilityModel;
