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
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Badge } from "../ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { ScrollArea } from "../ui/scroll-area";

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
  const sizeOrder = ["S", "M", "L", "XL", "XXL"];
  const allImages = variantInfo.variant_sample_images || [];

  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [selectedImage, setSelectedImage] = useState(
    allImages?.[0]?.variant_sample_image_image_url || "/placeholder.png"
  );

  const router = useRouter();

  const isSoldOut = useMemo(
    () =>
      variantInfo.variant_sizes.every(
        (size) => size.variant_size_quantity === 0
      ),
    [variantInfo.variant_sizes]
  );

  const handleAddToCart = async () => {
    try {
      if (isSoldOut) {
        toast.error("This product is sold out.");
        return;
      }

      if (!variantInfo || !selectedSize) {
        toast.error("Please select a size before adding to cart.");
        return;
      }

      setIsLoading(true);

      const selectedSizeData = variantInfo.variant_sizes.find(
        (s) => s.variant_size_value === selectedSize
      );

      if (!selectedSizeData || selectedSizeData.variant_size_quantity <= 0) {
        toast.error("Selected size is out of stock.");
        return;
      }

      const cartId = uuidv4();
      const cartItem = {
        cart_id: cartId,
        product_id: variantInfo.product_variant_product_id,
        product_name: product.product_name,
        product_price: product.product_price,
        product_quantity: quantity,
        product_size: selectedSize,
        product_variant_id: variantInfo.product_variant_id,
        product_variant_color: variantInfo.product_variant_color,
        product_variant_quantity: selectedSizeData.variant_size_quantity,
        product_variant_image:
          variantInfo?.variant_sample_images[0]
            ?.variant_sample_image_image_url ?? "",
        cart_is_checked_out: false,
        product_variant_size: selectedSize,
      };

      const existingItemIndex = cart.products.findIndex(
        (item) =>
          item.product_variant_id === cartItem.product_variant_id &&
          item.product_size === cartItem.product_size
      );

      const existingQuantity =
        existingItemIndex !== -1
          ? cart.products[existingItemIndex].product_quantity
          : 0;

      const maxStock = selectedSizeData.variant_size_quantity;

      if (existingQuantity + quantity > maxStock) {
        toast.error(
          `Cannot add more than ${maxStock} items for size ${selectedSize}.`
        );
        return;
      }

      if (!userData) {
        if (existingItemIndex !== -1) {
          cart.products[existingItemIndex].product_quantity =
            quantity + existingQuantity;
        } else {
          cart.products.push({
            ...cartItem,
            product_quantity: quantity + existingQuantity,
            product_variant_size: selectedSize,
          });
          cart.count = cart.count + 1;
        }

        localStorage.setItem("shoppingCart", JSON.stringify(cart));
        addToCart({ ...cartItem, product_variant_size: selectedSize });
      } else {
        const created = await cartService.create(cartItem);

        if (existingItemIndex !== -1) {
          cart.products[existingItemIndex].product_quantity =
            quantity + existingQuantity;
        } else {
          cart.products.push({
            ...cartItem,
            cart_id: created.cart_id,
            product_variant_size: selectedSize,
          });
          cart.count = cart.count + 1;
        }

        addToCart({
          ...cartItem,
          cart_id: created.cart_id,
        });
      }

      toast.success("Added to cart successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error adding to cart."
      );
    } finally {
      setIsLoading(false);
    }
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
        addToCart({ ...cartItem, cart_is_checked_out: true });

        await authService.createCheckoutToken(checkoutNumber);
      } else {
        const created = await cartService.create({ ...cartItem });
        addToCart({
          ...cartItem,
          cart_id: created.cart_id,
          cart_is_checked_out: true,
        });
        await authService.createCheckoutToken(checkoutNumber);
      }

      await authService.createCheckoutToken(checkoutNumber);

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
          {isSoldOut && (
            <Badge className="absolute top-2 right-2 bg-gray-500 text-xs px-2 py-1 rounded text-white">
              Sold Out
            </Badge>
          )}
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
            {variantInfo.variant_sizes
              .sort(
                (a, b) =>
                  sizeOrder.indexOf(a.variant_size_value) -
                  sizeOrder.indexOf(b.variant_size_value)
              )
              .map((variant) => (
                <Button
                  key={variant.variant_size_id}
                  disabled={variant.variant_size_quantity === 0}
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
        {!isSoldOut && (
          <>
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
          </>
        )}

        {/* Expandable Sections */}
        <Accordion type="single" collapsible className="mt-6">
          <AccordionItem value="description">
            <AccordionTrigger>Description</AccordionTrigger>
            <AccordionContent>
              {product.product_description || "No description available."}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="size-guide">
            <AccordionTrigger>Size Guide</AccordionTrigger>
            <AccordionContent className="flex justify-center items-center">
              <Image
                src={product.product_size_guide_url || ""}
                alt="Size Guide"
                width={600}
                height={600}
              />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="shipping">
            <AccordionTrigger>Shipping</AccordionTrigger>
            <AccordionContent>Shipping details go here.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="returns">
            <AccordionTrigger>
              Noir Clothing Philippines Corporation Returns
            </AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-[400px] px-4 py-2 text-sm text-gray-700">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Returns Policy</h2>

                  <p>
                    <strong>
                      Noir Clothing Philippines Corporation Returns Policy
                    </strong>
                  </p>

                  <p>
                    Original receipt of purchase is needed for product
                    exchange/refund within 7 days after purchase date, provided
                    that the product is purchased from any NOIR Philippines
                    physical store. For items purchased through the official
                    NOIR online store, the packing list and return form are
                    required to be presented within 30 days after receipt of
                    shipment confirmation email.
                  </p>

                  <p>
                    Products purchased with a coupon may be exchanged/refunded.
                    The amount to be refunded will be the total amount of the
                    transaction for refund less the coupon price. The coupon is
                    only for one-time use and will be forfeited once redeemed.
                    Coupon will be revived only if the item to be refunded is
                    damaged, defective, or faulty.
                  </p>

                  <p>
                    Refund can only be processed in the same store where the
                    item(s) were bought, including online orders settled using
                    the Pay In Store method.
                  </p>

                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Refund for products purchased in the official NOIR online
                      store, which are paid through the website, will be
                      processed through our Online Store warehouse. Please see
                      here for the Online Order Return Process.
                    </li>
                    <li>
                      Customers will be refunded based on their original mode of
                      payment.
                    </li>
                  </ul>

                  <p>
                    Product exchange can be processed in any of our NOIR
                    Philippines physical stores except for special sizes or
                    products exclusive to the NOIR online store. For exchange of
                    items purchased in the official NOIR online store, please
                    bring the products along with the packing list, items with
                    price tags, and return form to any NOIR Philippines physical
                    store. There is no online processing for product exchange.
                  </p>

                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      If the requested size or product to be exchanged is not
                      available in the physical store (i.e., special sizes,
                      online-exclusive products), exchange will not be allowed
                      but a refund can be processed using the Online Order
                      Return Process.
                    </li>
                    <li>
                      Customer may exchange the same product for a different
                      size, color, or a completely different product of equal or
                      greater value. If the exchanged product has a higher
                      price, the customer may pay the price difference.
                    </li>
                  </ul>

                  <p>
                    Products which are discounted at the time of purchase may be
                    exchanged/refunded based on the net amount of the purchased
                    item appearing on the receipt.
                  </p>

                  <p>
                    Products purchased through bulk order are not eligible for
                    return and exchange.
                  </p>

                  <p>
                    Products must be new and in their original condition and
                    with attached labels and price tags to be eligible under
                    this Return Policy. However, if products are found to be
                    defective or have manufacturing faults, they will still be
                    eligible for refund/exchange as an exemption to the policy.
                  </p>

                  <p>
                    Products that have been sent for alteration cannot be
                    returned or exchanged.
                  </p>

                  <p>
                    <strong>
                      Noir Clothing Philippines Corporation reserves the right
                      to:
                    </strong>
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Define and limit, refuse, and/or reject returns from
                      customers
                    </li>
                    <li>
                      Delete or freeze customer accounts at any time due to:
                    </li>
                    <ul className="list-[circle] pl-6 space-y-1">
                      <li>
                        Irregular or excessive returns history involving worn,
                        altered, laundered, damaged, or missing tags
                      </li>
                      <li>Purchases made for resale purposes</li>
                      <li>Creation of multiple account IDs by one user</li>
                      <li>Potential fraudulent or criminal activity</li>
                    </ul>
                  </ul>

                  <p>
                    Refund & Exchange conditions may be subject to Local
                    Government Unit (LGU) restrictions in relation to health and
                    safety protocols.
                  </p>
                </div>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default ProductSlugPublicPage;
