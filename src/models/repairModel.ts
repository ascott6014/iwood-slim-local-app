import { db } from "../dataSource";
import { CustomerRepairInput } from "../types/repairTypes";

function normalizeDate(datetimeInput: string): string {
  return datetimeInput.replace('T', ' ') + ':00'; // Ensures 'YYYY-MM-DD HH:MM:SS'
}


async function createCustomerAndRepair(data: CustomerRepairInput) {
  const [rows] = await db.query(
    'CALL CreateCustomerAndRepair(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      data.first_name,
      data.last_name,
      data.address,
      data.city,
      data.state,
      data.zip,
      data.phone,
      data.email,
      data.notes,
      data.items_brought,
      data.problem,
      data.solution,
      data.repair_cost,
      data.status,
      data.notes_repair,
      normalizeDate(data.start_date),
      normalizeDate(data.end_date)
    ]
  );
  return rows;
}

async function createRepairForCustomer(data: any) {
  const [rows] = await db.query(
    'CALL CreateRepairForCustomer(?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      data.customer_id,
      data.items_brought,
      data.problem,
      data.solution,
      data.repair_cost,
      data.status,
      data.notes,
      normalizeDate(data.start_date),
      normalizeDate(data.end_date),
    ]
  );
  return rows;
}

export {createCustomerAndRepair, createRepairForCustomer}