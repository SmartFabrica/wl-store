import { Pool, PoolClient } from "pg";
import { CustomerBrandModelListItem } from "../types/db.types";
import { nameMatchCondition } from "../utils/query";

const CustomerBrandModelModel = {
  getByBrandNames: async (client: Pool | PoolClient, brandNames: string[]): Promise<CustomerBrandModelListItem[]> => {
    const sql = `
        SELECT
          bm.id,
          bm.brand_id,
          bm.name
        FROM brand_models bm
        JOIN brands b ON b.id = bm.brand_id
        WHERE ${nameMatchCondition("b.name", 1)}
        ORDER BY bm.name ASC
    `;

    const result = await client.query(sql, [brandNames]);
    return result.rows;
  },
};

export default CustomerBrandModelModel;
