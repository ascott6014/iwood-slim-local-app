import { Request, Response } from 'express';
import { parseDatabaseError } from '../utils/db-utils';
import { createCustomerAndInstall, createInstallForCustomer } from '../models/installModel';

export async function handleCreateCustomerInstall(req: Request, res: Response) {
  try {
    const result = await createCustomerAndInstall(req.body);
    res.status(200).json({ message: 'Customer and install created', result });
  } catch (error) {
    const databaseErrorMessage = parseDatabaseError(error);
    console.log(error);
    res.status(500).json({ message: 'Error creating customer & install', databaseErrorMessage });
  }
}

export async function handleCreateInstallForCustomer(req: Request, res: Response) {
  try {
    const result = await createInstallForCustomer(req.body);
    res.status(200).json({ message: 'Install created for existing customer', result });
  } catch (error) {
    const databaseErrorMessage = parseDatabaseError(error);
    console.log(databaseErrorMessage);
    console.log(error);
    res.status(500).json({ message: 'Error creating install', databaseErrorMessage });
  }
}
