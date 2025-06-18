import { CheckoutFormData, PaymentCreatePaymentFormData } from "@/utils/schema";
import {
  PaymentMethodResponse,
  PaymentRedirectResponse,
  PaymentResponse,
} from "../../../types/types";
import { apiClient } from "./axios";

export const paymentService = {
  create: async (params: CheckoutFormData) => {
    const result = await apiClient.post("/payment", params);

    if (result.status !== 200) {
      throw new Error(result.data.message);
    }

    return result as unknown as PaymentResponse;
  },
  createPaymentMethod: async (params: PaymentCreatePaymentFormData) => {
    const result = await apiClient.post("/payment/create-payment", params);

    if (result.status !== 200) {
      throw new Error(result.data.message);
    }

    return result as unknown as PaymentMethodResponse;
  },
  getPayment: async (params: {
    paymentIntentId: string;
    clientKey: string;
    orderNumber: string;
  }) => {
    const result = await apiClient.get(`/payment/${params.orderNumber}`, {
      params: {
        paymentIntentId: params.paymentIntentId,
        clientKey: params.clientKey,
      },
    });

    return result.data as unknown as PaymentRedirectResponse;
  },
};
