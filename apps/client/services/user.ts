import axios from "axios";

export const userService = {
  getUserList: async (params: {
    take: number;
    skip: number;
    search?: string;
    teamId?: string;
    sortDirection?: string;
    columnAccessor?: string;
    dateFilter?: {
      start?: string;
      end?: string;
    };
  }) => {
    const { data } = await axios.post("/api/v1/user", { params });

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  },
  resellerRequest: async () => {
    const { data } = await axios.post("/api/v1/user/reseller-request");

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  },
  verifyResellerCode: async (params: { otp: string }) => {
    const { data } = await axios.post("/api/v1/user/verify-reseller-code", {
      params,
    });

    return data;
  },
};
