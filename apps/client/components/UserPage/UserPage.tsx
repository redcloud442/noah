import { Separator } from "@/components/ui/separator";
import UserTable from "./UserTable";

const UserPage = () => {
  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1 pb-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          User List
        </h1>
        <p className="text-muted-foreground">
          View and manage all user in the system. You can search for user by
          withdrawal by email, name, or payment method.
        </p>
      </div>

      <Separator className="my-6" />

      <UserTable />
    </div>
  );
};

export default UserPage;
