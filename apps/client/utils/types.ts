export type Product = {
  cart_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_quantity: number;
  product_variant_id: string;
  product_variant_size: string;
  product_variant_color: string;
  product_variant_quantity: number;
  product_variant_image: string;
};

export type OrderItem = {
  order_item_id: string;
  order_item_name: string;
  order_item_price: number;
  order_item_quantity: number;
  order_item_image: string;
};

export type Order = {
  order_id: string;
  order_number: string;
  order_date: string;
  order_status: string;
  order_total: number;
  order_items: OrderItem[];
};
