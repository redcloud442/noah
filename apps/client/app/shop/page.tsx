import ShopPage from "@/components/ShopPage/ShopPage";
import prisma from "@/utils/prisma/prisma";

const page = async () => {
  const products = await prisma.product_variant_table.findMany({
    where: {
      product_variant_is_deleted: false,
    },
    include: {
      product_variant_product: true,
      variant_sample_images: true,
      variant_sizes: true,
    },
    orderBy: {
      product_variant_product: {
        product_created_at: "desc",
      },
    },
  });

  return <ShopPage variants={products} />;
};

export default page;
