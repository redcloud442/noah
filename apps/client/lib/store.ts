import { create } from "zustand";

interface Product {
  cart_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  product_quantity: number;
  product_size: string;
  product_variant_id: string;
  product_variant_size: string;
  product_variant_color: string;
  product_variant_quantity: number;
  product_variant_image: string;
}

interface Cart {
  products: Product[];
  count: number;
}

interface Store {
  cart: Cart;
  addToCart: (product: Product) => void;
  setCart: (cart: Cart) => void;
  setNewQuantity: (product: Product) => void;
}

export const useCartStore = create<Store>((set) => ({
  cart: {
    products: [],
    count: 0,
  },

  addToCart: (product) =>
    set((state) => {
      const existingProductIndex = state.cart.products.findIndex(
        (p) => p.product_id === product.product_id
      );

      let updatedProducts;

      if (existingProductIndex !== -1) {
        // Update quantity if product already exists
        updatedProducts = state.cart.products.map((p, index) =>
          index === existingProductIndex
            ? {
                ...p,
                product_quantity: p.product_quantity + product.product_quantity,
              }
            : p
        );
      } else {
        // Add new product
        updatedProducts = [...state.cart.products, product];
      }

      return {
        cart: {
          products: updatedProducts,
          count: updatedProducts.reduce(
            (sum, p) => sum + p.product_quantity,
            0
          ),
        },
      };
    }),

  setNewQuantity: (product) =>
    set((state) => {
      const existingProductIndex = state.cart.products.findIndex(
        (p) =>
          p.product_variant_id === product.product_variant_id &&
          p.product_variant_size === product.product_variant_size
      );

      if (existingProductIndex !== -1) {
        state.cart.products[existingProductIndex].product_quantity =
          product.product_quantity;
      }

      return {
        cart: {
          products: state.cart.products,
          count: state.cart.products.reduce(
            (sum, p) => sum + p.product_quantity,
            0
          ),
        },
      };
    }),

  setCart: (cart) => set({ cart }),
}));
