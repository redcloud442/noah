import WithdrawalPage from "@/components/WithdrawalPage/WithdrawalPage";
import { protectionAdminMiddleware } from "@/utils/protectionMiddleware";

const page = async () => {
  await protectionAdminMiddleware();

  return <WithdrawalPage />;
};

export default page;
