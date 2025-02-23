import { CheckoutFormData } from "@packages/shared";
import { PaymentResponse } from "../../../types/types";
import { apiClient } from "./axios";

export const paymentService = {
  create: async (params: CheckoutFormData) => {
    const result = await apiClient.post("/payment", params);

    if (result.status !== 200) {
      throw new Error("Payment failed");
    }

    return result as unknown as PaymentResponse;
  },
};
