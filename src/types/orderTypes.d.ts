type CustomerOrderInput = {
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
}

type OrderOnlyInput = {
  customer_id: number;
}

type OrderItemInput = {
  order_id: number;
  item_id: number;
  quantity: number;
}

type NewOrderInput = {
  customer?: CustomerOrderInput;
  customer_id?: number;
  items: OrderItemInput[];
}
