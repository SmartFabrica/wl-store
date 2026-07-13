import { Pool } from "pg";
import { BrandModelRow } from "../types/db.types";

type BrandModelDTO = Omit<BrandModelRow, "created_at" | "updated_at">;

const BrandModelsModel = {
  create: async (client: Pool, dto: BrandModelDTO): Promise<BrandModelRow> => {
    const sql = `
        INSERT INTO brand_models (id, brand_id, name)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;

    const values = [dto.id, dto.brand_id, dto.name];
    const response = await client.query(sql, values);
    return response.rows[0];
  },

  update: async (client: Pool, dto: BrandModelDTO): Promise<BrandModelRow> => {
    const sql = `
        UPDATE brand_models 
      SET 
        name = $2,
        brand_id = $3 
      WHERE id = $1
      RETURNING *
    `;

    const values = [dto.id, dto.name, dto.brand_id];
    const result = await client.query(sql, values);
    return result.rows[0];
  },

  getById: async (client: Pool, id: string): Promise<BrandModelRow | null> => {
    const sql = `
        SELECT * 
        FROM brand_models 
        WHERE id = $1
    `;
    const values = [id];
    const result = await client.query(sql, values);
    if (result.rowCount === 0) return null;
    return result.rows[0];
  },

  getAll: async (client: Pool): Promise<BrandModelRow[]> => {
    const sql = `
        SELECT * FROM brand_models ORDER BY created_at DESC 
    `;
    const result = await client.query(sql);
    return result.rows;
  },

  delete: async (client: Pool, id: string): Promise<void> => {
    const sql = `
        DELETE FROM brand_models WHERE id=$1
    `;

    const values = [id];
    await client.query(sql, values);
  },
};

export default BrandModelsModel;
