"use client";

import useUserDataStore from "@/lib/userDataStore";
import { ordersService } from "@/services/orders";
import { formatDate } from "@/utils/function";
import { OrderItem } from "@/utils/types";
import { order_table } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import {
  CreditCard,
  MapPin,
  Package,
  Receipt,
  Truck,
  User,
} from "lucide-react";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

type OrderDetailsPageProps = {
  order: order_table;
};

const OrderDetailsPage = ({ order }: OrderDetailsPageProps) => {
  const { userData } = useUserDataStore();

  const { data: orderItems = [], isLoading } = useQuery<OrderItem[]>({
    queryKey: ["orderItems", order.order_number, userData?.userProfile.user_id],
    queryFn: async () => {
      const items = await ordersService.getOrderItems(order.order_number);
      return items;
    },
    enabled: !!userData && !!order.order_number,
  });

  const subtotal = orderItems.reduce(
    (total, product) =>
      total + product.order_item_price * product.order_item_quantity,
    0
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";
      case "PROCESSING":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8 text-black">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Receipt className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    Order #{order.order_number}
                  </h1>
                  <p className="text-sm">
                    Placed on {formatDate(order.order_created_at)}
                  </p>
                </div>
              </div>
            </div>
            <Badge
              className={`${getStatusColor(order.order_status)} px-4 py-2 text-sm font-medium border w-fit`}
            >
              {order.order_status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-black">
                  <Package className="h-5 w-5 text-black" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="w-20 h-20 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-3 w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : orderItems.length > 0 ? (
                  <div className="space-y-6">
                    {orderItems.map((product, index) => (
                      <div key={product.order_item_id}>
                        <div className="flex gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                          <div className="relative flex-shrink-0">
                            <Image
                              src={
                                product.product_variant_image ||
                                "/assets/model/QR_59794.jpg"
                              }
                              alt={product.product_variant_name}
                              width={80}
                              height={80}
                              className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                            />
                            <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full min-w-[24px] text-center">
                              {product.order_item_quantity}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-black text-lg mb-2">
                              {product.product_variant_name}
                            </h3>
                            <div className="grid grid-cols-2 gap-2 text-sm text-black mb-3">
                              <div>
                                Color:{" "}
                                <span className="font-medium">
                                  {product.product_variant_color}
                                </span>
                              </div>
                              <div className="text-black">
                                Size:{" "}
                                <span className="font-medium">
                                  {product.product_variant_size}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-black">
                                Qty: {product.order_item_quantity} × ₱
                                {product.order_item_price?.toLocaleString() ||
                                  "0"}
                              </div>
                              <div className="text-lg font-bold">
                                ₱
                                {(
                                  product.order_item_price *
                                  product.order_item_quantity
                                ).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                        {index < orderItems.length - 1 && (
                          <Separator className="mt-6" />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-black">
                    <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No items found for this order.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-black">
                  <User className="h-5 w-5 text-black" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email</Label>
                    <Input
                      readOnly
                      value={order.order_email}
                      className="bg-gray-50 border-gray-200 text-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Phone</Label>
                    <Input
                      readOnly
                      value={`+63${order.order_phone}`}
                      className="bg-gray-50 border-gray-200 text-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">First Name</Label>
                    <Input
                      readOnly
                      value={order.order_first_name}
                      className="bg-gray-50 border-gray-200 text-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Last Name</Label>
                    <Input
                      readOnly
                      value={order.order_last_name}
                      className="bg-gray-50 border-gray-200 text-black"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Info */}
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-black">
                  <MapPin className="h-5 w-5 text-black" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Address</Label>
                  <Input
                    readOnly
                    value={order.order_address}
                    className="bg-gray-50 border-gray-200 text-black"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">City</Label>
                    <Input
                      readOnly
                      value={order.order_city}
                      className="bg-gray-50 border-gray-200 text-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Barangay</Label>
                    <Input
                      readOnly
                      value={order.order_barangay || "N/A"}
                      className="bg-gray-50 border-gray-200 text-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Province</Label>
                    <Input
                      readOnly
                      value={order.order_state}
                      className="bg-gray-50 border-gray-200 text-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Postal Code</Label>
                    <Input
                      readOnly
                      value={order.order_postal_code}
                      className="bg-gray-50 border-gray-200 text-black"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Summary */}
            <Card className="shadow-sm border-0 bg-white sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-black">
                  <Receipt className="h-5 w-5 text-black" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-black">
                {orderItems.length > 0 && (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>
                          Subtotal (
                          {orderItems.reduce(
                            (total, item) => total + item.order_item_quantity,
                            0
                          )}{" "}
                          items)
                        </span>
                        <span className="font-medium">
                          ₱{subtotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Truck className="h-4 w-4" />
                          Shipping
                        </span>
                        <span className="font-medium text-green-600">Free</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>₱{subtotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-black">
                  <CreditCard className="h-5 w-5 text-black" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Payment Method</Label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-black">
                    <span className="font-medium">
                      {order.order_payment_method?.toUpperCase() || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Order Date</Label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-black">
                    <span className="font-medium">
                      {formatDate(order.order_created_at)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
