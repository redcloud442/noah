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
        setIsLoading(false);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Error fetching cart");
        }
      }
    };
    handleFetchCart();
  }, [setCart, userData]);

  const handleRemoveItem = async (cartId: string) => {
    if (userData) {
      const previousCart = cart;

      setCart({
        ...cart,
        products: cart.products.filter((item) => item.cart_id !== cartId),
        count: cart.count - 1,
      });

      try {
        await cartService.delete(cartId);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Error deleting item");
        }
        setCart(previousCart);
      }
    } else {
      const res = localStorage.getItem("cart");
      if (res) {
        const cart = JSON.parse(res);

        // Optimistically update local storage
        const updatedCart = {
          ...cart,
          products: cart.products.filter(
            (item: Product) => item.cart_id !== cartId
          ),
          count: cart.count - 1,
        };

        localStorage.setItem("cart", JSON.stringify(updatedCart));
        setCart(updatedCart);
      }
    }
  };

  const updateQuantity = async (cartId: string, newQuantity: number) => {
    if (userData) {
      // Save previous state in case of rollback
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
        // Perform the actual API update
        await cartService.update(cartId, newQuantity);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Error updating quantity");
        }
        setCart(previousCart);
      }
    } else {
      const res = localStorage.getItem("cart");
      if (res) {
        const cart = JSON.parse(res);

        // Optimistically update localStorage
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

  return (
    <div className="min-h-screen mt-20 p-6 bg-gray-100 text-black">
      <h1 className="text-4xl font-bold text-center mb-6">Shopping Cart</h1>

      <div className="max-w-7xl mx-auto flex flex-col items-start  lg:flex-row space-y-6 lg:space-y-0 lg:space-x-8">
        {/* Left Section - Cart Items */}
        <div className="flex-1 bg-white shadow-md rounded-lg p-6 w-full">
          <h2 className="text-2xl font-bold mb-4">Cart Items</h2>
          {cart.products.length === 0 ? (
            <p className="text-gray-600 text-center">Your cart is empty.</p>
          ) : (
            <div className="space-y-4">
              {isLoading ? (
                <>
                  <Skeleton className="w-full bg-gray-200 h-[100px] rounded-md" />
                  <Skeleton className="bg-gray-200 h-[100px] rounded-md w-1/2" />
                  <Skeleton className=" bg-gray-200 h-[100px] rounded-md w-1/3" />
                </>
              ) : (
                cart.products.map((product) => (
                  <Card
                    key={product.cart_id}
                    className="relative p-4 flex bg-white text-black items-center space-x-2 space-y-4"
                  >
                    {/* Trash Icon in the Upper Right */}
                    <Button
                      className="absolute top-2 right-2 "
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveItem(product.cart_id)}
                    >
                      <Trash2 className="w-2 h-2" />
                    </Button>

                    {/* Product Image & Quantity Badge */}
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

                    {/* Product Details */}
                    <div className="flex-1">
                      <p className="font-semibold text-lg">
                        {product.product_name} - {product.product_variant_color}
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
                    </div>

                    {/* Quantity Controls */}
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
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Section - Order Summary */}
        {cart.products.length > 0 && (
          <div className="w-full lg:w-1/3 bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <Separator />
            <div className="space-y-3 py-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  ₱{" "}
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
              <div className="flex justify-between"></div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>
                  ₱{" "}
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

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              className="w-full mt-4"
              disabled={submitting}
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
