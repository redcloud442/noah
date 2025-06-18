"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store";
import useUserDataStore from "@/lib/userDataStore";
import { generateCheckoutNumber } from "@/lib/utils";
import { authService } from "@/services/auth";
import { cartService } from "@/services/cart";
import { ProductType, ProductVariantType } from "@/utils/types";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

type Props = {
  product: ProductType;
  variantInfo: ProductVariantType;
};

const ProductSlugPublicPage = ({ product, variantInfo }: Props) => {
  const { cart, addToCart } = useCartStore();
  const { userData } = useUserDataStore();

  const [selectedSize, setSelectedSize] = useState(
    product.product_variants[0]?.variant_sizes[0].variant_size_value
  );
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const allImages = variantInfo.variant_sample_images || [];
  const [selectedImage, setSelectedImage] = useState(
    allImages?.[0]?.variant_sample_image_image_url || "/placeholder.png"
  );

  const router = useRouter();

  const handleAddToCart = async () => {
    try {
      setIsLoading(true);
      if (!variantInfo || !selectedSize) {
        toast.error("Please select a size before adding to cart.");
        setIsLoading(false);
        return;
      }

      const selectedSizeData = variantInfo.variant_sizes.find(
        (s) => s.variant_size_value === selectedSize
      );

      if (!selectedSizeData || selectedSizeData.variant_size_quantity <= 0) {
        toast.error("Selected size is out of stock.");
        setIsLoading(false);
        return;
      }

      const cartItem = {
        cart_id: uuidv4(),
        product_id: variantInfo.product_variant_product_id,
        product_name: product.product_name,
        product_price: product.product_price,
        product_quantity: quantity,
        product_size: selectedSize,
        product_variant_id: variantInfo.product_variant_id,
        product_variant_size: selectedSize,
        product_variant_color: variantInfo.product_variant_color,
        product_variant_quantity: selectedSizeData.variant_size_quantity,
        product_variant_image:
          variantInfo?.variant_sample_images[0]
            ?.variant_sample_image_image_url ?? "",
      };

      if (!userData) {
        localStorage.setItem(
          "shoppingCart",
          JSON.stringify({ products: [cartItem], count: cart.count + quantity })
        );
        addToCart(cartItem);
      } else {
        const created = await cartService.create({ ...cartItem });
        addToCart({ ...cartItem, cart_id: created.cart_id });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error adding to cart.");
      }
    } finally {
      setIsLoading(false);
    }

    toast.success("Added to cart successfully!");
  };

  const handleProceedToCheckout = async () => {
    try {
      setIsLoading(true);
      const checkoutNumber = generateCheckoutNumber();

      const selectedSizeData = variantInfo.variant_sizes.find(
        (s) => s.variant_size_value === selectedSize
      );

      if (!selectedSizeData || selectedSizeData.variant_size_quantity <= 0) {
        toast.error("Selected size is out of stock.");
        setIsLoading(false);
        return;
      }

      const cartItem = {
        cart_id: uuidv4(),
        product_id: variantInfo.product_variant_product_id,
        product_name: product.product_name,
        product_price: product.product_price,
        product_quantity: quantity,
        product_size: selectedSize,
        product_variant_id: variantInfo.product_variant_id,
        product_variant_size: selectedSize,
        product_variant_color: variantInfo.product_variant_color,
        product_variant_quantity: selectedSizeData.variant_size_quantity,
        product_variant_image:
          variantInfo?.variant_sample_images[0]
            ?.variant_sample_image_image_url ?? "",
      };

      if (!userData) {
        localStorage.setItem(
          "shoppingCart",
          JSON.stringify({ products: [cartItem], count: cart.count + quantity })
        );
        addToCart(cartItem);

        await authService.createCheckoutToken(checkoutNumber);
      } else {
        const created = await cartService.create({ ...cartItem });
        addToCart({ ...cartItem, cart_id: created.cart_id });
        await authService.createCheckoutToken(checkoutNumber);
      }

      router.push(`/checkout/cn/${checkoutNumber}`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error proceeding to checkout.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-12 bg-white mt-24 p-10 text-black relative space-y-8">
      <div className="absolute top-0 left-4 pt-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft /> Go back
        </Button>
      </div>
      <div className="block md:sticky top-0">
        <div className="relative bg-gray-200 rounded-lg overflow-hidden mb-4">
          <Image
            src={selectedImage}
            alt="Selected Product Image"
            width={1000}
            height={1000}
            className="object-cover w-full h-full"
          />
        </div>

        <div className="flex  gap-2 overflow-x-auto">
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

      <div className="block md:sticky top-0 self-start md:col-span-2">
        <h1 className="text-3xl font-bold uppercase">
          {product.product_name} - {variantInfo.product_variant_color}
        </h1>
        <p className="text-xl font-bold mt-2">
          ₱ {product.product_price.toLocaleString()}
        </p>

        <div className="mt-4">
          <h3 className="text-sm font-semibold">Select Color:</h3>
          <div className="flex gap-2 mt-2">
            {product.product_variants.map((variant) => (
              <Link
                key={variant.product_variant_id}
                href={`/product/${variant.product_variant_slug}`}
              >
                <HoverCard>
                  <HoverCardTrigger>
                    {" "}
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
                            ?.variant_sample_image_image_url ||
                          "/placeholder.png"
                        }
                        alt={variant.product_variant_color}
                        width={50}
                        height={50}
                      />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <p>{variant.product_variant_color}</p>
                  </HoverCardContent>
                </HoverCard>
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
          <h3 className="text-sm font-semibold">Available Stock:</h3>
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

        <div className="mt-4 flex items-center gap-4">
          <h3 className="text-sm font-semibold">Quantity:</h3>
          <div className="flex items-center  gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                if (quantity > 1) setQuantity(quantity - 1);
              }}
            >
              -
            </Button>
            <span className="min-w-[32px] text-center">{quantity}</span>
            <Button
              variant="ghost"
              onClick={() => {
                const selectedVariant = variantInfo.variant_sizes.find(
                  (variant) => variant.variant_size_value === selectedSize
                );
                if (
                  selectedVariant &&
                  quantity < selectedVariant.variant_size_quantity
                ) {
                  setQuantity(quantity + 1);
                }
              }}
            >
              +
            </Button>
          </div>
        </div>

        <Button
          className="mt-4 w-full"
          disabled={isLoading}
          onClick={handleAddToCart}
        >
          {isLoading ? "Adding..." : "+ Add to Cart"}
        </Button>

        <Button
          className="mt-4 w-full"
          variant="secondary"
          disabled={isLoading}
          onClick={handleProceedToCheckout}
        >
          {" "}
          Proceed to Checkout
        </Button>

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

export default ProductSlugPublicPage;
