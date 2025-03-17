import ProductCategoryPage from "@/components/ProductCategoryPage/ProductCategoryPage";
import prisma from "@/utils/prisma/prisma";
import { protectionAdminMiddleware } from "@/utils/protectionMiddleware";

const page = async () => {
  await protectionAdminMiddleware();

  const collections = await prisma.product_category_table.findMany({
    select: {
      product_category_id: true,
      product_category_name: true,
      product_category_description: true,
    },
    orderBy: {
      product_category_created_at: "desc",
    },
  });

  return <ProductCategoryPage collections={collections} />;
};

export default page;
