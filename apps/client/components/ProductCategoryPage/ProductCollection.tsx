"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardTitle } from "../ui/card";

type ProductCollectionProps = {
  collections: {
    product_category_id: string;
    product_category_name: string;
    product_category_description: string;
  }[];
};

const ProductCollection = ({ collections }: ProductCollectionProps) => {
  const router = useRouter();
  const { teamName } = useParams();

  const handleOnClick = (collectionSlug: string) => {
    router.push(`/${teamName}/admin/product/collections/${collectionSlug}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {collections.length === 0 ? (
        <div className="w-full col-span-full flex justify-center items-center py-8">
          <p className="text-gray-500">No product categories available.</p>
        </div>
      ) : (
        collections.map((collection) => (
          <Card
            key={collection.product_category_id}
            className="w-full rounded-lg shadow-lg border p-4 hover:shadow-xl transition-shadow cursor-pointer hover:bg-gray-800/50"
            onClick={() =>
              handleOnClick(
                collection.product_category_name
                  .toLowerCase()
                  .replace(/\s+/g, "-")
              )
            }
          >
            <CardContent>
              <CardTitle className="text-xl font-bold uppercase">
                {collection.product_category_name}
              </CardTitle>
              <CardDescription className="mt-2 text-foreground">
                {collection.product_category_description}
              </CardDescription>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default ProductCollection;
