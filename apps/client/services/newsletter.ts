import { newsletterType } from "@/components/Footer/SubscribeNowForm/SubscribeNowForm";
import { apiClient } from "./axios";

export const newsLetterService = {
  subscribe: async (params: newsletterType) => {
    const result = await apiClient.post("/newsletter", params);

    if (result.status !== 200) {
      throw new Error("newsletter failed");
    }

    return result.data as newsletterType;
  },
};
