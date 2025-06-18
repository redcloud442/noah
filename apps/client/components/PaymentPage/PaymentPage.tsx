"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { paymentService } from "@/services/payment";
import {
  cardPaymentSchema,
  PaymentCreatePaymentFormData,
} from "@/utils/schema";
import { order_table } from "@prisma/client";
import { AxiosError } from "axios";
import { Building2, Clock, CreditCard, Loader2, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type PaymentPageProps = {
  order: order_table;
};

const paymentMethods = {
  card: ["Visa", "Mastercard"],
  eWallet: ["GCash", "GrabPay", "PayMaya"],
  onlineBanking: ["BPI", "UnionBank"],
};

const PaymentPage = ({ order }: PaymentPageProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PaymentCreatePaymentFormData>();

  const paymentMethod = watch("payment_method");

  const onSubmit = async (data: PaymentCreatePaymentFormData) => {
    try {
      const payload = {
        order_number: data.order_number,
        payment_method: data.payment_method,
      } as const;

      if (data.payment_method === "card") {
        const cardPayload = {
          ...payload,
          payment_details: {
            card: data.payment_details.card,
          },
          payment_type: data.payment_type as "BPI" | "UnionBank",
        };
        const result = await paymentService.createPaymentMethod(cardPayload);

        if (result.data.nextAction.redirect.url) {
          router.push(result.data.nextAction.redirect.url);
        }
      } else if (data.payment_method === "e_wallet") {
        const eWalletPayload = {
          ...payload,
          payment_method: "e_wallet" as const,
          payment_type: data.payment_type as "GCash" | "GrabPay" | "PayMaya",
        };
        const result = await paymentService.createPaymentMethod(eWalletPayload);

        if (result.data.nextAction.redirect.url) {
          router.push(result.data.nextAction.redirect.url);
        }
      } else if (data.payment_method === "online_banking") {
        const bankingPayload = {
          ...payload,
          payment_method: "online_banking" as const,
          payment_type: data.payment_type as "BPI" | "UnionBank",
        };

        const result = await paymentService.createPaymentMethod(bankingPayload);
        if (result.data.nextAction.redirect.url) {
          router.push(result.data.nextAction.redirect.url);
        }
      }

      toast.success(
        "Payment created successfully, you will be redirected to the payment page shortly"
      );
    } catch (error) {
      toast.error(
        error instanceof AxiosError
          ? error.response?.data.message || error.response?.data.error
          : "Error creating payment method"
      );
    }
  };

  const handleReset = (
    paymentMethod: "card" | "e_wallet" | "online_banking",
    bank?: "BPI" | "UnionBank" | "GCash" | "GrabPay" | "PayMaya"
  ) => {
    reset({
      order_number: order.order_number,
      payment_method: paymentMethod,
      payment_details: {
        card: {
          card_number: "",
          card_expiry: "",
          card_cvv: "",
        },
      },
      payment_type: bank,
    });
  };

  const cardErrors = errors as FieldErrors<z.infer<typeof cardPaymentSchema>>;

  return (
    <div className="min-h-screen pt-24">
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen pt-10">
        <div className="max-w-5xl mx-auto">
          {/* Enhanced Header Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8">
              <div className="flex justify-between items-start text-white">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Complete Your Payment
                  </h1>
                  <div className="flex items-center text-slate-200">
                    <span className="text-lg">Order #{order.order_number}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-slate-300 mb-2">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {new Date(order.order_created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Payment Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Accordion type="single" collapsible className="space-y-4">
              {/* Enhanced Cards Section */}
              <AccordionItem
                value="card"
                className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
              >
                <AccordionTrigger className="hover:no-underline p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-semibold text-slate-800">
                        Credit/Debit Card
                      </h3>
                      <p className="text-slate-500 text-sm">
                        Pay securely with your card
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="border-t border-slate-100">
                  <CardContent className="p-6 bg-slate-50">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {paymentMethods.card.map((card) => (
                        <label
                          key={card}
                          className={`relative cursor-pointer group transition-all duration-200 ${
                            selectedMethod === card
                              ? "transform scale-105"
                              : "hover:scale-102"
                          }`}
                        >
                          <input
                            type="radio"
                            {...register("payment_method")}
                            value="card"
                            onChange={() => {
                              setSelectedMethod(card);
                              handleReset("card");
                            }}
                            className="sr-only text-black"
                          />
                          <div
                            className={`
                            p-4 rounded-xl border-2 text-center transition-all duration-200 flex items-center justify-center
                            ${
                              selectedMethod === card
                                ? "border-blue-500 bg-blue-50 shadow-lg"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                            }
                          `}
                          >
                            <span className="font-semibold text-slate-800">
                              {card}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>

                    {paymentMethod === "card" && (
                      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <h4 className="text-lg font-semibold text-slate-800 mb-4">
                          Card Details
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <Label
                              htmlFor="cardNumber"
                              className="text-sm font-medium text-slate-700 mb-2 block"
                            >
                              Card Number
                            </Label>
                            <Input
                              id="cardNumber"
                              type="text"
                              placeholder="1234 5678 9012 3456"
                              {...register("payment_details.card.card_number", {
                                required: true,
                              })}
                              className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black"
                            />
                            {cardErrors.payment_details?.card?.card_number && (
                              <p className="text-red-500 text-sm mt-1">
                                Card number is required
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label
                                htmlFor="expiry"
                                className="text-sm font-medium text-slate-700 mb-2 block"
                              >
                                Expiry Date
                              </Label>
                              <Input
                                id="expiry"
                                type="text"
                                placeholder="MM/YY"
                                {...register(
                                  "payment_details.card.card_expiry",
                                  {
                                    required: true,
                                  }
                                )}
                                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black"
                              />
                              {cardErrors.payment_details?.card
                                ?.card_expiry && (
                                <p className="text-red-500 text-sm mt-1">
                                  Expiry date is required
                                </p>
                              )}
                            </div>
                            <div>
                              <Label
                                htmlFor="cvv"
                                className="text-sm font-medium text-slate-700 mb-2 block"
                              >
                                CVV
                              </Label>
                              <Input
                                id="cvv"
                                type="text"
                                placeholder="123"
                                {...register("payment_details.card.card_cvv", {
                                  required: true,
                                })}
                                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-black"
                              />
                              {cardErrors.payment_details?.card?.card_cvv && (
                                <p className="text-red-500 text-sm mt-1">
                                  CVV is required
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </AccordionContent>
              </AccordionItem>

              {/* Enhanced E-Wallet Section */}
              <AccordionItem
                value="eWallet"
                className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
              >
                <AccordionTrigger className="hover:no-underline p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-semibold text-slate-800">
                        E-Wallet
                      </h3>
                      <p className="text-slate-500 text-sm">
                        Quick and convenient digital payments
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="border-t border-slate-100">
                  <CardContent className="p-6 bg-slate-50">
                    <div className="grid grid-cols-3 gap-4">
                      {paymentMethods.eWallet.map((wallet) => (
                        <label
                          key={wallet}
                          className={`relative cursor-pointer group transition-all duration-200 ${
                            selectedMethod === wallet
                              ? "transform scale-105"
                              : "hover:scale-102"
                          }`}
                        >
                          <input
                            type="radio"
                            {...register("payment_method")}
                            value="e_wallet"
                            onChange={() => {
                              setSelectedMethod(wallet);
                              handleReset(
                                "e_wallet",
                                wallet as "GCash" | "GrabPay" | "PayMaya"
                              );
                            }}
                            className="sr-only"
                          />
                          <div
                            className={`
                            p-4 rounded-xl border-2 text-center transition-all duration-200 flex items-center justify-center
                            ${
                              selectedMethod === wallet
                                ? "border-green-500 bg-green-50 shadow-lg"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                            }
                          `}
                          >
                            <span className="font-semibold text-slate-800">
                              {wallet}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </AccordionContent>
              </AccordionItem>

              {/* Enhanced Online Banking Section */}
              <AccordionItem
                value="onlineBanking"
                className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
              >
                <AccordionTrigger className="hover:no-underline p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-semibold text-slate-800">
                        Online Banking
                      </h3>
                      <p className="text-slate-500 text-sm">
                        Direct bank transfers
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="border-t border-slate-100">
                  <CardContent className="p-6 bg-slate-50">
                    <div className="grid grid-cols-2 gap-4">
                      {paymentMethods.onlineBanking.map((bank) => (
                        <label
                          key={bank}
                          className={`relative cursor-pointer group transition-all duration-200 ${
                            selectedMethod === bank
                              ? "transform scale-105"
                              : "hover:scale-102"
                          }`}
                        >
                          <input
                            type="radio"
                            {...register("payment_method")}
                            value="online_banking"
                            onChange={() => {
                              setSelectedMethod(bank);
                              handleReset(
                                "online_banking",
                                bank as "BPI" | "UnionBank"
                              );
                            }}
                            className="sr-only"
                          />
                          <div
                            className={`
                            p-4 rounded-xl border-2 text-center transition-all duration-200 flex items-center justify-center
                            ${
                              selectedMethod === bank
                                ? "border-purple-500 bg-purple-50 shadow-lg"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                            }
                          `}
                          >
                            <span className="font-semibold text-slate-800">
                              {bank}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Enhanced Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                disabled={!selectedMethod || isSubmitting}
                className={`
                  w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 transform text-white
                  ${
                    selectedMethod && !isSubmitting
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl hover:scale-105"
                      : "bg-slate-400 cursor-not-allowed"
                  }
                `}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Pay Now"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
