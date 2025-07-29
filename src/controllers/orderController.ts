import { Request, Response } from 'express';
import { parseDatabaseError } from '../utils/db-utils';
import { createCustomerAndOrder, createOrderForCustomer, createCompleteOrder } from '../models/orderModel';

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
