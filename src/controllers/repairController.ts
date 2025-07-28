import { Request, Response } from 'express';
import { parseDatabaseError } from '../utils/db-utils';
import { createCustomerAndRepair, createRepairForCustomer } from '../models/repairModel';


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
