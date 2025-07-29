import { db } from "../dataSource";

export async function searchItems(query: string): Promise<Item[]> {
  const like = `%${query}%`;
  const [rows] = await db.query(
    `SELECT item_id, item_name, item_color, item_model, description, cost, markup_rate, price, quantity, sell_item, repair_item, install_item
     FROM items
     WHERE (item_name LIKE ? OR item_model LIKE ? OR description LIKE ?)
       AND sell_item = true
       AND quantity > 0
     ORDER BY item_name
     LIMIT 20`,
    [like, like, like]
  );
  return rows as Item[];
}

export async function getItemById(itemId: number): Promise<Item | null> {
  const [rows] = await db.query(
    `SELECT item_id, item_name, item_color, item_model, description, cost, markup_rate, price, quantity, sell_item, repair_item, install_item
     FROM items WHERE item_id = ?`,
    [itemId]
  );
  const items = rows as Item[];
  return items.length > 0 ? items[0] : null;
}

export async function getOrderItems(orderId: number): Promise<OrderItem[]> {
  const [rows] = await db.query(
    `SELECT oi.order_item_id, oi.order_id, oi.item_id, oi.order_item_quantity, oi.total_price,
            i.item_name, i.item_color, i.item_model, i.price
     FROM order_items oi
     JOIN items i ON oi.item_id = i.item_id
     WHERE oi.order_id = ?
     ORDER BY oi.order_item_id`,
    [orderId]
  );
  return rows as OrderItem[];
}
