import { db } from "../dataSource";


// function normalizeDate(datetimeInput: string): string {
//   return datetimeInput.replace('T', ' ') + ':00'; // Ensures 'YYYY-MM-DD HH:MM:SS'
// }


async function createCustomerAndRepair(data: NewCustomerRepairInput) {
  const [rows] = await db.query(
    'CALL AddCustomerAndRepair(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      data.first_name,
      data.last_name,
      data.address,
      data.city,
      data.state,
      data.zip,
      data.phone,
      data.email,
      data.items_brought,
      data.problem,
      data.solution,
      data.estimate,
      data.status,
      data.notes,
      data.drop_off_date
    ]
  );
  return rows;
}

async function createRepairForCustomer(data: CustomerRepairInput) {
  const [rows] = await db.query(
    'CALL AddRepairForCustomer(?, ?, ?, ?, ?, ?, ?, ?)',
    [
      data.customer_id,
      data.items_brought,
      data.problem,
      data.solution,
      data.estimate,
      data.status,
      data.notes,
      data.drop_off_date
    ]
  );
  return rows;
}

async function updateRepairPickupDate(repairId: number) {
  const [rows] = await db.query(
    'UPDATE repairs SET pickup_date = NOW() WHERE repair_id = ?',
    [repairId]
  );
  return rows;
}

async function updateRepairStatus(repairId: number, status: string, notes?: string) {
  const [rows] = await db.query(
    'UPDATE repairs SET status = ?, notes = COALESCE(?, notes) WHERE repair_id = ?',
    [status, notes, repairId]
  );
  return rows;
}

export {createCustomerAndRepair, createRepairForCustomer, updateRepairPickupDate, updateRepairStatus}