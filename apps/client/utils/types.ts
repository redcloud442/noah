import {
  product_table,
  product_variant_table,
  team_group_member_table,
  variant_sample_image_table,
} from "@prisma/client";

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
  order_item_size: string;
  order_item_color: string;
};

export type Order = {
  order_id: string;
  order_number: string;
  order_date: string;
  order_status: string;
  order_total: number;
  order_items: OrderItem[];
};

export type teamMemberProfile = {
  team_member_date_created: Date;
  team_member_team_id: string;
  team_member_user_id: string;
  team_member_team: string;
  team_member_role: string;
  team_member_team_group: team_group_member_table[];
};

export type ProductType = {
  product_table: product_table & {
    product_variants: (product_variant_table & {
      variant_sample_images: variant_sample_image_table[];
    })[];
  };
};
