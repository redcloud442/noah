import { apiClient } from "@/utils/axios/axios";
import { WithdrawalSchema } from "@/utils/schema";

export const withdrawalService = {
  createWithdrawal: async (params: WithdrawalSchema) => {
    const data = await apiClient.post("/withdraw", params);

    if (data.status !== 200) {
      throw new Error(data.data.message);
    }

    return data.data;
  },
};
