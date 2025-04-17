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
import { Trash } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { IoBagOutline } from "react-icons/io5";
import { toast } from "sonner";

const ShoppingCartModal = () => {
  const { cart, setCart } = useCartStore();
  const { userData } = useUserDataStore();
  const router = useRouter();
  const pathname = usePathname();

  const generateCheckoutNumber = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  useEffect(() => {
    const fetchCart = async () => {
      if (!userData) {
        const storedCart = localStorage.getItem("shoppingCart");
        if (storedCart) {
          setCart(JSON.parse(storedCart));
        }
      } else {
        const response = await cartService.get();

        if (!response.json) {
          toast.error("Error fetching cart");
          return;
        }

        const cartData = await response.json();

        setCart(cartData);
      }
    };

    fetchCart();
  }, []);

  useEffect(() => {
    if (cart || !userData) {
      localStorage.setItem("shoppingCart", JSON.stringify(cart));
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
          count:
            cart.count -
            (cart.products.find((item) => item.cart_id === id)
              ?.product_quantity ?? 0),
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

  const handleCheckout = async () => {
    const checkoutNumber = generateCheckoutNumber();

    if (!userData) {
      await authService.createCheckoutToken(checkoutNumber);
    }

    if (!checkoutNumber) {
      toast.error("Error generating checkout number");
      return;
    }
    router.push(`/checkout/cn/${checkoutNumber}`);
  };

  return (
    <Sheet>
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
                key={item.product_id}
                className="p-4 shadow-sm gap-2 flex w-full items-center"
              >
                <Image
                  src={
                    item.product_variant_image || "/assets/model/QR_59794.jpg"
                  }
                  alt={item.product_name}
                  width={120}
                  height={120}
                  className="w-20 h-20 rounded-md object-contain"
                />
                <div className="w-full">
                  <div className="w-full flex justify-between items-start">
                    <h3 className="text-md font-medium">{item.product_name}</h3>
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
                      Size: {item.product_variant_size}
                    </p>
                    <p className="text-sm text-gray-500">
                      Color: {item.product_variant_color}
                    </p>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.product_quantity}
                    </p>
                    <p className="text-sm text-gray-500">
                      Price: ₱ {item.product_price * item.product_quantity}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {cart?.products?.length > 0 && (
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleCheckout}
              className="w-full "
              variant="default"
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ShoppingCartModal;
