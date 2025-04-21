import DashboardAnalyticsPage from "@/components/DashboardAnalyticsPage/DashboardAnalyticsPage";
import { protectionAdminMiddleware } from "@/utils/protectionMiddleware";

const Page = async () => {
  await protectionAdminMiddleware();

  return <DashboardAnalyticsPage />;
};

export default Page;
