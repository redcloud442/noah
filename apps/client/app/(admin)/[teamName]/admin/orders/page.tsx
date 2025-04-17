import OrderPage from "@/components/OrderPage/OrderPage";
import { protectionAdminMiddleware } from "@/utils/protectionMiddleware";

const page = async () => {
  await protectionAdminMiddleware();

  return <OrderPage />;
};

export default page;
