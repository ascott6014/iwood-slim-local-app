import { db } from '../dataSource';
import { CustomerInstallInput, InstallOnlyInput } from '../types/installTypes';

export async function createCustomerAndInstall(data: CustomerInstallInput) {
  const [rows] = await db.query(
    'CALL CreateCustomerAndInstall(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      data.first_name,
      data.last_name,
      data.address,
      data.city,
      data.state,
      data.zip,
      data.phone,
      data.email,
      data.notes ?? null,
      data.description,
      data.cost,
      data.install_date,
      data.install_notes ?? null,
    ]
  );
  return rows;
}

export async function createInstallForCustomer(data: InstallOnlyInput) {
  const [rows] = await db.query(
    'CALL CreateInstallForCustomer(?, ?, ?, ?, ?)',
    [
      data.customer_id,
      data.description,
      data.cost,
      data.install_date,
      data.install_notes ?? null,
    ]
  );
  return rows;
}
