import ProductPage from "@/components/ProductPage/ProductPage";
import { protectionAdminMiddleware } from "@/utils/protectionMiddleware";

const page = async () => {
  await protectionAdminMiddleware();

  return <ProductPage />;
};

export default page;
