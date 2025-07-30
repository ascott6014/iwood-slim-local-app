import { Request, Response } from 'express';
import { searchItems, getOrderItems, getInstallItems } from '../models/itemModel';
import { addOrderItem, removeOrderItem, updateOrderItem } from '../models/orderModel';

export async function handleSearchItems(req: Request, res: Response): Promise<void> {
  const query = (req.query.q as string)?.trim() || '';
  if (query.length < 2) {
    res.status(400).json({ message: 'Query must be at least 2 characters' });
    return;
  }

  try {
    const items = await searchItems(query);
    res.status(200).json(items);
  } catch (error) {
    console.error('Error searching items:', error);
    res.status(500).json({ message: 'Unable to search items', error });
  }
}

export async function handleGetOrderItems(req: Request, res: Response): Promise<void> {
  const orderId = parseInt(req.params.orderId);
  if (isNaN(orderId)) {
    res.status(400).json({ message: 'Invalid order ID' });
    return;
  }

  try {
    const items = await getOrderItems(orderId);
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching order items:', error);
    res.status(500).json({ message: 'Unable to fetch order items', error });
  }
}

export async function handleAddOrderItem(req: Request, res: Response): Promise<void> {
  const { order_id, item_id, quantity } = req.body;

  if (!order_id || !item_id || !quantity || quantity <= 0) {
    res.status(400).json({ message: 'Missing required fields or invalid quantity' });
    return;
  }

  try {
    const result = await addOrderItem({ order_id, item_id, quantity });
    res.status(200).json({ message: 'Order item added successfully', result });
  } catch (error) {
    console.error('Error adding order item:', error);
    res.status(500).json({ message: 'Unable to add order item', error });
  }
}

export async function handleUpdateOrderItem(req: Request, res: Response): Promise<void> {
  const orderItemId = parseInt(req.params.orderItemId);
  const { quantity } = req.body;

  if (isNaN(orderItemId) || !quantity || quantity <= 0) {
    res.status(400).json({ message: 'Invalid order item ID or quantity' });
    return;
  }

  try {
    const result = await updateOrderItem(orderItemId, quantity);
    res.status(200).json({ message: 'Order item updated successfully', result });
  } catch (error) {
    console.error('Error updating order item:', error);
    res.status(500).json({ message: 'Unable to update order item', error });
  }
}

export async function handleRemoveOrderItem(req: Request, res: Response): Promise<void> {
  const orderItemId = parseInt(req.params.orderItemId);

  if (isNaN(orderItemId)) {
    res.status(400).json({ message: 'Invalid order item ID' });
    return;
  }

  try {
    const result = await removeOrderItem(orderItemId);
    res.status(200).json({ message: 'Order item removed successfully', result });
  } catch (error) {
    console.error('Error removing order item:', error);
    res.status(500).json({ message: 'Unable to remove order item', error });
  }
}

export async function handleGetInstallItems(req: Request, res: Response): Promise<void> {
  try {
    const items = await getInstallItems();
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching install items:', error);
    res.status(500).json({ message: 'Unable to fetch install items', error });
  }
}
