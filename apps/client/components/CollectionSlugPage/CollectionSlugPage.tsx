import {
  product_table,
  product_variant_table,
  variant_sample_image_table,
} from "@prisma/client";
import { PlusIcon } from "lucide-react";
import Image from "next/image";
import ButtonVariant from "../ui/button-variant";
import { Card, CardHeader } from "../ui/card";
import CollectionContent from "./CollectionContent";
type Props = {
  products: (product_table & {
    product_variants: (product_variant_table & {
      variant_sample_images: variant_sample_image_table[];
    })[];
  })[];
  collectionSlug: string;
};

const CollectionSlugPage = ({ products, collectionSlug }: Props) => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-4 capitalize">
          {collectionSlug.replace(/-/g, " ")}
        </h1>
        <ButtonVariant
          variant="default"
          type="link"
          href="/admin/product/create"
        >
          <PlusIcon className="w-4 h-4" /> Add Product
        </ButtonVariant>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card
            key={product.product_id}
            className="shadow-lg hover:shadow-xl transition"
          >
            <CardHeader>
              <div className="relative w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                {product.product_variants?.[0].variant_sample_images?.[0]
                  ?.variant_sample_image_image_url ? (
                  <Image
                    src={
                      product.product_variants[0].variant_sample_images[0]
                        .variant_sample_image_image_url
                    }
                    alt={product.product_name}
                    width={100}
                    height={100}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 h-100 w-full">
                    No Image
                  </div>
                )}
              </div>
            </CardHeader>
            <CollectionContent product={product} />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CollectionSlugPage;
