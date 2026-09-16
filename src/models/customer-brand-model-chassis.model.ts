import { Pool, PoolClient } from "pg";
import { CustomerChassisListItem } from "../types/db.types";
import { nameMatchCondition } from "../utils/query";

const CustomerBrandModelChassisModel = {
  getByModelNames: async (client: Pool | PoolClient, modelNames: string[]): Promise<CustomerChassisListItem[]> => {
    const sql = `
        SELECT
          bc.id,
          bc.model_id,
          bc.name
        FROM brand_chassis bc
        JOIN brand_models bm ON bm.id = bc.model_id
        WHERE ${nameMatchCondition("bm.name", 1)}
        ORDER BY bc.name ASC
    `;

    const result = await client.query(sql, [modelNames]);
    return result.rows;
  },
};

export default CustomerBrandModelChassisModel;
