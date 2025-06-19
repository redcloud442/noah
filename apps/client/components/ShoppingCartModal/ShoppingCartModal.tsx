import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCartStore } from "@/lib/store";
import useUserDataStore from "@/lib/userDataStore";
import { authService } from "@/services/auth";
import { cartService } from "@/services/cart";
import { Product } from "@/utils/types";
import { Loader2, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { IoBagOutline } from "react-icons/io5";
import { toast } from "sonner";

const ShoppingCartModal = () => {
  const [open, setOpen] = useState(false);

  const { cart, setCart } = useCartStore();
  const { userData } = useUserDataStore();
  const searchParams = useSearchParams();
  const REFERRAL_CODE = searchParams.get("REFERRAL_CODE") as string;
  const router = useRouter();
  const pathname = usePathname();
  const [currentStock, setCurrentStock] = useState<
    {
      variant_size_variant_id: string;
      variant_size_value: string;
      variant_size_quantity: number;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateCheckoutNumber = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  const fetchCartQuantity = async () => {
    try {
      if (cart.products.length === 0 || !open) return;
      const updatedCart = await cartService.getQuantity({
        items: cart.products.map((product) => ({
          product_variant_id: product.product_variant_id,
          product_variant_size: product.product_size ?? "",
        })),
      });
      setCurrentStock(updatedCart);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error fetching cart");
      }
    }
  };

  useEffect(() => {
    fetchCartQuantity();
  }, [cart, open]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        if (userData) {
          const cart = await cartService.get();
          setCart(cart);
        } else {
          const res = localStorage.getItem("shoppingCart");
          const response = res ? JSON.parse(res) : { products: [], count: 0 };

          setCart(response);
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Error fetching cart");
        }
      }
    };

    fetchCart();
  }, [userData]);

  useEffect(() => {
    if (cart && !userData) {
      localStorage.setItem("shoppingCart", JSON.stringify(cart));
    } else {
      localStorage.removeItem("shoppingCart");
    }
  }, [cart, userData]);

  const handleRemoveItem = async (id: string) => {
    try {
      if (!userData) {
        const storedCart = localStorage.getItem("shoppingCart");
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          parsedCart.products = parsedCart.products.filter(
            (item: Product) => item.cart_id !== id
          );
          localStorage.setItem("shoppingCart", JSON.stringify(parsedCart));
        }

        setCart({
          ...cart,
          products: cart.products.filter((item) => item.cart_id !== id),
          count: cart.count - 1,
        });
      } else {
        await cartService.delete(id);
        setCart({
          ...cart,
          products: cart.products.filter((item) => item.cart_id !== id),
          count:
            cart.count -
            (cart.products.find((item) => item.cart_id === id)
              ?.product_quantity ?? 0),
        });
      }

      toast.success("Item removed from cart");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error removing item from cart");
      }
    }
  };

  const handleCheckoutItems = async (cart_id: string[]) => {
    try {
      await cartService.checkout({ items: cart_id });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error checking out items"
      );
    }
  };
  const handleCheckout = async () => {
    try {
      if (hasInvalidProduct) {
        toast.error("Please check your cart for invalid products");
        return;
      }

      setIsLoading(true);

      if (userData) {
        const cartIds = cart.products.map((item) => item.cart_id);
        await handleCheckoutItems(cartIds);
      } else {
        const res = localStorage.getItem("shoppingCart");
        const existingCart = res ? JSON.parse(res) : { products: [], count: 0 };

        existingCart.products = existingCart.products.map(
          (product: Product) => ({
            ...product,
            cart_is_checked_out: true,
          })
        );

        localStorage.setItem("shoppingCart", JSON.stringify(existingCart));
      }

      const checkoutNumber = generateCheckoutNumber();

      await authService.createCheckoutToken(checkoutNumber);

      if (!checkoutNumber) {
        toast.error("Error generating checkout number");
        return;
      }

      setOpen(false);

      router.push(
        `/checkout/cn/${checkoutNumber}${REFERRAL_CODE ? `?REFERRAL_CODE=${REFERRAL_CODE}` : ""}`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error checking out items"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const hasInvalidProduct = cart.products.some((product) => {
    const stock = currentStock.find(
      (s) =>
        s.variant_size_variant_id === product.product_variant_id &&
        s.variant_size_value === product.product_size
    );
    if (!stock) return true;
    return product.product_quantity > stock.variant_size_quantity;
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {pathname !== "/cart" && pathname !== "/checkout" ? (
        <SheetTrigger>
          <div className="relative">
            <IoBagOutline className="w-6 h-6 cursor-pointer " />
            <div className="absolute -top-1 -right-3 bg-red-500 text-white rounded-full min-w-4 max-w-auto h-4 flex items-center justify-center">
              {cart.count ?? 0}
            </div>
          </div>
        </SheetTrigger>
      ) : (
        <IoBagOutline className="w-6 h-6 cursor-pointer " />
      )}

      <SheetContent className="w-[1000px] sm:w-[600px] p-4">
        <SheetHeader>
          <SheetTitle className="text-2xl font-semibold">
            Shopping Cart
          </SheetTitle>
          <SheetDescription className="text-gray-500">
            Review your items before proceeding to checkout.
          </SheetDescription>
        </SheetHeader>

        {cart?.products?.length === 0 ? (
          <p className="mt-6 text-center text-gray-600">
            Your cart is currently empty.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {cart?.products?.map((item) => (
              <Card
                key={item.cart_id}
                className="p-4 shadow-sm gap-2 flex w-full items-center"
              >
                <Image
                  src={
                    item.product_variant_image || "/assets/model/QR_59794.jpg"
                  }
                  alt={item.product_name}
                  width={150}
                  height={150}
                  className="w-32 h-32 rounded-md object-contain"
                />
                <div className="w-full">
                  <div className="w-full flex justify-between items-start">
                    <h3 className="text-md font-medium uppercase">
                      {item.product_name} - {item.product_variant_color}
                    </h3>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="p-2">
                          <Trash className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Item?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove{" "}
                            <strong>{item.product_name}</strong> from your cart?
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRemoveItem(item.cart_id)}
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <div className="grid grid-cols-1">
                    <p className="text-sm text-gray-500">
                      Size: {item.product_size}
                    </p>
                    <p className="text-sm text-gray-500">
                      Color: {item.product_variant_color}
                    </p>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.product_quantity}
                    </p>
                    <p className="text-sm text-gray-500">
                      Price: ₱{" "}
                      {(
                        item.product_price * item.product_quantity
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {cart?.products?.length > 0 && (
          <div className="mt-6 flex flex-col gap-2">
            <Link href="/cart">
              <Button variant="outline" className="w-full">
                View Cart
              </Button>
            </Link>

            <Button
              onClick={handleCheckout}
              disabled={hasInvalidProduct || isLoading}
              className="w-full "
              variant="default"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Proceed to Checkout"
              )}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ShoppingCartModal;
