import { db } from "../dataSource";


export async function getOrderSummaries(customerId?: number): Promise<OrderSummary[]> {
  let query = 'SELECT * FROM vw_order_summary';
  let params: any[] = [];
  
  if (customerId) {
    query += ' WHERE customer_id = ?';
    params.push(customerId);
  }
  
  const [rows] = await db.query(query, params);
  return rows as OrderSummary[];
}

export async function getRepairSummaries(customerId?: number): Promise<RepairSummary[]> {
  let query = 'SELECT * FROM vw_repair_summary';
  let params: any[] = [];
  
  if (customerId) {
    query += ' WHERE customer_id = ?';
    params.push(customerId);
  }
  
  const [rows] = await db.query(query, params);
  return rows as RepairSummary[];
}

export async function getInstallSummaries(customerId?: number): Promise<InstallSummary[]> {
  let query = 'SELECT * FROM vw_install_summary';
  let params: any[] = [];
  
  if (customerId) {
    query += ' WHERE customer_id = ?';
    params.push(customerId);
  }
  
  const [rows] = await db.query(query, params);
  return rows as InstallSummary[];
}