import { WithdrawalSchema } from "@/utils/schema";
import axios from "axios";

export const withdrawalService = {
  createWithdrawal: async (params: WithdrawalSchema) => {
    const data = await axios.post("/api/v1/reseller/withdraw", params);

    if (data.status !== 200) {
      throw new Error(data.data.message);
    }

    return data.data;
  },
};
