import { Pool } from "pg";
import { BrandModelChassisListItem, BrandModelChassisRow } from "../types/db.types";

type BrandModelChassisDTO = Omit<BrandModelChassisRow, "created_at" | "updated_at">;

const BrandModelChassisModel = {
  create: async (client: Pool, dto: BrandModelChassisDTO): Promise<BrandModelChassisRow> => {
    const sql = `
        INSERT INTO brand_chassis (id, model_id, name)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;

    const values = [dto.id, dto.model_id, dto.name];
    const response = await client.query(sql, values);
    return response.rows[0];
  },

  update: async (client: Pool, dto: BrandModelChassisDTO): Promise<BrandModelChassisRow> => {
    const sql = `
        UPDATE brand_chassis
      SET 
        name = $2,
        model_id = $3 
      WHERE id = $1
      RETURNING *
    `;

    const values = [dto.id, dto.name, dto.model_id];
    const result = await client.query(sql, values);
    return result.rows[0];
  },

  getById: async (client: Pool, id: string): Promise<BrandModelChassisRow | null> => {
    const sql = `
        SELECT * 
        FROM brand_chassis 
        WHERE id = $1
    `;
    const values = [id];
    const result = await client.query(sql, values);
    if (result.rowCount === 0) return null;
    return result.rows[0];
  },

  getAll: async (client: Pool): Promise<BrandModelChassisRow[]> => {
    const sql = `
        SELECT * FROM brand_chassis ORDER BY created_at DESC 
    `;
    const result = await client.query(sql);
    return result.rows;
  },

  getByModelId: async (client: Pool, modelId: string): Promise<BrandModelChassisListItem[]> => {
    const sql = `
        SELECT
          bc.*,
          COUNT(DISTINCT pc.product_id)::int AS product_count
        FROM brand_chassis bc
        LEFT JOIN product_compatibility pc ON pc.chassis_id = bc.id
        WHERE bc.model_id = $1
        GROUP BY bc.id
        ORDER BY bc.created_at DESC
    `;
    const values = [modelId];
    const result = await client.query(sql, values);
    return result.rows;
  },

  delete: async (client: Pool, id: string): Promise<void> => {
    const sql = `
        DELETE FROM brand_chassis WHERE id=$1
    `;

    const values = [id];
    await client.query(sql, values);
  },
};

export default BrandModelChassisModel;
