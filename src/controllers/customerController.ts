import { Request, Response } from 'express';
import { getAllCustomers, searchCustomers, addCustomer } from '../models/customerModel';


 export async function handleGetCustomers(_req: Request, res: Response) {
  try {
    const customers = await getAllCustomers();
    res.status(200).json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Unable to fetch customers', error });
  }
}


export async function handleCustomerSearch(req: Request, res: Response) {
  const query = req.query.q as string;

  if (!query || query.trim().length < 2) {
    res.status(400).json({ message: 'Query must be at least 2 characters long' });
  }

  try {
    const customers = await searchCustomers(query.trim());
    res.status(200).json(customers);
  } catch (error) {
    console.error('Customer search failed:', error);
    res.status(500).json({ message: 'Error searching customers', error });
  }
}

export async function handleCreateNewCustomer (req: Request, res: Response): Promise <void> {
    const {first_name, last_name, address, city, state, zip, phone, email, notes } = req.body;
    
    try {
        await addCustomer(first_name, last_name, address, city, state, zip, phone, email, notes );
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding customer.')
    }

}



