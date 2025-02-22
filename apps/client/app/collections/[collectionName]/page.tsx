import prisma from "@/utils/prisma/prisma";
import { Suspense, lazy } from "react";
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
    include: {
      product_variants: {
        select: {
          product_variant_id: true,
          product_variant_color: true,
          product_variant_size: true,
          product_variant_slug: true,
          product_variant_quantity: true,
          variant_sample_images: {
            select: {
              variant_sample_image_image_url: true,
            },
          },
        },
      },
    },
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CollectionNamePage
        currentDate={currentDate}
        collectionItems={
          product?.map((p) => ({
            ...p,
            product_variants: p.product_variants.map((v) => ({
              ...v,
              product_variant_product_id: p.product_id,
            })),
          })) || []
        }
        categoryName={collectionName || ""}
      />
    </Suspense>
  );
};

export default page;
