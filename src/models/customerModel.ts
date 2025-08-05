import { db } from "../dataSource";

// Get all customers with their most recent visit information
export async function getCustomersWithRecentVisits(): Promise<any[]> {
  const [rows] = await db.query(
    `SELECT 
       customer_id,
       first_name,
       last_name,
       phone,
       email,
       address,
       city,
       state,
       zip,
       last_visit_date,
       last_visit_type
     FROM customer_with_recent_visit
     ORDER BY last_visit_date IS NULL, last_visit_date DESC, customer_id DESC`
  );
  return rows as any[];
}

// search by name or phone, limit 10
export async function searchCustomers(query: string): Promise<Customer[]> {
  const like = `%${query}%`;
  const [rows] = await db.query(
    `SELECT customer_id, first_name, last_name, email, phone, address, city, state, zip
     FROM customers
     WHERE CONCAT(first_name, ' ', last_name) LIKE ?
        OR phone LIKE ?
        OR email LIKE ?
     LIMIT 10`,
    [like, like, like]
  );
  return rows as Customer[];
}

// fetch every column for all customers
export async function getCustomers(): Promise<Customer[]> {
  const [rows] = await db.query(
    `SELECT * FROM customers`
  );
  return rows as Customer[];
}

export async function getCustomerById(customer_id: number): Promise<Customer | null> {
  const [rows] = await db.query(
    `SELECT * FROM customers WHERE customer_id = ?`,
    [customer_id]
  );
  const customers = rows as Customer[];
  return customers.length > 0 ? customers[0] : null;
}

// insert a new customer, return the insertResult
export async function addCustomer(
  first_name: string,
  last_name: string,
  address: string,
  city: string,
  state: string,
  zip: string,
  phone: string,
  email: string
): Promise<any> {
  const [result] = await db.execute(
    `INSERT INTO customers
      (first_name, last_name, address, city, state, zip, phone, email)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [first_name, last_name, address, city, state, zip, phone, email]
  );
  return result;
}

// update an existing customer by id
export async function updateCustomer(
  customer_id: number,
  data: Partial<Omit<Customer, "customer_id">>
): Promise<any> {
  const fields = Object.keys(data);
  if (fields.length === 0) return null;

  const sets = fields.map(f => `${f} = ?`).join(", ");
  const params = fields.map(f => (data as any)[f]);
  params.push(customer_id);

  const [result] = await db.execute(
    `UPDATE customers SET ${sets} WHERE customer_id = ?`,
    params
  );
  return result;
}

// delete a customer by id
export async function deleteCustomer(customer_id: number): Promise<any> {
  const [result] = await db.execute(
    `DELETE FROM customers WHERE customer_id = ?`,
    [customer_id]
  );
  return result;
}
