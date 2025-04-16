import CreateProductPage from "@/components/CreateProductPage/CreateProductPage";
import { protectionAdminMiddleware } from "@/utils/protectionMiddleware";

const page = async () => {
  await protectionAdminMiddleware();

  return <CreateProductPage />;
};

export default page;
