"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAddressQuery } from "@/query/addressQuery";
import { useOrderQuery } from "@/query/orderQuery";
import { order_table, user_address_table } from "@prisma/client";
import { useState } from "react";
import AddressContent from "./AddressContent";
import OrderContents from "./OrderContents";
import ResellerContents from "./ResellerContents";

const TabButton = ({ tab }: { tab: string }) => {
  const [activeTab, setActiveTab] = useState(tab || "orders");

  const handleTabChange = (value: string) => {
    setActiveTab(value);

    const slug = encodeURIComponent(value.toLowerCase().replace(/\s+/g, "-"));

    window.history.pushState(null, "", `/account/${slug}`);
  };

  const [activePage, setActivePage] = useState(1);

  const orderQuery = useOrderQuery(15, activePage);
  const addressQuery = useAddressQuery(15, activePage);

  const { data, isLoading } =
    activeTab === "orders" ? orderQuery : addressQuery;

  const orders =
    activeTab === "orders"
      ? (data as { orders: order_table[]; count: number })?.orders || []
      : [];

  const address =
    activeTab === "address"
      ? (data as { address: user_address_table[]; count: number })?.address ||
        []
      : [];

  const count = data?.count as number;

  return (
    <div className="flex justify-start">
      <Tabs
        value={activeTab}
        className="w-full"
        onValueChange={handleTabChange}
      >
        <TabsList variant="outline">
          <TabsTrigger variant="outline" value="orders">
            Orders
          </TabsTrigger>
          <TabsTrigger variant="outline" value="address">
            Address
          </TabsTrigger>
          <TabsTrigger variant="outline" value="Be a reseller">
            Be a reseller
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="w-full px-4">
          <OrderContents
            orders={orders}
            count={count}
            setActivePage={setActivePage}
            activePage={activePage}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="address" className="w-full px-4">
          <AddressContent
            address={address}
            count={count}
            setActivePage={setActivePage}
            activePage={activePage}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="Be a reseller" className="w-full px-4">
          <ResellerContents />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TabButton;
