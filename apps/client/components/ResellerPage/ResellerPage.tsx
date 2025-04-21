import { Separator } from "../ui/separator";
import ResellerTable from "./ResellerTable";
const ResellerPage = () => {
  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1 pb-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Reseller List
        </h1>
        <p className="text-muted-foreground">
          View and manage all reseller in the system. You can search for
          withdrawal by email, name, or payment method.
        </p>
      </div>
      <Separator />
      <ResellerTable />
    </div>
  );
};

export default ResellerPage;
