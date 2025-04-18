import ProductSlugPage from "@/components/ProductSlugPage/ProductSlugPage";
import { findProductBySlug, slugify } from "@/utils/function";
import prisma from "@/utils/prisma/prisma";
import { redirect } from "next/navigation";

const ProductPage = async ({
  params,
}: {
  params: Promise<{ productSlug: string; teamName: string }>;
}) => {
  const { productSlug, teamName } = await params;
  const generateSlug = slugify(productSlug);

  const { product, variantInfo } = await findProductBySlug(
    generateSlug,
    prisma
  );

  if (!product || !variantInfo) {
    return redirect(`/${teamName}/admin/product`);
  }

  return <ProductSlugPage variantInfo={variantInfo} product={product} />;
};

export default ProductPage;
