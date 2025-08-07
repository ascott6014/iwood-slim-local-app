const { db } = require("../dataSource");


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

async function addRepairItem(repairId: number, itemId: number, quantity: number) {
  const [rows] = await db.query(
    'CALL AddRepairItem(?, ?, ?)',
    [repairId, itemId, quantity]
  );
  return rows;
}

async function getRepairItems(repairId: number) {
  const [rows] = await db.query(
    `SELECT 
      ri.repair_item_id,
      ri.repair_id,
      ri.item_id,
      ri.repair_item_quantity,
      ri.total_price,
      i.item_name,
      i.item_color,
      i.item_model,
      i.description,
      i.cost,
      i.markup_rate,
      (i.cost + (i.cost * i.markup_rate / 100)) as price
    FROM repair_items ri
    JOIN items i ON ri.item_id = i.item_id
    WHERE ri.repair_id = ?
    ORDER BY ri.repair_item_id`,
    [repairId]
  );
  return rows;
}

async function getRepairById(repairId: number) {
  const [rows] = await db.query(
    `SELECT 
      r.repair_id,
      r.customer_id,
      r.items_brought,
      r.problem,
      r.solution,
      r.estimate,
      r.status,
      r.notes,
      r.drop_off_date,
      r.pickup_date
    FROM repairs r
    WHERE r.repair_id = ?`,
    [repairId]
  );
  return rows;
}

async function updateRepair(repairId: number, data: any) {
  // Format drop_off_date if provided
  let dropOffDate = null;
  if (data.drop_off_date) {
    const date = new Date(data.drop_off_date);
    dropOffDate = date.toISOString().slice(0, 19).replace('T', ' '); // Convert to 'YYYY-MM-DD HH:MM:SS'
  }
  
  const [result] = await db.query(
    'CALL UpdateRepair(?, ?, ?, ?, ?, ?, ?, ?)',
    [
      repairId,
      data.items_brought || null,
      data.problem || null,
      data.solution || null,
      data.estimate ? parseFloat(data.estimate) : null,
      data.status || null,
      data.notes || null,
      dropOffDate
    ]
  );
  return result;
}

async function updateRepairItemQuantity(repairItemId: number, newQuantity: number) {
  const [rows] = await db.query(
    'CALL UpdateRepairItem(?, ?)',
    [repairItemId, newQuantity]
  );
  return rows;
}

async function removeRepairItem(repairItemId: number) {
  const [rows] = await db.query(
    'CALL RemoveRepairItem(?)',
    [repairItemId]
  );
  return rows;
}

export {createCustomerAndRepair, createRepairForCustomer, updateRepairPickupDate, updateRepairStatus, addRepairItem, getRepairItems, getRepairById, updateRepair, updateRepairItemQuantity, removeRepairItem}