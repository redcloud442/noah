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
};
