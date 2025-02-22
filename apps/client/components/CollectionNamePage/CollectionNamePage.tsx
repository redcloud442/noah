"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  product_table,
  product_variant_table,
  variant_sample_image_table,
} from "@prisma/client";
import { PlusIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { VariantSelectionToast } from "./AddToCart";

type Props = {
  collectionItems: (product_table & {
    product_variants: (product_variant_table & {
      variant_sample_images: {
        variant_sample_image_image_url: string;
      }[];
    })[];
  })[];
  categoryName: string;
  currentDate: Date;
};

const CollectionNamePage = ({
  collectionItems,
  categoryName,
  currentDate,
}: Props) => {
  return (
    <div className="min-h-screen w-full mx-auto text-black py-8 mt-24 bg-gray-100">
      <div className="mx-auto px-6">
        <h1 className="text-3xl font-bold mb-10 sm:text-center">
          {categoryName.slice(0, 1).toUpperCase() + categoryName.slice(1)}{" "}
          Collection
        </h1>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {collectionItems.map((item) => (
            <HoverImageCard
              key={item.product_id}
              product={item}
              currentDate={currentDate}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionNamePage;

type HoverImageCardProps = {
  product: product_table & {
    product_variants: (product_variant_table & {
      variant_sample_images: {
        variant_sample_image_image_url: string;
      }[];
    })[];
  };
  currentDate: Date;
};

const HoverImageCard = ({ product, currentDate }: HoverImageCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [isHovered, setIsHovered] = useState(false);

  const imageUrls = product.product_variants.flatMap((variant) =>
    variant.variant_sample_images.map(
      (img) => img.variant_sample_image_image_url
    )
  );

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isHovered && imageUrls.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
      }, 1500); // Smooth transition interval
    } else {
      setCurrentImageIndex(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHovered, imageUrls.length]);

  const handleAddToCart = (availableVariants: product_variant_table[]) => {
    if (availableVariants.length === 0) {
      toast.error("No variants available for this product.");
      return;
    }

    toast.custom((t) => (
      <VariantSelectionToast
        product={product}
        availableVariants={
          availableVariants as (product_variant_table & {
            variant_sample_image_product_variant: variant_sample_image_table;
          })[]
        }
        closeToast={() => toast.dismiss(t)}
      />
    ));
  };

  return (
    <Card
      className="overflow-hidden bg-white shadow-md rounded-none border-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative group">
        <Image
          src={imageUrls[currentImageIndex] || "/assets/model/QR_59794.jpg"}
          alt={product.product_name}
          width={2000}
          height={2000}
          quality={80}
          className="w-full min-h-[300px] h-auto object-cover transition-opacity duration-300"
        />

        {/* "Add to Cart" button - initially hidden */}
        <div className="absolute inset-0 p-2 flex items-end justify-end bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            onClick={() => handleAddToCart(product.product_variants)}
            size="sm"
            variant="outline"
            className="bg-white text-black"
          >
            <PlusIcon className="w-4 h-4" /> Quick Add
          </Button>
        </div>

        {/* Badges */}
        {new Date(product.product_created_at).getTime() >
          currentDate.getTime() - 30 * 24 * 60 * 60 * 1000 && (
          <div className="absolute top-2 left-2 bg-black text-xs px-2 py-1 rounded text-white">
            New
          </div>
        )}
      </div>

      {/* Product Details */}
      <CardContent className="p-4 text-center text-black">
        <CardTitle className="text-sm font-semibold">
          {product.product_name}
        </CardTitle>
        <p className="text-sm font-bold mt-2">
          ₱{product.product_price.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
};
