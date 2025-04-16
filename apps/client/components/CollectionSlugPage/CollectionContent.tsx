"use client";

import { product_table, product_variant_table } from "@prisma/client";
import { useRouter } from "next/navigation";
import { CardContent, CardTitle } from "../ui/card";
type Props = {
  product: product_table & {
    product_variants: product_variant_table[];
  };
};

const CollectionContent = ({ product }: Props) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(
      `/admin/product/${product.product_variants[0].product_variant_slug}`
    );
  };

  return (
    <CardContent
      onClick={handleClick}
      className="cursor-pointer h-full relative"
    >
      <CardTitle className="text-xl font-bold">
        {product.product_name}
      </CardTitle>

      <p className="text-sm text-white/70">
        Variants: {product.product_variants.length}
      </p>
      <p className="text-sm text-white/70">{product.product_description}</p>
      <p className="text-sm text-white/70">
        Price: ₱{" "}
        {product.product_price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </p>
    </CardContent>
  );
};

export default CollectionContent;
