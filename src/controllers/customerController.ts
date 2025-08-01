// src/controllers/customerController.ts
import { Request, Response } from 'express';
import { parseDatabaseError } from '../utils/db-utils';
import {
  searchCustomers,
  getCustomers,
  getCustomersWithRecentVisits,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from "../models/customerModel"

// GET /customers/all
// return id, first_name, last_name, email


// GET /customers
// return every column
export async function handleGetCustomers(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    const customers = await getCustomers();
    res.status(200).json(customers);
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ message: 'Unable to fetch customers', error: err });
  }
}

// GET /customers/search?q=term
// search by full name or phone (min 2 chars)
export async function handleSearchCustomers(
  req: Request,
  res: Response
): Promise<void> {
  const q = (req.query.q as string)?.trim() || '';
  if (q.length < 2) {
    res
      .status(400)
      .json({ message: 'Query must be at least 2 characters long' });
    return;
  }

  try {
    const results = await searchCustomers(q);
    res.status(200).json(results);
  } catch (err) {
    console.error('Error searching customers:', err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json({ message: 'Error searching customers', error: databaseErrorMessage });
  }
}

// GET /customers/with-visits
// return all customers with their most recent visit information
export async function handleGetCustomersWithRecentVisits(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    console.log('Attempting to fetch customers with recent visits...');
    const customers = await getCustomersWithRecentVisits();
    console.log('Successfully fetched customers:', customers.length);
    res.status(200).json(customers);
  } catch (err) {
    console.error('Error fetching customers with recent visits:', err);
    console.error('Error details:', JSON.stringify(err, null, 2));
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json({ message: 'Error fetching customers with recent visits', error: databaseErrorMessage });
  }
}

// POST /customers
// create a new customer
export async function handleAddCustomer(
  req: Request,
  res: Response
): Promise<void> {
  const {
    first_name,
    last_name,
    address = '',
    city = '',
    state = '',
    zip = '',
    phone,
    email = ''
  } = req.body as Partial<Customer>;

  if (!first_name || !last_name || !phone) {
    res
      .status(400)
      .json({ message: 'first_name, last_name and phone are required' });
    return;
  }

  try {
    const result = await addCustomer(
      first_name,
      last_name,
      address,
      city,
      state,
      zip,
      phone,
      email
    );
    res.status(201).json({ message: 'Customer created', result });
  } catch (err) {
    console.error('Error adding customer:', err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json({ message: 'Error adding customer', error: databaseErrorMessage });
  }
}

// PUT /customers/:id
// partial update allowed
export async function handleUpdateCustomer(
  req: Request,
  res: Response
): Promise<void> {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ message: 'Invalid customer ID' });
    return;
  }

  const data = req.body as Partial<Omit<Customer, 'customer_id'>>;
  if (Object.keys(data).length === 0) {
    res.status(400).json({ message: 'No fields provided to update' });
    return;
  }

  try {
    const result = await updateCustomer(id, data);
    res.status(200).json({ message: 'Customer updated', result });
  } catch (err) {
    console.error('Error updating customer:', err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json({ message: 'Error updating customer', error: databaseErrorMessage });
  }
}

// DELETE /customers/:id
export async function handleDeleteCustomer(
  req: Request,
  res: Response
): Promise<void> {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ message: 'Invalid customer ID' });
    return;
  }

  try {
    const result = await deleteCustomer(id);
    res.status(200).json({ message: 'Customer deleted', result });
  } catch (err) {
    console.error('Error deleting customer:', err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json({ message: 'Error deleting customer', error: databaseErrorMessage });
  }
}

