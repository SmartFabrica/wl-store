import { Pool, PoolClient } from "pg";
import { CustomerBrandListItem } from "../types/db.types";

const CustomerBrandModel = {
  getAll: async (client: Pool | PoolClient): Promise<CustomerBrandListItem[]> => {
    const sql = `
        SELECT
          b.id,
          b.name,
          COUNT(p.id)::int AS product_count
        FROM brands b
        LEFT JOIN products p ON p.brand_id = b.id
        GROUP BY b.id, b.name
        ORDER BY b.name ASC
    `;

    const result = await client.query(sql);
    return result.rows;
  },
};

export default CustomerBrandModel;
