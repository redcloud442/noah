import HomeSection from "@/components/HomeSection/HomeSection";
import prisma from "@/utils/prisma/prisma";

export default async function Home() {
  const products = await prisma.product_table.findMany({
    orderBy: {
      product_created_at: "desc",
    },
    include: {
      product_variants: {
        where: {
          product_variant_is_deleted: false,
        },
        include: {
          variant_sample_images: true,
          variant_sizes: true,
        },
      },
    },
    take: 15,
  });
  return <HomeSection products={products} />;
}
