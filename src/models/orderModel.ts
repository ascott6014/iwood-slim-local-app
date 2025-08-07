const { db } = require("../dataSource");


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
  console.log('createOrderForCustomer called with:', data);
  const [rows] = await db.query(
    'CALL AddOrderForCustomer(?)',
    [
      data.customer_id
    ]
  );
  console.log('createOrderForCustomer rows result:', rows);
  return rows;
}

export async function addOrderItem(data: OrderItemInput) {
  console.log('addOrderItem called with:', data);
  const [rows] = await db.query(
    'CALL AddOrderItem(?, ?, ?)',
    [
      data.order_id,
      data.item_id,
      data.quantity
    ]
  );
  console.log('addOrderItem result:', rows);
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
  console.log('Model received data:', JSON.stringify(data, null, 2));
  console.log('data.customer:', data.customer);
  console.log('data.customer_id:', data.customer_id);
  console.log('typeof data.customer_id:', typeof data.customer_id);
  console.log('data.customer_id === undefined:', data.customer_id === undefined);
  console.log('data.customer_id === null:', data.customer_id === null);
  console.log('Boolean(data.customer_id):', Boolean(data.customer_id));
  
  let orderResult;
  
  if (data.customer) {
    console.log('Taking customer branch');
    // Create new customer and order
    orderResult = await createCustomerAndOrder(data.customer);
  } else if (data.customer_id) {
    console.log('Taking customer_id branch');
    // Create order for existing customer
    orderResult = await createOrderForCustomer({ customer_id: data.customer_id });
  } else {
    console.log('Taking error branch - this should not happen!');
    throw new Error('Either customer data or customer_id must be provided');
  }
  
  console.log('Order creation result:', orderResult);
  const orderId = (orderResult as any)[0][0].order_id;
  console.log('Extracted orderId:', orderId);
  
  // Add all items to the order
  console.log('Adding items to order:', data.items);
  for (const item of data.items) {
    console.log('Adding item:', item);
    await addOrderItem({
      order_id: orderId,
      item_id: item.item_id,
      quantity: item.quantity
    });
    console.log('Item added successfully');
  }
  
  console.log('All items added, returning result');
  return { order_id: orderId, customer_id: (orderResult as any)[0][0].customer_id };
}

export async function getOrderById(orderId: number) {
  const [rows] = await db.query(`
    SELECT o.*, c.first_name, c.last_name, c.email, c.phone, c.address, c.city, c.state, c.zip
    FROM orders o
    JOIN customers c ON o.customer_id = c.customer_id
    WHERE o.order_id = ?
  `, [orderId]);
  return (rows as any[])[0];
}

export async function updateOrder(orderId: number, data: { order_date?: string }) {
  const updates = [];
  const values = [];
  
  if (data.order_date !== undefined) {
    updates.push('order_date = ?');
    values.push(data.order_date);
  }
  
  if (updates.length === 0) {
    throw new Error('No valid fields to update');
  }
  
  values.push(orderId);
  
  const [result] = await db.query(
    `UPDATE orders SET ${updates.join(', ')} WHERE order_id = ?`,
    values
  );
  
  return result;
}
