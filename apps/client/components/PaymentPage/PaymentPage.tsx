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
import { Loader2 } from "lucide-react";
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
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error creating payment method");
      }
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
    <div className="text-black min-h-screen bg-white h-full mt-24 pt-20">
      <div className="max-w-5xl mx-auto bg-white p-6 shadow-md rounded-md border-2">
        {/* Order Info */}
        <div className="flex justify-between items-center border-b pb-4">
          <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
          <p className="text-sm text-gray-500">
            {new Date(order.order_created_at).toLocaleString()}
          </p>
        </div>

        {/* Payment Method Selection */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          <Accordion type="single" collapsible>
            {/* Cards */}
            <AccordionItem value="card">
              <AccordionTrigger>Credit/Debit Card</AccordionTrigger>
              <AccordionContent>
                <CardContent className="grid grid-cols-2 gap-4 p-4">
                  {paymentMethods.card.map((card) => (
                    <label
                      key={card}
                      className={`border p-4 rounded-lg flex items-center cursor-pointer ${
                        selectedMethod === card ? "border-blue-500" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        {...register("payment_method")}
                        value={card}
                        onChange={() => {
                          setSelectedMethod(card);
                          handleReset("card");
                        }}
                        className="hidden"
                      />
                      <span className="ml-2">{card}</span>
                    </label>
                  ))}
                </CardContent>
                {paymentMethod === "card" && (
                  <div className="p-4">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      type="text"
                      {...register("payment_details.card.card_number", {
                        required: true,
                      })}
                    />
                    {cardErrors.payment_details?.card?.card_number && (
                      <p className="text-red-500 text-sm">
                        Card number is required
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          type="text"
                          {...register("payment_details.card.card_expiry", {
                            required: true,
                          })}
                        />
                        {cardErrors.payment_details?.card?.card_expiry && (
                          <p className="text-red-500 text-sm">
                            Expiry date is required
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          type="text"
                          {...register("payment_details.card.card_cvv", {
                            required: true,
                          })}
                        />
                        {cardErrors.payment_details?.card?.card_cvv && (
                          <p className="text-red-500 text-sm">
                            CVV is required
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* E-Wallet */}
            <AccordionItem value="eWallet">
              <AccordionTrigger>E-Wallet</AccordionTrigger>
              <AccordionContent>
                <CardContent className="grid grid-cols-3 gap-4 p-4">
                  {paymentMethods.eWallet.map((wallet) => (
                    <label
                      key={wallet}
                      className={`border p-4 rounded-lg flex items-center cursor-pointer ${
                        selectedMethod === wallet ? "border-blue-500" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        {...register("payment_method")}
                        value={wallet}
                        onChange={() => {
                          setSelectedMethod(wallet);
                          handleReset(
                            "e_wallet",
                            wallet as "GCash" | "GrabPay" | "PayMaya"
                          );
                        }}
                        className="hidden"
                      />
                      <span className="ml-2">{wallet}</span>
                    </label>
                  ))}
                </CardContent>
              </AccordionContent>
            </AccordionItem>

            {/* Online Banking */}
            <AccordionItem value="onlineBanking">
              <AccordionTrigger>Online Banking</AccordionTrigger>
              <AccordionContent>
                <CardContent className="grid grid-cols-2 gap-4 p-4">
                  {paymentMethods.onlineBanking.map((bank) => (
                    <label
                      key={bank}
                      className={`border p-4 rounded-lg flex items-center cursor-pointer ${
                        selectedMethod === bank ? "border-blue-500" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        {...register("payment_method")}
                        value={bank}
                        onChange={() => {
                          setSelectedMethod(bank);
                          handleReset(
                            "online_banking",
                            bank as "BPI" | "UnionBank"
                          );
                        }}
                        className="hidden"
                      />
                      <span className="ml-2">{bank}</span>
                    </label>
                  ))}
                </CardContent>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Submit Button */}
          <div className="mt-6">
            <Button
              type="submit"
              variant="secondary"
              disabled={!selectedMethod || isSubmitting}
              className="w-full text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
  );
};

export default PaymentPage;
