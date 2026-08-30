import { Pool, PoolClient } from "pg";
import { QuoteStatus, UserStatus } from "../types/common.types";
import { OverviewRow } from "../types/db.types";

const DashboardModel = {
  count: async (client: PoolClient | Pool): Promise<OverviewRow> => {
    const sql = `
        SELECT
            (SELECT COUNT(title) FROM products)::int AS product_count,
            (SELECT COUNT(id) FROM users WHERE status=$1)::int AS approved_customer_count,
            (SELECT COUNT(name) FROM categories)::int AS category_count,
            (SELECT COUNT(name) FROM brands)::int AS brand_count,
            (SELECT COUNT(name) FROM brand_models)::int AS brand_model_count,
            (SELECT COUNT(name) FROM brand_chassis)::int AS brand_model_chassis_count,
            (SELECT COUNT(id) FROM users WHERE status=$2)::int AS pending_customer_count,
            (SELECT COUNT(id) FROM quotes WHERE status=$3)::int AS pending_quote_count  
    `;

    const values = [UserStatus.APPROVED, UserStatus.PENDING, QuoteStatus.PENDING];
    const response = await client.query(sql, values);
    return response.rows[0];
  },
};

export default DashboardModel;
