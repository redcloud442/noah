import ProductCategoryPage from "@/components/ProductCategoryPage/ProductCategoryPage";
import { protectionAdminMiddleware } from "@/utils/protectionMiddleware";

const page = async () => {
  await protectionAdminMiddleware();

  return <ProductCategoryPage />;
};

export default page;
