"use client";

import { Button } from "@/components/ui/button"; // ShadCN Button
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/lib/store";
import { authService } from "@/services/auth";
import { emailSevice } from "@/services/email";
import { paymentService } from "@/services/payment";
import { motion } from "framer-motion"; // Animation library
import { CheckCircle, XCircle } from "lucide-react"; // Icons for success & failure
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type PaymentRedirectPageProps = {
  paymentNumber: string;
  paymentIntentId: string;
  email: string;
};

export const PaymentRedirectPage = ({
  paymentNumber,
  paymentIntentId,
  email,
}: PaymentRedirectPageProps) => {
  const router = useRouter();
  const { setCart } = useCartStore();
  const [orderStatus, setOrderStatus] = useState<
    "PAID" | "CANCELED" | "PENDING" | "UNPAID"
  >("UNPAID");

  useEffect(() => {
    if (!paymentIntentId) {
      router.replace("/");
      return;
    }

    const fetchPayment = async () => {
      try {
        const response = await paymentService.getPayment({
          paymentIntentId,
          clientKey: "",
          orderNumber: paymentNumber,
        });

        if (response?.orderStatus === "PAID") {
          setOrderStatus("PAID");

          // Send success email in the background
          (async () => {
            try {
              await emailSevice.sendEmail({
                to: email,
                subject:
                  "Congratulations! Your Payment is Successful – Welcome to Noir Clothing!",
                text: `Congratulations on completing your purchase! Your payment was successful.`,
                html: `
                  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                    <h2 style="color: #10B981; font-size: 24px;">Congratulations!</h2>
                    <p style="font-size: 16px;">We're excited to welcome you to <strong>Noir Clothing</strong>!</p>
                    <p style="font-size: 16px;">
                      Your payment was <strong>successfully processed</strong>. You can now enjoy exclusive access to our latest collections and rewards.
                    </p>
                    <br />
                    <p style="font-size: 14px; color: #555;">Thank you for trusting Noir Clothing. We’re excited to have you with us!</p>
                    <p style="font-weight: bold;">– The Noir Clothing Team</p>
                  </div>
                `,
              });
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (emailError) {}
          })();
        } else {
          setOrderStatus("CANCELED");

          // Send failure email in the background
          (async () => {
            try {
              await emailSevice.sendEmail({
                to: email,
                subject: "Payment Unsuccessful - Please Try Again",
                text: "Hi there, unfortunately your payment could not be processed. Please try again or contact our support team if the issue persists.",
                html: `
                  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
                    <h2 style="color: #EF4444; font-size: 24px;">Payment Unsuccessful</h2>
                    <p style="font-size: 16px; margin-bottom: 16px;">
                      Unfortunately, we were unable to process your payment.
                    </p>
                    <p style="font-size: 16px; margin-bottom: 16px;">
                      Please try again. If the issue continues, feel free to reach out to our support team for assistance.
                    </p>
                    <p style="font-size: 16px; margin-bottom: 32px;">
                      We apologize for the inconvenience and appreciate your patience.
                    </p>
                    <p style="font-weight: bold;">– The Noir Clothing Team</p>
                  </div>
                `,
              });
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (emailError) {}
          })();
        }

        localStorage.removeItem("shoppingCart");
        setCart({ products: [], count: 0 });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setOrderStatus("CANCELED");
        localStorage.removeItem("shoppingCart");
        setCart({ products: [], count: 0 });
      }
    };

    fetchPayment();
  }, [paymentIntentId, paymentNumber, setCart]);

  const handleDeleteCheckoutToken = async () => {
    try {
      if (orderStatus === "PAID") {
        await authService.deleteCheckoutToken();
        router.push("/");
      }
      if (orderStatus === "CANCELED") {
        router.refresh();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error deleting checkout token");
      }
    }
  };

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
                onClick={handleDeleteCheckoutToken}
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
                onClick={() => router.refresh()}
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
