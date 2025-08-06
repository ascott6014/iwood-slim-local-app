import { Request, Response } from 'express';
import { parseDatabaseError } from '../utils/db-utils';
import { createCustomerAndInstall, createInstallForCustomer, getInstallItems, addInstallItem, updateInstallItem, removeInstallItem, getInstallById, updateInstall } from '../models/installModel';

export async function handleCreateCustomerInstall(req: Request, res: Response) {
  try {
    const { items, ...installData } = req.body;
    const result = await createCustomerAndInstall(installData);
    
    // Extract install_id from stored procedure result
    const resultData = result as any;
    const install_id = resultData[0]?.[0]?.install_id;
    const customer_id = resultData[0]?.[0]?.customer_id;
    
    // If items are provided, add them to the install
    if (items && items.length > 0 && install_id) {
      for (const item of items) {
        await addInstallItem(install_id, item.item_id, item.quantity);
      }
    }
    
    res.status(200).json({ 
      message: 'Customer and install created', 
      install_id,
      customer_id,
      result 
    });
  } catch (error) {
    const databaseErrorMessage = parseDatabaseError(error);
    console.log(error);
    res.status(500).json({ message: 'Error creating customer & install', databaseErrorMessage });
  }
}

export async function handleCreateInstallForCustomer(req: Request, res: Response) {
  try {
    const { items, ...installData } = req.body;
    const result = await createInstallForCustomer(installData);
    
    // Extract install_id from stored procedure result
    const resultData = result as any;
    const install_id = resultData[0]?.[0]?.install_id;
    
    // If items are provided, add them to the install
    if (items && items.length > 0 && install_id) {
      for (const item of items) {
        await addInstallItem(install_id, item.item_id, item.quantity);
      }
    }
    
    res.status(200).json({ 
      message: 'Install created for existing customer', 
      install_id,
      result 
    });
  } catch (error) {
    const databaseErrorMessage = parseDatabaseError(error);
    console.log(databaseErrorMessage);
    console.log(error);
    res.status(500).json({ message: 'Error creating install', databaseErrorMessage });
  }
}

export async function handleGetInstallItemsById(req: Request, res: Response) {
  try {
    const installId = parseInt(req.params.installId);
    if (isNaN(installId)) {
      return res.status(400).json({ message: 'Invalid install ID' });
    }
    
    const items = await getInstallItems(installId);
    return res.status(200).json(items);
  } catch (error) {
    const databaseErrorMessage = parseDatabaseError(error);
    console.log(error);
    return res.status(500).json({ message: 'Error getting install items', databaseErrorMessage });
  }
}

export async function handleAddInstallItem(req: Request, res: Response) {
  try {
    const { install_id, item_id, quantity } = req.body;
    
    if (!install_id || !item_id || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid input data' });
    }
    
    const result = await addInstallItem(install_id, item_id, quantity);
    return res.status(200).json({ message: 'Item added to install', result });
  } catch (error) {
    const databaseErrorMessage = parseDatabaseError(error);
    console.log(error);
    return res.status(500).json({ message: 'Error adding item to install', databaseErrorMessage });
  }
}

export async function handleUpdateInstallItem(req: Request, res: Response) {
  try {
    // Check if install_item_id is in URL params or body (for backward compatibility)
    const installItemId = req.params.installItemId ? parseInt(req.params.installItemId) : req.body.install_item_id;
    const { quantity } = req.body;
    
    if (!installItemId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid input data' });
    }
    
    const result = await updateInstallItem(installItemId, quantity);
    return res.status(200).json({ message: 'Install item updated', result });
  } catch (error) {
    const databaseErrorMessage = parseDatabaseError(error);
    console.log(error);
    return res.status(500).json({ message: 'Error updating install item', databaseErrorMessage });
  }
}

export async function handleRemoveInstallItem(req: Request, res: Response) {
  try {
    // Check if install_item_id is in URL params or body (for backward compatibility)
    const installItemId = req.params.installItemId ? parseInt(req.params.installItemId) : req.body.install_item_id;
    
    if (!installItemId) {
      return res.status(400).json({ message: 'Install item ID is required' });
    }
    
    const result = await removeInstallItem(installItemId);
    return res.status(200).json({ message: 'Item removed from install', result });
  } catch (error) {
    const databaseErrorMessage = parseDatabaseError(error);
    console.log(error);
    return res.status(500).json({ message: 'Error removing item from install', databaseErrorMessage });
  }
}

export async function handleGetInstall(req: Request, res: Response) {
  try {
    const installId = parseInt(req.params.id);
    const install = await getInstallById(installId);
    
    if (!install) {
      return res.status(404).json({ message: 'Install not found' });
    }
    
    return res.status(200).json(install);
  } catch (error) {
    console.error(error);
    const databaseErrorMessage = parseDatabaseError(error);
    return res.status(500).json({ message: 'Error fetching install', databaseErrorMessage });
  }
}

export async function handleUpdateInstall(req: Request, res: Response) {
  try {
    const installId = parseInt(req.params.id);
    const result = await updateInstall(installId, req.body);
    res.status(200).json({ message: 'Install updated successfully', result });
  } catch (error) {
    console.error(error);
    const databaseErrorMessage = parseDatabaseError(error);
    res.status(500).json({ message: 'Error updating install', databaseErrorMessage });
  }
}
