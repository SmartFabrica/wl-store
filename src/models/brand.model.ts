import { Pool } from "pg";
import { BrandRow } from "../types/db.types";

type BrandDTO = Omit<BrandRow, "created_at" | "updated_at">;

const BrandModel = {
  create: async (client: Pool, dto: BrandDTO): Promise<BrandRow> => {
    const sql = `
        INSERT INTO brands (id, name)
        VALUES ($1, $2)
        RETURNING *;
    `;

    const values = [dto.id, dto.name];
    const response = await client.query(sql, values);
    return response.rows[0];
  },

  update: async (client: Pool, dto: BrandDTO): Promise<BrandRow> => {
    const sql = `
        UPDATE brands 
      SET 
        name = $2 
      WHERE id = $1
      RETURNING *
    `;

    const values = [dto.id, dto.name];
    const result = await client.query(sql, values);
    return result.rows[0];
  },

  getById: async (client: Pool, id: string): Promise<BrandRow | null> => {
    const sql = `
        SELECT * 
        FROM brands 
        WHERE id = $1
    `;
    const values = [id];
    const result = await client.query(sql, values);
    if (result.rowCount === 0) return null;
    return result.rows[0];
  },

  getAll: async (client: Pool): Promise<BrandRow[]> => {
    const sql = `
        SELECT * FROM brands ORDER BY created_at DESC 
    `;
    const result = await client.query(sql);
    return result.rows;
  },

  delete: async (client: Pool, id: string): Promise<void> => {
    const sql = `
        DELETE FROM brands WHERE id=$1
    `;

    const values = [id];
    await client.query(sql, values);
  },
};

export default BrandModel;
