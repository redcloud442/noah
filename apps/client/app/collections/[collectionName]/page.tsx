import prisma from "@/utils/prisma/prisma";
import { ProductType } from "@/utils/types";
import { lazy } from "react";
const CollectionNamePage = lazy(
  () => import("@/components/CollectionNamePage/CollectionNamePage")
);

const page = async ({
  params,
}: {
  params: Promise<{ collectionName: string }>;
}) => {
  const { collectionName } = await params;
  const currentDate = new Date();

  const categoryName = await prisma.product_category_table.findFirst({
    where: {
      product_category_name: {
        contains: collectionName,
        mode: "insensitive",
      },
    },
  });

  const product = await prisma.product_table.findMany({
    where: {
      product_category_id: categoryName?.product_category_id,
    },
    orderBy: {
      product_created_at: "desc",
    },
    include: {
      product_variants: {
        where: {
          product_variant_is_deleted: false,
        },
        select: {
          product_variant_id: true,
          product_variant_color: true,
          product_variant_slug: true,
          product_variant_product_id: true,
          variant_sizes: {
            select: {
              variant_size_id: true,
              variant_size_value: true,
              variant_size_quantity: true,
              variant_size_variant_id: true,
            },
          },
          variant_sample_images: {
            select: {
              variant_sample_image_image_url: true,
              variant_sample_image_id: true,
              variant_sample_image_product_variant_id: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    return <div>No product found</div>;
  }

  return (
    <CollectionNamePage
      currentDate={currentDate}
      collectionItems={product as ProductType[]}
      categoryName={collectionName || ""}
    />
  );
};

export default page;
