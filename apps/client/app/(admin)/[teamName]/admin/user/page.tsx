import UserPage from "@/components/UserPage/UserPage";
import { protectionAdminMiddleware } from "@/utils/protectionMiddleware";

const page = async () => {
  await protectionAdminMiddleware();

  return <UserPage />;
};

export default page;
