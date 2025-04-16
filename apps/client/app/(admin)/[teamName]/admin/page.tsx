import { protectionAdminMiddleware } from "@/utils/protectionMiddleware";

const Page = async () => {
  await protectionAdminMiddleware();

  return <div>Admin Dashboard</div>;
};

export default Page;
