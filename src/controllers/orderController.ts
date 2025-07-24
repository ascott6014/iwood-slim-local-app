import { Request, Response } from 'express';
import { createCustomerAndOrder, createOrderForCustomer } from '../models/orderModel';

export async function handleCreateCustomerOrder(req: Request, res: Response) {
  try {
    const result = await createCustomerAndOrder(req.body);
    res.status(200).json({ message: 'Customer and order created', result });
  } catch (error) {
    res.status(500).json({ message: 'Error creating customer & order', error });
  }
}

export async function handleCreateOrderForCustomer(req: Request, res: Response) {
  try {
    const result = await createOrderForCustomer(req.body);
    res.status(200).json({ message: 'Order created for existing customer', result });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error });
  }
}
