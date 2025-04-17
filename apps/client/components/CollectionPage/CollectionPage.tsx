"use client";

import { product_category_table } from "@prisma/client";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardTitle } from "../ui/card";

type Props = {
  collections: product_category_table[];
};

const CollectionPage = ({ collections }: Props) => {
  return (
    <div className="min-h-screen w-full mx-auto text-black py-8 mt-24 bg-gray-100">
      <div className="mx-auto px-6">
        <h1 className="text-3xl font-bold mb-10 sm:text-center">Collections</h1>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {collections.map((item) => (
            <HoverImageCardCollection
              key={item.product_category_id}
              product={item}
              currentDate={new Date()}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;

type HoverImageCardProps = {
  product: product_category_table;
  currentDate: Date;
};

export const HoverImageCardCollection = ({
  product,
  currentDate,
}: HoverImageCardProps) => {
  const imageUrls = product.product_category_image;

  const router = useRouter();

  return (
    <Card
      onClick={() =>
        router.push(`/collections/${product.product_category_name}`)
      }
      className="overflow-hidden relative bg-white min-h-auto shadow-md rounded-none border-none hover:shadow-lg transition-shadow duration-300 cursor-pointer"
    >
      <AspectRatio ratio={4 / 5} className="w-full">
        <Image
          src={imageUrls || "/assets/model/QR_59794.jpg"}
          alt={product.product_category_name}
          width={2000}
          height={2000}
          quality={80}
          className="w-full min-h-[300px] h-auto object-cover transition-opacity duration-300"
        />
      </AspectRatio>

      {new Date(product.product_category_created_at).getTime() >
        currentDate.getTime() - 30 * 24 * 60 * 60 * 1000 && (
        <div className="absolute top-2 left-2 bg-green-500 text-xs px-2 py-1 rounded text-white">
          New Collection
        </div>
      )}

      {/* Product Details */}
      <CardContent className="p-4 text-center text-black">
        <CardTitle className="text-lg font-semibold">
          {product.product_category_name.slice(0, 1).toUpperCase() +
            product.product_category_name.slice(1)}
        </CardTitle>
      </CardContent>
    </Card>
  );
};
