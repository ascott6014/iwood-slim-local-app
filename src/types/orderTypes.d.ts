export interface CustomerOrderInput {
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  notes: string | null;
  order_date: string;     // Format: 'YYYY-MM-DD'
  order_total: number;
}

export interface OrderOnlyInput {
  customer_id: number;
  order_date: string;     // Format: 'YYYY-MM-DD'
  order_total: number;
}
