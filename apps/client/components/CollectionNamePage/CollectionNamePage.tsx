"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ProductType, ProductVariantType } from "@/utils/types";
import { PlusIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { VariantSelectionToast } from "./AddToCart";

type Props = {
  collectionItems: ProductType[];
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
          {collectionItems.map((item) =>
            item.product_variants.map((variant) => (
              <HoverImageCard
                key={variant.product_variant_id}
                product={item}
                variant={variant}
                currentDate={currentDate}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionNamePage;

type HoverImageCardProps = {
  currentDate: Date;
  variant: ProductVariantType;
  product: ProductType;
};

export const HoverImageCard = ({
  variant,
  currentDate,
  product,
}: HoverImageCardProps) => {
  const router = useRouter();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [isHovered, setIsHovered] = useState(false);

  const imageUrls = useMemo(
    () =>
      variant.variant_sample_images.map(
        (img) => img.variant_sample_image_image_url
      ),
    [variant]
  );

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isHovered && imageUrls.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
      setCurrentImageIndex(0); // only reset when unmount or mouse leaves
    };
  }, [isHovered, imageUrls]);

  const handleAddToCart = () => {
    toast.custom((t) => (
      <VariantSelectionToast
        selectedVariant={variant}
        product={product}
        // availableVariants={
        //   availableVariants as (product_variant_table & {
        //     variant_sizes: variant_size_table[];
        //     variant_sample_image_product_variant: variant_sample_image_table;
        //   })[]
        // }
        closeToast={() => toast.dismiss(t)}
      />
    ));
  };

  return (
    <Card
      className="overflow-hidden bg-white shadow-md rounded-none border-none cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(`/product/${product.product_slug}`)}
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
            onClick={() => handleAddToCart()}
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
          {product.product_name} - {variant.product_variant_color}
        </CardTitle>
        <p className="text-sm font-bold mt-2">
          ₱{product.product_price.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
};

type HoverVariantCardProps = {
  variant: ProductVariantType;
  product: ProductType;
  currentDate: Date;
};

export const HoverVariantCard = ({
  variant,
  product,
  currentDate,
}: HoverVariantCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [isHovered, setIsHovered] = useState(false);

  const imageUrls = variant.variant_sample_images.map(
    (img) => img.variant_sample_image_image_url
  );

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isHovered && imageUrls.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
      }, 500); // Smooth transition interval
    } else {
      setCurrentImageIndex(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHovered, imageUrls.length]);

  const handleAddToCart = () => {
    toast.custom((t) => (
      <VariantSelectionToast
        selectedVariant={variant}
        product={product}
        // availableVariants={
        //   availableVariants as (product_variant_table & {
        //     variant_sizes: variant_size_table[];
        //     variant_sample_image_product_variant: variant_sample_image_table;
        //   })[]
        // }
        closeToast={() => toast.dismiss(t)}
      />
    ));
  };

  return (
    <Card
      className="overflow-hidden bg-white shadow-md rounded-none border-none cursor-pointer"
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
            onClick={() => handleAddToCart()}
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
        <CardTitle className="text-sm font-semibold uppercase">
          {product.product_name} - {variant.product_variant_color}
        </CardTitle>
        <p className="text-sm font-bold mt-2">
          ₱{product.product_price.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
};
