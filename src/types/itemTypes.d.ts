type Item = {
  item_id: number;
  item_name: string;
  item_color: string;
  item_model: string;
  description: string;
  cost: number;
  markup_rate: number;
  price: number;
  quantity: number;
  sell_item: boolean;
  repair_item: boolean;
  install_item: boolean;
}

type OrderItem = {
  order_item_id: number;
  order_id: number;
  item_id: number;
  order_item_quantity: number;
  total_price: number;
  item_name?: string;
  item_color?: string;
  item_model?: string;
  price?: number;
}
