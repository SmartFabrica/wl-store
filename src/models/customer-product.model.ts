import { Pool, PoolClient } from "pg";
import { CustomerProductFilters, CustomerProductListItem } from "../types/db.types";

const CustomerProductModel = {
  getAll: async (client: Pool | PoolClient, filters: CustomerProductFilters): Promise<CustomerProductListItem[]> => {
    const { category_id, model_id, chassis_id, limit } = filters;

    let sql = `
        SELECT
          p.id,
          p.title,
          p.mpn,
          p.price_visible,
          CASE WHEN p.price_visible THEN p.price ELSE NULL END AS price,
          b.name AS brand_name,
          c.name AS category_name
        FROM products p
        JOIN brands b ON b.id = p.brand_id
        JOIN categories c ON c.id = p.category_id
    `;

    const params: unknown[] = [];
    const conditions: string[] = [];

    if (category_id) {
      params.push(category_id);
      conditions.push(`p.category_id = $${params.length}`);
    }

    if (model_id || chassis_id) {
      const compatConditions: string[] = [];

      if (model_id) {
        params.push(model_id);
        compatConditions.push(`pc.model_id = $${params.length}`);
      }

      if (chassis_id) {
        params.push(chassis_id);
        compatConditions.push(`pc.chassis_id = $${params.length}`);
      }

      conditions.push(`
        EXISTS (
          SELECT 1
          FROM product_compatibility pc
          WHERE pc.product_id = p.id AND ${compatConditions.join(" AND ")}
        )
      `);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    sql += ` ORDER BY p.created_at DESC`;

    if (Number.isInteger(limit)) {
      params.push(Math.min(limit as number, 100));
      sql += ` LIMIT $${params.length}`;
    }

    const result = await client.query(sql, params);
    return result.rows;
  },
};

export default CustomerProductModel;
