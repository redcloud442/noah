"use client";

import { Button } from "@/components/ui/button"; // ShadCN Button
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { paymentService } from "@/services/payment";
import { motion } from "framer-motion"; // Animation library
import { CheckCircle, XCircle } from "lucide-react"; // Icons for success & failure
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type PaymentRedirectPageProps = {
  paymentNumber: string;
  paymentIntentId: string;
};

export const PaymentRedirectPage = ({
  paymentNumber,
  paymentIntentId,
}: PaymentRedirectPageProps) => {
  const router = useRouter();
  const [orderStatus, setOrderStatus] = useState<
    "PAID" | "CANCELED" | "PENDING"
  >("PENDING");

  useEffect(() => {
    const fetchPayment = async () => {
      if (!paymentIntentId) {
        router.push("/");
      }

      try {
        const response = await paymentService.getPayment({
          paymentIntentId,
          clientKey: "",
          orderNumber: paymentNumber,
        });

        if (response.orderStatus === "PAID") {
          setOrderStatus("PAID");
        } else {
          setOrderStatus("CANCELED");
        }
      } catch (error) {
        console.error("Error fetching payment status:", error);
        setOrderStatus("CANCELED");
      }
    };

    fetchPayment();
  }, [paymentIntentId]);

  return (
    <div className="flex items-center justify-center min-h-screen mt-24 bg-gray-100">
      {orderStatus === "PENDING" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <p className="text-lg font-semibold text-gray-600">
            Checking payment status...
          </p>
        </motion.div>
      )}

      {orderStatus === "PAID" && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-md shadow-lg bg-white p-6 text-center rounded-lg">
            <CardHeader>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <CardTitle className="text-xl font-bold text-gray-800">
                Payment Successful
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Your payment has been received successfully.
              </p>
              <Button
                className="mt-4 w-full"
                variant="secondary"
                onClick={() => router.push("/")}
              >
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {orderStatus === "CANCELED" && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-md shadow-lg bg-white p-6 text-center rounded-lg">
            <CardHeader>
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
              <CardTitle className="text-xl font-bold text-gray-800">
                Payment Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Unfortunately, your payment could not be processed.
              </p>
              <Button
                className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white"
                onClick={() => router.push("/")}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
