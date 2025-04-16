"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utils/function";
import { order_table } from "@prisma/client";
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

  return (
    <div className="w-full max-w-4xl sm:max-w-none px-4">
      <h2 className="text-2xl font-semibold my-4">Your Recent Orders</h2>
      <p className="text-gray-600">Track your past and ongoing orders below.</p>

      {isLoading ? (
        <div className="flex justify-center flex-col gap-4 mt-6">
          <Skeleton className="w-full bg-gray-200 h-32" />
          <Skeleton className="w-full bg-gray-200 max-w-6xl h-32" />
          <Skeleton className="w-full bg-gray-200 max-w-4xl h-32" />
        </div>
      ) : orders.length === 0 ? (
        <p className="mt-6 text-gray-500">No orders found.</p>
      ) : (
        <>
          <ul className="space-y-4 mt-6">
            {orders.map((order) => (
              <li
                key={order.order_id}
                className="p-5 border border-gray-200 rounded-lg shadow-md bg-white flex flex-col md:flex-row justify-between items-start md:items-start"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-lg">
                      Order #{order.order_number}
                    </p>
                    <Badge
                      variant={
                        order.order_status === "PENDING"
                          ? "default"
                          : order.order_status === "PAID"
                          ? "success"
                          : "destructive"
                      }
                    >
                      {order.order_status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Placed on: {formatDate(order.order_created_at)}
                  </p>

                  <div className="flex flex-col items-start text-sm">
                    <p className="mt-1 text-gray-500">{order.order_email}</p>
                    <p className="mt-1 text-gray-500">
                      +63 {order.order_phone}
                    </p>
                    <p className="mt-1 text-gray-500">{order.order_address}</p>
                  </div>
                </div>
                <Link href={`/account/orders/${order.order_number}`}>
                  <Button variant="secondary">View Details</Button>
                </Link>
              </li>
            ))}
          </ul>
          {count > 0 && (
            <Pagination
              activePage={activePage}
              handleChangePage={setActivePage}
              pageCount={pageCount}
            />
          )}
        </>
      )}
    </div>
  );
};

export default OrderContents;
