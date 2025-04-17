import EditProductPage from "@/components/EditProductPage/EditProductPage";
import { findProductBySlugAdmin } from "@/utils/function";
import prisma from "@/utils/prisma/prisma";
import { protectionAdminMiddleware } from "@/utils/protectionMiddleware";
import { redirect } from "next/navigation";

const page = async ({
  params,
}: {
  params: Promise<{ productSlug: string; teamName: string }>;
}) => {
  await protectionAdminMiddleware();

  const { productSlug, teamName } = await params;

  const { product } = await findProductBySlugAdmin(productSlug, prisma);

  if (!product) {
    return redirect(`/${teamName}/admin/product`);
  }

  const formattedVariantInfo = {
    products: [
      {
        name: product.product_name,
        price: product.product_price,
        description: product.product_description || "",
        category: product.product_category_id,
        variants: product.product_variants.map((variant) => ({
          id: variant.product_variant_id,
          color: variant.product_variant_color,
          sizesWithQuantities: variant.variant_sizes.map((size) => ({
            size: size.variant_size_value,
            quantity: size.variant_size_quantity,
          })),
          images: variant.variant_sample_images.map(
            (image) => image.variant_sample_image_image_url
          ),
          publicUrl:
            variant.variant_sample_images.map(
              (image) => image.variant_sample_image_image_url
            ) || [],
        })),
      },
    ],
  };

  console.log(formattedVariantInfo);

  return (
    <EditProductPage
      productId={product.product_id}
      formattedVariantInfo={{
        products: formattedVariantInfo.products.map((product) => ({
          ...product,
          variants: product.variants.map((variant) => ({
            ...variant,
            images: [],
            publicUrl: variant.publicUrl,
          })),
        })),
      }}
    />
  );
};

export default page;
