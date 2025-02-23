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
import { order_table } from "@prisma/client";
import { useState } from "react";
import { useForm } from "react-hook-form";

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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: any) => {
    console.log("Payment Data:", data);
    alert("Payment Successful!");
  };

  return (
    <div className="min-h-screen h-full mt-20 p-6 bg-gray-100 text-black">
      <div className="max-w-4xl mx-auto bg-white p-6 shadow-md rounded-md">
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
                        {...register("paymentMethod")}
                        value={card}
                        onChange={() => setSelectedMethod(card)}
                        className="hidden"
                      />
                      <span className="ml-2">{card}</span>
                    </label>
                  ))}
                </CardContent>
                {selectedMethod &&
                  paymentMethods.card.includes(selectedMethod) && (
                    <div className="p-4">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        type="text"
                        {...register("cardNumber", { required: true })}
                      />
                      {errors.cardNumber && (
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
                            {...register("expiry", { required: true })}
                          />
                          {errors.expiry && (
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
                            {...register("cvv", { required: true })}
                          />
                          {errors.cvv && (
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
                        {...register("paymentMethod")}
                        value={wallet}
                        onChange={() => setSelectedMethod(wallet)}
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
                        {...register("paymentMethod")}
                        value={bank}
                        onChange={() => setSelectedMethod(bank)}
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
            <Button type="submit" className="w-full bg-blue-600 text-white">
              Pay Now
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
