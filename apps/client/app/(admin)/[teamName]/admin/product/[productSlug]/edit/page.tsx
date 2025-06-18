import EditProductPage from "@/components/EditProductPage/EditProductPage";
import { findProductBySlugAdmin } from "@/utils/function";
import prisma from "@/utils/prisma/prisma";
import { redirect } from "next/navigation";

const page = async ({
  params,
}: {
  params: Promise<{ productSlug: string; teamName: string }>;
}) => {
  const { productSlug, teamName } = await params;

  const { product } = await findProductBySlugAdmin(productSlug, prisma);

  if (!product) {
    return redirect(`/${teamName}/admin/product`);
  }

  const formattedVariantInfo = {
    products: [
      {
        id: product.product_id,
        name: product.product_name,
        price: product.product_price,
        description: product.product_description || "",
        category: product.product_category_id,
        sizeGuide: new File([], ""),
        sizeGuideUrl: product.product_size_guide_url || "",
        variants: product.product_variants.map(
          (variant: {
            product_variant_id: string;
            product_variant_color: string;
            variant_sizes: {
              variant_size_value: string;
              variant_size_quantity: number;
            }[];
            variant_sample_images: { variant_sample_image_image_url: string }[];
          }) => ({
            id: variant.product_variant_id,
            color: variant.product_variant_color,
            sizesWithQuantities: variant.variant_sizes.map(
              (size: {
                variant_size_value: string;
                variant_size_quantity: number;
              }) => ({
                size: size.variant_size_value,
                quantity: size.variant_size_quantity,
              })
            ),
            images: [],
            publicUrl:
              variant.variant_sample_images.map(
                (image) => image.variant_sample_image_image_url
              ) || [],
          })
        ),
      },
    ],
  };

  return (
    <EditProductPage
      productId={product.product_id}
      formattedVariantInfo={formattedVariantInfo}
    />
  );
};

export default page;
