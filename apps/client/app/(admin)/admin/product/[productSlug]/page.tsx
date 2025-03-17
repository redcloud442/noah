import ProductSlugPage from "@/components/ProductSlugPage/ProductSlugPage";
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

  const product = await findProductBySlug(generateSlug, prisma);

  if (!product) {
    return redirect("/admin/product");
  }

  return <ProductSlugPage product={product} />;
};

export default ProductPage;
