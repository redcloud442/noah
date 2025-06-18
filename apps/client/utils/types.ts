import {
  order_table,
  product_table,
  product_variant_table,
  team_group_member_table,
  team_member_table,
  user_table,
  variant_sample_image_table,
  variant_size_table,
} from "@prisma/client";

export type Product = {
  cart_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_size: string;
  cart_is_checked_out: boolean;
  product_quantity: number;
  product_variant_id: string;
  product_variant_size: string;
  product_variant_color: string;
  product_variant_quantity: number;
  product_variant_image: string;
};

export type OrderItem = order_table & {
  order_item_id: string;
  order_item_name: string;
  order_item_price: number;
  order_item_quantity: number;
  order_item_image: string;
  order_item_size: string;
  order_item_status: string;
  order_item_color: string;
  product_variant_name: string;
  product_variant_slug: string;
  product_variant_size: string;
  product_variant_image: string;
  product_variant_quantity: number;
  product_variant_price: number;
  product_variant_color: string;
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
  team_member_request_reseller: boolean;
  team_member_team_group: team_group_member_table[];
};

export type ProductType = product_table & {
  product_variants: (product_variant_table & {
    variant_sizes: variant_size_table[];
    variant_sample_images: variant_sample_image_table[];
  })[];
};

export type VariantProductType = product_variant_table & {
  variant_sizes: variant_size_table[];
  product_variant_product: product_table;
  variant_sample_images: variant_sample_image_table[];
};

export type ProductTypeData = {
  product_id: string;
  product_name: string;
  product_slug: string;
  product_created_at: Date;
  product_category_id: string;
  product_team_id: string;
  product_description: string;
  product_price: number;
  product_sale_percentage: number;
  product_variants: {
    product_variant_id: string;
    product_variant_product_id: string;
    product_variant_color: string;
    product_variant_size: string;
    product_variant_quantity: number;
    product_variant_slug: string;
    variant_sample_images: {
      variant_sample_image_id: string;
      variant_sample_image_image_url: string;
      variant_sample_image_product_variant_id: string;
    }[];
  }[];
};

export type OrderType = order_table & {
  user_email: string;
  team_name: string;
};

export type UserType = user_table & {
  team_member_table: team_member_table[];
  order_count: number;
  team_member_role: string;
  order_purchased_amount: number;
};

export type ProductVariantType = product_variant_table & {
  variant_sizes: variant_size_table[];
  variant_sample_images: variant_sample_image_table[];
};

export type ProductVariantTypeShop = product_variant_table & {
  variant_sizes: variant_size_table[];
  variant_sample_images: variant_sample_image_table[];
  product_variant_product: product_table;
};

export type FeaturedProductType = {
  product_variant_id: string;
  product_variant_color: string;
  product_variant_slug: string | null;
  product_variant_product: {
    product_id: string;
    product_name: string;
    product_slug: string | null;
    product_description: string;
  };
  variant_sample_images: {
    variant_sample_image_id: string;
    variant_sample_image_image_url: string;
  }[];
};

export type FreshDropsType = {
  product_variant_id: string;
  product_variant_color: string;
  product_variant_slug: string | null;
  product_variant_product: {
    product_id: string;
    product_name: string;
    product_slug: string | null;
    product_description: string;
  };
  variant_sample_images: {
    variant_sample_image_id: string;
    variant_sample_image_image_url: string;
  }[];
};

export type WithdrawalType = {
  reseller_withdrawal_reseller: string;
  reseller_withdrawal_action_by: string;
  reseller_withdrawal_status: string;
  reseller_withdrawal_bank_name: string;
  reseller_withdrawal_account_number: string;
  reseller_withdrawal_account_name: string;
  reseller_withdrawal_amount: number;
  reseller_withdrawal_created_at: Date;
  reseller_withdrawal_updated_at: Date;
  reseller_withdrawal_id: string;
  reseller_withdrawal_reseller_id: string;
};

export type DashboardType = {
  sales: {
    daily: number;
    monthly: number;
    total: number;
    currentDate: Date;
  };
  withdrawals: {
    currentDate: Date;
    daily: number;
    monthly: number;
    total: number;
  };
  branches: {
    total: number;
  };
};
