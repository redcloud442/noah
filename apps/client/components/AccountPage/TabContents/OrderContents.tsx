"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utils/function";
import { order_table } from "@prisma/client";
import {
  ArrowRight,
  CalendarDays,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { Dispatch, SetStateAction } from "react";

type OrderContentsProps = {
  orders: order_table[];
  count: number;
  setActivePage: Dispatch<SetStateAction<number>>;
  activePage: number;
  isLoading: boolean;
};

const OrderContents = ({
  orders,
  count,
  setActivePage,
  activePage,
  isLoading,
}: OrderContentsProps) => {
  const pageCount = count > 0 ? Math.ceil(count / 15) : 1;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "PAID":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "DELIVERED":
        return "bg-green-50 text-green-700 border-green-200";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";
      case "SHIPPED":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ShoppingBag className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Track and manage your purchase history
        </p>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-3 flex-1">
                  <Skeleton className="h-6 w-48 bg-gray-200" />
                  <Skeleton className="h-4 w-32 bg-gray-200" />
                </div>
                <Skeleton className="h-10 w-28 bg-gray-200" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-4 w-full bg-gray-200" />
                <Skeleton className="h-4 w-full bg-gray-200" />
                <Skeleton className="h-4 w-full bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No orders yet
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            When you place your first order, it will appear here for easy
            tracking.
          </p>
          <Button asChild variant="secondary">
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-4">
          <ScrollArea className="h-[800px] pr-4">
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.order_id}
                  className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg"
                >
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            Order #{order.order_number}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <CalendarDays className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {formatDate(order.order_created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          className={`px-3 py-1 text-sm font-medium border ${getStatusColor(order.order_status)}`}
                        >
                          {order.order_status}
                        </Badge>
                        <Link
                          href={`/account/orders/${encodeURIComponent(
                            order.order_number
                          )}`}
                        >
                          <Button className="group hover:bg-blue-50 hover:border-blue-200">
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                            Email
                          </p>
                          <p className="text-sm text-gray-900 truncate">
                            {order.order_email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                            Phone
                          </p>
                          <p className="text-sm text-gray-900">
                            +63 {order.order_phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg md:col-span-1">
                        <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                            Address
                          </p>
                          <p className="text-sm text-gray-900 line-clamp-2">
                            {order.order_address}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Pagination */}
      {count > 0 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            activePage={activePage}
            handleChangePage={setActivePage}
            pageCount={pageCount}
          />
        </div>
      )}
    </div>
  );
};

export default OrderContents;
