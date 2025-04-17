"use client";

import { VariantProductType } from "@/utils/types";
import { useRouter } from "next/navigation";
import { CardContent, CardTitle } from "../ui/card";
type Props = {
  product: VariantProductType;
};

const CollectionVariantContent = ({ product }: Props) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(
      `/admin/product/${product.product_variant_product.product_slug}`
    );
  };

  return (
    <CardContent
      onClick={handleClick}
      className="cursor-pointer h-full relative space-y-4 text-center"
    >
      <CardTitle className="text-xl font-bold uppercase">
        {product.product_variant_product.product_name} -{" "}
        {product.product_variant_color}
      </CardTitle>

      <p className="text-sm text-white/70">
        {product.product_variant_product.product_description}
      </p>
      <p className="text-md text-white/70">
        ₱ {product.product_variant_product.product_price.toLocaleString()}
      </p>
    </CardContent>
  );
};

export default CollectionVariantContent;
