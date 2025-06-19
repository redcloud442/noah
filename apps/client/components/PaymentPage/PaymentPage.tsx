"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { paymentService } from "@/services/payment";
import { PaymentCreatePaymentFormData } from "@/utils/schema";
import { order_table } from "@prisma/client";
import { AxiosError } from "axios";
import { Building2, Clock, Loader2, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<PaymentCreatePaymentFormData>({
    defaultValues: {
      order_number: order.order_number,
    },
  });

  const onSubmit = async (data: PaymentCreatePaymentFormData) => {
    try {
      let result;

      switch (data.payment_method) {
        case "card": {
          const formattedData = {
            order_number: data.order_number,
            payment_method: data.payment_method,
            payment_details:
              data.payment_method === "card"
                ? {
                    card: {
                      card_number:
                        data.payment_details.card.card_number.replace(
                          /\s/g,
                          ""
                        ),
                      card_expiry: data.payment_details.card.card_expiry,
                      card_cvv: data.payment_details.card.card_cvv,
                    },
                  }
                : undefined,
            payment_type: data.payment_type,
          };
          result = await paymentService.createPaymentMethod(
            formattedData as PaymentCreatePaymentFormData
          );
          break;
        }

        case "e_wallet": {
          const eWalletPayload = {
            order_number: data.order_number,
            payment_method: "e_wallet",
            payment_type: data.payment_type as "GCash" | "GrabPay" | "PayMaya",
          };
          result = await paymentService.createPaymentMethod(
            eWalletPayload as PaymentCreatePaymentFormData
          );
          break;
        }

        case "online_banking": {
          const bankingPayload = {
            order_number: data.order_number,
            payment_method: "online_banking",
            payment_type: data.payment_type as "BPI" | "UnionBank",
          };
          result = await paymentService.createPaymentMethod(
            bankingPayload as PaymentCreatePaymentFormData
          );
          break;
        }

        default:
          throw new Error("Unsupported payment method");
      }

      const redirectUrl = result?.data?.nextAction?.redirect?.url;
      if (redirectUrl) {
        router.push(redirectUrl);
      }

      toast.success("Payment created successfully, redirecting...");
    } catch (error) {
      toast.error(
        error instanceof AxiosError
          ? error.response?.data.message || error.response?.data.error
          : "Error creating payment method"
      );
    }
  };

  const handleSelectMethod = (
    method: "card" | "e_wallet" | "online_banking",
    type:
      | "Visa"
      | "Mastercard"
      | "GCash"
      | "GrabPay"
      | "PayMaya"
      | "BPI"
      | "UnionBank"
  ) => {
    setValue("payment_method", method);
    setValue("payment_type", type);
    setSelectedMethod(type);
  };

  return (
    <div className="min-h-screen pt-24">
      <div className="bg-gradient-to-br from-zinc-50 via-zinc-100 to-zinc-100 min-h-screen pt-10 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Enhanced Header Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 mb-8 overflow-hidden">
            <div className="bg-gradient-to-r from-zinc-950 to-zinc-900 p-8">
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
              {/* <AccordionItem
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
                            value={card}
                            onChange={() => {
                              handleSelectMethod(
                                "card",
                                card as "Visa" | "Mastercard"
                              );
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
                              maxLength={19}
                              {...register("payment_details.card.card_number", {
                                required: "Card number is required",
                                onChange: (e) => {
                                  let value = e.target.value.replace(/\D/g, "");

                                  value =
                                    value.match(/.{1,4}/g)?.join(" ") || "";

                                  e.target.value = value;
                                },
                                pattern: {
                                  value: /^(\d{4} ){3}\d{4}$/,
                                  message: "Card number must be 16 digits",
                                },
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
                                maxLength={5}
                                {...register(
                                  "payment_details.card.card_expiry",
                                  {
                                    required: "Expiry date is required",
                                    onChange: (e) => {
                                      let value = e.target.value.replace(
                                        /\D/g,
                                        ""
                                      ); // remove non-digits

                                      if (value.length >= 3) {
                                        value =
                                          value.slice(0, 2) +
                                          "/" +
                                          value.slice(2, 4);
                                      }

                                      if (value.length > 5) {
                                        value = value.slice(0, 5); // Limit to MM/YY
                                      }

                                      e.target.value = value;
                                    },
                                    pattern: {
                                      value: /^(0[1-9]|1[0-2])\/\d{2}$/,
                                      message: "Invalid format. Use MM/YY",
                                    },
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
                                maxLength={3}
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
              </AccordionItem> */}

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
                            value={wallet}
                            onChange={() => {
                              handleSelectMethod(
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
                            value={bank}
                            onChange={() => {
                              handleSelectMethod(
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
                      ? "bg-gradient-to-r from-zinc-950 to-zinc-900 hover:from-zinc-900 hover:to-zinc-950 shadow-lg hover:shadow-xl hover:scale-105"
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
