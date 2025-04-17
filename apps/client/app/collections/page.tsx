import CollectionPage from "@/components/CollectionPage/CollectionPage";
import prisma from "@/utils/prisma/prisma";

const page = async () => {
  const collections = await prisma.product_category_table.findMany({
    orderBy: {
      product_category_created_at: "desc",
    },
  });

  return <CollectionPage collections={collections} />;
};

export default page;
