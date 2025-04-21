"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ProductType, ProductVariantType } from "@/utils/types";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Separator } from "../ui/separator";

type Props = {
  product: ProductType;
  variantInfo: ProductVariantType;
};

const ProductSlugPage = ({ product, variantInfo }: Props) => {
  const { teamName } = useParams();

  const [selectedSize, setSelectedSize] = useState(
    product.product_variants[0]?.variant_sizes[0].variant_size_value
  );

  const allImages = variantInfo.variant_sample_images || [];

  const [selectedImage, setSelectedImage] = useState(
    allImages?.[0]?.variant_sample_image_image_url || "/placeholder.png"
  );

  return (
    <div className="px-4">
      <div className="space-y-1 pb-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          View Product
        </h1>
        <p className="text-muted-foreground">
          View the product details and variants.
        </p>
      </div>
      <Separator className="my-6" />
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
                className="group relative border rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-black transition"
                onMouseEnter={() =>
                  setSelectedImage(image.variant_sample_image_image_url)
                }
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 hover:opacity-0 opacity-100 transition-opacity duration-300 z-10" />

                {/* Image */}
                <Image
                  src={image.variant_sample_image_image_url}
                  alt="Thumbnail"
                  width={250}
                  height={250}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="sticky top-0 self-start">
          <h1 className="text-3xl font-bold uppercase">
            {product.product_name} - {variantInfo.product_variant_color}
          </h1>
          <p className="text-xl text-white/70 mt-2">
            ₱ {product.product_price.toLocaleString()}
          </p>

          <div className="mt-4">
            <h3 className="text-sm font-semibold">Select Color:</h3>
            <div className="flex gap-2 mt-2">
              {product.product_variants.map((variant) => (
                <Link
                  key={variant.product_variant_id}
                  href={`/${teamName}/admin/product/${variant.product_variant_slug}`}
                >
                  <Button
                    variant="ghost"
                    className={`w-16 h-16 border ${
                      variant.product_variant_id ===
                      variantInfo.product_variant_id
                        ? "border-gray-300"
                        : "border-black"
                    }`}
                  >
                    <Image
                      src={
                        variant.variant_sample_images[0]
                          ?.variant_sample_image_image_url || "/placeholder.png"
                      }
                      alt={variant.product_variant_color}
                      width={50}
                      height={50}
                    />
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div className="mt-4">
            <h3 className="text-sm font-semibold">Size:</h3>
            <div className="flex gap-3 mt-2">
              {variantInfo.variant_sizes.map((variant) => (
                <Button
                  key={variant.variant_size_id}
                  onClick={() => setSelectedSize(variant.variant_size_value)}
                  className={`px-4 py-2 border rounded-md ${
                    selectedSize === variant.variant_size_value
                      ? "scale-110 bg-gray-400"
                      : ""
                  }`}
                >
                  {variant.variant_size_value}
                </Button>
              ))}
            </div>
          </div>

          {/* Quantity Display */}
          <div className="mt-4 flex items-center gap-4">
            <h3 className="text-sm font-semibold">Quantity:</h3>
            <div className="flex items-center border p-1 rounded-md">
              <span className="px-4">
                {
                  variantInfo.variant_sizes.find(
                    (variant) => variant.variant_size_value === selectedSize
                  )?.variant_size_quantity
                }
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
              <AccordionContent>
                Return policy details go here.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default ProductSlugPage;
