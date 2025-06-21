"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useUserDataStore from "@/lib/userDataStore";
import { posService } from "@/services/pos";
import {
  CartItem,
  VariantProductTypePos,
  VariantSizeType,
} from "@/utils/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  CreditCard,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pagination } from "../ui/pagination";

const sizes = ["S", "M", "L", "XL", "XXL"];

const CashierPosPage = () => {
  const { userData } = useUserDataStore();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] =
    useState<VariantProductTypePos | null>(null);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const queryClient = useQueryClient();
  const queryKey = ["pos-products", activePage];

  const { data: products, isLoading: isProductsLoading } = useQuery({
    queryKey,
    queryFn: () =>
      posService.getProducts({
        take: 15,
        skip: activePage,
      }),
    enabled: !!userData?.teamMemberProfile?.team_member_team_id,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const addToCart = (
    product: VariantProductTypePos,
    size: VariantSizeType,
    quantity = 1
  ) => {
    const cartItem = {
      id: `${product.product_variant_id}-${size.variant_size_id}`,
      productId: product.product_variant_id,
      productName: product.product_variant_slug
        ?.replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      sizeName: size.variant_size_value,
      price: product.product_variant_product.product_price,
      quantity,
      image: product.variant_sample_images?.[0]?.variant_sample_image_image_url,
    };

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === cartItem.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === cartItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, cartItem];
    });

    setShowSizeModal(false);
    setSelectedProduct(null);
  };

  const updateCartQuantity = (
    itemId: string,
    newQuantity: number,
    itemQuantity: number
  ) => {
    if (newQuantity > itemQuantity) {
      toast.error("Already reached the maximum quantity");
      return;
    }
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleProductSelect = (product: VariantProductTypePos) => {
    setSelectedProduct(product);
    setShowSizeModal(true);
  };

  const handleGetQuantity = useMemo(
    () => (productId: string) => {
      const product = products?.products.find(
        (product: VariantProductTypePos) =>
          product.product_variant_id === productId
      );
      return (
        product?.variant_sizes.find(
          (size: VariantSizeType) => size.variant_size_variant_id === productId
        )?.variant_size_quantity || 0
      );
    },
    [products]
  );

  const { mutate: checkout, isPending } = useMutation({
    mutationFn: posService.checkout,
    onSuccess: () => {
      toast.success("Checkout successful");
      setCart([]);
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pos-products"] });
    },
  });

  const handleCheckout = async () => {
    checkout({
      total_amount: getTotalAmount(),
      cartItems: cart.map((item) => ({
        product_variant_id: item.productId,
        product_quantity: item.quantity,
        product_variant_size: item.sizeName,
        product_variant_product: item.productName,
      })),
    });
  };
  const totalPages = Math.ceil((products?.count || 0) / 15);
  return (
    <div className="flex h-screen mt-20 bg-slate-50">
      {/* Products Section */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-zinc-900 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                Point of Sale
              </h1>
            </div>
            <p className="text-slate-600 text-lg">
              Select products to add to cart
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {isProductsLoading
              ? Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 animate-pulse"
                  >
                    <div className="w-full h-48 bg-slate-200 rounded-xl mb-4"></div>
                    <div className="h-4 bg-slate-200 rounded-lg mb-2"></div>
                    <div className="h-6 bg-slate-200 rounded-lg w-3/4"></div>
                  </div>
                ))
              : products?.products?.map((product: VariantProductTypePos) => (
                  <div
                    key={product.product_variant_id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 transition-all duration-300 cursor-pointer group overflow-hidden"
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className="relative h-48 p-4">
                      {product.variant_sample_images?.[0] ? (
                        <Image
                          src={
                            product.variant_sample_images[0]
                              .variant_sample_image_image_url
                          }
                          alt={product.product_variant_product.product_name}
                          className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
                          width={300}
                          height={300}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center rounded-xl">
                          <Package className="h-12 w-12 text-slate-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex flex-col gap-1">
                        {product.variant_sizes.every(
                          (size) => size.variant_size_quantity === 0
                        ) && (
                          <Badge variant="destructive" className="shadow-lg">
                            SOLD OUT
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="p-4 pt-0">
                      <h3 className="font-semibold text-zinc-900 text-sm line-clamp-2 mb-2 group-hover:text-zinc-900 transition-colors">
                        {product.product_variant_slug
                          ?.replace(/-/g, " ")
                          .replace(/\b\w/g, (char) => char.toUpperCase())}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-zinc-900 font-bold text-lg">
                          ₱{" "}
                          {product.product_variant_product.product_price.toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }
                          ) || 0}
                        </p>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-zinc-900 text-white px-3 py-1 rounded-lg text-xs font-medium">
                            Add to Cart
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
        <Pagination
          activePage={activePage}
          pageCount={totalPages}
          handleChangePage={setActivePage}
        />
      </div>

      {/* Cart Sidebar */}
      <div className="w-96 bg-white shadow-2xl p-6 flex flex-col border-l border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-zinc-900 to-zinc-600 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Cart</h2>
          </div>
          <div className="bg-gradient-to-r from-zinc-900 to-zinc-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
            {getTotalItems()}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="text-center text-slate-500 mt-12">
              <div className="bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-12 w-12 text-slate-400" />
              </div>
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm text-slate-400 mt-1">
                Add some products to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    {item.image ? (
                      <Image
                        src={item.image}
                        width={60}
                        height={60}
                        alt={item.productName}
                        className="w-15 h-15 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-15 h-15 bg-slate-200 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-slate-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-slate-800 line-clamp-2">
                        {item.productName}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 bg-slate-200 px-2 py-1 rounded-full inline-block">
                        Size: {item.sizeName}
                      </p>
                      <p className="text-sm font-bold text-blue-600 mt-2">
                        ₱{" "}
                        {item.price.toLocaleString("en-US", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-red-50 hover:text-red-600 transition-colors"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 rounded-lg hover:bg-slate-100"
                        onClick={() =>
                          updateCartQuantity(
                            item.id,
                            item.quantity - 1,
                            handleGetQuantity(item.productId)
                          )
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-semibold text-slate-800 bg-white px-2 py-1 rounded-lg border border-slate-200">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 rounded-lg hover:bg-slate-100"
                        onClick={() =>
                          updateCartQuantity(
                            item.id,
                            item.quantity + 1,
                            handleGetQuantity(item.productId)
                          )
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="font-bold text-slate-800">
                      ₱
                      {(item.price * item.quantity).toLocaleString("en-US", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-slate-200 pt-6 mt-6">
            <div className="bg-gradient-to-r from-zinc-50 to-zinc-50 rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-zinc-700">
                  Total:
                </span>
                <span className="text-2xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                  ₱
                  {getTotalAmount().toLocaleString("en-US", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <Button
                className="w-full bg-gradient-to-r from-zinc-900 to-zinc-600 hover:from-zinc-700 hover:to-zinc-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handleCheckout}
                disabled={isPending}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Checkout
              </Button>
              <Button
                className="w-full border-2 border-slate-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 font-semibold py-3 rounded-xl transition-all duration-300"
                variant="outline"
                onClick={() => setCart([])}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Size Selection Modal */}
      <Dialog open={showSizeModal} onOpenChange={setShowSizeModal}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Select Size</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              <div className="text-center">
                <h4 className="text-lg font-semibold mb-4">
                  {selectedProduct.product_variant_slug
                    ?.replace(/-/g, " ")
                    .replace(/\b\w/g, (char) => char.toUpperCase())}
                </h4>
                {selectedProduct.variant_sample_images?.[0] && (
                  <div className="relative w-full h-48 mb-4">
                    <Image
                      src={
                        selectedProduct.variant_sample_images[0]
                          .variant_sample_image_image_url
                      }
                      alt={selectedProduct.product_variant_product.product_name}
                      className="w-full h-full object-contain rounded-xl"
                      width={400}
                      height={400}
                    />
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {selectedProduct.variant_sizes
                  .sort((a, b) => {
                    const aIndex = sizes.indexOf(a.variant_size_value);
                    const bIndex = sizes.indexOf(b.variant_size_value);
                    return aIndex - bIndex;
                  })
                  .map((size) => (
                    <Button
                      key={size.variant_size_id}
                      className="w-full justify-between p-4 h-auto rounded-xl border-2 border-slate-200 hover:border-blue-300 disabled:opacity-50 disabled:hover:border-slate-200"
                      variant="outline"
                      disabled={size.variant_size_quantity === 0}
                      onClick={() => addToCart(selectedProduct, size)}
                    >
                      <div className="text-left">
                        <div className="font-semibold">
                          Size {size.variant_size_value}
                        </div>
                        <div className="text-blue-600 font-bold">
                          ₱
                          {selectedProduct.product_variant_product.product_price.toLocaleString(
                            "en-US",
                            {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-sm px-2 py-1 rounded-full ${
                            size.variant_size_quantity === 0
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {size.variant_size_quantity === 0
                            ? "Out of Stock"
                            : `${size.variant_size_quantity} left`}
                        </span>
                      </div>
                    </Button>
                  ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CashierPosPage;
