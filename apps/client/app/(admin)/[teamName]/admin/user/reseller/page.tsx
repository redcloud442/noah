import ResellerPage from "@/components/ResellerPage/ResellerPage";
import { protectionAdminMiddleware } from "@/utils/protectionMiddleware";

const page = async () => {
  await protectionAdminMiddleware();

  return <ResellerPage />;
};

export default page;
