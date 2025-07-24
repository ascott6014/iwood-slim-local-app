export interface CustomerRepairInput {
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  notes: string | null;
  items_brought: string;
  problem: string;
  solution: string;
  repair_cost: number;
  status: 'not started' | 'in progress' | 'completed' | 'unsuccessful';
  notes_repair: string | null;
  start_date: string; // format: 'YYYY-MM-DDTHH:mm'
  end_date: string;   // format: 'YYYY-MM-DDTHH:mm'
}
