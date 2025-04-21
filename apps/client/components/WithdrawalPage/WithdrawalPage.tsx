import { Separator } from "../ui/separator";
import WithdrawalTable from "./WithdrawalTable";

const WithdrawalPage = () => {
  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1 pb-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Withdrawal List
        </h1>
        <p className="text-muted-foreground">
          View and manage all withdrawal in the system. You can search for
          withdrawal by email, name, or payment method.
        </p>
      </div>

      <Separator className="my-6" />

      <WithdrawalTable />
    </div>
  );
};

export default WithdrawalPage;
