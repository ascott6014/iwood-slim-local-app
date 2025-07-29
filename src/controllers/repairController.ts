import { Request, Response } from 'express';
import { parseDatabaseError } from '../utils/db-utils';
import { createCustomerAndRepair, createRepairForCustomer, updateRepairPickupDate, updateRepairStatus } from '../models/repairModel';


export async function handleCustomerAndRepair(req: Request, res: Response) {

    console.log('form input:', req.body);
  try {
    const result = await createCustomerAndRepair(req.body);
    res.status(200).json({ message: 'Customer and repair created', result });
  } catch (error) {
    res.status(500).json({ message: 'Error creating customer & repair', error });
  }
}

export async function handleRepairForCustomer(req: Request, res: Response) {
  try {
    const result = await createRepairForCustomer(req.body);
    res.status(200).json({ message: 'Repair created for existing customer', result });
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
