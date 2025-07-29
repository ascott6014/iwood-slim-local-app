import { db } from "../dataSource";


export async function createCustomerAndOrder(data: CustomerOrderInput) {
  const [rows] = await db.query(
    'CALL AddCustomerAndOrder(?, ?, ?, ?, ?, ?, ?, ?)',
    [
      data.first_name,
      data.last_name,
      data.address,
      data.city,
      data.state,
      data.zip,
      data.phone,
      data.email
    ]
  );
  return rows;
}

export async function createOrderForCustomer(data: OrderOnlyInput) {
  const [rows] = await db.query(
    'CALL AddOrderForCustomer(?)',
    [
      data.customer_id
    ]
  );
  return rows;
}

export async function addOrderItem(data: OrderItemInput) {
  const [rows] = await db.query(
    'CALL AddOrderItem(?, ?, ?)',
    [
      data.order_id,
      data.item_id,
      data.quantity
    ]
  );
  return rows;
}

export async function removeOrderItem(orderItemId: number) {
  const [rows] = await db.query(
    'CALL RemoveOrderItem(?)',
    [orderItemId]
  );
  return rows;
}

export async function updateOrderItem(orderItemId: number, quantity: number) {
  const [rows] = await db.query(
    'CALL UpdateOrderItem(?, ?)',
    [orderItemId, quantity]
  );
  return rows;
}

export async function createCompleteOrder(data: NewOrderInput) {
  let orderResult;
  
  if (data.customer) {
    // Create new customer and order
    orderResult = await createCustomerAndOrder(data.customer);
  } else if (data.customer_id) {
    // Create order for existing customer
    orderResult = await createOrderForCustomer({ customer_id: data.customer_id });
  } else {
    throw new Error('Either customer data or customer_id must be provided');
  }
  
  const orderId = (orderResult as any)[0][0].order_id;
  
  // Add all items to the order
  for (const item of data.items) {
    await addOrderItem({
      order_id: orderId,
      item_id: item.item_id,
      quantity: item.quantity
    });
  }
  
  return { order_id: orderId, customer_id: (orderResult as any)[0][0].customer_id };
}
