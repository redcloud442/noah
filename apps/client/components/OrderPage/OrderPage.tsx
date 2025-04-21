import { Separator } from "../ui/separator";
import OrderListTable from "./OrderListTable";

const OrderPage = () => {
  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Orders List
        </h1>
        <p className="text-muted-foreground">
          View and manage all orders in the system. You can search for orders by
          order number, user email, or payment method.
        </p>
      </div>
      <Separator className="my-6" />

      <OrderListTable />
    </div>
  );
};

export default OrderPage;
