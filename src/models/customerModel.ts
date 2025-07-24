import { db } from "../dataSource";


async function getAllCustomers() {
    const [rows] = await db.query(
        'select customer_id, first_name, last_name, email from customers'
    );

    return rows;
}

 async function searchCustomers(query: string) {
  const like = `%${query}%`;
  const [rows] = await db.query(
    `SELECT customer_id, first_name, last_name, email, phone
     FROM customers
     WHERE CONCAT(first_name, ' ', last_name) LIKE ?
        OR phone LIKE ?
     LIMIT 10`,
    [like, like]
  );
  return rows;
}

async function getCustomers() {
    const [rows] = await db.query("select * from customers");
    return rows;
}

async function addCustomer(first_name: string, last_name: string, address: string, city: string, state: string, zip: string,
    phone: string, email: string, notes: string
){
    const [result] = await db.execute("INSERT INTO customers (first_name, last_name, address, city, state, zip, phone, email, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [first_name, last_name, address, city, state, zip, phone, email, notes]
    );

    return result;
}
export { getAllCustomers, searchCustomers, getCustomers, addCustomer }