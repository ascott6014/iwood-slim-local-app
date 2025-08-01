type Customer = {
  customer_id: number;
  first_name: string;
  last_name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  phone: string;
  email?: string;
}


type CustomerSummary = {
  customer_id: number;
  first_name: string;
  last_name: string;
  email: string;
}
