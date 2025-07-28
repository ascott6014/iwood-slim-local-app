import { db } from "../dataSource";


export async function createCustomerAndOrder(data: CustomerOrderInput) {
  const [rows] = await db.query(
    'CALL AddCustomerAndOrder(?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      data.first_name,
      data.last_name,
      data.address,
      data.city,
      data.state,
      data.zip,
      data.phone,
      data.email,
      data.order_date
    ]
  );
  return rows;
}

export async function createOrderForCustomer(data: OrderOnlyInput) {
  const [rows] = await db.query(
    'CALL AddOrderForCustomer(?, ?)',
    [
      data.customer_id,
      data.order_date
    ]
  );
  return rows;
}
