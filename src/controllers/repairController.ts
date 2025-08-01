import { Request, Response } from 'express';
import { parseDatabaseError } from '../utils/db-utils';
import { createCustomerAndRepair, createRepairForCustomer, updateRepairPickupDate, updateRepairStatus, addRepairItem, getRepairItems } from '../models/repairModel';


export async function handleCustomerAndRepair(req: Request, res: Response) {

    console.log('form input:', req.body);
  try {
    const result = await createCustomerAndRepair(req.body);
    // Extract repair_id from stored procedure result
    const resultData = result as any;
    const repair_id = resultData[0]?.[0]?.repair_id;
    const customer_id = resultData[0]?.[0]?.customer_id;
    
    res.status(200).json({ 
      message: 'Customer and repair created', 
      repair_id, 
      customer_id,
      result 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error creating customer & repair', error });
  }
}

export async function handleRepairForCustomer(req: Request, res: Response) {
  try {
    const result = await createRepairForCustomer(req.body);
    // Extract repair_id from stored procedure result
    const resultData = result as any;
    const repair_id = resultData[0]?.[0]?.repair_id;
    
    res.status(200).json({ 
      message: 'Repair created for existing customer', 
      repair_id,
      result 
    });
  } catch (error) {
    console.error(error);
    const databaseErrorMessage = parseDatabaseError(error);
    res.status(500).json({ message: 'Error creating repair', databaseErrorMessage });
  }
}

export async function handleRepairPickup(req: Request, res: Response) {
  try {
    const { repairId } = req.params;
    const result = await updateRepairPickupDate(parseInt(repairId));
    res.status(200).json({ message: 'Repair marked as picked up', result });
  } catch (error) {
    console.error(error);
    const databaseErrorMessage = parseDatabaseError(error);
    res.status(500).json({ message: 'Error updating pickup date', databaseErrorMessage });
  }
}

export async function handleRepairStatusUpdate(req: Request, res: Response) {
  try {
    const { repairId } = req.params;
    const { status, notes } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const result = await updateRepairStatus(parseInt(repairId), status, notes);
    return res.status(200).json({ message: 'Repair status updated successfully', result });
  } catch (error) {
    console.error(error);
    const databaseErrorMessage = parseDatabaseError(error);
    return res.status(500).json({ message: 'Error updating repair status', databaseErrorMessage });
  }
}

export async function handleAddRepairItem(req: Request, res: Response) {
  try {
    const { repair_id, item_id, quantity } = req.body;
    
    if (!repair_id || !item_id || !quantity) {
      return res.status(400).json({ message: 'repair_id, item_id, and quantity are required' });
    }
    
    const result = await addRepairItem(repair_id, item_id, quantity);
    return res.status(200).json({ message: 'Item added to repair successfully', result });
  } catch (error) {
    console.error(error);
    const databaseErrorMessage = parseDatabaseError(error);
    return res.status(500).json({ message: 'Error adding item to repair', databaseErrorMessage });
  }
}

export async function handleGetRepairItems(req: Request, res: Response) {
  try {
    const { repairId } = req.params;
    const items = await getRepairItems(parseInt(repairId));
    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    const databaseErrorMessage = parseDatabaseError(error);
    res.status(500).json({ message: 'Error fetching repair items', databaseErrorMessage });
  }
}