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
  subtotal: number;
  order_items_total: number;
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
  subtotal: number;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Unsuccessful';
  notes: string | null;
  drop_off_date: string;
  pickup_date: string | null;
  repair_items_total: number;
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
  subtotal: number;
  install_items_total: number;
};
