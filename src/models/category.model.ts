import { Pool } from "pg";
import { CategoryListItem, CategoryRow } from "../types/db.types";

type CategoryDTO = Omit<CategoryRow, "created_at" | "updated_at">;

const CategoryModel = {
  create: async (client: Pool, dto: CategoryDTO): Promise<CategoryRow> => {
    const sql = `
        INSERT INTO categories (id, name)
        VALUES ($1, $2)
        RETURNING *;
    `;

    const values = [dto.id, dto.name];
    const response = await client.query(sql, values);
    return response.rows[0];
  },

  update: async (client: Pool, dto: CategoryDTO): Promise<CategoryRow> => {
    const sql = `
        UPDATE categories 
      SET 
        name = $2 
      WHERE id = $1
      RETURNING *
    `;

    const values = [dto.id, dto.name];
    const result = await client.query(sql, values);
    return result.rows[0];
  },

  getById: async (client: Pool, id: string): Promise<CategoryRow | null> => {
    const sql = `
        SELECT * 
        FROM categories 
        WHERE id = $1
    `;
    const values = [id];
    const result = await client.query(sql, values);
    if (result.rowCount === 0) return null;
    return result.rows[0];
  },

  getAll: async (client: Pool): Promise<CategoryListItem[]> => {
    const sql = `
        SELECT
          c.*,
          COUNT(p.id)::int AS product_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id
        GROUP BY c.id
        ORDER BY c.created_at DESC
    `;
    const result = await client.query(sql);
    return result.rows;
  },

  delete: async (client: Pool, id: string): Promise<void> => {
    const sql = `
        DELETE FROM categories WHERE id=$1
    `;

    const values = [id];
    await client.query(sql, values);
  },
};

export default CategoryModel;
