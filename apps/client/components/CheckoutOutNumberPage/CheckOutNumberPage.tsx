"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Cart, useCartStore } from "@/lib/store";
import useUserDataStore from "@/lib/userDataStore";
import { cartService } from "@/services/cart";
import { paymentService } from "@/services/payment";
import {
  AddressCreateFormData,
  CheckoutFormData,
  paymentSchema,
} from "@/utils/schema";
import { Product } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Banknote, CreditCard, Loader2, Smartphone, Trash } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import PolicyModal from "../PolicyModal/PolicyModal";
import ReturnPolicyPage from "../ReturnPolicyPage/ReturnPolicyPage";
import TermsOfServicePage from "../TermsOfService/TermsOfServicePage";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Skeleton } from "../ui/skeleton";

type CheckOutNumberPageProps = {
  formattedAddress: AddressCreateFormData;
};

const CheckOutNumberPage = ({ formattedAddress }: CheckOutNumberPageProps) => {
  const params = useParams();
  const router = useRouter();
  const { cart } = useCartStore();
  const { userData } = useUserDataStore();
  const [cartToBeCheckedOut, setCartToBeCheckedOut] = useState<Cart>({
    products: [],
    count: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      email: formattedAddress.email,
      firstName: formattedAddress.firstName,
      lastName: formattedAddress.lastName,
      address: formattedAddress.address,
      province: formattedAddress.province,
      city: formattedAddress.city,
      postalCode: formattedAddress.postalCode,
      phone: formattedAddress.phone,
      order_number: params.checkoutNumber as string,
    },
  });

  const handleRemoveItem = async (cartId: string) => {
    const previousCart = cartToBeCheckedOut;
    setCartToBeCheckedOut((prev) => ({
      ...prev,
      products: prev.products.filter((item) => item.cart_id !== cartId),
      count: prev.count - 1,
    }));

    try {
      if (userData) {
        await cartService.delete(cartId);
      } else {
        const res = localStorage.getItem("shoppingCart");
        if (res) {
          const cart = JSON.parse(res);
          const updatedCart = {
            ...cart,
            products: cart.products.filter(
              (item: Product) => item.cart_id !== cartId
            ),
            count: cart.count - 1,
          };
          localStorage.setItem("shoppingCart", JSON.stringify(updatedCart));
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error deleting item"
      );
      setCartToBeCheckedOut(previousCart);
    }
  };

  const [provices, setProvices] = useState<
    {
      code: string;
      name: string;
      regionName: string;
      islandGroupCode: string;
    }[]
  >([]);

  const [cities, setCities] = useState<
    { code: string; name: string; province_code: string }[]
  >([]);
  const [barangays, setBarangays] = useState<
    { code: string; name: string; city_code: string }[]
  >([]);

  const selectedProvince = watch("province");
  const selectedCity = watch("city");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        if (userData) {
          const cart = await cartService.checkedOut();
          setCartToBeCheckedOut(cart);
        } else {
          const res = localStorage.getItem("shoppingCart");
          if (res) {
            const cart = JSON.parse(res);

            cart.products = cart.products.filter(
              (product: Product) => product.cart_is_checked_out
            );

            setCartToBeCheckedOut(cart);
          }
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [userData, cart]);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await axios.get("https://psgc.gitlab.io/api/provinces/");

        setProvices(res.data);

        if (formattedAddress.province) {
          const provinceData = res.data.find(
            (p: { name: string }) => p.name === formattedAddress.province
          );
          if (provinceData) {
            setValue("province", provinceData.code);
          }
        }
      } catch (error) {
        console.error("Error fetching regions:", error);
      }
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      const fetchCities = async () => {
        try {
          const res = await axios.get(
            `https://psgc.gitlab.io/api/provinces/${selectedProvince}/cities`
          );
          setCities(res.data);
          setValue("city", "");
          setValue("barangay", "");
        } catch (error) {
          console.error("Error fetching cities:", error);
        }
      };
      fetchCities();
    }
  }, [selectedProvince, setValue]);

  useEffect(() => {
    if (selectedCity) {
      const fetchBarangays = async () => {
        try {
          const res = await axios.get(
            `https://psgc.gitlab.io/api/provinces/${selectedProvince}/barangays`
          );
          setBarangays(res.data);
          setValue("barangay", "");
        } catch (error) {
          console.error("Error fetching barangays:", error);
        }
      };
      fetchBarangays();
    }
  }, [selectedCity, setValue]);

  useEffect(() => {
    setValue(
      "amount",
      cart.products.reduce<number>(
        (total, product) =>
          total + product.product_price * product.product_quantity,
        0
      )
    );
    setValue(
      "productVariant",
      cart.products.map((product) => ({
        product_variant_id: product.product_variant_id,
        product_variant_quantity: product.product_quantity,
        product_variant_price: product.product_price,
        product_variant_size: product.product_size,
        product_variant_color: product.product_variant_color,
      }))
    );
  }, [cart, setValue]);

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      const { ...rest } = data;

      const res = await paymentService.create({
        ...rest,
        productVariant: cartToBeCheckedOut.products.map((variant) => ({
          product_variant_id: variant.product_variant_id,
          product_variant_quantity: variant.product_quantity,
          product_variant_price: variant.product_price,
          product_variant_size: variant.product_size,
          product_variant_color: variant.product_variant_color,
        })),
      });

      if (!userData) {
        localStorage.removeItem("shoppingCart");
        setCartToBeCheckedOut({
          products: [],
          count: 0,
        });
      }

      if (res) {
        toast.success("Payment on process");

        router.push(`/payment/pn/${params.checkoutNumber}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error submitting payment");
      }
    }
  };

  const SubTotal = useMemo(() => {
    return cartToBeCheckedOut.products.reduce(
      (total, product) =>
        total + product.product_price * product.product_quantity,
      0
    );
  }, [cartToBeCheckedOut]);

  const Total = useMemo(() => {
    return cartToBeCheckedOut.products.reduce(
      (total, product) =>
        total + product.product_price * product.product_quantity,
      0
    );
  }, [cartToBeCheckedOut]);

  return (
    <div className="min-h-screen h-full mt-20 p-4 bg-gray-100 text-black">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-6xl mx-auto items-start grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* Left Section: Delivery, Shipping, Payment */}
        <div className="space-y-6 bg-white p-6 shadow-md rounded-md">
          <h1 className="text-2xl font-bold">Checkout</h1>

          {/* Delivery Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Delivery</h2>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                {...register("email", { required: true })}
                type="email"
                placeholder="Email"
              />
            </div>

            <div className="flex space-x-4">
              <div className="flex-1">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  {...register("firstName", { required: true })}
                  type="text"
                  placeholder="First name"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  {...register("lastName", { required: true })}
                  type="text"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                {...register("address", { required: true })}
                type="text"
                placeholder="Barangay / Apartment, Suite, etc."
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="w-full">
                <Label htmlFor="region">State / Province</Label>
                <Controller
                  name="province"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      defaultValue={formattedAddress.province}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provices.map((province) => (
                          <SelectItem key={province.code} value={province.code}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="flex justify-between gap-4">
                <div className="flex-1">
                  <Label htmlFor="city">City</Label>
                  <Controller
                    name="city"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                        defaultValue={formattedAddress.city}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="City" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.code} value={city.code}>
                              {city.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="barangay">Barangay</Label>
                  <Controller
                    name="barangay"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                        }}
                        defaultValue={formattedAddress.barangay}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Barangay" />
                        </SelectTrigger>
                        <SelectContent>
                          {barangays.map((barangay) => (
                            <SelectItem
                              key={barangay.code}
                              value={barangay.code}
                            >
                              {barangay.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <div className="flex-1">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  {...register("postalCode", { required: true })}
                  type="text"
                  placeholder="Postal Code"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">
                    +63
                  </span>
                  <Input
                    {...register("phone", { required: true })}
                    type="text"
                    placeholder="Phone"
                    maxLength={10}
                    className="pl-12" // Adjust padding to prevent overlap with +63
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Payment</h2>
            <p className="text-gray-700">
              All transactions are secure and encrypted.
            </p>

            {/* Secure Payment Section */}
            <div className="border rounded-md p-4">
              <h3 className="font-semibold">Secure Payments via PayMongo</h3>
              <p>
                After clicking &quot;Pay now&quot;, you will be redirected to
                securely complete your payment.
              </p>
            </div>

            {/* Accepted Payment Methods */}
            <div className="border rounded-md p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-3">
                Accepted Payment Methods
              </h3>

              {/* Credit/Debit Cards */}
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-blue-500" />
                <span className="text-gray-700 font-medium">
                  Credit / Debit Cards
                </span>
              </div>
              <div className="flex space-x-2 mt-2">
                <div className="border flex items-center justify-center rounded-md p-2">
                  <Image
                    src="/assets/banks/Visa.svg"
                    alt="Visa"
                    width={30}
                    height={30}
                  />
                </div>
                <div className="border rounded-md p-2">
                  <Image
                    src="/assets/banks/mc-logo-52.svg"
                    alt="Mastercard"
                    width={30}
                    height={30}
                  />
                </div>
              </div>

              {/* E-Wallets */}
              <div className="flex items-center space-x-3 mt-4">
                <Smartphone className="w-5 h-5 text-green-500" />
                <span className="text-gray-700 font-medium">E-Wallets</span>
              </div>
              <div className="flex space-x-2 mt-2">
                <div className="border rounded-md p-2">
                  <Image
                    src="/assets/banks/gcash.svg"
                    alt="GCash"
                    width={40}
                    height={40}
                  />
                </div>
                <div className="border rounded-md p-2">
                  <Image
                    src="/assets/banks/grabpay.svg"
                    alt="GrabPay"
                    width={40}
                    height={40}
                  />
                </div>
                <div className="border flex items-center justify-center rounded-md p-2">
                  <Image
                    src="/assets/banks/Maya_logo.svg"
                    alt="Maya"
                    width={40}
                    height={40}
                  />
                </div>
              </div>

              {/* Online Banking */}
              <div className="flex items-center space-x-3 mt-4">
                <Banknote className="w-5 h-5 text-gray-700" />
                <span className="text-gray-700 font-medium">
                  Online Banking
                </span>
              </div>
              <div className="flex space-x-2 mt-2">
                <div className="border flex items-center justify-center rounded-md p-2">
                  <Image
                    src="/assets/banks/LOGO_BPI.svg"
                    alt="BPI Online"
                    width={40}
                    height={40}
                  />
                </div>
                <div className="border flex items-center justify-center rounded-md p-2">
                  <Image
                    src="/assets/banks/UB svg.svg"
                    alt="UnionBank"
                    width={25}
                    height={25}
                  />
                </div>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="secondary"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
              </>
            ) : (
              "Pay Now"
            )}
          </Button>
          <div className="text-gray-500 text-sm text-center flex flex-col items-center gap-2">
            By clicking &quot;Pay Now&quot;, you agree to the{" "}
            <div className="flex gap-2">
              <PolicyModal
                title="Terms of Service"
                description="Noir Clothing Philippines Corporation"
                content={<TermsOfServicePage />}
              />{" "}
              And
              <PolicyModal
                title="Returns Policy"
                description="Noir Clothing Philippines Corporation"
                content={<ReturnPolicyPage />}
              />{" "}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow-md rounded-md space-y-4">
          <h2 className="text-xl font-semibold">Order Summary</h2>
          {isLoading ? (
            <>
              <Skeleton className="w-full bg-gray-200 h-[80px] rounded-md" />
              <Skeleton className="w-1/2 bg-gray-200 h-[80px] rounded-md" />
              <Skeleton className="w-1/3 bg-gray-200 h-[80px] rounded-md" />
            </>
          ) : (
            cartToBeCheckedOut.products.map((product) => (
              <div
                key={product.cart_id}
                className="flex items-center bg-white text-black gap-4 relative"
              >
                <div className="relative">
                  {/* Product Image */}
                  <Image
                    src={
                      product.product_variant_image ||
                      "/assets/model/QR_59794.jpg"
                    }
                    alt={product.product_name}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-contain rounded-xl"
                  />

                  {/* Quantity Badge */}
                  <div className="absolute -top-4 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {product.product_quantity}
                  </div>
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <p className="font-semibold text-lg uppercase">
                    {product.product_name} {product.product_variant_color}
                  </p>

                  <p className="text-gray-500 text-sm">
                    Size: {product.product_size}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Quantity: {product.product_quantity}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Color: {product.product_variant_color}
                  </p>
                  <p className="text-gray-700 font-bold">
                    ₱
                    {(
                      product.product_price * product.product_quantity
                    ).toLocaleString()}
                  </p>
                  <Button
                    className="absolute top-2 right-2"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveItem(product.cart_id)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₱{SubTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₱{Total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckOutNumberPage;
