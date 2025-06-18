"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCartStore } from "@/lib/store";
import useUserDataStore from "@/lib/userDataStore";
import { paymentService } from "@/services/payment";
import {
  AddressCreateFormData,
  CheckoutFormData,
  paymentSchema,
} from "@/utils/schema";
import { Product } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  ArrowRight,
  Banknote,
  CreditCard,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShoppingBag,
  Smartphone,
  User,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type CheckOutNumberPageProps = {
  formattedAddress: AddressCreateFormData;
};

const CheckOutNumberPage = ({ formattedAddress }: CheckOutNumberPageProps) => {
  const params = useParams();
  const router = useRouter();
  const { cart } = useCartStore();
  const { userData } = useUserDataStore();

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

  const selectedProvince = watch("province");
  const selectedCity = watch("city");

  const totalAmount = useMemo(
    () =>
      cart.products.reduce<number>(
        (total: number, product: Product) =>
          total + product.product_price * product.product_quantity,
        0
      ),
    [cart.products]
  );

  useEffect(() => {
    if (cart.products.length > 0) {
      setValue("amount", totalAmount);
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
    }
  }, [cart, setValue]);

  const { data: provinces = [] } = useQuery({
    queryKey: ["provinces"],
    queryFn: async () => {
      const res = await axios.get("https://psgc.gitlab.io/api/provinces/");
      return res.data;
    },
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["cities", selectedProvince],
    queryFn: async () => {
      const res = await axios.get(
        `https://psgc.gitlab.io/api/provinces/${selectedProvince}/cities`
      );
      return res.data;
    },
    enabled: !!selectedProvince,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const { data: barangays = [] } = useQuery({
    queryKey: ["barangays", selectedCity],
    queryFn: async () => {
      const res = await axios.get(
        `https://psgc.gitlab.io/api/provinces/${selectedProvince}/barangays`
      );
      return res.data;
    },
    enabled: !!selectedCity,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
  });

  useEffect(() => {
    if (provinces.length > 0) {
      setValue("province", "");
    }
  }, [provinces, setValue]);

  useEffect(() => {
    if (cities.length > 0) {
      setValue("city", "");
      setValue("barangay", "");
    }
  }, [cities, setValue]);

  useEffect(() => {
    if (barangays.length > 0) {
      setValue("barangay", "");
    }
  }, [barangays, setValue]);

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      const { ...rest } = data;

      const res = await paymentService.create({
        ...rest,
        productVariant: cart.products.map((variant) => ({
          product_variant_id: variant.product_variant_id,
          product_variant_quantity: variant.product_quantity,
          product_variant_price: variant.product_price,
          product_variant_size: variant.product_size,
          product_variant_color: variant.product_variant_color,
        })),
      });

      if (!userData) {
        localStorage.removeItem("cart");
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

  return (
    <div className="min-h-screen pt-24">
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-100 ">
        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Secure Checkout
                  </h1>
                  <p className="text-sm text-gray-600">
                    Complete your purchase safely
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left Section: Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contact Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Contact Information
                      </h2>
                      <p className="text-sm text-gray-600">
                        We&apos;ll use this to send you order updates
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        {...register("email", { required: true })}
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-black"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="firstName"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        First Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          {...register("firstName", { required: true })}
                          type="text"
                          placeholder="John"
                          className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-black"
                        />
                      </div>
                    </div>
                    <div>
                      <Label
                        htmlFor="lastName"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Last Name
                      </Label>
                      <Input
                        {...register("lastName", { required: true })}
                        type="text"
                        placeholder="Doe"
                        className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-black"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Shipping Address
                      </h2>
                      <p className="text-sm text-gray-600">
                        Where should we deliver your order?
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <Label
                      htmlFor="address"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Street Address
                    </Label>
                    <Input
                      {...register("address", { required: true })}
                      type="text"
                      placeholder="123 Main Street, Apartment 4B"
                      className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl text-black"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="province"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Province
                    </Label>
                    <Controller
                      name="province"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <Select onValueChange={field.onChange}>
                          <SelectTrigger className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl text-black">
                            <SelectValue placeholder="Select Province" />
                          </SelectTrigger>
                          <SelectContent>
                            {provinces.map(
                              (province: { code: string; name: string }) => (
                                <SelectItem
                                  key={province.code}
                                  value={province.code}
                                >
                                  {province.name}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="city"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        City
                      </Label>
                      <Controller
                        name="city"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <Select onValueChange={field.onChange}>
                            <SelectTrigger className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl text-black">
                              <SelectValue placeholder="Select City" />
                            </SelectTrigger>
                            <SelectContent>
                              {cities.map(
                                (city: { code: string; name: string }) => (
                                  <SelectItem key={city.code} value={city.code}>
                                    {city.name}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="barangay"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Barangay
                      </Label>
                      <Controller
                        name="barangay"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <Select onValueChange={field.onChange}>
                            <SelectTrigger className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl text-black">
                              <SelectValue placeholder="Select Barangay" />
                            </SelectTrigger>
                            <SelectContent>
                              {barangays.map(
                                (barangay: { code: string; name: string }) => (
                                  <SelectItem
                                    key={barangay.code}
                                    value={barangay.code}
                                  >
                                    {barangay.name}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="postalCode"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Postal Code
                      </Label>
                      <Input
                        {...register("postalCode", { required: true })}
                        type="text"
                        placeholder="1234"
                        className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl text-black"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="phone"
                        className="text-sm font-medium text-gray-700 mb-2 block"
                      >
                        Phone Number
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">+63</span>
                        </div>
                        <Input
                          {...register("phone", { required: true })}
                          type="text"
                          placeholder="9123456789"
                          className="pl-16 h-12 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-xl text-black"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Shield className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          Secure Payment
                        </h2>
                        <p className="text-sm text-gray-600">
                          Your payment information is encrypted and secure
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-1 bg-blue-100 rounded-md">
                        <Shield className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        PayMongo Secure Checkout
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      After clicking &quot;Complete Order&quot;, you&apos;ll be
                      redirected to our secure payment partner to safely
                      complete your transaction.
                    </p>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Accepted Payment Methods
                    </h3>

                    {/* Credit Cards */}
                    <div className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-gray-900">
                            Credit & Debit Cards
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <div className="bg-white border border-gray-200 rounded-lg p-2 hover:shadow-sm transition-shadow">
                          <Image
                            src="/assets/banks/Visa.svg"
                            alt="Visa"
                            width={32}
                            height={32}
                          />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-2 hover:shadow-sm transition-shadow">
                          <Image
                            src="/assets/banks/mc-logo-52.svg"
                            alt="Mastercard"
                            width={32}
                            height={32}
                          />
                        </div>
                      </div>
                    </div>

                    {/* E-Wallets */}
                    <div className="p-4 border border-gray-200 rounded-xl hover:border-green-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Smartphone className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-gray-900">
                            Digital Wallets
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <div className="bg-white border border-gray-200 rounded-lg p-2 hover:shadow-sm transition-shadow">
                          <Image
                            src="/assets/banks/gcash.svg"
                            alt="GCash"
                            width={32}
                            height={32}
                          />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-2 hover:shadow-sm transition-shadow">
                          <Image
                            src="/assets/banks/grabpay.svg"
                            alt="GrabPay"
                            width={32}
                            height={32}
                          />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-2 hover:shadow-sm transition-shadow">
                          <Image
                            src="/assets/banks/Maya_logo.svg"
                            alt="Maya"
                            width={32}
                            height={32}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Online Banking */}
                    <div className="p-4 border border-gray-200 rounded-xl hover:border-purple-300 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Banknote className="w-5 h-5 text-purple-600" />
                          <span className="font-medium text-gray-900">
                            Online Banking
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <div className="bg-white border border-gray-200 rounded-lg p-2 hover:shadow-sm transition-shadow">
                          <Image
                            src="/assets/banks/LOGO_BPI.svg"
                            alt="BPI"
                            width={32}
                            height={32}
                          />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-2 hover:shadow-sm transition-shadow">
                          <Image
                            src="/assets/banks/UB svg.svg"
                            alt="UnionBank"
                            width={32}
                            height={32}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-32">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <ShoppingBag className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Order Summary
                      </h2>
                      <p className="text-sm text-gray-600">
                        {cart.products.length} item(s)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                  {cart.products.map((product) => (
                    <div key={product.product_id} className="group">
                      <div className="flex items-start space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="relative flex-shrink-0">
                          <Image
                            src={
                              product.product_variant_image ||
                              "/assets/model/QR_59794.jpg"
                            }
                            alt={product.product_name}
                            width={64}
                            height={64}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                            {product.product_quantity}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm uppercase tracking-wide truncate">
                            {product.product_name}
                          </h3>
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>Size: {product.product_size}</span>
                              <span>•</span>
                              <span>{product.product_variant_color}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Qty: {product.product_quantity}
                              </span>
                              <span className="font-semibold text-gray-900">
                                ₱
                                {(
                                  product.product_price *
                                  product.product_quantity
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 p-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      ₱{totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Billing Address</span>
                    <span className="text-green-600 font-medium">
                      Calculated at next step
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-gray-900">
                        ₱{totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Button
                    type="submit"
                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-3">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <span>Complete Order</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckOutNumberPage;
