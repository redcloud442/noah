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
import { useRouter } from "next/navigation";
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
  const [selectedSize, setSelectedSize] = useState(
    product.product_variants[0]?.product_variant_size
  );

  const handleClick = async (slug: string | null) => {
    router.replace(`/admin/product/${slug}`);
    router.refresh();
  };

  return (
    <div className=" py-8 grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Left Side - Scrollable Product Images */}
      <div className="h-screen overflow-y-auto sticky top-0">
        <div className="relative w-full h-[600px] bg-gray-200 rounded-lg overflow-hidden">
          {product.product_variants.map((variant) => (
            <Image
              key={variant.product_variant_id}
              src={
                variant.variant_sample_images[0]
                  ?.variant_sample_image_image_url || "/placeholder.png"
              }
              alt={variant.product_variant_color}
              layout="fill"
              objectFit="cover"
            />
          ))}
        </div>
      </div>

      {/* Right Side - Fixed Product Details */}
      <div className="sticky top-0 self-start">
        <h1 className="text-3xl font-bold">{product.product_name}</h1>
        <p className="text-lg text-gray-700 mt-2">
          ₱{product.product_price.toLocaleString()}
        </p>

        {/* Color Selector */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold">Select Color:</h3>
          <div className="flex gap-2 mt-2">
            {product.product_variants.map((variant) => (
              <Button
                key={variant.product_variant_id}
                onClick={() => handleClick(variant.product_variant_slug)}
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
                  width={20}
                  height={20}
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

        {/* Quantity Selector */}
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
