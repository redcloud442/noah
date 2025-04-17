import OrderListTable from "./OrderListTable";

const OrderPage = () => {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-semibold mb-6">Orders List</h1>
      <p className="text-sm text-gray-500">
        View and manage all orders in the system. You can search for orders by
        order number, user email, or payment method.
      </p>

      <OrderListTable />
    </div>
  );
};

export default OrderPage;
