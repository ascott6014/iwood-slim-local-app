type OrderSummary = {
  customer_id: number;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  order_id: number;
  order_date: string; // or Date if you cast it
  order_items_total: number;
  tax_amount: number;
  final_price: number;
};

type RepairSummary = {
  customer_id: number;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  repair_id: number;
  items_brought: string;
  problem: string;
  solution: string | null;
  estimate: number;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Unsuccessful';
  notes: string | null;
  drop_off_date: string;
  pickup_date: string | null;
  repair_items_total: number;
  subtotal: number;
  tax_amount: number;
  final_price: number;
};

type InstallSummary = {
  customer_id: number;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  install_id: number;
  description: string;
  estimate: number;
  install_date: string; // or Date
  notes: string | null;
  install_items_total: number;
  subtotal: number;
  tax_amount: number;
  final_price: number;
};
