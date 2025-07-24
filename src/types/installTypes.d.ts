export interface CustomerInstallInput {
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  notes: string | null;
  description: string;
  cost: number;
  install_date: string;    // Format: YYYY-MM-DD
  install_notes: string | null;
}

export interface InstallOnlyInput {
  customer_id: number;
  description: string;
  cost: number;
  install_date: string;    // Format: YYYY-MM-DD
  install_notes: string | null;
}
