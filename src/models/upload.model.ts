import { Pool, PoolClient } from "pg";
import {
  BulkUpsertCategoriesResult,
  BulkUpsertCategoriesRow,
  BulkUpsertModelChassisResult,
  BulkUpsertModelChassisRow,
  BulkUpsertProductsResult,
  BulkUpsertProductsRow,
} from "../types/db.types";

const UploadModel = {
  bulkUpsertBrandModelChassis: async (client: Pool | PoolClient, dto: BulkUpsertModelChassisRow[]): Promise<BulkUpsertModelChassisResult> => {
    const sql = `
            WITH input AS (
            SELECT DISTINCT brand_name, model_name, chassis_name
            FROM unnest($1::text[], $2::text[], $3::text[])
                AS t(brand_name, model_name, chassis_name)
            ),
            brand_in AS (
            SELECT DISTINCT brand_name FROM input
            ),
            brand_ins AS (
            INSERT INTO brands (id, name)
            SELECT gen_random_uuid()::text, brand_name
            FROM brand_in
            ORDER BY brand_name
            ON CONFLICT (name) DO NOTHING
            RETURNING id, name
            ),
            brand_resolved AS (
            SELECT id, name FROM brand_ins
            UNION
            SELECT b.id, b.name
            FROM brands b
            JOIN brand_in bi ON bi.brand_name = b.name
            ),
            model_in AS (
            SELECT DISTINCT br.id AS brand_id, i.model_name
            FROM input i
            JOIN brand_resolved br ON br.name = i.brand_name
            ),
            model_ins AS (
            INSERT INTO brand_models (id, brand_id, name)
            SELECT gen_random_uuid()::text, brand_id, model_name
            FROM model_in
            ORDER BY brand_id, model_name
            ON CONFLICT (brand_id, name) DO NOTHING
            RETURNING id, brand_id, name
            ),
            model_resolved AS (
            SELECT id, brand_id, name FROM model_ins
            UNION
            SELECT m.id, m.brand_id, m.name
            FROM brand_models m
            JOIN model_in mi ON mi.brand_id = m.brand_id AND mi.model_name = m.name
            ),
            chassis_in AS (
            SELECT DISTINCT mr.id AS model_id, i.chassis_name
            FROM input i
            JOIN brand_resolved br ON br.name = i.brand_name
            JOIN model_resolved mr ON mr.brand_id = br.id AND mr.name = i.model_name
            ),
            chassis_ins AS (
            INSERT INTO brand_chassis (id, model_id, name)
            SELECT gen_random_uuid()::text, model_id, chassis_name
            FROM chassis_in
            ORDER BY model_id, chassis_name
            ON CONFLICT (model_id, name) DO NOTHING
            RETURNING id
            )
            SELECT
            (SELECT count(*) FROM brand_ins)::int   AS brands_created,
            (SELECT count(*) FROM model_ins)::int   AS models_created,
            (SELECT count(*) FROM chassis_ins)::int AS chassis_created
        `;

    const brands = dto.map((item) => item.brand);
    const models = dto.map((item) => item.model);
    const chassis = dto.map((item) => item.chassis);

    const response = await client.query(sql, [brands, models, chassis]);
    return response.rows[0];
  },

  bulkUpsertCategories: async (client: Pool | PoolClient, dto: BulkUpsertCategoriesRow[]): Promise<BulkUpsertCategoriesResult> => {
    const sql = `
        WITH input AS (
          SELECT DISTINCT category_name
          FROM unnest($1::text[]) AS t(category_name)
        ),
        category_ins AS (
          INSERT INTO categories (id, name)
          SELECT gen_random_uuid()::text, category_name
          FROM input
          ORDER BY category_name
          ON CONFLICT (name) DO NOTHING
          RETURNING id
        )
        SELECT (SELECT count(*) FROM category_ins)::int AS category_created
    `;

    const categories = dto.map((item) => item.category);
    const response = await client.query(sql, [categories]);
    return response.rows[0];
  },

  bulkUpsertProducts: async (client: Pool | PoolClient, dto: BulkUpsertProductsRow[]): Promise<BulkUpsertProductsResult> => {
    const sql = `
        WITH input AS (
          SELECT
            ord,
            mpn,
            brand_name,
            category_name,
            model_name,
            chassis_name,
            title,
            NULLIF(price, '')::numeric(12, 2) AS price,
            price_visible
          FROM unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[], $7::text[], $8::boolean[])
            WITH ORDINALITY AS t(
              mpn, brand_name, category_name, model_name, chassis_name, title, price, price_visible, ord
            )
        ),
        resolved AS (
          SELECT
            i.ord,
            i.mpn,
            i.title,
            i.price,
            i.price_visible,
            b.id  AS brand_id,
            c.id  AS category_id,
            m.id  AS model_id,
            ch.id AS chassis_id
          FROM input i
          JOIN brands b         ON b.name = i.brand_name
          JOIN categories c     ON c.name = i.category_name
          JOIN brand_models m   ON m.brand_id = b.id AND m.name = i.model_name
          JOIN brand_chassis ch ON ch.model_id = m.id AND ch.name = i.chassis_name
        ),
        product_in AS (
          SELECT DISTINCT ON (mpn) mpn, brand_id, category_id, title, price, price_visible
          FROM resolved
          ORDER BY mpn, ord
        ),
        product_ins AS (
          INSERT INTO products (id, brand_id, category_id, title, mpn, price, price_visible)
          SELECT gen_random_uuid()::text, brand_id, category_id, title, mpn, price, price_visible
          FROM product_in
          ON CONFLICT (mpn) DO UPDATE SET
            brand_id      = EXCLUDED.brand_id,
            category_id   = EXCLUDED.category_id,
            title         = EXCLUDED.title,
            price         = EXCLUDED.price,
            price_visible = EXCLUDED.price_visible,
            updated_at    = CURRENT_TIMESTAMP
          RETURNING id, mpn, (xmax = 0) AS is_new
        ),
        compatibility_in AS (
          SELECT DISTINCT p.id AS product_id, r.model_id, r.chassis_id
          FROM resolved r
          JOIN product_ins p ON p.mpn = r.mpn
        ),
        compatibility_ins AS (
          INSERT INTO product_compatibility (id, product_id, model_id, chassis_id)
          SELECT gen_random_uuid()::text, product_id, model_id, chassis_id
          FROM compatibility_in
          ON CONFLICT DO NOTHING
          RETURNING id
        )
        SELECT (SELECT count(*) FROM product_ins WHERE is_new)::int AS product_created
    `;

    const mpns = dto.map((item) => item.mpn);
    const brands = dto.map((item) => item.brand);
    const categories = dto.map((item) => item.category);
    const models = dto.map((item) => item.model);
    const chassis = dto.map((item) => item.chassis);
    const titles = dto.map((item) => item.title);
    const prices = dto.map((item) => item.price);
    const priceVisibilities = dto.map((item) => item.price_visible);

    const values = [mpns, brands, categories, models, chassis, titles, prices, priceVisibilities];
    const response = await client.query(sql, values);
    return response.rows[0];
  },
};

export default UploadModel;
