type  NewCustomerRepairInput = {
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  items_brought: string;
  problem: string;
  solution: string;
  estimate: number;
  status: 'not started' | 'in progress' | 'completed' | 'unsuccessful';
  notes: string | null;
  drop_off_date: Date; // format: 'YYYY-MM-DDTHH:mm'
  pick_up_date: Date;   // format: 'YYYY-MM-DDTHH:mm'
}

type CustomerRepairInput = {
  customer_id: string;
  items_brought: string;
  problem: string;
  solution: string;
  estimate: number;
  status: 'not started' | 'in progress' | 'completed' | 'unsuccessful';
  notes: string | null;
  drop_off_date: Date; // format: 'YYYY-MM-DDTHH:mm'
  pick_up_date: Date;   // format: 'YYYY-MM-DDTHH:mm'
}
