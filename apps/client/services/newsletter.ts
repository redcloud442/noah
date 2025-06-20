import { newsletterType } from "@/components/Footer/SubscribeNowForm/SubscribeNowForm";
import axios from "axios";

export const newsLetterService = {
  subscribe: async (params: newsletterType) => {
    const result = await axios.post("/api/v1/newsletter", params);

    if (result.status !== 200) {
      throw new Error("newsletter failed");
    }

    return result.data as newsletterType;
  },
};
