type CustomerInstallInput = {
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  description: string;
  install_location: string;
  estimate: number;
  install_date: string;    // Format: YYYY-MM-DD
  install_notes: string | null;
}

type InstallOnlyInput = {
  customer_id: number;
  description: string;
  install_location: string;
  estimate: number;
  install_date: string;    // Format: YYYY-MM-DD
  install_notes: string | null;
}
