import AccountPage from "@/components/AccountPage/AccountPage";
import { protectionUserMiddleware } from "@/utils/protectionMiddleware";

const page = async () => {
  await protectionUserMiddleware();
  return <AccountPage />;
};

export default page;
