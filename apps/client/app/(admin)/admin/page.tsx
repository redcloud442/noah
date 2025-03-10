import AdminDashboardPage from "@/components/AdminDashboardPage/AdminDashboardPage";
import { protectionAdminMiddleware } from "@/utils/protectionMiddleware";

const Page = async () => {
  await protectionAdminMiddleware();

  return <AdminDashboardPage />;
};

export default Page;
