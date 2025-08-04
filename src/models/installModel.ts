import { db } from '../dataSource';


export async function createCustomerAndInstall(data: CustomerInstallInput) {
  const [rows] = await db.query(
    'CALL AddCustomerAndInstall(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      data.first_name,
      data.last_name,
      data.address,
      data.city,
      data.state,
      data.zip,
      data.phone,
      data.email,
      data.description,
      data.estimate,
      data.install_date,
      data.install_notes ?? null,
    ]
  );
  return rows;
}

export async function createInstallForCustomer(data: InstallOnlyInput) {
  const [rows] = await db.query(
    'CALL AddInstallForCustomer(?, ?, ?, ?, ?)',
    [
      data.customer_id,
      data.description,
      data.estimate,
      data.install_date,
      data.install_notes ?? null,
    ]
  );
  return rows;
}

export async function getInstallItems(installId: number) {
  const [rows] = await db.query(`
    SELECT 
      ii.install_item_id,
      ii.install_id,
      ii.item_id,
      ii.install_item_quantity,
      ii.total_price,
      i.item_name,
      i.item_color,
      i.item_model,
      i.description,
      i.price
    FROM install_items ii
    JOIN items i ON ii.item_id = i.item_id
    WHERE ii.install_id = ?
    ORDER BY ii.install_item_id
  `, [installId]);
  return rows;
}

export async function addInstallItem(installId: number, itemId: number, quantity: number) {
  const [rows] = await db.query(
    'CALL AddInstallItem(?, ?, ?)',
    [installId, itemId, quantity]
  );
  return rows;
}

export async function updateInstallItem(installItemId: number, quantity: number) {
  const [rows] = await db.query(
    'CALL UpdateInstallItem(?, ?)',
    [installItemId, quantity]
  );
  return rows;
}

export async function removeInstallItem(installItemId: number) {
  const [rows] = await db.query(
    'CALL RemoveInstallItem(?)',
    [installItemId]
  );
  return rows;
}

export async function getInstallById(installId: number) {
  const [rows] = await db.query(`
    SELECT i.*, c.first_name, c.last_name, c.email, c.phone, c.address, c.city, c.state, c.zip
    FROM installs i
    JOIN customers c ON i.customer_id = c.customer_id
    WHERE i.install_id = ?
  `, [installId]);
  return (rows as any[])[0];
}

export async function updateInstall(installId: number, data: { install_date?: string; description?: string; estimate?: number; notes?: string }) {
  const [result] = await db.query(
    'CALL UpdateInstall(?, ?, ?, ?, ?)',
    [
      installId,
      data.install_date || null,
      data.description || null,
      data.estimate || null,
      data.notes || null
    ]
  );
  
  return result;
}
