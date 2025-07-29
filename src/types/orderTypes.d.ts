type CustomerOrderInput = {
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  order_date: string;     // Format: 'YYYY-MM-DD'
  order_total: number;    // Order total amount
}

type OrderOnlyInput = {
  customer_id: number;
  order_date: string;     // Format: 'YYYY-MM-DD'
  order_total: number;    // Order total amount
}
