import { Request, Response } from 'express';
import { createCustomerAndInstall, createInstallForCustomer } from '../models/installModel';

export async function handleCreateCustomerInstall(req: Request, res: Response) {
  try {
    const result = await createCustomerAndInstall(req.body);
    res.status(200).json({ message: 'Customer and install created', result });
  } catch (error) {
    res.status(500).json({ message: 'Error creating customer & install', error });
  }
}

export async function handleCreateInstallForCustomer(req: Request, res: Response) {
  try {
    const result = await createInstallForCustomer(req.body);
    res.status(200).json({ message: 'Install created for existing customer', result });
  } catch (error) {
    res.status(500).json({ message: 'Error creating install', error });
  }
}
