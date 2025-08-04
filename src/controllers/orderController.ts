import { Request, Response } from 'express';
import { parseDatabaseError } from '../utils/db-utils';
import { createCustomerAndOrder, createOrderForCustomer, createCompleteOrder, getOrderById, updateOrder } from '../models/orderModel';

export async function handleCreateCustomerOrder(req: Request, res: Response) {
  try {
    const result = await createCustomerAndOrder(req.body);
    res.status(200).json({ message: 'Customer and order created', result });
  } catch (error) {
    console.error(error);
    const databaseErrorMessage = parseDatabaseError(error);
    res.status(500).json({ message: 'Error creating customer and order', databaseErrorMessage });
  }
}

export async function handleCreateOrderForCustomer(req: Request, res: Response) {
  try {
    const result = await createOrderForCustomer(req.body);
    res.status(200).json({ message: 'Order created for existing customer', result });
  } catch (error) {
    console.error(error);
    const databaseErrorMessage = parseDatabaseError(error);
    res.status(500).json({ message: 'Error creating Order', databaseErrorMessage });
  }
}

export async function handleCreateCompleteOrder(req: Request, res: Response) {
  try {
    console.log('Received request body:', JSON.stringify(req.body, null, 2));
    const result = await createCompleteOrder(req.body);
    res.status(200).json({ 
      message: 'Order created successfully with items', 
      order_id: result.order_id,
      customer_id: result.customer_id
    });
  } catch (error) {
    console.error(error);
    const databaseErrorMessage = parseDatabaseError(error);
    res.status(500).json({ message: 'Error creating complete order', databaseErrorMessage });
  }
}

export async function handleGetOrder(req: Request, res: Response) {
  try {
    const orderId = parseInt(req.params.id);
    const order = await getOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    return res.status(200).json(order);
  } catch (error) {
    console.error(error);
    const databaseErrorMessage = parseDatabaseError(error);
    return res.status(500).json({ message: 'Error fetching order', databaseErrorMessage });
  }
}

export async function handleUpdateOrder(req: Request, res: Response) {
  try {
    const orderId = parseInt(req.params.id);
    const result = await updateOrder(orderId, req.body);
    res.status(200).json({ message: 'Order updated successfully', result });
  } catch (error) {
    console.error(error);
    const databaseErrorMessage = parseDatabaseError(error);
    res.status(500).json({ message: 'Error updating order', databaseErrorMessage });
  }
}
