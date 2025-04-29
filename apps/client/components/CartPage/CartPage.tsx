"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/lib/store";
import useUserDataStore from "@/lib/userDataStore";
import { generateCheckoutNumber } from "@/lib/utils";
import { authService } from "@/services/auth";
import { cartService } from "@/services/cart";
import { Product } from "@/utils/types";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";

const CartPage = () => {
  const { cart, setCart } = useCartStore();
  const { userData } = useUserDataStore();

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStock, setCurrentStock] = useState<
    {
      variant_size_variant_id: string;
      variant_size_value: string;
      variant_size_quantity: number;
    }[]
  >([]);

  useEffect(() => {
    const handleFetchCart = async () => {
      try {
        setIsLoading(true);
        if (userData) {
          const cart = await cartService.get();
          setCart(cart);
        } else {
          const res = localStorage.getItem("cart");
          if (res) {
            const cart = JSON.parse(res);
            setCart(cart);
          }
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Error fetching cart"
        );
      } finally {
        setIsLoading(false);
      }
    };
    handleFetchCart();
  }, [setCart, userData]);

  const fetchCartQuantity = async () => {
    try {
      if (cart.products.length === 0) return;
      const updatedCart = await cartService.getQuantity({
        items: cart.products.map((product: Product) => ({
          product_variant_id: product.product_variant_id,
          product_variant_size: product.product_size,
        })),
      });
      setCurrentStock(updatedCart);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error fetching stock"
      );
    }
  };

  useEffect(() => {
    fetchCartQuantity();
  }, []);

  const handleRemoveItem = async (cartId: string) => {
    const previousCart = cart;
    setCart({
      ...cart,
      products: cart.products.filter((item) => item.cart_id !== cartId),
      count: cart.count - 1,
    });

    try {
      if (userData) {
        await cartService.delete(cartId);
      } else {
        const res = localStorage.getItem("cart");
        if (res) {
          const cart = JSON.parse(res);
          const updatedCart = {
            ...cart,
            products: cart.products.filter(
              (item: Product) => item.cart_id !== cartId
            ),
            count: cart.count - 1,
          };
          localStorage.setItem("cart", JSON.stringify(updatedCart));
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error deleting item"
      );
      setCart(previousCart);
    }
  };

  const updateQuantity = async (cartId: string, newQuantity: number) => {
    const previousCart = cart;
    setCart({
      ...cart,
      products: cart.products.map((item) =>
        item.cart_id === cartId
          ? { ...item, product_quantity: newQuantity }
          : item
      ),
    });

    try {
      if (userData) {
        await cartService.update(cartId, newQuantity);
      } else {
        const res = localStorage.getItem("cart");
        if (res) {
          const cart = JSON.parse(res);
          const updatedCart = {
            ...cart,
            products: cart.products.map((item: Product) =>
              item.cart_id === cartId
                ? { ...item, product_quantity: newQuantity }
                : item
            ),
          };
          localStorage.setItem("cart", JSON.stringify(updatedCart));
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error updating quantity"
      );
      setCart(previousCart);
    }
  };

  const handleCheckout = async () => {
    setSubmitting(true);
    const checkoutNumber = generateCheckoutNumber();

    await authService.createCheckoutToken(checkoutNumber);
    setTimeout(() => {
      router.push(`/checkout/cn/${checkoutNumber}`);
      setSubmitting(false);
    }, 1000);
  };

  const hasInvalidProduct = cart.products.some((product) => {
    const stock = currentStock.find(
      (s) =>
        s.variant_size_variant_id === product.product_variant_id &&
        s.variant_size_value === product.product_size
    );
    if (!stock) return true;
    return product.product_quantity > stock.variant_size_quantity;
  });

  return (
    <div className="min-h-screen mt-20 p-6 bg-gray-100 text-black">
      <h1 className="text-4xl font-bold text-center mb-6">Shopping Cart</h1>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-8">
        <div className="flex-1 bg-white shadow-md rounded-lg p-6 w-full">
          <h2 className="text-2xl font-bold mb-4">Cart Items</h2>

          {cart.products.length === 0 ? (
            <p className="text-gray-600 text-center">Your cart is empty.</p>
          ) : (
            <div className="space-y-4">
              {isLoading ? (
                <>
                  <Skeleton className="w-full bg-gray-200 h-[100px] rounded-md" />
                  <Skeleton className="w-1/2 bg-gray-200 h-[100px] rounded-md" />
                  <Skeleton className="w-1/3 bg-gray-200 h-[100px] rounded-md" />
                </>
              ) : (
                cart.products.map((product) => {
                  const stock = currentStock.find(
                    (s) =>
                      s.variant_size_variant_id ===
                        product.product_variant_id &&
                      s.variant_size_value === product.product_size
                  );
                  const outOfStock =
                    !stock || stock.variant_size_quantity === 0;
                  const exceededStock =
                    stock &&
                    product.product_quantity >= stock.variant_size_quantity;

                  const stocks =
                    product.product_quantity === stock?.variant_size_quantity;

                  return (
                    <Card
                      key={product.cart_id}
                      className="relative p-4 flex bg-white text-black items-center space-x-2"
                    >
                      <Button
                        className="absolute top-2 right-2"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveItem(product.cart_id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                      <div className="flex flex-col sm:relative">
                        <Image
                          src={
                            product.product_variant_image ||
                            "/assets/model/QR_59794.jpg"
                          }
                          alt={product.product_name}
                          width={80}
                          height={80}
                          className="w-20 h-20 hidden sm:block object-contain rounded-md"
                        />
                        <div className="absolute -top-2 -right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {product.product_quantity}
                        </div>
                      </div>

                      <div className="flex-1">
                        <p className="font-semibold text-lg uppercase">
                          {product.product_name} -{" "}
                          {product.product_variant_color}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Size: {product.product_size}
                        </p>
                        <p className="text-gray-500 text-sm">
                          Color: {product.product_variant_color}
                        </p>
                        <p className="text-gray-700 font-bold">
                          ₱
                          {(
                            product.product_price * product.product_quantity
                          ).toLocaleString()}
                        </p>

                        {/* Status if out of stock */}
                        {outOfStock && (
                          <p className="text-red-500 font-semibold text-sm mt-2">
                            Out of Stock
                          </p>
                        )}
                        {exceededStock && (
                          <p className="text-red-500 font-semibold text-sm mt-2">
                            Only {stock?.variant_size_quantity} left
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          className="bg-white text-black"
                          disabled={product.product_quantity <= 1}
                          onClick={() =>
                            updateQuantity(
                              product.cart_id,
                              product.product_quantity - 1
                            )
                          }
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-medium">
                          {product.product_quantity}
                        </span>
                        <Button
                          variant="ghost"
                          className="bg-white text-black"
                          disabled={outOfStock || stocks}
                          onClick={() =>
                            updateQuantity(
                              product.cart_id,
                              product.product_quantity + 1
                            )
                          }
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </div>

        {cart.products.length > 0 && (
          <div className="w-full lg:w-1/3 bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <Separator />
            <div className="space-y-3 py-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  ₱
                  {cart.products
                    .reduce(
                      (total, product) =>
                        total +
                        product.product_price * product.product_quantity,
                      0
                    )
                    .toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>
                  ₱
                  {cart.products
                    .reduce(
                      (total, product) =>
                        total +
                        product.product_price * product.product_quantity,
                      0
                    )
                    .toLocaleString()}
                </span>
              </div>
            </div>
            <Separator />

            <Button
              onClick={handleCheckout}
              className="w-full mt-4"
              disabled={submitting || hasInvalidProduct}
              variant="secondary"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Proceeding to Checkout
                </>
              ) : (
                "Proceed to Checkout"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
