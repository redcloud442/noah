import { Hono } from "hono";
import { Product } from "./types";

export type AppType = Hono<{
  Bindings: {
    cookie: string;
  };
  Variables: {
    userId: string;
  };
}> & {
  $get: () => Promise<{ id: string; name: string; email: string }>;
  auth: {
    login: {
      $post: (input: {
        email: string;
        password: string;
      }) => Promise<{ token: string }>;
    };
    register: {
      $post: (input: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
      }) => Promise<{ message: string; token: string }>;
    };
    logout: {
      $post: () => Promise<{ success: boolean }>;
    };
  };
  user: {
    getProfile: {
      $get: () => Promise<{ id: string; name: string; email: string }>;
    };
    updateProfile: {
      $post: (input: {
        name: string;
        email: string;
      }) => Promise<{ success: boolean }>;
    };
  };
  cart: {
    $get: () => Promise<{
      json: () => Promise<{ products: Product[]; count: number }>;
    }>;
    $post: (input: {
      product_variant_id: string;
      product_quantity: number;
      product_variant_size: string;
      product_variant_color: string;
      product_variant_quantity: number;
      product_variant_image: string;
      product_id: string;
      product_name: string;
      product_price: number;
    }) => Promise<{ message: string }>;
  };
};
