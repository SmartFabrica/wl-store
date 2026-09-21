import { Pool, PoolClient } from "pg";
import { CartRow, CustomerCartItemDetail, CustomerCartListItem } from "../types/db.types";

interface CartItemDTO {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
}

const CartModel = {
  findByBuyerId: async (client: Pool | PoolClient, buyerId: string): Promise<CartRow | null> => {
    const sql = "SELECT * FROM carts WHERE buyer_id = $1 LIMIT 1";
    const values = [buyerId];
    const result = await client.query(sql, values);
    if (result.rowCount === 0) return null;
    return result.rows[0];
  },

  create: async (client: Pool | PoolClient, id: string, buyerId: string): Promise<CartRow> => {
    const sql = `
        INSERT INTO carts (id, buyer_id)
        VALUES ($1, $2)
        RETURNING *
    `;
    const values = [id, buyerId];
    const result = await client.query(sql, values);
    return result.rows[0];
  },

  upsertItem: async (client: Pool | PoolClient, dto: CartItemDTO): Promise<CustomerCartItemDetail> => {
    const sql = `
        WITH upserted AS (
          INSERT INTO cart_items (id, cart_id, product_id, quantity)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (cart_id, product_id)
          DO UPDATE SET
            quantity = cart_items.quantity + EXCLUDED.quantity,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *
        )
        SELECT
          u.*,
          p.title,
          p.mpn,
          p.price_visible,
          CASE WHEN p.price_visible THEN p.price ELSE NULL END AS price,
          b.name AS brand_name
        FROM upserted u
        JOIN products p ON p.id = u.product_id
        JOIN brands b ON b.id = p.brand_id
    `;
    const values = [dto.id, dto.cart_id, dto.product_id, dto.quantity];
    const result = await client.query(sql, values);
    return result.rows[0];
  },

  getItemsByBuyerId: async (client: Pool | PoolClient, buyerId: string): Promise<CustomerCartListItem[]> => {
    const sql = `
        SELECT
          ci.id,
          ci.product_id,
          ci.quantity,
          p.title,
          p.mpn,
          p.price_visible,
          CASE WHEN p.price_visible THEN p.price ELSE NULL END AS price,
          b.name AS brand_name,
          COALESCE(
            (SELECT json_agg(
                json_build_object('id', pi.id, 'image_url', pi.image_url, 'is_main', pi.is_main)
                ORDER BY pi.is_main DESC, pi.created_at ASC
              )
             FROM product_images pi
             WHERE pi.product_id = p.id),
            '[]'::json
          ) AS images
        FROM cart_items ci
        JOIN carts c ON c.id = ci.cart_id
        JOIN products p ON p.id = ci.product_id
        JOIN brands b ON b.id = p.brand_id
        WHERE c.buyer_id = $1
        ORDER BY ci.created_at DESC
    `;
    const values = [buyerId];
    const result = await client.query(sql, values);
    return result.rows;
  },
};

export default CartModel;
