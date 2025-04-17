import ProductSlugPublicPage from "@/components/ProductSlugPublicPage/ProductSlugPublicPage";
import { findProductBySlug, slugify } from "@/utils/function";
import prisma from "@/utils/prisma/prisma";
import { redirect } from "next/navigation";

const ProductPage = async ({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) => {
  const { productSlug } = await params;
  const generateSlug = slugify(productSlug);

  const { product, variantInfo } = await findProductBySlug(
    generateSlug,
    prisma
  );

  if (!product || !variantInfo) {
    return redirect("/");
  }

  return <ProductSlugPublicPage variantInfo={variantInfo} product={product} />;
};

export default ProductPage;
