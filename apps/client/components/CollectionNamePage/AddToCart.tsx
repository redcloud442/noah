import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/lib/store";
import useUserDataStore from "@/lib/userDataStore";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth";
import { cartService } from "@/services/cart";
import { ProductType, ProductVariantType } from "@/utils/types";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Button } from "../ui/button";
// Toast component

export const VariantSelectionToast = ({
  closeToast,
  selectedVariant,
  product,
}: {
  selectedVariant: ProductVariantType;
  product: ProductType;
  closeToast: () => void;
}) => {
  const router = useRouter();

  const generateCheckoutNumber = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
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
    if (!selectedVariant || !selectedSize) {
      toaster({
        title: "Please select a size before adding to cart.",
        variant: "destructive",
      });
      return;
    }

    const selectedSizeData = selectedVariant.variant_sizes.find(
      (s) => s.variant_size_value === selectedSize
    );

    if (!selectedSizeData || selectedSizeData.variant_size_quantity <= 0) {
      toaster({
        title: "Selected size is out of stock.",
        variant: "destructive",
      });
      return;
    }

    const cartItem = {
      cart_id: uuidv4(),
      product_id: selectedVariant.product_variant_product_id,
      product_name: product.product_name,
      product_price: product.product_price,
      product_quantity: quantity,
      product_variant_id: selectedVariant.product_variant_id,
      product_variant_size: selectedSize,
      product_variant_color: selectedVariant.product_variant_color,
      product_variant_quantity: selectedSizeData.variant_size_quantity,
      product_variant_image:
        selectedVariant?.variant_sample_images[0]
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

    closeToast();

    toast.custom(
      () => (
        <div className="bg-white text-black p-6 rounded-lg shadow-xl border border-gray-200 w-full">
          <h1 className="text-base font-semibold text-green-800 pb-2">
            Added to cart successfully!
          </h1>
          <div className="flex justify-start gap-2 items-center">
            <div className="w-20 h-20 rounded-md overflow-hidden">
              <Image
                src={cartItem.product_variant_image}
                alt={product.product_name}
                width={100}
                height={100}
                className="w-full h-full rounded-md object-contain"
              />
            </div>

            <div className="flex flex-col">
              <p className="text-sm text-gray-600">{product.product_name}</p>
              <p className="text-sm text-gray-600">Size: {selectedSize}</p>
              <p className="text-sm text-gray-600">Quantity: {quantity}</p>
            </div>
          </div>

          <div className="flex justify-between gap-3 mt-4">
            <Button
              variant="outline"
              className="w-full bg-white text-black hover:bg-gray-100"
              onClick={() => {
                router.push("/cart");
                closeToast();
              }}
            >
              View Cart
            </Button>

            <Button
              variant="default"
              className="w-full bg-black text-white hover:bg-gray-800"
              onClick={handleProceedToCheckout}
            >
              Checkout
            </Button>
          </div>
        </div>
      ),
      { duration: 8000 }
    );
  };

  const handleAddQuantity = (variant: "add" | "subtract") => {
    const selectedSizeData = selectedVariant.variant_sizes.find(
      (s) => s.variant_size_value === selectedSize
    );

    if (!selectedSizeData) {
      toaster({
        title: "Please select a size before adjusting quantity.",
        variant: "destructive",
      });
      return;
    }

    if (variant === "add") {
      if (quantity >= selectedSizeData.variant_size_quantity) {
        toaster({
          title: "Maximum stock reached for this size.",
          variant: "destructive",
        });
        return;
      }
      setQuantity(quantity + 1);
    } else {
      if (quantity <= 1) {
        toaster({
          title: "Minimum quantity is 1.",
          variant: "destructive",
        });
        return;
      }
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="p-6 border bg-white rounded-lg shadow-lg w-full max-w-2xl text-black min-h-[500px]">
      <h4 className="font-bold text-lg">
        {product.product_name} - {selectedVariant?.product_variant_color}
      </h4>
      <div className="mt-4">
        <Image
          src={
            selectedVariant?.variant_sample_images[0]
              ?.variant_sample_image_image_url ?? "/assets/model/QR_59794.jpg"
          }
          alt={product.product_name}
          width={300}
          height={300}
          className="w-full min-h-[300px] h-[300px] object-contain"
        />
      </div>

      <p className="mt-4 font-semibold">Available Sizes:</p>

      <div className="mt-2 flex justify-center items-center flex-wrap gap-2">
        {selectedVariant?.variant_sizes.map((variant) => (
          <Button
            key={variant.variant_size_id}
            onClick={() => setSelectedSize(variant.variant_size_value)}
            className={cn(
              "text-sm px-4 py-2 bg-white text-black ring-1 ring-gray-300",
              selectedSize === variant.variant_size_value &&
                "ring-2 ring-green-500"
            )}
          >
            {variant.variant_size_value}
          </Button>
        ))}
      </div>

      <div className="flex justify-center items-center w-full gap-2 mt-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleAddQuantity("subtract")}
        >
          <Minus />
        </Button>

        <p>{quantity}</p>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleAddQuantity("add")}
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
