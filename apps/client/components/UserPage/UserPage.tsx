import UserTable from "./UserTable";

const UserPage = () => {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-semibold mb-6">Users List</h1>
      <p className="text-sm text-gray-500">
        View and manage all users in the system. You can search for users by
        email, name, or payment method.
      </p>

      <UserTable />
    </div>
  );
};

export default UserPage;
