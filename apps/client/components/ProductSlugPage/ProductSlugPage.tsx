"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  product_table,
  product_variant_table,
  variant_sample_image_table,
} from "@prisma/client";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  product: product_table & {
    product_variants: (product_variant_table & {
      variant_sample_images: variant_sample_image_table[];
    })[];
  };
};

const ProductSlugPage = ({ product }: Props) => {
  const router = useRouter();
  const { teamName } = useParams();

  const [selectedSize, setSelectedSize] = useState(
    product.product_variants[0]?.product_variant_size
  );

  const allImages =
    product.product_variants.flatMap((v) => v.variant_sample_images) || [];

  const [selectedImage, setSelectedImage] = useState(
    allImages?.[0]?.variant_sample_image_image_url || "/placeholder.png"
  );

  const handleClick = async (slug: string | null) => {
    router.replace(`/${teamName}/admin/product/${slug}`);
    router.refresh();
  };

  return (
    <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="sticky top-0">
        <div className="relative bg-gray-200 rounded-lg overflow-hidden mb-4">
          <Image
            src={selectedImage}
            alt="Selected Product Image"
            width={500}
            height={500}
            className="object-cover w-full h-full"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {allImages.map((image, idx) => (
            <div
              key={idx}
              className="border rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-black transition"
              onMouseEnter={() =>
                setSelectedImage(image.variant_sample_image_image_url)
              }
            >
              <Image
                src={image.variant_sample_image_image_url}
                alt="Thumbnail"
                width={250}
                height={250}
                className="object-cover w-full h-full hover:scale-105 hover:bg-gray-900/50 transition duration-300"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="sticky top-0 self-start">
        <h1 className="text-3xl font-bold">{product.product_name}</h1>
        <p className="text-xl text-white/70 mt-2">
          ₱{" "}
          {product.product_price.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>

        <div className="mt-4">
          <h3 className="text-sm font-semibold">Select Color:</h3>
          <div className="flex gap-2 mt-2">
            {product.product_variants.map((variant) => (
              <Button
                key={variant.product_variant_id}
                onClick={() => handleClick(variant.product_variant_slug)}
                variant="ghost"
                className={`w-14 h-14 border ${
                  selectedSize === variant.product_variant_size
                    ? "border-black"
                    : "border-gray-300"
                }`}
              >
                <Image
                  src={
                    variant.variant_sample_images[0]
                      ?.variant_sample_image_image_url || "/placeholder.png"
                  }
                  alt={variant.product_variant_color}
                  width={35}
                  height={35}
                />
              </Button>
            ))}
          </div>
        </div>

        {/* Size Selector */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold">Size:</h3>
          <div className="flex gap-3 mt-2">
            {product.product_variants.map((variant) => (
              <Button
                key={variant.product_variant_id}
                onClick={() => setSelectedSize(variant.product_variant_size)}
                className={`px-4 py-2 border rounded-md ${
                  selectedSize === variant.product_variant_size
                    ? "border-black"
                    : "border-gray-300"
                }`}
              >
                {variant.product_variant_size}
              </Button>
            ))}
          </div>
        </div>

        {/* Quantity Display */}
        <div className="mt-4 flex items-center gap-4">
          <h3 className="text-sm font-semibold">Quantity:</h3>
          <div className="flex items-center border p-1 rounded-md">
            <span className="px-4">
              {product.product_variants[0].product_variant_quantity}
            </span>
          </div>
        </div>

        {/* Expandable Sections */}
        <Accordion type="single" collapsible className="mt-6">
          <AccordionItem value="description">
            <AccordionTrigger>Description</AccordionTrigger>
            <AccordionContent>
              {product.product_description || "No description available."}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="shipping">
            <AccordionTrigger>Shipping</AccordionTrigger>
            <AccordionContent>Shipping details go here.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="returns">
            <AccordionTrigger>Returns</AccordionTrigger>
            <AccordionContent>Return policy details go here.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default ProductSlugPage;
