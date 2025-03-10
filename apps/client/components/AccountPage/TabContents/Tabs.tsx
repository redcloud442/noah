"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddressContent from "./AddressContent";
import OrderContents from "./OrderContents";

const TabButton = ({ tab }: { tab: string }) => {
  const handleTabChange = (value: string) => {
    window.history.pushState(null, "", `/account/${value}`);
  };

  return (
    <div className="flex justify-start">
      <Tabs
        defaultValue={tab || "orders"}
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
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders" className="w-full px-4">
          <OrderContents />
        </TabsContent>

        {/* Address Tab */}
        <TabsContent value="address" className="w-full px-4">
          <AddressContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TabButton;
