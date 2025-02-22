import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AccountPage = () => {
  return (
    <div className="flex flex-col justify-center p-4 text-black space-y-6">
      <h1 className="scroll-m-20 text-xl font-extrabold tracking-tight lg:text-3xl">
        Account Dashboard
      </h1>
      <Separator className="my-4" />

      <div className="flex justify-start">
        <Tabs defaultValue="orders" className="w-full max-w-xl">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="address">Address</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <h2 className="text-2xl font-semibold my-4">Your Recent Orders</h2>
            <p className="text-gray-700">
              Here is a list of your past and ongoing orders.
            </p>
            <ul className="space-y-2 mt-4">
              <li className="p-4 border rounded-md shadow-sm">
                <p className="font-bold">Order #12345</p>
                <p className="text-sm text-gray-600">
                  Placed on: February 1, 2025
                </p>
                <p>Status: Shipped</p>
              </li>
              <li className="p-4 border rounded-md shadow-sm">
                <p className="font-bold">Order #67890</p>
                <p className="text-sm text-gray-600">
                  Placed on: January 25, 2025
                </p>
                <p>Status: Delivered</p>
              </li>
              {/* Add dynamic content for orders here */}
            </ul>
          </TabsContent>

          {/* Address Tab */}
          <TabsContent value="address">
            <h2 className="text-2xl font-semibold my-4">Saved Addresses</h2>
            <p className="text-gray-700">
              Manage your shipping and billing addresses below.
            </p>
            <div className="mt-4 space-y-4">
              <div className="p-4 border rounded-md shadow-sm">
                <p className="font-bold">Home Address</p>
                <p>123 Main St, Los Angeles, CA, 90001</p>
                <button className="mt-2 text-blue-500 hover:underline">
                  Edit Address
                </button>
              </div>
              <div className="p-4 border rounded-md shadow-sm">
                <p className="font-bold">Office Address</p>
                <p>456 Park Ave, New York, NY, 10001</p>
                <button className="mt-2 text-blue-500 hover:underline">
                  Edit Address
                </button>
              </div>
              {/* Add dynamic content for addresses here */}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AccountPage;
