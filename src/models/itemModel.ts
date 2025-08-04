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

export async function getSellableItems(): Promise<Item[]> {
  const [rows] = await db.query(
    `SELECT item_id, item_name, item_color, item_model, description, cost, markup_rate, price, quantity, sell_item, repair_item, install_item
     FROM items
     WHERE sell_item = true
       AND quantity > 0
     ORDER BY item_name`,
    []
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

export async function getInstallItems(): Promise<Item[]> {
  const [rows] = await db.query(
    `SELECT item_id, item_name, item_color, item_model, description, cost, markup_rate, price, quantity, sell_item, repair_item, install_item
     FROM items
     WHERE install_item = true
       AND quantity > 0
     ORDER BY item_name`,
    []
  );
  return rows as Item[];
}

export async function getAllItems(): Promise<Item[]> {
  const [rows] = await db.query(
    `SELECT item_id, item_name, item_color, item_model, description, cost, markup_rate, price, quantity, sell_item, repair_item, install_item
     FROM items
     ORDER BY item_name`,
    []
  );
  return rows as Item[];
}

export async function createItem(itemData: {
  item_name: string;
  item_color: string;
  item_model: string;
  description: string;
  cost: number;
  markup_rate: number;
  quantity: number;
  sell_item: boolean;
  repair_item: boolean;
  install_item: boolean;
}): Promise<any> {
  const [result] = await db.query(
    `INSERT INTO items (item_name, item_color, item_model, description, cost, markup_rate, quantity, sell_item, repair_item, install_item)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      itemData.item_name,
      itemData.item_color,
      itemData.item_model,
      itemData.description,
      itemData.cost,
      itemData.markup_rate,
      itemData.quantity,
      itemData.sell_item,
      itemData.repair_item,
      itemData.install_item
    ]
  );
  return result;
}

export async function updateItem(itemId: number, itemData: {
  item_name: string;
  item_color: string;
  item_model: string;
  description: string;
  cost: number;
  markup_rate: number;
  quantity: number;
  sell_item: boolean;
  repair_item: boolean;
  install_item: boolean;
}): Promise<any> {
  const [result] = await db.query(
    `UPDATE items SET 
     item_name = ?, item_color = ?, item_model = ?, description = ?, 
     cost = ?, markup_rate = ?, quantity = ?, 
     sell_item = ?, repair_item = ?, install_item = ?
     WHERE item_id = ?`,
    [
      itemData.item_name,
      itemData.item_color,
      itemData.item_model,
      itemData.description,
      itemData.cost,
      itemData.markup_rate,
      itemData.quantity,
      itemData.sell_item,
      itemData.repair_item,
      itemData.install_item,
      itemId
    ]
  );
  return result;
}

export async function deleteItem(itemId: number): Promise<any> {
  const [result] = await db.query(
    `DELETE FROM items WHERE item_id = ?`,
    [itemId]
  );
  return result;
}
