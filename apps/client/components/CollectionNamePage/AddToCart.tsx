import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/lib/store";
import useUserDataStore from "@/lib/userDataStore";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth";
import { cartService } from "@/services/cart";
import {
  product_table,
  product_variant_table,
  variant_sample_image_table,
} from "@prisma/client";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Button } from "../ui/button";
// Toast component
export const VariantSelectionToast = ({
  product,
  availableVariants,
  closeToast,
}: {
  product: product_table;
  availableVariants: (product_variant_table & {
    variant_sample_image_product_variant: variant_sample_image_table;
  })[];
  closeToast: () => void;
}) => {
  const router = useRouter();

  const generateCheckoutNumber = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  const [selectedVariant, setSelectedVariant] = useState<
    | (product_variant_table & {
        variant_sample_image_product_variant: variant_sample_image_table;
      })
    | null
  >(null);
  const [quantity, setQuantity] = useState(1);
  const { userData } = useUserDataStore();
  const { cart, addToCart } = useCartStore();
  const { toast: toaster } = useToast();

  const handleProceedToCheckout = async () => {
    const checkoutNumber = generateCheckoutNumber();
    if (!userData) {
      await authService.createCheckoutToken(checkoutNumber);
    }

    router.push(`/checkout/cn/${checkoutNumber}`);
    closeToast();
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toaster({
        title: "Please select a variant before adding to cart.",
        description: "Please select a variant before adding to cart.",
        variant: "destructive",
      });
      return;
    }

    if (selectedVariant.product_variant_quantity <= 0) {
      toaster({
        title: "Selected variant is out of stock.",
        description: "Selected variant is out of stock.",
      });
      return;
    }

    if (!userData) {
      localStorage.setItem(
        "shoppingCart",
        JSON.stringify({
          products: [
            {
              cart_id: uuidv4(),
              product_id: product.product_id,
              product_name: product.product_name,
              product_price: product.product_price,
              product_quantity: quantity,
              product_variant_id: selectedVariant.product_variant_id,
              product_variant_size: selectedVariant.product_variant_size,
              product_variant_color: selectedVariant.product_variant_color,
              product_variant_quantity:
                selectedVariant.product_variant_quantity,
              product_variant_image:
                selectedVariant?.variant_sample_image_product_variant
                  ?.variant_sample_image_image_url ?? "",
            },
          ],
          count: cart.count + quantity,
        })
      );
      addToCart({
        cart_id: uuidv4(),
        product_id: product.product_id,
        product_name: product.product_name,
        product_price: product.product_price,
        product_quantity: quantity,
        product_variant_id: selectedVariant.product_variant_id,
        product_variant_size: selectedVariant.product_variant_size,
        product_variant_color: selectedVariant.product_variant_color,
        product_variant_quantity: selectedVariant.product_variant_quantity,
        product_variant_image:
          selectedVariant?.variant_sample_image_product_variant
            ?.variant_sample_image_image_url ?? "",
      });
    } else {
      const cart = await cartService.create({
        product_variant_id: selectedVariant.product_variant_id,
        product_quantity: quantity,
        product_variant_size: selectedVariant.product_variant_size,
        product_variant_color: selectedVariant.product_variant_color,
        product_variant_quantity: selectedVariant.product_variant_quantity,
        product_variant_image:
          selectedVariant?.variant_sample_image_product_variant
            ?.variant_sample_image_image_url ?? "",
        product_id: product.product_id,
        product_name: product.product_name,
        product_price: product.product_price,
      });
      addToCart({
        cart_id: cart.cart_id,
        product_variant_id: selectedVariant.product_variant_id,
        product_quantity: quantity,
        product_variant_size: selectedVariant.product_variant_size,
        product_variant_color: selectedVariant.product_variant_color,
        product_variant_quantity: selectedVariant.product_variant_quantity,
        product_variant_image:
          selectedVariant?.variant_sample_image_product_variant
            ?.variant_sample_image_image_url ?? "",
        product_id: product.product_id,
        product_name: product.product_name,
        product_price: product.product_price,
      });
    }

    closeToast();

    toast.custom(
      () => (
        <div
          className={`bg-white border-none text-black p-6 rounded-lg shadow-xl border border-gray-200  w-full`}
        >
          <h1 className="text-base font-semibold text-green-800 pb-2">
            Added to cart successfully!
          </h1>
          <div className="flex justify-start gap-2 items-center">
            <div className="w-20 h-20 rounded-md overflow-hidden">
              <Image
                src={
                  selectedVariant?.variant_sample_image_product_variant
                    ?.variant_sample_image_image_url ??
                  "/assets/model/QR_59794.jpg"
                }
                alt={product.product_name}
                width={100}
                height={100}
                className="w-full h-full rounded-md object-contain"
              />
            </div>

            <div className="flex flex-col">
              <p className="text-sm text-gray-600">{product.product_name}</p>
              <p className="text-sm text-gray-600">
                Size: {selectedVariant?.product_variant_size}
              </p>
              <p className="text-sm text-gray-600">
                Color: {selectedVariant?.product_variant_color}
              </p>
              <p className="text-sm text-gray-600">Quantity: {quantity}</p>
            </div>
          </div>

          <div className="flex justify-between gap-3 mt-4">
            <Button
              variant="outline"
              className="w-full bg-white text-black transition"
              onClick={() => {
                router.push("/cart");
                closeToast();
              }}
            >
              View Cart
            </Button>

            <Button
              variant="default"
              className="w-full bg-black text-white transition"
              onClick={handleProceedToCheckout}
            >
              Checkout
            </Button>
          </div>
        </div>
      ),
      {
        duration: 8000,
      }
    );
  };

  const handleAddQuantity = (
    variant: "add" | "subtract",
    selectedVariant: product_variant_table
  ) => {
    if (variant === "add") {
      if (selectedVariant?.product_variant_quantity <= quantity) {
        toaster({
          title: "Selected variant is out of stock.",
          description: "Selected variant is out of stock.",
          variant: "destructive",
        });
        return;
      }
      setQuantity(quantity + 1);
    } else {
      if (quantity <= 1) {
        toaster({
          title: "Quantity cannot be less than 1.",
          description: "Quantity cannot be less than 1.",
          variant: "destructive",
        });
        return;
      }
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="p-6 border bg-white border-none rounded-lg shadow-lg w-full max-w-2xl text-black min-h-[500px]">
      <h4 className="font-bold text-lg">{product.product_name}</h4>
      <div className="mt-4">
        <Image
          src={"/assets/model/QR_59794.jpg"}
          alt={
            selectedVariant?.product_variant_size ||
            "/assets/model/QR_59794.jpg"
          }
          width={300}
          height={300}
          className="w-full min-h-[300px] h-[300px] object-contain"
        />
      </div>

      <p className="mt-4 font-semibold">Available Variants:</p>

      <div className="mt-2 flex justify-center items-center flex-wrap gap-2">
        {availableVariants.map((variant) => (
          <Button
            key={variant.product_variant_id}
            className={cn(
              "text-sm px-4 py-2 bg-white text-black ring-1 ring-gray-300",
              selectedVariant?.product_variant_id === variant.product_variant_id
                ? "ring-2 ring-green-500"
                : ""
            )}
            onClick={() =>
              setSelectedVariant({
                ...variant,
                variant_sample_image_product_variant:
                  variant.variant_sample_image_product_variant,
              })
            }
          >
            {variant.product_variant_size}
          </Button>
        ))}
      </div>
      <div className="flex justify-center items-center w-full gap-2 mt-2">
        <Button
          variant={"ghost"}
          size={"icon"}
          onClick={() =>
            handleAddQuantity(
              "subtract",
              selectedVariant ?? availableVariants[0]
            )
          }
        >
          <Minus />
        </Button>

        <p>{quantity}</p>

        <Button
          size={"icon"}
          variant={"ghost"}
          onClick={() =>
            handleAddQuantity("add", selectedVariant ?? availableVariants[0])
          }
        >
          <Plus />
        </Button>
      </div>

      <div className="mt-6">
        <Button
          onClick={handleAddToCart}
          className="bg-black text-white w-full hover:bg-gray-800"
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
};
