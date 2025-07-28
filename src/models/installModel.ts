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
