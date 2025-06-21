import CashierPosPage from "@/components/CashierPosPage/CashierPosPage";
import { protectionPosMiddleware } from "@/utils/protectionMiddleware";

const page = async () => {
  await protectionPosMiddleware();
  return <CashierPosPage />;
};

export default page;
