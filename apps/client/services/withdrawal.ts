import { typeWithdrawalListSchema } from "@/utils/schema";
import axios from "axios";

export const withdrawalService = {
  getWithdrawalList: async (params: typeWithdrawalListSchema) => {
    const { data } = await axios.post("/api/v1/withdraw/list", params);

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  },
  withdrawalAction: async (params: {
    resellerId: string;
    withdrawalId: string;
    status: "APPROVED" | "REJECTED";
  }) => {
    const { resellerId, withdrawalId, status } = params;
    const { data } = await axios.post("/api/v1/withdraw/action", {
      resellerId,
      withdrawalId,
      status,
    });

    if (data.error) {
      throw new Error(data.error);
    }
  },
};
