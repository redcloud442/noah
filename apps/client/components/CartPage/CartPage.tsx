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
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";
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

  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleSelectItem = (cartId: string) => {
    setSelectedItems(
      (prev) =>
        prev.includes(cartId)
          ? prev.filter((id) => id !== cartId) // Unselect if already selected
          : [...prev, cartId] // Add to selected if not yet
    );
  };

  useEffect(() => {
    const handleFetchCart = async () => {
      try {
        setIsLoading(true);
        if (userData) {
          const cart = await cartService.get();
          setCart(cart);
        } else {
          const res = localStorage.getItem("shoppingCart");
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

  useEffect(() => {
    setSelectedItems(cart.products.map((product) => product.cart_id));
  }, [cart]);

  const fetchCartQuantity = async () => {
    try {
      if (cart.products.length === 0) return;
      const updatedCart = await cartService.getQuantity({
        items: cart.products.map((product) => ({
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
  }, [cart]);

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
        const res = localStorage.getItem("shoppingCart");
        if (res) {
          const cart = JSON.parse(res);
          const updatedCart = {
            ...cart,
            products: cart.products.filter(
              (item: Product) => item.cart_id !== cartId
            ),
            count: cart.count - 1,
          };
          localStorage.setItem("shoppingCart", JSON.stringify(updatedCart));
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
        const res = localStorage.getItem("shoppingCart");
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

  const handleCheckoutItems = async () => {
    try {
      if (userData) {
        await cartService.checkout({ items: selectedItems });
      } else {
        const res = localStorage.getItem("shoppingCart");
        const existingCart = res ? JSON.parse(res) : { products: [], count: 0 };

        existingCart.products = existingCart.products.map((product: Product) =>
          selectedItems.includes(product.cart_id)
            ? { ...product, cart_is_checked_out: true }
            : product
        );

        localStorage.setItem("shoppingCart", JSON.stringify(existingCart));
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error checking out items"
      );
    }
  };

  const handleCheckout = async () => {
    setSubmitting(true);
    const checkoutNumber = generateCheckoutNumber();

    await handleCheckoutItems();

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
    <div className="min-h-screen text-white bg-white">
      {/* Hero Header */}
      <div className=" py-16 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-zinc-950 to-zinc-900 bg-clip-text text-transparent mb-4">
              Your Cart
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Review your selected items and proceed to checkout
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Cart Items Section */}
          <div className="flex-1">
            <Card className="bg-zinc-900 border border-zinc-800 backdrop-blur-sm">
              <div className="p-6 border-b border-zinc-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Cart Items</h2>
                  <div className="text-sm text-zinc-400">
                    {cart.products.length}{" "}
                    {cart.products.length === 1 ? "item" : "items"}
                  </div>
                </div>

                {/* SELECT ALL CHECKBOX */}
                <div className="flex items-center gap-3 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={
                        selectedItems.length === cart.products.length &&
                        cart.products.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(cart.products.map((p) => p.cart_id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                      className="w-5 h-5 rounded border-2 border-zinc-600 bg-zinc-800 text-white focus:ring-2 focus:ring-zinc-500 focus:ring-offset-0 focus:ring-offset-zinc-900"
                    />
                    {selectedItems.length === cart.products.length &&
                      cart.products.length > 0 && (
                        <CheckCircle2
                          size={20}
                          className="absolute -top-0.5 -left-0.5 text-white pointer-events-none"
                        />
                      )}
                  </div>
                  <span className="text-sm font-medium text-zinc-200">
                    Select All ({selectedItems.length}/{cart.products.length})
                  </span>
                </div>
              </div>

              <div className="p-6">
                {cart.products.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingBag
                      size={64}
                      className="mx-auto text-zinc-600 mb-4"
                    />
                    <h3 className="text-xl font-semibold text-zinc-400 mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-zinc-500 mb-6">
                      Start shopping to add items to your cart
                    </p>
                    <Button
                      onClick={() => router.push("/products")}
                      className="bg-white text-black hover:bg-zinc-200"
                    >
                      Continue Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {isLoading ? (
                      <>
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="flex gap-4 p-4 bg-zinc-800/30 rounded-xl animate-pulse"
                          >
                            <Skeleton className="w-24 h-24 bg-zinc-700 rounded-lg" />
                            <div className="flex-1 space-y-3">
                              <Skeleton className="h-5 bg-zinc-700 rounded w-3/4" />
                              <Skeleton className="h-4 bg-zinc-700 rounded w-1/2" />
                              <Skeleton className="h-6 bg-zinc-700 rounded w-1/4" />
                            </div>
                          </div>
                        ))}
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
                          product.product_quantity >=
                            stock.variant_size_quantity;

                        const stocks =
                          product.product_quantity ===
                          stock?.variant_size_quantity;

                        return (
                          <Card
                            key={product.cart_id}
                            className={`relative p-6 bg-zinc-800/30 border transition-all duration-300 hover:bg-zinc-800/50 ${
                              selectedItems.includes(product.cart_id)
                                ? "border-zinc-600 shadow-lg"
                                : "border-zinc-700"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row gap-4">
                              {/* Checkbox */}
                              <div className="flex items-start pt-2">
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    checked={selectedItems.includes(
                                      product.cart_id
                                    )}
                                    onChange={() =>
                                      handleSelectItem(product.cart_id)
                                    }
                                    className="w-5 h-5 rounded border-2 border-zinc-600 bg-zinc-800 text-white focus:ring-2 focus:ring-zinc-500"
                                  />
                                  {selectedItems.includes(product.cart_id) && (
                                    <CheckCircle2
                                      size={20}
                                      className="absolute -top-0.5 -left-0.5 text-white pointer-events-none"
                                    />
                                  )}
                                </div>
                              </div>

                              {/* Product Image */}
                              <div className="relative">
                                <div className="w-24 h-24 bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
                                  <Image
                                    src={
                                      product.product_variant_image ||
                                      "/assets/model/QR_59794.jpg"
                                    }
                                    alt={product.product_name}
                                    width={96}
                                    height={96}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="absolute sm:top-2 sm:right-2 -top-1 left-20 bg-white text-black text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                                  {product.product_quantity}
                                </div>
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-semibold text-lg text-white uppercase truncate">
                                    {product.product_name} -{" "}
                                    {product.product_variant_color}
                                  </h3>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleRemoveItem(product.cart_id)
                                    }
                                    className="text-zinc-400 hover:text-red-400 hover:bg-red-950/20 ml-2"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>

                                <div className="space-y-1 mb-3">
                                  <p className="text-zinc-400 text-sm">
                                    Size: {product.product_size}
                                  </p>
                                  <p className="text-zinc-400 text-sm">
                                    Color: {product.product_variant_color}
                                  </p>
                                </div>

                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-xl font-bold text-white">
                                      ₱
                                      {(
                                        product.product_price *
                                        product.product_quantity
                                      ).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-zinc-400">
                                      ₱{product.product_price.toLocaleString()}{" "}
                                      each
                                    </p>
                                  </div>

                                  {/* Quantity Controls */}
                                  <div className="flex items-center gap-3 bg-zinc-800 rounded-lg p-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      disabled={product.product_quantity <= 1}
                                      onClick={() =>
                                        updateQuantity(
                                          product.cart_id,
                                          product.product_quantity - 1
                                        )
                                      }
                                      className="w-8 h-8 p-0 text-zinc-400 hover:text-white disabled:opacity-50"
                                    >
                                      <Minus className="w-4 h-4" />
                                    </Button>
                                    <span className="font-medium text-white min-w-[32px] text-center">
                                      {product.product_quantity}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      disabled={outOfStock || stocks}
                                      onClick={() =>
                                        updateQuantity(
                                          product.cart_id,
                                          product.product_quantity + 1
                                        )
                                      }
                                      className="w-8 h-8 p-0 text-zinc-400 hover:text-white disabled:opacity-50"
                                    >
                                      <Plus className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Stock Status */}
                                {(outOfStock || exceededStock) && (
                                  <div className="mt-3 flex items-center gap-2 p-2 bg-red-950/20 border border-red-800/30 rounded-lg">
                                    <AlertCircle
                                      size={16}
                                      className="text-red-400"
                                    />
                                    <p className="text-red-400 text-sm font-medium">
                                      {outOfStock
                                        ? "Out of Stock"
                                        : `Only ${stock?.variant_size_quantity} left`}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          {cart.products.length > 0 && (
            <div className="w-full xl:w-96">
              <Card className="bg-zinc-900 border border-zinc-800 backdrop-blur-sm sticky top-6">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Order Summary
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-zinc-300">
                      <span>Items ({selectedItems.length})</span>
                      <span>
                        ₱
                        {cart.products
                          .filter((product) =>
                            selectedItems.includes(product.cart_id)
                          )
                          .reduce(
                            (total, product) =>
                              total +
                              product.product_price * product.product_quantity,
                            0
                          )
                          .toLocaleString()}
                      </span>
                    </div>

                    <Separator className="bg-zinc-700" />

                    <div className="flex justify-between text-xl font-bold text-white">
                      <span>Total</span>
                      <span>
                        ₱
                        {cart.products
                          .filter((product) =>
                            selectedItems.includes(product.cart_id)
                          )
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

                  <Button
                    onClick={handleCheckout}
                    disabled={
                      submitting ||
                      hasInvalidProduct ||
                      selectedItems.length === 0
                    }
                    className="w-full bg-white text-black hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed h-12 font-semibold"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      `Proceed to Checkout (${selectedItems.length})`
                    )}
                  </Button>

                  {hasInvalidProduct && (
                    <div className="mt-4 flex items-center gap-2 p-3 bg-amber-950/20 border border-amber-800/30 rounded-lg">
                      <AlertCircle size={16} className="text-amber-400" />
                      <p className="text-amber-400 text-sm">
                        Some items are out of stock or exceed available quantity
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
