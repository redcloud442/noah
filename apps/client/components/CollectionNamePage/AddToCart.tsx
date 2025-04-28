import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/lib/store";
import useUserDataStore from "@/lib/userDataStore";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth";
import { cartService } from "@/services/cart";
import { ProductType, ProductVariantType } from "@/utils/types";
import { product_table } from "@prisma/client";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export const VariantSelectionToast = ({
  closeToast,
  selectedVariant,
  product,
  referralCode,
}: {
  selectedVariant: ProductVariantType;
  product: ProductType;
  closeToast: () => void;
  referralCode?: string;
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

  const selectedSizeData = selectedVariant.variant_sizes.find(
    (s) => s.variant_size_value === selectedSize
  );

  const isSoldOut = selectedSizeData?.variant_size_quantity === 0;

  const handleProceedToCheckout = async () => {
    const checkoutNumber = generateCheckoutNumber();

    await authService.createCheckoutToken(checkoutNumber, referralCode);

    router.push(`/checkout/cn/${checkoutNumber}`);
    closeToast();
  };

  const handleChangeSize = (size: string) => {
    setSelectedSize(size);

    const selectedSizeData = selectedVariant.variant_sizes.find(
      (s) => s.variant_size_value === size
    );

    if (selectedSizeData && quantity > selectedSizeData.variant_size_quantity) {
      setQuantity(selectedSizeData.variant_size_quantity);
    }
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
      product_size: selectedSize,
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
        <div className="bg-white text-black p-6 shadow-xl border rounded-none border-gray-200 w-full">
          <h1 className="text-base font-semibold text-green-800 pb-2">
            Added to cart successfully!
          </h1>
          <div className="flex justify-start gap-2 items-center">
            <div className="w-20 h-20 overflow-hidden relative">
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
    <div className="p-6 border bg-white shadow-lg w-full max-w-2xl text-black min-h-[500px]">
      <h4 className="font-bold text-lg uppercase">
        {product.product_name} - {selectedVariant?.product_variant_color}
      </h4>
      <div className="mt-4 relative">
        {isSoldOut && (
          <Badge className="absolute inset-0 top-2 right-2 bg-black/50 flex items-center justify-center">
            Sold Out
          </Badge>
        )}
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
      <p className="text-sm text-gray-600 text-center">
        {selectedSizeData
          ? `${selectedSizeData.variant_size_quantity} left`
          : null}
      </p>

      <div className="mt-2 flex justify-center items-center flex-wrap gap-2">
        {selectedVariant?.variant_sizes.map((variant) => (
          <Button
            key={variant.variant_size_id}
            onClick={() => handleChangeSize(variant.variant_size_value)}
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
          disabled={isSoldOut}
          onClick={() => handleAddQuantity("subtract")}
        >
          <Minus />
        </Button>

        <p>{quantity}</p>

        <Button
          variant="ghost"
          size="icon"
          disabled={isSoldOut}
          onClick={() => handleAddQuantity("add")}
        >
          <Plus />
        </Button>
      </div>

      <div className="mt-6">
        <Button
          onClick={handleAddToCart}
          disabled={isSoldOut}
          className="bg-black text-white w-full hover:bg-gray-800"
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export const VariantTypeSelectionToast = ({
  closeToast,
  selectedVariant,
  product,
  referralCode,
}: {
  selectedVariant: ProductVariantType;
  product: product_table;
  referralCode?: string;
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

  const selectedSizeData = selectedVariant.variant_sizes.find(
    (s) => s.variant_size_value === selectedSize
  );

  const isSoldOut = selectedSizeData?.variant_size_quantity === 0;

  const handleProceedToCheckout = async () => {
    const checkoutNumber = generateCheckoutNumber();

    await authService.createCheckoutToken(checkoutNumber, referralCode);

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
      product_size: selectedSize,
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
        <div className="bg-white text-black p-6 shadow-xl border border-gray-200 w-full">
          <h1 className="text-base font-semibold text-green-800 pb-2">
            Added to cart successfully!
          </h1>
          <div className="flex justify-start gap-2 items-center">
            <div className="w-20 h-20 rounded-md overflow-hidden relative">
              <Image
                src={cartItem.product_variant_image}
                alt={product.product_name}
                width={100}
                height={100}
                className="w-full h-full rounded-md object-contain"
              />
            </div>

            <div className="flex flex-col">
              <p className="text-sm text-gray-600 uppercase">
                {product.product_name} - {selectedVariant.product_variant_color}
              </p>
              <p className="text-sm text-gray-600">Size: {selectedSize}</p>
              <p className="text-sm text-gray-600">Quantity: {quantity}</p>
            </div>
          </div>

          <div className="flex justify-between gap-3 mt-4">
            <Button
              variant="outline"
              className="w-full bg-white text-black hover:bg-gray-100"
              onClick={() => {
                router.push(
                  `/cart${referralCode ? `?REFERRAL_CODE=${referralCode}` : ""}`
                );
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

  const handleChangeSize = (size: string) => {
    setSelectedSize(size);

    const selectedSizeData = selectedVariant.variant_sizes.find(
      (s) => s.variant_size_value === size
    );

    if (selectedSizeData && quantity > selectedSizeData.variant_size_quantity) {
      setQuantity(selectedSizeData.variant_size_quantity);
    }
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
    <div className="p-6 border bg-white shadow-lg w-full max-w-2xl text-black min-h-[500px]">
      <h4 className="font-bold text-lg uppercase">
        {product.product_name} - {selectedVariant?.product_variant_color}
      </h4>
      <div className="mt-4 relative">
        {isSoldOut && (
          <Badge className="absolute inset-0 top-2 right-2 bg-black/50 flex items-center justify-center">
            Sold Out
          </Badge>
        )}
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

      <div className="flex justify-center items-center w-full gap-2 mt-4">
        <p className="text-sm text-gray-600">
          {selectedSizeData
            ? `${selectedSizeData.variant_size_quantity} left`
            : null}
        </p>
      </div>

      <div className="mt-2 flex justify-center items-center flex-wrap gap-2">
        {selectedVariant?.variant_sizes.map((variant) => (
          <Button
            key={variant.variant_size_id}
            onClick={() => handleChangeSize(variant.variant_size_value)}
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
          disabled={isSoldOut}
          onClick={() => handleAddQuantity("subtract")}
        >
          <Minus />
        </Button>

        <p>{quantity}</p>

        <Button
          variant="ghost"
          size="icon"
          disabled={isSoldOut}
          onClick={() => handleAddQuantity("add")}
        >
          <Plus />
        </Button>
      </div>

      <div className="mt-6">
        <Button
          onClick={handleAddToCart}
          disabled={isSoldOut}
          className="bg-black text-white w-full hover:bg-gray-800"
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
};
