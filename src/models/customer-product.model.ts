import { Pool, PoolClient } from "pg";
import { CustomerProductDetail, CustomerProductFilters, CustomerProductListItem, CustomerProductListResult } from "../types/db.types";
import { CustomerProductSort } from "../types/common.types";
import { nameMatchCondition } from "../utils/query";

/** Sıralama, dışarıdan gelen değerle SQL'e girmesin diye whitelist üzerinden çözülür. */
const SORT_CLAUSES: Record<CustomerProductSort, string> = {
  [CustomerProductSort.NEW]: "p.created_at DESC",
  [CustomerProductSort.PRICE_ASC]: "CASE WHEN p.price_visible THEN p.price END ASC NULLS LAST, p.created_at DESC",
  [CustomerProductSort.PRICE_DESC]: "CASE WHEN p.price_visible THEN p.price END DESC NULLS LAST, p.created_at DESC",
  [CustomerProductSort.AZ]: "p.title ASC",
};

const CustomerProductModel = {
  getAll: async (client: Pool | PoolClient, filters: CustomerProductFilters): Promise<CustomerProductListResult> => {
    const { q, category_names, brand_names, model_names, chassis_names, sort, limit } = filters;

    const params: unknown[] = [];
    const conditions: string[] = [];

    if (q) {
      params.push(`%${q}%`);
      conditions.push(
        `(p.title ILIKE $${params.length} OR p.mpn ILIKE $${params.length} OR b.name ILIKE $${params.length} OR c.name ILIKE $${params.length})`,
      );
    }

    if (category_names && category_names.length > 0) {
      params.push(category_names);
      conditions.push(nameMatchCondition("c.name", params.length));
    }

    if (brand_names && brand_names.length > 0) {
      params.push(brand_names);
      conditions.push(nameMatchCondition("b.name", params.length));
    }

    if ((model_names && model_names.length > 0) || (chassis_names && chassis_names.length > 0)) {
      const compatConditions: string[] = [];
      let compatJoins = "";

      if (model_names && model_names.length > 0) {
        params.push(model_names);
        compatConditions.push(nameMatchCondition("cbm.name", params.length));
      }

      if (chassis_names && chassis_names.length > 0) {
        params.push(chassis_names);
        compatJoins = " JOIN brand_chassis cbc ON cbc.id = pc.chassis_id";
        compatConditions.push(nameMatchCondition("cbc.name", params.length));
      }

      conditions.push(`
        EXISTS (
          SELECT 1
          FROM product_compatibility pc
          JOIN brand_models cbm ON cbm.id = pc.model_id${compatJoins}
          WHERE pc.product_id = p.id AND ${compatConditions.join(" AND ")}
        )
      `);
    }

    let sql = `
        SELECT
          p.id,
          p.title,
          p.mpn,
          p.price_visible,
          CASE WHEN p.price_visible THEN p.price ELSE NULL END AS price,
          b.name AS brand_name,
          c.name AS category_name,
          COUNT(*) OVER()::int AS total
        FROM products p
        JOIN brands b ON b.id = p.brand_id
        JOIN categories c ON c.id = p.category_id
    `;

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    sql += ` ORDER BY ${SORT_CLAUSES[sort ?? CustomerProductSort.NEW]}`;

    if (Number.isInteger(limit)) {
      params.push(Math.min(limit as number, 100));
      sql += ` LIMIT $${params.length}`;
    }

    const result = await client.query<CustomerProductListItem & { total: number }>(sql, params);

    const total = result.rows[0]?.total ?? 0;
    const items = result.rows.map(({ total: _total, ...item }) => item);

    return { items, total };
  },

  getDetailById: async (client: Pool | PoolClient, id: string): Promise<CustomerProductDetail | null> => {
    const sql = `
        SELECT
          p.id,
          p.title,
          p.mpn,
          p.description,
          p.specs,
          p.price_visible,
          CASE WHEN p.price_visible THEN p.price ELSE NULL END AS price,
          p.brand_id,
          b.name AS brand_name,
          p.category_id,
          c.name AS category_name,
          COALESCE(
            (SELECT json_agg(
                json_build_object('id', pi.id, 'image_url', pi.image_url, 'is_main', pi.is_main)
                ORDER BY pi.is_main DESC, pi.created_at ASC
              )
             FROM product_images pi
             WHERE pi.product_id = p.id),
            '[]'::json
          ) AS images,
          COALESCE(
            (SELECT json_agg(
                json_build_object(
                  'model_id', pc.model_id,
                  'model_name', bm.name,
                  'chassis_id', pc.chassis_id,
                  'chassis_name', bc.name
                ) ORDER BY bm.name, bc.name
              )
             FROM product_compatibility pc
             JOIN brand_models bm ON bm.id = pc.model_id
             JOIN brand_chassis bc ON bc.id = pc.chassis_id
             WHERE pc.product_id = p.id),
            '[]'::json
          ) AS compat
        FROM products p
        JOIN brands b ON b.id = p.brand_id
        JOIN categories c ON c.id = p.category_id
        WHERE p.id = $1
    `;

    const result = await client.query(sql, [id]);
    if (result.rowCount === 0) return null;
    return result.rows[0];
  },
};

export default CustomerProductModel;
