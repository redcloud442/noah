"use client";

import useUserDataStore from "@/lib/userDataStore";
import { ordersService } from "@/services/orders";
import { formatDate } from "@/utils/function";
import { Order } from "@/utils/types";
import { order_table } from "@prisma/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";

type OrderDetailsPageProps = {
  order: order_table;
};

const OrderDetailsPage = ({ order }: OrderDetailsPageProps) => {
  const { userData } = useUserDataStore();
  const [orderDetails, setOrderDetails] = useState<Order>({
    ...order,
    order_total: order.order_total || 0,
    order_date: new Date().toISOString(),
    order_items: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        if (!userData) return;
        setIsLoading(true);
        const response = await ordersService.getOrderItems(order.order_number);

        setOrderDetails({
          ...orderDetails,
          order_items: response,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [order, userData]);

  const subtotal = orderDetails.order_items.reduce(
    (total, product) =>
      total + product.order_item_price * product.order_item_quantity,
    0
  );

  return (
    <div className="min-h-screen h-full px-0 sm:px-6 text-black relative">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Order Number: {order.order_number}
        </h1>
        <p className="text-muted-foreground">
          View and manage all orders in the system. You can search for orders by
          order number, user email, or payment method.
        </p>
      </div>
      <div className="w-full sm:p-6 rounded-md flex flex-col xl:flex-row gap-6 h-auto">
        <div className="w-full md:w-1/2 space-y-6 bg-white p-6 rounded-md h-fit">
          <div className="flex justify-between items-center border-b pb-2">
            <h1 className="text-2xl font-bold pb-2">
              Order Details # {order.order_number}
            </h1>
            <Badge
              className={`${
                order.order_status === "PAID"
                  ? "bg-green-100 text-green-700"
                  : order.order_status === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
              } font-semibold`}
            >
              {order.order_status}
            </Badge>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Order Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Order Date</Label>
                <Input readOnly value={formatDate(order.order_created_at)} />
              </div>
              <div>
                <Label>Payment Method</Label>
                <Input
                  readOnly
                  value={order.order_payment_method?.toUpperCase() || "N/A"}
                />
              </div>
            </div>
          </div>

          {/* Delivery Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Delivery Information</h2>
            <div>
              <Label>Email</Label>
              <Input readOnly type="email" value={order.order_email} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input readOnly value={order.order_first_name} />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input readOnly value={order.order_last_name} />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Input readOnly value={order.order_address} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>City</Label>
                <Input readOnly value={order.order_city} />
              </div>
              <div>
                <Label>Barangay</Label>
                <Input readOnly value={order.order_barangay || "N/A"} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>State / Province</Label>
                <Input readOnly value={order.order_state} />
              </div>
              <div>
                <Label>Postal Code</Label>
                <Input readOnly value={order.order_postal_code} />
              </div>
            </div>
            <div>
              <Label>Phone Number</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                  +63
                </span>
                <Input
                  readOnly
                  type="text"
                  className="pl-12"
                  value={order.order_phone}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 space-y-4">
          <div className="bg-white p-6 shadow-md rounded-md space-y-4">
            <h2 className="text-xl font-semibold">Order Summary</h2>

            {isLoading ? (
              <div className="flex flex-col gap-4 justify-start items-start h-full">
                <Skeleton className="w-full bg-gray-200 h-20" />
                <Skeleton className="w-full max-w-sm bg-gray-200 h-20" />
                <Skeleton className="w-full max-w-xs bg-gray-200 h-20" />
              </div>
            ) : orderDetails.order_items.length > 0 ? (
              orderDetails.order_items.map((product) => (
                <div
                  key={product.order_item_id}
                  className="flex items-center bg-white text-black gap-4"
                >
                  <div className="relative">
                    <Image
                      src={
                        product.product_variant_image ||
                        "/assets/model/QR_59794.jpg"
                      }
                      alt={product.product_variant_name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-contain rounded-xl"
                    />

                    {/* Quantity Badge */}
                    <div className="absolute -top-4 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {product.order_item_quantity}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <p className="font-semibold text-lg uppercase">
                      {product.product_variant_name} -{" "}
                      {product.product_variant_color}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Size: {product.product_variant_size}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Color: {product.order_item_color}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Quantity: {product.order_item_quantity}
                    </p>
                    <p className="text-gray-700 font-bold">
                      ₱
                      {(
                        product.order_item_price * product.order_item_quantity
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No items found for this order.</p>
            )}
            {orderDetails.order_items.length > 0 && (
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₱{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₱0.00</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₱{subtotal.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
