import { db } from "../dataSource";
import { CustomerOrderInput, OrderOnlyInput } from "../types/orderTypes";

export async function createCustomerAndOrder(data: CustomerOrderInput) {
  const [rows] = await db.query(
    'CALL CreateCustomerAndOrder(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      data.first_name,
      data.last_name,
      data.address,
      data.city,
      data.state,
      data.zip,
      data.phone,
      data.email,
      data.notes ?? null,
      data.order_date,
      data.order_total,
    ]
  );
  return rows;
}

export async function createOrderForCustomer(data: OrderOnlyInput) {
  const [rows] = await db.query(
    'CALL CreateOrderForCustomer(?, ?, ?)',
    [
      data.customer_id,
      data.order_date,
      data.order_total,
    ]
  );
  return rows;
}
